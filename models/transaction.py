from datetime import datetime
from mongoengine import Document, StringField, FloatField, IntField, BooleanField, DateTimeField, ReferenceField, ListField

class Transaction(Document):
    """Transaction model for credit card transactions"""
    
    # Core transaction information
    user_id = ReferenceField('User', required=True)
    card_id = ReferenceField('Card', required=True)
    transaction_id = StringField(required=True, unique=True, max_length=50)
    
    # Transaction details
    merchant_name = StringField(required=True, max_length=200)
    merchant_category = StringField(required=True, max_length=100)
    description = StringField(max_length=500)
    
    # Financial information
    amount = FloatField(required=True, min_value=0)
    currency = StringField(default='INR', max_length=3)
    transaction_type = StringField(required=True, choices=['debit', 'credit', 'refund'])
    
    # Status and processing
    status = StringField(default='pending', choices=['pending', 'completed', 'failed', 'cancelled', 'refunded'])
    payment_method = StringField(max_length=50)  # e.g., 'contactless', 'chip', 'online'
    
    # Location and device information
    location = StringField(max_length=200)
    device_type = StringField(max_length=50)  # e.g., 'mobile', 'web', 'pos'
    
    # Timestamps
    transaction_date = DateTimeField(required=True)
    processed_at = DateTimeField()
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    # Additional metadata
    reference_number = StringField(max_length=100)
    authorization_code = StringField(max_length=50)
    is_recurring = BooleanField(default=False)
    is_international = BooleanField(default=False)
    
    meta = {
        'collection': 'transactions',
        'indexes': [
            'user_id',
            'card_id',
            'transaction_id',
            'merchant_name',
            'transaction_date',
            'status',
            'amount'
        ]
    }
    
    @classmethod
    def create_transaction(cls, user_id, card_id, transaction_id, merchant_name, 
                         merchant_category, amount, description=None, 
                         transaction_type='debit', location=None, device_type=None):
        """Create a new transaction"""
        transaction = cls()
        transaction.user_id = user_id
        transaction.card_id = card_id
        transaction.transaction_id = transaction_id
        transaction.merchant_name = merchant_name
        transaction.merchant_category = merchant_category
        transaction.amount = amount
        transaction.description = description
        transaction.transaction_type = transaction_type
        transaction.location = location
        transaction.device_type = device_type
        transaction.transaction_date = datetime.utcnow()
        return transaction
    
    def process_transaction(self):
        """Process the transaction and update status"""
        self.status = 'completed'
        self.processed_at = datetime.utcnow()
        self.save()
    
    def fail_transaction(self):
        """Mark transaction as failed"""
        self.status = 'failed'
        self.processed_at = datetime.utcnow()
        self.save()
    
    def cancel_transaction(self):
        """Cancel the transaction"""
        self.status = 'cancelled'
        self.processed_at = datetime.utcnow()
        self.save()
    
    def refund_transaction(self):
        """Refund the transaction"""
        self.status = 'refunded'
        self.processed_at = datetime.utcnow()
        self.save()
    
    def is_successful(self):
        """Check if transaction was successful"""
        return self.status == 'completed'
    
    def is_pending(self):
        """Check if transaction is pending"""
        return self.status == 'pending'
    
    def get_formatted_amount(self):
        """Get formatted amount with currency"""
        return f"{self.currency} {self.amount:.2f}"
    
    def save(self, *args, **kwargs):
        """Override save to update updated_at timestamp"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def to_dict(self):
        """Convert transaction to dictionary for JSON serialization"""
        return {
            'id': str(self.id),
            'user_id': str(self.user_id) if self.user_id else None,
            'card_id': str(self.card_id) if self.card_id else None,
            'transaction_id': self.transaction_id,
            'merchant_name': self.merchant_name,
            'merchant_category': self.merchant_category,
            'description': self.description,
            'amount': float(self.amount),
            'currency': self.currency,
            'transaction_type': self.transaction_type,
            'status': self.status,
            'payment_method': self.payment_method,
            'location': self.location,
            'device_type': self.device_type,
            'transaction_date': self.transaction_date.isoformat() if self.transaction_date else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'reference_number': self.reference_number,
            'authorization_code': self.authorization_code,
            'is_recurring': self.is_recurring,
            'is_international': self.is_international,
            'formatted_amount': self.get_formatted_amount()
        }
    
    def __repr__(self):
        return f'<Transaction {self.transaction_id} - {self.merchant_name} - {self.get_formatted_amount()}>'
