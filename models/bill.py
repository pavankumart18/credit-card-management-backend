from datetime import datetime, timedelta
from mongoengine import Document, StringField, FloatField, IntField, BooleanField, DateTimeField, ReferenceField, ListField

class Bill(Document):
    """Bill model for managing bill payments"""
    
    # Core bill information
    user_id = ReferenceField('User', required=True)
    card_id = ReferenceField('Card', required=True)
    bill_id = StringField(required=True, unique=True, max_length=50)
    
    # Bill details
    biller_name = StringField(required=True, max_length=200)
    biller_category = StringField(required=True, max_length=100)
    bill_type = StringField(required=True, choices=['utility', 'mobile', 'internet', 'insurance', 'loan', 'credit_card', 'other'])
    
    # Financial information
    amount = FloatField(required=True, min_value=0)
    currency = StringField(default='INR', max_length=3)
    due_date = DateTimeField(required=True)
    
    # Payment information
    payment_status = StringField(default='pending', choices=['pending', 'paid', 'overdue', 'cancelled'])
    paid_amount = FloatField(default=0.0, min_value=0)
    paid_date = DateTimeField()
    
    # Bill details
    bill_period_start = DateTimeField()
    bill_period_end = DateTimeField()
    bill_number = StringField(max_length=100)
    consumer_number = StringField(max_length=100)
    
    # Additional information
    description = StringField(max_length=500)
    is_recurring = BooleanField(default=False)
    recurring_frequency = StringField(choices=['monthly', 'quarterly', 'yearly'])
    auto_pay_enabled = BooleanField(default=False)
    
    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    reminder_sent = BooleanField(default=False)
    
    # Relationships
    payment_transactions = ListField(ReferenceField('Transaction'))
    
    meta = {
        'collection': 'bills',
        'indexes': [
            'user_id',
            'card_id',
            'bill_id',
            'biller_name',
            'due_date',
            'payment_status',
            'bill_type'
        ]
    }
    
    @classmethod
    def create_bill(cls, user_id, card_id, bill_id, biller_name, biller_category, 
                   bill_type, amount, due_date, bill_number=None, consumer_number=None,
                   description=None, is_recurring=False, recurring_frequency=None):
        """Create a new bill"""
        bill = cls()
        bill.user_id = user_id
        bill.card_id = card_id
        bill.bill_id = bill_id
        bill.biller_name = biller_name
        bill.biller_category = biller_category
        bill.bill_type = bill_type
        bill.amount = amount
        bill.due_date = due_date
        bill.bill_number = bill_number
        bill.consumer_number = consumer_number
        bill.description = description
        bill.is_recurring = is_recurring
        bill.recurring_frequency = recurring_frequency
        return bill
    
    def is_overdue(self):
        """Check if bill is overdue"""
        return datetime.utcnow() > self.due_date and self.payment_status != 'paid'
    
    def is_due_soon(self, days=3):
        """Check if bill is due within specified days"""
        days_until_due = (self.due_date - datetime.utcnow()).days
        return 0 <= days_until_due <= days and self.payment_status == 'pending'
    
    def pay_bill(self, amount=None, payment_date=None):
        """Pay the bill"""
        if amount is None:
            amount = self.amount
        
        self.paid_amount += amount
        self.paid_date = payment_date or datetime.utcnow()
        self.payment_status = 'paid'
        self.save()
    
    def mark_overdue(self):
        """Mark bill as overdue"""
        if self.payment_status == 'pending' and self.is_overdue():
            self.payment_status = 'overdue'
            self.save()
    
    def cancel_bill(self):
        """Cancel the bill"""
        self.payment_status = 'cancelled'
        self.save()
    
    def get_remaining_amount(self):
        """Get remaining amount to be paid"""
        return max(0, self.amount - self.paid_amount)
    
    def get_days_until_due(self):
        """Get days until due date"""
        return (self.due_date - datetime.utcnow()).days
    
    def get_formatted_amount(self):
        """Get formatted amount with currency"""
        return f"{self.currency} {self.amount:.2f}"
    
    def enable_auto_pay(self):
        """Enable auto pay for recurring bills"""
        if self.is_recurring:
            self.auto_pay_enabled = True
            self.save()
    
    def disable_auto_pay(self):
        """Disable auto pay"""
        self.auto_pay_enabled = False
        self.save()
    
    def save(self, *args, **kwargs):
        """Override save to update updated_at timestamp"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def to_dict(self):
        """Convert bill to dictionary for JSON serialization"""
        return {
            'id': str(self.id),
            'user_id': str(self.user_id) if self.user_id else None,
            'card_id': str(self.card_id) if self.card_id else None,
            'bill_id': self.bill_id,
            'biller_name': self.biller_name,
            'biller_category': self.biller_category,
            'bill_type': self.bill_type,
            'amount': float(self.amount),
            'currency': self.currency,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'payment_status': self.payment_status,
            'paid_amount': float(self.paid_amount),
            'paid_date': self.paid_date.isoformat() if self.paid_date else None,
            'bill_period_start': self.bill_period_start.isoformat() if self.bill_period_start else None,
            'bill_period_end': self.bill_period_end.isoformat() if self.bill_period_end else None,
            'bill_number': self.bill_number,
            'consumer_number': self.consumer_number,
            'description': self.description,
            'is_recurring': self.is_recurring,
            'recurring_frequency': self.recurring_frequency,
            'auto_pay_enabled': self.auto_pay_enabled,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'reminder_sent': self.reminder_sent,
            'is_overdue': self.is_overdue(),
            'is_due_soon': self.is_due_soon(),
            'remaining_amount': float(self.get_remaining_amount()),
            'days_until_due': self.get_days_until_due(),
            'formatted_amount': self.get_formatted_amount()
        }
    
    def __repr__(self):
        return f'<Bill {self.bill_id} - {self.biller_name} - {self.get_formatted_amount()}>'
