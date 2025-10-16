import mongoengine

# Import all models here to ensure they are registered with MongoEngine
from .user import User
from .product import Product
from .order import Order, OrderItem
from .card import Card
from .transaction import Transaction
from .bill import Bill
from .emi import EMI
from .cibil_score import CibilScore
from .notification import Notification

# Export all models
__all__ = ['User', 'Product', 'Order', 'OrderItem', 'Card', 'Transaction', 'Bill', 'EMI', 'CibilScore', 'Notification']
