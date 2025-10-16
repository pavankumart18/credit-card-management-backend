from flask import Blueprint, request, jsonify
from models.card import Card
from models.user import User
from models.transaction import Transaction
from services.auth import token_required
from bson import ObjectId
import uuid

cards_bp = Blueprint('cards', __name__)

@cards_bp.route('/', methods=['GET'])
@token_required
def get_cards():
    """Get all cards for the authenticated user"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        cards = Card.objects(user_id=ObjectId(user_id), is_active=True)
        return jsonify({
            'cards': [card.to_dict() for card in cards],
            'total': len(cards)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cards_bp.route('/<card_id>', methods=['GET'])
@token_required
def get_card(card_id):
    """Get a specific card by ID"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        card = Card.objects.get(id=ObjectId(card_id), user_id=ObjectId(user_id))
        return jsonify(card.to_dict()), 200
    except Card.DoesNotExist:
        return jsonify({'error': 'Card not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cards_bp.route('/', methods=['POST'])
@token_required
def create_card():
    """Create a new credit card"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        required_fields = ['card_number', 'card_holder_name', 'expiry_month', 'expiry_year', 
                          'cvv', 'card_type', 'card_brand', 'card_name', 'credit_limit']
        
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate card number format (basic validation)
        card_number = data['card_number'].replace('-', '').replace(' ', '')
        if not card_number.isdigit() or len(card_number) < 13 or len(card_number) > 19:
            return jsonify({'error': 'Invalid card number format'}), 400
        
        # Validate expiry date
        if data['expiry_month'] < 1 or data['expiry_month'] > 12:
            return jsonify({'error': 'Invalid expiry month'}), 400
        
        if data['expiry_year'] < 2024:
            return jsonify({'error': 'Card has expired'}), 400
        
        # Validate CVV
        cvv = str(data['cvv'])
        if not cvv.isdigit() or len(cvv) < 3 or len(cvv) > 4:
            return jsonify({'error': 'Invalid CVV format'}), 400
        
        # Create the card
        card = Card.create_card(
            user_id=ObjectId(user_id),
            card_number=card_number,
            card_holder_name=data['card_holder_name'],
            expiry_month=data['expiry_month'],
            expiry_year=data['expiry_year'],
            cvv=cvv,
            card_type=data['card_type'],
            card_brand=data['card_brand'],
            card_name=data['card_name'],
            credit_limit=data['credit_limit'],
            due_date=data.get('due_date')
        )
        
        card.save()
        return jsonify(card.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cards_bp.route('/<card_id>', methods=['PUT'])
@token_required
def update_card(card_id):
    """Update a credit card"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        card = Card.objects.get(id=ObjectId(card_id), user_id=ObjectId(user_id))
        data = request.get_json()
        
        # Update allowed fields
        if 'card_name' in data:
            card.card_name = data['card_name']
        
        if 'due_date' in data:
            if 1 <= data['due_date'] <= 31:
                card.due_date = data['due_date']
            else:
                return jsonify({'error': 'Invalid due date'}), 400
        
        card.save()
        return jsonify(card.to_dict()), 200
    except Card.DoesNotExist:
        return jsonify({'error': 'Card not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cards_bp.route('/<card_id>/block', methods=['PUT'])
@token_required
def block_card(card_id):
    """Block a credit card"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        card = Card.objects.get(id=ObjectId(card_id), user_id=ObjectId(user_id))
        card.block_card()
        return jsonify(card.to_dict()), 200
    except Card.DoesNotExist:
        return jsonify({'error': 'Card not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cards_bp.route('/<card_id>/unblock', methods=['PUT'])
@token_required
def unblock_card(card_id):
    """Unblock a credit card"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        card = Card.objects.get(id=ObjectId(card_id), user_id=ObjectId(user_id))
        card.unblock_card()
        return jsonify(card.to_dict()), 200
    except Card.DoesNotExist:
        return jsonify({'error': 'Card not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cards_bp.route('/<card_id>/pin', methods=['PUT'])
@token_required
def update_pin(card_id):
    """Update card PIN"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        if 'pin' not in data:
            return jsonify({'error': 'PIN is required'}), 400
        
        pin = str(data['pin'])
        if not pin.isdigit() or len(pin) != 4:
            return jsonify({'error': 'PIN must be 4 digits'}), 400
        
        card = Card.objects.get(id=ObjectId(card_id), user_id=ObjectId(user_id))
        card.set_pin(pin)
        card.save()
        
        return jsonify({'message': 'PIN updated successfully'}), 200
    except Card.DoesNotExist:
        return jsonify({'error': 'Card not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cards_bp.route('/<card_id>/transactions', methods=['GET'])
@token_required
def get_card_transactions(card_id):
    """Get transactions for a specific card"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Verify card belongs to user
        card = Card.objects.get(id=ObjectId(card_id), user_id=ObjectId(user_id))
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', type=str)
        transaction_type = request.args.get('type', type=str)
        
        # Build query
        query = {'card_id': ObjectId(card_id)}
        if status:
            query['status'] = status
        if transaction_type:
            query['transaction_type'] = transaction_type
        
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
    except Card.DoesNotExist:
        return jsonify({'error': 'Card not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cards_bp.route('/<card_id>', methods=['DELETE'])
@token_required
def delete_card(card_id):
    """Delete a credit card (soft delete)"""
    try:
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id')
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        card = Card.objects.get(id=ObjectId(card_id), user_id=ObjectId(user_id))
        card.is_active = False
        card.save()
        
        return jsonify({'message': 'Card deleted successfully'}), 200
    except Card.DoesNotExist:
        return jsonify({'error': 'Card not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
