from datetime import datetime
from mongoengine import Document, StringField, FloatField, IntField, BooleanField, DateTimeField, ReferenceField, ListField

class Product(Document):
    """Product model for e-commerce or inventory management"""
    
    name = StringField(required=True, max_length=100)
    description = StringField(max_length=1000)
    price = FloatField(required=True)
    sku = StringField(required=True, unique=True, max_length=50)
    category = StringField(required=True, max_length=50)
    stock_quantity = IntField(default=0)
    is_active = BooleanField(default=True)
    image_url = StringField(max_length=255)
    weight = FloatField()  # in kg
    dimensions = StringField(max_length=50)  # LxWxH in cm
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    # Relationships
    order_items = ListField(ReferenceField('OrderItem'))
    
    meta = {
        'collection': 'products',
        'indexes': [
            'name',
            'sku',
            'category',
            'created_at'
        ]
    }
    
    @classmethod
    def create_product(cls, name, description, price, sku, category, stock_quantity=0, 
                      image_url=None, weight=None, dimensions=None):
        """Create a new product"""
        product = cls()
        product.name = name
        product.description = description
        product.price = price
        product.sku = sku
        product.category = category
        product.stock_quantity = stock_quantity
        product.image_url = image_url
        product.weight = weight
        product.dimensions = dimensions
        return product
    
    def update_stock(self, quantity):
        """Update stock quantity"""
        self.stock_quantity += quantity
        if self.stock_quantity < 0:
            self.stock_quantity = 0
    
    def is_in_stock(self):
        """Check if product is in stock"""
        return self.stock_quantity > 0
    
    def save(self, *args, **kwargs):
        """Override save to update updated_at timestamp"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def to_dict(self):
        """Convert product to dictionary for JSON serialization"""
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'price': float(self.price) if self.price else 0,
            'sku': self.sku,
            'category': self.category,
            'stock_quantity': self.stock_quantity,
            'is_active': self.is_active,
            'image_url': self.image_url,
            'weight': float(self.weight) if self.weight else None,
            'dimensions': self.dimensions,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Product {self.name}>'
