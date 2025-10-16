
from datetime import datetime
from mongoengine import (
    Document, StringField, FloatField, BooleanField, DateTimeField,
    ReferenceField, IntField, ListField
)
from services.encryption import encryption_service
import uuid

class Card(Document):
    """Credit Card model for user card management"""

    # Relationships
    user_id = ReferenceField('User', required=True, reverse_delete_rule=2)  # CASCADE

    # Card details
    card_id = StringField(required=True, unique=True, max_length=50)
    card_name = StringField(required=True, max_length=100)
    card_holder_name = StringField(required=True, max_length=100)
    card_number = StringField(required=True, max_length=256)  # Store encrypted card number
    card_type = StringField(required=True, max_length=50)  # visa, mastercard, amex, rupay
    card_brand = StringField(required=True, max_length=100)  # Visa Platinum, etc.
    expiry_month = IntField(required=True, min_value=1, max_value=12)
    expiry_year = IntField(required=True, min_value=2024)
    cvv = StringField(required=True, max_length=256)  # Store encrypted CVV
    pin_hash = StringField(max_length=256)  # Store hashed PIN
    secret = StringField(max_length=16)  # Masked or last 4 digits

    # Financials
    credit_limit = FloatField(required=True, min_value=0)
    outstanding_balance = FloatField(default=0.0, min_value=0)
    available_credit = FloatField(default=0.0, min_value=0)
    minimum_payment = FloatField(default=0.0, min_value=0)
    due_date = IntField(min_value=1, max_value=31)  # Day of month
    is_active = BooleanField(default=True)
    is_blocked = BooleanField(default=False)
    is_international = BooleanField(default=True)

    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    last_used = DateTimeField()

    # Relationships
    transactions = ListField(ReferenceField('Transaction'))
    emis = ListField(ReferenceField('EMI'))

    meta = {
        'collection': 'cards',
        'indexes': [
            'user_id',
            'card_id',
            'card_number',
            'card_brand',
            'is_blocked',
            'is_active'
        ]
    }

    @classmethod
    def create_card(cls, user_id, card_number, card_holder_name, expiry_month, 
                   expiry_year, cvv, card_type, card_brand, card_name, 
                   credit_limit, due_date=None):
        """Create a new credit card with encryption"""
        card = cls()
        card.user_id = user_id
        card.card_id = f"CARD_{uuid.uuid4().hex[:12].upper()}"
        card.card_name = card_name
        card.card_holder_name = card_holder_name
        card.card_type = card_type
        card.card_brand = card_brand
        card.expiry_month = expiry_month
        card.expiry_year = expiry_year
        card.credit_limit = credit_limit
        card.available_credit = credit_limit
        card.outstanding_balance = 0.0
        card.minimum_payment = 0.0
        card.due_date = due_date
        card.is_active = True
        card.is_blocked = False
        
        # Encrypt sensitive data
        card.card_number = encryption_service.encrypt_card_number(card_number)
        card.cvv = encryption_service.encrypt_cvv(cvv)
        
        # Store last 4 digits for display
        card.secret = card_number[-4:] if len(card_number) >= 4 else "****"
        
        return card

    def mask_number(self):
        """Return masked card number for display (last 4 digits)"""
        if self.secret:
            return f"**** **** **** {self.secret}"
        return "**** **** **** ****"

    def get_masked_number(self):
        """Alias for mask_number for compatibility"""
        return self.mask_number()

    def block_card(self):
        """Block the card"""
        self.is_blocked = True
        self.is_active = False
        self.save()

    def unblock_card(self):
        """Unblock the card"""
        self.is_blocked = False
        self.is_active = True
        self.save()

    def set_pin(self, pin):
        """Set the card PIN (hash it)"""
        from werkzeug.security import generate_password_hash
        self.pin_hash = generate_password_hash(pin)
        self.save()

    def check_pin(self, pin):
        """Check if provided PIN matches stored hash"""
        if not self.pin_hash:
            return False
        from werkzeug.security import check_password_hash
        return check_password_hash(self.pin_hash, pin)

    def update_balance(self, amount, transaction_type='debit'):
        """Update card balance after transaction"""
        if transaction_type == 'debit':
            self.outstanding_balance += amount
        elif transaction_type == 'credit':
            self.outstanding_balance -= amount
        
        # Ensure balance doesn't go negative
        if self.outstanding_balance < 0:
            self.outstanding_balance = 0
        
        # Update available credit
        self.available_credit = self.credit_limit - self.outstanding_balance
        
        # Update minimum payment (typically 5% of outstanding or minimum amount)
        self.minimum_payment = max(self.outstanding_balance * 0.05, 100.0)
        
        self.save()

    def is_expired(self):
        """Check if card is expired"""
        current_date = datetime.utcnow()
        return (self.expiry_year < current_date.year or 
                (self.expiry_year == current_date.year and self.expiry_month < current_date.month))

    def get_expiry_string(self):
        """Get formatted expiry string"""
        return f"{self.expiry_month:02d}/{self.expiry_year}"

    def save(self, *args, **kwargs):
        """Override save to update updated_at timestamp"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)

    def to_dict(self):
        """Convert card to dictionary for JSON serialization"""
        return {
            'id': str(self.id),
            'user_id': str(self.user_id) if self.user_id else None,
            'card_id': self.card_id,
            'card_name': self.card_name,
            'card_holder_name': self.card_holder_name,
            'card_type': self.card_type,
            'card_brand': self.card_brand,
            'card_number': self.get_masked_number(),
            'expiry_month': self.expiry_month,
            'expiry_year': self.expiry_year,
            'expiry': self.get_expiry_string(),
            'credit_limit': float(self.credit_limit),
            'available_credit': float(self.available_credit),
            'outstanding_balance': float(self.outstanding_balance),
            'minimum_payment': float(self.minimum_payment),
            'due_date': self.due_date,
            'is_active': self.is_active,
            'is_blocked': self.is_blocked,
            'is_international': self.is_international,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_used': self.last_used.isoformat() if self.last_used else None,
            'is_expired': self.is_expired()
        }

    def __repr__(self):
        return f'<Card {self.card_id} - {self.card_name} - {self.get_masked_number()}>'