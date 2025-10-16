from flask import Blueprint, request, jsonify
from models.emi import EMI
from models.card import Card
from models.user import User
from services.auth import token_required
from bson import ObjectId
import uuid
from datetime import datetime, timedelta

emis_bp = Blueprint('emis', __name__)

@emis_bp.route('/', methods=['GET'])
@token_required
def get_emis():
    """Get all EMIs for the authenticated user"""
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
        
        # Build query
        query = {'user_id': ObjectId(user_id)}
        if card_id:
            query['card_id'] = ObjectId(card_id)
        if status:
            query['status'] = status
        
        # Calculate pagination
        skip = (page - 1) * per_page
        
        # Get EMIs
        emis = EMI.objects(__raw__=query).skip(skip).limit(per_page).order_by('-created_at')
        total = EMI.objects(__raw__=query).count()
        
        return jsonify({
            'emis': [emi.to_dict() for emi in emis],
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'current_page': page,
            'per_page': per_page
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emis_bp.route('/<emi_id>', methods=['GET'])
@token_required
def get_emi(emi_id):
    """Get a specific EMI by ID"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        emi = EMI.objects.get(id=ObjectId(emi_id), user_id=ObjectId(user_id))
        return jsonify(emi.to_dict()), 200
    except EMI.DoesNotExist:
        return jsonify({'error': 'EMI not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emis_bp.route('/', methods=['POST'])
@token_required
def create_emi():
    """Create a new EMI"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        required_fields = ['card_id', 'principal_amount', 'interest_rate', 'tenure_months', 'start_date']
        
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Verify card belongs to user
        card = Card.objects.get(id=ObjectId(data['card_id']), user_id=ObjectId(user_id))
        
        # Check if card is active
        if not card.is_active or card.is_blocked:
            return jsonify({'error': 'Card is not active or is blocked'}), 400
        
        # Generate EMI ID
        emi_id = f"EMI_{uuid.uuid4().hex[:12].upper()}"
        
        # Parse start date
        start_date = datetime.fromisoformat(data['start_date']) if isinstance(data['start_date'], str) else data['start_date']
        
        # Create EMI
        emi = EMI.create_emi(
            user_id=ObjectId(user_id),
            card_id=ObjectId(data['card_id']),
            emi_id=emi_id,
            principal_amount=data['principal_amount'],
            interest_rate=data['interest_rate'],
            tenure_months=data['tenure_months'],
            start_date=start_date,
            description=data.get('description'),
            merchant_name=data.get('merchant_name'),
            product_name=data.get('product_name')
        )
        
        emi.save()
        return jsonify(emi.to_dict()), 201
    except Card.DoesNotExist:
        return jsonify({'error': 'Card not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emis_bp.route('/<emi_id>/pay', methods=['POST'])
@token_required
def pay_emi(emi_id):
    """Make an EMI payment"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        amount = data.get('amount')
        payment_date = data.get('payment_date')
        
        emi = EMI.objects.get(id=ObjectId(emi_id), user_id=ObjectId(user_id))
        
        if emi.status != 'active':
            return jsonify({'error': 'EMI is not active'}), 400
        
        # Use EMI amount if not specified
        if not amount:
            amount = emi.emi_amount
        elif amount > emi.remaining_amount:
            return jsonify({'error': 'Payment amount cannot exceed remaining amount'}), 400
        
        # Check card balance
        card = Card.objects.get(id=emi.card_id)
        if amount > card.available_credit:
            return jsonify({'error': 'Insufficient credit limit'}), 400
        
        # Parse payment date
        if payment_date:
            payment_date = datetime.fromisoformat(payment_date) if isinstance(payment_date, str) else payment_date
        else:
            payment_date = datetime.utcnow()
        
        # Make payment
        emi.make_payment(amount, payment_date)
        
        # Update card balance
        card.update_balance(amount, 'debit')
        card.save()
        
        return jsonify(emi.to_dict()), 200
    except EMI.DoesNotExist:
        return jsonify({'error': 'EMI not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emis_bp.route('/<emi_id>/auto-pay', methods=['PUT'])
@token_required
def toggle_auto_pay(emi_id):
    """Toggle auto pay for an EMI"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        enable = data.get('enable', True)
        auto_pay_date = data.get('auto_pay_date')
        
        emi = EMI.objects.get(id=ObjectId(emi_id), user_id=ObjectId(user_id))
        
        if enable:
            emi.enable_auto_pay(auto_pay_date)
        else:
            emi.disable_auto_pay()
        
        return jsonify(emi.to_dict()), 200
    except EMI.DoesNotExist:
        return jsonify({'error': 'EMI not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emis_bp.route('/<emi_id>/pre-close', methods=['POST'])
@token_required
def pre_close_emi(emi_id):
    """Pre-close an EMI"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        amount = data.get('amount')
        
        emi = EMI.objects.get(id=ObjectId(emi_id), user_id=ObjectId(user_id))
        
        if emi.status != 'active':
            return jsonify({'error': 'EMI is not active'}), 400
        
        # Use remaining amount if not specified
        if not amount:
            amount = emi.remaining_amount
        elif amount > emi.remaining_amount:
            return jsonify({'error': 'Payment amount cannot exceed remaining amount'}), 400
        
        # Check card balance
        card = Card.objects.get(id=emi.card_id)
        if amount > card.available_credit:
            return jsonify({'error': 'Insufficient credit limit'}), 400
        
        # Make payment
        emi.make_payment(amount)
        
        # Update card balance
        card.update_balance(amount, 'debit')
        card.save()
        
        return jsonify(emi.to_dict()), 200
    except EMI.DoesNotExist:
        return jsonify({'error': 'EMI not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emis_bp.route('/<emi_id>', methods=['PUT'])
@token_required
def update_emi(emi_id):
    """Update an EMI"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        emi = EMI.objects.get(id=ObjectId(emi_id), user_id=ObjectId(user_id))
        data = request.get_json()
        
        # Update allowed fields
        if 'description' in data:
            emi.description = data['description']
        if 'merchant_name' in data:
            emi.merchant_name = data['merchant_name']
        if 'product_name' in data:
            emi.product_name = data['product_name']
        
        emi.save()
        return jsonify(emi.to_dict()), 200
    except EMI.DoesNotExist:
        return jsonify({'error': 'EMI not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emis_bp.route('/<emi_id>', methods=['DELETE'])
@token_required
def cancel_emi(emi_id):
    """Cancel an EMI"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        emi = EMI.objects.get(id=ObjectId(emi_id), user_id=ObjectId(user_id))
        emi.cancel_emi()
        
        return jsonify({'message': 'EMI cancelled successfully'}), 200
    except EMI.DoesNotExist:
        return jsonify({'error': 'EMI not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emis_bp.route('/calculator', methods=['POST'])
@token_required
def calculate_emi():
    """Calculate EMI amount for given parameters"""
    try:
        data = request.get_json()
        required_fields = ['principal_amount', 'interest_rate', 'tenure_months']
        
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        principal = data['principal_amount']
        rate = data['interest_rate']
        months = data['tenure_months']
        
        # Calculate EMI
        emi_amount = EMI._calculate_emi_amount(principal, rate, months)
        total_amount = emi_amount * months
        total_interest = total_amount - principal
        
        return jsonify({
            'principal_amount': float(principal),
            'interest_rate': float(rate),
            'tenure_months': months,
            'emi_amount': float(emi_amount),
            'total_amount': float(total_amount),
            'total_interest': float(total_interest)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emis_bp.route('/summary', methods=['GET'])
@token_required
def get_emis_summary():
    """Get EMIs summary for the user"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get all EMIs for user
        emis = EMI.objects(user_id=ObjectId(user_id))
        
        # Calculate summary
        total_emis = len(emis)
        active_emis = len([e for e in emis if e.status == 'active'])
        completed_emis = len([e for e in emis if e.status == 'completed'])
        overdue_emis = len([e for e in emis if e.is_overdue()])
        due_soon_emis = len([e for e in emis if e.is_due_soon()])
        
        total_principal = sum(e.principal_amount for e in emis)
        total_paid = sum(e.total_paid for e in emis)
        total_remaining = sum(e.remaining_amount for e in emis)
        total_interest = sum(e.interest_paid for e in emis)
        
        return jsonify({
            'total_emis': total_emis,
            'active_emis': active_emis,
            'completed_emis': completed_emis,
            'overdue_emis': overdue_emis,
            'due_soon_emis': due_soon_emis,
            'total_principal': float(total_principal),
            'total_paid': float(total_paid),
            'total_remaining': float(total_remaining),
            'total_interest': float(total_interest)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
