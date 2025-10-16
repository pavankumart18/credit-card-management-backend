from flask import Blueprint, request, jsonify
from models.transaction import Transaction
from models.card import Card
from models.user import User
from services.auth import token_required
from bson import ObjectId
import uuid
from datetime import datetime, timedelta

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/', methods=['GET'])
@token_required
def get_transactions():
    """Get all transactions for the authenticated user"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        card_id = request.args.get('card_id', type=str)
        status = request.args.get('status', type=str)
        transaction_type = request.args.get('type', type=str)
        merchant = request.args.get('merchant', type=str)
        start_date = request.args.get('start_date', type=str)
        end_date = request.args.get('end_date', type=str)
        
        # Build query
        query = {'user_id': ObjectId(user_id)}
        if card_id:
            query['card_id'] = ObjectId(card_id)
        if status:
            query['status'] = status
        if transaction_type:
            query['transaction_type'] = transaction_type
        if merchant:
            query['merchant_name'] = {'$regex': merchant, '$options': 'i'}
        
        # Date filtering
        if start_date or end_date:
            date_query = {}
            if start_date:
                date_query['$gte'] = datetime.fromisoformat(start_date)
            if end_date:
                date_query['$lte'] = datetime.fromisoformat(end_date)
            query['transaction_date'] = date_query
        
        # Calculate pagination
        skip = (page - 1) * per_page
        
        # Get transactions
        transactions = Transaction.objects(__raw__=query).skip(skip).limit(per_page).order_by('-transaction_date')
        total = Transaction.objects(__raw__=query).count()
        
        return jsonify({
            'transactions': [transaction.to_dict() for transaction in transactions],
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'current_page': page,
            'per_page': per_page
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/<transaction_id>', methods=['GET'])
@token_required
def get_transaction(transaction_id):
    """Get a specific transaction by ID"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        transaction = Transaction.objects.get(id=ObjectId(transaction_id), user_id=ObjectId(user_id))
        return jsonify(transaction.to_dict()), 200
    except Transaction.DoesNotExist:
        return jsonify({'error': 'Transaction not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/', methods=['POST'])
@token_required
def create_transaction():
    """Create a new transaction"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        required_fields = ['card_id', 'merchant_name', 'merchant_category', 'amount']
        
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Verify card belongs to user
        card = Card.objects.get(id=ObjectId(data['card_id']), user_id=ObjectId(user_id))
        
        # Check if card is active and not blocked
        if not card.is_active or card.is_blocked:
            return jsonify({'error': 'Card is not active or is blocked'}), 400
        
        # Check available credit
        if data['amount'] > card.available_credit:
            return jsonify({'error': 'Insufficient credit limit'}), 400
        
        # Generate transaction ID
        transaction_id = f"TXN_{uuid.uuid4().hex[:12].upper()}"
        
        # Create transaction
        transaction = Transaction.create_transaction(
            user_id=ObjectId(user_id),
            card_id=ObjectId(data['card_id']),
            transaction_id=transaction_id,
            merchant_name=data['merchant_name'],
            merchant_category=data['merchant_category'],
            amount=data['amount'],
            description=data.get('description'),
            transaction_type=data.get('transaction_type', 'debit'),
            location=data.get('location'),
            device_type=data.get('device_type')
        )
        
        # Set additional fields
        transaction.payment_method = data.get('payment_method', 'online')
        transaction.reference_number = data.get('reference_number')
        transaction.is_recurring = data.get('is_recurring', False)
        transaction.is_international = data.get('is_international', False)
        
        transaction.save()
        
        # Update card balance
        card.update_balance(data['amount'], 'debit')
        card.last_used = datetime.utcnow()
        card.save()
        
        # Process transaction
        transaction.process_transaction()
        
        return jsonify(transaction.to_dict()), 201
    except Card.DoesNotExist:
        return jsonify({'error': 'Card not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/<transaction_id>/refund', methods=['POST'])
@token_required
def refund_transaction(transaction_id):
    """Refund a transaction"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        refund_amount = data.get('amount')
        
        transaction = Transaction.objects.get(id=ObjectId(transaction_id), user_id=ObjectId(user_id))
        
        if transaction.status != 'completed':
            return jsonify({'error': 'Transaction is not completed'}), 400
        
        if refund_amount and refund_amount > transaction.amount:
            return jsonify({'error': 'Refund amount cannot exceed transaction amount'}), 400
        
        # Use full amount if not specified
        if not refund_amount:
            refund_amount = transaction.amount
        
        # Create refund transaction
        refund_transaction = Transaction.create_transaction(
            user_id=ObjectId(user_id),
            card_id=transaction.card_id.id,
            transaction_id=f"REF_{transaction.transaction_id}",
            merchant_name=transaction.merchant_name,
            merchant_category=transaction.merchant_category,
            amount=refund_amount,
            description=f"Refund for {transaction.transaction_id}",
            transaction_type='refund',
            location=transaction.location,
            device_type=transaction.device_type
        )
        
        refund_transaction.payment_method = transaction.payment_method
        refund_transaction.reference_number = f"REF_{transaction.reference_number}" if transaction.reference_number else None
        refund_transaction.save()
        
        # Update original transaction
        transaction.refund_transaction()
        
        # Update card balance
        card = Card.objects.get(id=transaction.card_id.id)
        card.update_balance(refund_amount, 'credit')
        card.save()
        
        return jsonify(refund_transaction.to_dict()), 201
    except Transaction.DoesNotExist:
        return jsonify({'error': 'Transaction not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/categories', methods=['GET'])
@token_required
def get_transaction_categories():
    """Get available transaction categories"""
    categories = [
        'groceries', 'restaurants', 'gas_station', 'pharmacy', 'entertainment',
        'shopping', 'travel', 'utilities', 'healthcare', 'education',
        'transportation', 'online_shopping', 'subscriptions', 'other'
    ]
    
    return jsonify({'categories': categories}), 200

@transactions_bp.route('/summary', methods=['GET'])
@token_required
def get_transaction_summary():
    """Get transaction summary for the user"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get date range
        days = request.args.get('days', 30, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get transactions in date range
        transactions = Transaction.objects(
            user_id=ObjectId(user_id),
            transaction_date__gte=start_date,
            transaction_date__lte=end_date,
            status='completed'
        )
        
        # Calculate summary
        total_amount = sum(t.amount for t in transactions)
        total_transactions = len(transactions)
        
        # Category breakdown
        category_breakdown = {}
        for transaction in transactions:
            category = transaction.merchant_category
            if category not in category_breakdown:
                category_breakdown[category] = {'count': 0, 'amount': 0}
            category_breakdown[category]['count'] += 1
            category_breakdown[category]['amount'] += transaction.amount
        
        return jsonify({
            'period_days': days,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'total_amount': float(total_amount),
            'total_transactions': total_transactions,
            'average_transaction': float(total_amount / total_transactions) if total_transactions > 0 else 0,
            'category_breakdown': category_breakdown
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
