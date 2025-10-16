from datetime import datetime
from mongoengine import Document, StringField, FloatField, IntField, DateTimeField, ReferenceField, ListField, EmbeddedDocument, EmbeddedDocumentField

class OrderItem(EmbeddedDocument):
    """Order item model for individual items in an order"""
    
    product_id = ReferenceField('Product', required=True)
    quantity = IntField(required=True)
    price = FloatField(required=True)  # Price at time of order
    created_at = DateTimeField(default=datetime.utcnow)
    
    def get_subtotal(self):
        """Calculate subtotal for this order item"""
        return self.price * self.quantity
    
    def to_dict(self):
        """Convert order item to dictionary for JSON serialization"""
        return {
            'product_id': str(self.product_id.id) if self.product_id else None,
            'quantity': self.quantity,
            'price': float(self.price) if self.price else 0,
            'subtotal': float(self.get_subtotal()),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'product': self.product_id.to_dict() if self.product_id else None
        }

class Order(Document):
    """Order model for managing customer orders"""
    
    user_id = ReferenceField('User', required=True)
    order_number = StringField(required=True, unique=True, max_length=20)
    status = StringField(default='pending', max_length=20)
    total_amount = FloatField(default=0.0)
    shipping_address = StringField(required=True, max_length=1000)
    billing_address = StringField(max_length=1000)
    payment_method = StringField(max_length=50)
    payment_status = StringField(default='pending', max_length=20)
    notes = StringField(max_length=1000)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    shipped_at = DateTimeField()
    delivered_at = DateTimeField()
    
    # Embedded documents
    order_items = ListField(EmbeddedDocumentField(OrderItem))
    
    meta = {
        'collection': 'orders',
        'indexes': [
            'order_number',
            'status',
            'user_id',
            'created_at'
        ]
    }
    
    @classmethod
    def create_order(cls, user_id, order_number, shipping_address, billing_address=None, 
                    payment_method=None, notes=None):
        """Create a new order"""
        order = cls()
        order.user_id = user_id
        order.order_number = order_number
        order.shipping_address = shipping_address
        order.billing_address = billing_address
        order.payment_method = payment_method
        order.notes = notes
        order.total_amount = 0.0
        return order
    
    def calculate_total(self):
        """Calculate total amount from order items"""
        total = 0.0
        for item in self.order_items:
            total += item.price * item.quantity
        self.total_amount = total
        return total
    
    def update_status(self, status):
        """Update order status with timestamp"""
        self.status = status
        if status == 'shipped':
            self.shipped_at = datetime.utcnow()
        elif status == 'delivered':
            self.delivered_at = datetime.utcnow()
    
    def save(self, *args, **kwargs):
        """Override save to update updated_at timestamp"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def to_dict(self):
        """Convert order to dictionary for JSON serialization"""
        return {
            'id': str(self.id),
            'user_id': str(self.user_id.id) if self.user_id else None,
            'order_number': self.order_number,
            'status': self.status,
            'total_amount': float(self.total_amount) if self.total_amount else 0,
            'shipping_address': self.shipping_address,
            'billing_address': self.billing_address,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'shipped_at': self.shipped_at.isoformat() if self.shipped_at else None,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
            'order_items': [item.to_dict() for item in self.order_items]
        }
    
    def __repr__(self):
        return f'<Order {self.order_number}>'
