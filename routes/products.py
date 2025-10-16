from flask import Blueprint, request, jsonify
from models.product import Product
from bson import ObjectId

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
def get_products():
    """Get all products with filtering and pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category = request.args.get('category', '', type=str)
    search = request.args.get('search', '', type=str)
    in_stock_only = request.args.get('in_stock_only', 'false', type=str).lower() == 'true'
    
    # Build query
    query = {'is_active': True}  # Only show active products by default
    
    if category:
        query['category'] = category
    
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}},
            {'sku': {'$regex': search, '$options': 'i'}}
        ]
    
    if in_stock_only:
        query['stock_quantity'] = {'$gt': 0}
    
    # Calculate pagination
    skip = (page - 1) * per_page
    
    # Get products with pagination
    products = Product.objects(__raw__=query).skip(skip).limit(per_page)
    total = Product.objects(__raw__=query).count()
    
    return jsonify({
        'products': [product.to_dict() for product in products],
        'total': total,
        'pages': (total + per_page - 1) // per_page,
        'current_page': page,
        'per_page': per_page
    }), 200

@products_bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product by ID"""
    try:
        product = Product.objects.get(id=ObjectId(product_id))
        return jsonify(product.to_dict()), 200
    except Product.DoesNotExist:
        return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/', methods=['POST'])
def create_product():
    """Create a new product"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'price', 'sku', 'category']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if SKU already exists
    if Product.objects(sku=data['sku']).first():
        return jsonify({'error': 'SKU already exists'}), 400
    
    try:
        product = Product.create_product(
            name=data['name'],
            description=data.get('description', ''),
            price=float(data['price']),
            sku=data['sku'],
            category=data['category'],
            stock_quantity=data.get('stock_quantity', 0),
            image_url=data.get('image_url'),
            weight=float(data['weight']) if data.get('weight') else None,
            dimensions=data.get('dimensions')
        )
        
        product.save()
        return jsonify(product.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<product_id>', methods=['PUT'])
def update_product(product_id):
    """Update a product"""
    try:
        product = Product.objects.get(id=ObjectId(product_id))
        data = request.get_json()
        
        # Update fields if provided
        if 'name' in data:
            product.name = data['name']
        
        if 'description' in data:
            product.description = data['description']
        
        if 'price' in data:
            product.price = float(data['price'])
        
        if 'sku' in data:
            # Check if SKU is already taken by another product
            existing_product = Product.objects(sku=data['sku']).first()
            if existing_product and str(existing_product.id) != product_id:
                return jsonify({'error': 'SKU already exists'}), 400
            product.sku = data['sku']
        
        if 'category' in data:
            product.category = data['category']
        
        if 'stock_quantity' in data:
            product.stock_quantity = data['stock_quantity']
        
        if 'is_active' in data:
            product.is_active = data['is_active']
        
        if 'image_url' in data:
            product.image_url = data['image_url']
        
        if 'weight' in data:
            product.weight = float(data['weight']) if data['weight'] else None
        
        if 'dimensions' in data:
            product.dimensions = data['dimensions']
        
        product.save()
        return jsonify(product.to_dict()), 200
    except Product.DoesNotExist:
        return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete a product (soft delete by setting is_active to False)"""
    try:
        product = Product.objects.get(id=ObjectId(product_id))
        product.is_active = False
        product.save()
        return jsonify({'message': 'Product deactivated successfully'}), 200
    except Product.DoesNotExist:
        return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<product_id>/stock', methods=['PUT'])
def update_stock(product_id):
    """Update product stock quantity"""
    try:
        product = Product.objects.get(id=ObjectId(product_id))
        data = request.get_json()
        
        if 'quantity' not in data:
            return jsonify({'error': 'quantity is required'}), 400
        
        quantity_change = data['quantity']
        product.update_stock(quantity_change)
        product.save()
        
        return jsonify({
            'message': 'Stock updated successfully',
            'product': product.to_dict()
        }), 200
    except Product.DoesNotExist:
        return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all product categories"""
    try:
        categories = Product.objects.distinct('category')
        category_list = [cat for cat in categories if cat]
        return jsonify({'categories': category_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
