from flask import Blueprint, request, jsonify
from models.order import Order, OrderItem
from models.product import Product
from models.user import User
from bson import ObjectId
import uuid
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['GET'])
def get_orders():
    """Get all orders with filtering and pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status', '', type=str)
    user_id = request.args.get('user_id', type=str)
    
    # Build query
    query = {}
    
    if status:
        query['status'] = status
    
    if user_id:
        try:
            query['user_id'] = ObjectId(user_id)
        except:
            return jsonify({'error': 'Invalid user_id format'}), 400
    
    # Calculate pagination
    skip = (page - 1) * per_page
    
    # Get orders with pagination
    orders = Order.objects(__raw__=query).order_by('-created_at').skip(skip).limit(per_page)
    total = Order.objects(__raw__=query).count()
    
    return jsonify({
        'orders': [order.to_dict() for order in orders],
        'total': total,
        'pages': (total + per_page - 1) // per_page,
        'current_page': page,
        'per_page': per_page
    }), 200

@orders_bp.route('/<order_id>', methods=['GET'])
def get_order(order_id):
    """Get a specific order by ID"""
    try:
        order = Order.objects.get(id=ObjectId(order_id))
        return jsonify(order.to_dict()), 200
    except Order.DoesNotExist:
        return jsonify({'error': 'Order not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/', methods=['POST'])
def create_order():
    """Create a new order"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['user_id', 'shipping_address', 'order_items']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Validate user exists
    try:
        user = User.objects.get(id=ObjectId(data['user_id']))
    except User.DoesNotExist:
        return jsonify({'error': 'User not found'}), 404
    except:
        return jsonify({'error': 'Invalid user_id format'}), 400
    
    # Validate order items
    if not isinstance(data['order_items'], list) or len(data['order_items']) == 0:
        return jsonify({'error': 'Order must have at least one item'}), 400
    
    try:
        # Generate unique order number
        order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        # Create order
        order = Order.create_order(
            user_id=user,
            order_number=order_number,
            shipping_address=data['shipping_address'],
            billing_address=data.get('billing_address'),
            payment_method=data.get('payment_method'),
            notes=data.get('notes')
        )
        
        # Create order items and validate products
        total_amount = 0.0
        order_items = []
        
        for item_data in data['order_items']:
            try:
                product = Product.objects.get(id=ObjectId(item_data['product_id']))
            except Product.DoesNotExist:
                return jsonify({'error': f'Product with ID {item_data["product_id"]} not found'}), 404
            except:
                return jsonify({'error': f'Invalid product_id format: {item_data["product_id"]}'}), 400
            
            if not product.is_active:
                return jsonify({'error': f'Product {product.name} is not available'}), 400
            
            if product.stock_quantity < item_data['quantity']:
                return jsonify({'error': f'Insufficient stock for product {product.name}'}), 400
            
            # Create order item
            order_item = OrderItem(
                product_id=product,
                quantity=item_data['quantity'],
                price=product.price
            )
            
            order_items.append(order_item)
            
            # Update product stock
            product.update_stock(-item_data['quantity'])
            product.save()
            
            # Add to total
            total_amount += product.price * item_data['quantity']
        
        # Set order items and total
        order.order_items = order_items
        order.total_amount = total_amount
        
        order.save()
        
        return jsonify(order.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<order_id>', methods=['PUT'])
def update_order(order_id):
    """Update an order"""
    try:
        order = Order.objects.get(id=ObjectId(order_id))
        data = request.get_json()
        
        # Update fields if provided
        if 'status' in data:
            order.update_status(data['status'])
        
        if 'shipping_address' in data:
            order.shipping_address = data['shipping_address']
        
        if 'billing_address' in data:
            order.billing_address = data['billing_address']
        
        if 'payment_method' in data:
            order.payment_method = data['payment_method']
        
        if 'payment_status' in data:
            order.payment_status = data['payment_status']
        
        if 'notes' in data:
            order.notes = data['notes']
        
        order.save()
        return jsonify(order.to_dict()), 200
    except Order.DoesNotExist:
        return jsonify({'error': 'Order not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<order_id>', methods=['DELETE'])
def cancel_order(order_id):
    """Cancel an order (only if status is pending)"""
    try:
        order = Order.objects.get(id=ObjectId(order_id))
        
        if order.status not in ['pending', 'confirmed']:
            return jsonify({'error': 'Cannot cancel order with current status'}), 400
        
        # Restore product stock
        for item in order.order_items:
            product = item.product_id
            if product:
                product.update_stock(item.quantity)
                product.save()
        
        # Update order status
        order.status = 'cancelled'
        order.save()
        
        return jsonify({'message': 'Order cancelled successfully'}), 200
    except Order.DoesNotExist:
        return jsonify({'error': 'Order not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<order_id>/items', methods=['GET'])
def get_order_items(order_id):
    """Get all items for a specific order"""
    try:
        order = Order.objects.get(id=ObjectId(order_id))
        return jsonify([item.to_dict() for item in order.order_items]), 200
    except Order.DoesNotExist:
        return jsonify({'error': 'Order not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/statuses', methods=['GET'])
def get_order_statuses():
    """Get all possible order statuses"""
    statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    return jsonify({'statuses': statuses}), 200
