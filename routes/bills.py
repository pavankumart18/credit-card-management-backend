from flask import Blueprint, request, jsonify
from models.bill import Bill
from models.card import Card
from models.user import User
from services.auth import token_required
from bson import ObjectId
import uuid
from datetime import datetime, timedelta

bills_bp = Blueprint('bills', __name__)

@bills_bp.route('/', methods=['GET'])
@token_required
def get_bills():
    """Get all bills for the authenticated user"""
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
        bill_type = request.args.get('type', type=str)
        due_soon = request.args.get('due_soon', type=bool)
        
        # Build query
        query = {'user_id': ObjectId(user_id)}
        if card_id:
            query['card_id'] = ObjectId(card_id)
        if status:
            query['payment_status'] = status
        if bill_type:
            query['bill_type'] = bill_type
        
        # Calculate pagination
        skip = (page - 1) * per_page
        
        # Get bills
        bills = Bill.objects(__raw__=query).skip(skip).limit(per_page).order_by('-due_date')
        total = Bill.objects(__raw__=query).count()
        
        # Filter due soon if requested
        if due_soon:
            bills = [bill for bill in bills if bill.is_due_soon()]
        
        return jsonify({
            'bills': [bill.to_dict() for bill in bills],
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'current_page': page,
            'per_page': per_page
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/<bill_id>', methods=['GET'])
@token_required
def get_bill(bill_id):
    """Get a specific bill by ID"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        bill = Bill.objects.get(id=ObjectId(bill_id), user_id=ObjectId(user_id))
        return jsonify(bill.to_dict()), 200
    except Bill.DoesNotExist:
        return jsonify({'error': 'Bill not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/', methods=['POST'])
@token_required
def create_bill():
    """Create a new bill"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        required_fields = ['card_id', 'biller_name', 'biller_category', 'bill_type', 'amount', 'due_date']
        
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Verify card belongs to user
        card = Card.objects.get(id=ObjectId(data['card_id']), user_id=ObjectId(user_id))
        
        # Generate bill ID
        bill_id = f"BILL_{uuid.uuid4().hex[:12].upper()}"
        
        # Parse due date
        due_date = datetime.fromisoformat(data['due_date']) if isinstance(data['due_date'], str) else data['due_date']
        
        # Create bill
        bill = Bill.create_bill(
            user_id=ObjectId(user_id),
            card_id=ObjectId(data['card_id']),
            bill_id=bill_id,
            biller_name=data['biller_name'],
            biller_category=data['biller_category'],
            bill_type=data['bill_type'],
            amount=data['amount'],
            due_date=due_date,
            bill_number=data.get('bill_number'),
            consumer_number=data.get('consumer_number'),
            description=data.get('description'),
            is_recurring=data.get('is_recurring', False),
            recurring_frequency=data.get('recurring_frequency')
        )
        
        # Set additional fields
        bill.bill_period_start = datetime.fromisoformat(data['bill_period_start']) if data.get('bill_period_start') else None
        bill.bill_period_end = datetime.fromisoformat(data['bill_period_end']) if data.get('bill_period_end') else None
        
        bill.save()
        return jsonify(bill.to_dict()), 201
    except Card.DoesNotExist:
        return jsonify({'error': 'Card not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/<bill_id>/pay', methods=['POST'])
@token_required
def pay_bill(bill_id):
    """Pay a bill"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        amount = data.get('amount')
        
        bill = Bill.objects.get(id=ObjectId(bill_id), user_id=ObjectId(user_id))
        
        if bill.payment_status == 'paid':
            return jsonify({'error': 'Bill is already paid'}), 400
        
        # Use full amount if not specified
        if not amount:
            amount = bill.amount
        elif amount > bill.amount:
            return jsonify({'error': 'Payment amount cannot exceed bill amount'}), 400
        
        # Check card balance
        card = Card.objects.get(id=bill.card_id)
        if amount > card.available_credit:
            return jsonify({'error': 'Insufficient credit limit'}), 400
        
        # Pay the bill
        bill.pay_bill(amount)
        
        # Update card balance
        card.update_balance(amount, 'debit')
        card.save()
        
        return jsonify(bill.to_dict()), 200
    except Bill.DoesNotExist:
        return jsonify({'error': 'Bill not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/<bill_id>/auto-pay', methods=['PUT'])
@token_required
def toggle_auto_pay(bill_id):
    """Toggle auto pay for a bill"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        enable = data.get('enable', True)
        
        bill = Bill.objects.get(id=ObjectId(bill_id), user_id=ObjectId(user_id))
        
        if enable:
            if not bill.is_recurring:
                return jsonify({'error': 'Auto pay can only be enabled for recurring bills'}), 400
            bill.enable_auto_pay()
        else:
            bill.disable_auto_pay()
        
        return jsonify(bill.to_dict()), 200
    except Bill.DoesNotExist:
        return jsonify({'error': 'Bill not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/<bill_id>', methods=['PUT'])
@token_required
def update_bill(bill_id):
    """Update a bill"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        bill = Bill.objects.get(id=ObjectId(bill_id), user_id=ObjectId(user_id))
        data = request.get_json()
        
        # Update allowed fields
        if 'biller_name' in data:
            bill.biller_name = data['biller_name']
        if 'biller_category' in data:
            bill.biller_category = data['biller_category']
        if 'amount' in data:
            bill.amount = data['amount']
        if 'due_date' in data:
            bill.due_date = datetime.fromisoformat(data['due_date']) if isinstance(data['due_date'], str) else data['due_date']
        if 'description' in data:
            bill.description = data['description']
        if 'bill_number' in data:
            bill.bill_number = data['bill_number']
        if 'consumer_number' in data:
            bill.consumer_number = data['consumer_number']
        
        bill.save()
        return jsonify(bill.to_dict()), 200
    except Bill.DoesNotExist:
        return jsonify({'error': 'Bill not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/<bill_id>', methods=['DELETE'])
@token_required
def delete_bill(bill_id):
    """Delete a bill"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        bill = Bill.objects.get(id=ObjectId(bill_id), user_id=ObjectId(user_id))
        bill.cancel_bill()
        
        return jsonify({'message': 'Bill cancelled successfully'}), 200
    except Bill.DoesNotExist:
        return jsonify({'error': 'Bill not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/types', methods=['GET'])
@token_required
def get_bill_types():
    """Get available bill types"""
    bill_types = [
        'utility', 'mobile', 'internet', 'insurance', 'loan', 'credit_card', 'other'
    ]
    
    return jsonify({'bill_types': bill_types}), 200

@bills_bp.route('/summary', methods=['GET'])
@token_required
def get_bills_summary():
    """Get bills summary for the user"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get all bills for user
        bills = Bill.objects(user_id=ObjectId(user_id))
        
        # Calculate summary
        total_bills = len(bills)
        paid_bills = len([b for b in bills if b.payment_status == 'paid'])
        pending_bills = len([b for b in bills if b.payment_status == 'pending'])
        overdue_bills = len([b for b in bills if b.is_overdue()])
        due_soon_bills = len([b for b in bills if b.is_due_soon()])
        
        total_amount = sum(b.amount for b in bills)
        paid_amount = sum(b.paid_amount for b in bills)
        pending_amount = sum(b.amount for b in bills if b.payment_status == 'pending')
        
        return jsonify({
            'total_bills': total_bills,
            'paid_bills': paid_bills,
            'pending_bills': pending_bills,
            'overdue_bills': overdue_bills,
            'due_soon_bills': due_soon_bills,
            'total_amount': float(total_amount),
            'paid_amount': float(paid_amount),
            'pending_amount': float(pending_amount)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
