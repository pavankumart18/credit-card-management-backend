from datetime import datetime, timedelta
from mongoengine import Document, StringField, FloatField, IntField, BooleanField, DateTimeField, ReferenceField, ListField

class EMI(Document):
    """EMI model for managing Equated Monthly Installments"""
    
    # Core EMI information
    user_id = ReferenceField('User', required=True)
    card_id = ReferenceField('Card', required=True)
    emi_id = StringField(required=True, unique=True, max_length=50)
    
    # EMI details
    principal_amount = FloatField(required=True, min_value=0)
    interest_rate = FloatField(required=True, min_value=0, max_value=100)  # Annual percentage
    tenure_months = IntField(required=True, min_value=1, max_value=60)
    emi_amount = FloatField(required=True, min_value=0)
    
    # Status and progress
    status = StringField(default='active', choices=['active', 'completed', 'cancelled', 'defaulted'])
    current_installment = IntField(default=0)
    total_installments = IntField(required=True, min_value=1)
    
    # Financial tracking
    total_paid = FloatField(default=0.0, min_value=0)
    remaining_amount = FloatField(required=True, min_value=0)
    interest_paid = FloatField(default=0.0, min_value=0)
    principal_paid = FloatField(default=0.0, min_value=0)
    
    # Dates
    start_date = DateTimeField(required=True)
    end_date = DateTimeField(required=True)
    next_due_date = DateTimeField(required=True)
    last_payment_date = DateTimeField()
    
    # Additional information
    description = StringField(max_length=500)
    merchant_name = StringField(max_length=200)
    product_name = StringField(max_length=200)
    
    # Auto-pay settings
    auto_pay_enabled = BooleanField(default=False)
    auto_pay_date = IntField(min_value=1, max_value=31)  # Day of month
    
    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    # Relationships
    payment_transactions = ListField(ReferenceField('Transaction'))
    
    meta = {
        'collection': 'emis',
        'indexes': [
            'user_id',
            'card_id',
            'emi_id',
            'status',
            'next_due_date',
            'start_date'
        ]
    }
    
    @classmethod
    def create_emi(cls, user_id, card_id, emi_id, principal_amount, interest_rate, 
                  tenure_months, start_date, description=None, merchant_name=None, 
                  product_name=None):
        """Create a new EMI"""
        emi = cls()
        emi.user_id = user_id
        emi.card_id = card_id
        emi.emi_id = emi_id
        emi.principal_amount = principal_amount
        emi.interest_rate = interest_rate
        emi.tenure_months = tenure_months
        emi.start_date = start_date
        emi.description = description
        emi.merchant_name = merchant_name
        emi.product_name = product_name
        
        # Calculate EMI amount and dates
        emi.emi_amount = cls._calculate_emi_amount(principal_amount, interest_rate, tenure_months)
        emi.total_installments = tenure_months
        emi.remaining_amount = principal_amount
        emi.end_date = start_date + timedelta(days=30 * tenure_months)
        emi.next_due_date = start_date + timedelta(days=30)
        
        return emi
    
    @staticmethod
    def _calculate_emi_amount(principal, rate, months):
        """Calculate EMI amount using the formula"""
        if rate == 0:
            return principal / months
        
        monthly_rate = rate / (12 * 100)
        emi = principal * monthly_rate * ((1 + monthly_rate) ** months) / (((1 + monthly_rate) ** months) - 1)
        return round(emi, 2)
    
    def make_payment(self, amount, payment_date=None):
        """Make an EMI payment"""
        if payment_date is None:
            payment_date = datetime.utcnow()
        
        # Calculate interest and principal components
        interest_component = self._calculate_interest_component(amount)
        principal_component = amount - interest_component
        
        # Update EMI details
        self.total_paid += amount
        self.remaining_amount -= principal_component
        self.interest_paid += interest_component
        self.principal_paid += principal_component
        self.current_installment += 1
        self.last_payment_date = payment_date
        
        # Update next due date
        self.next_due_date = payment_date + timedelta(days=30)
        
        # Check if EMI is completed
        if self.remaining_amount <= 0:
            self.status = 'completed'
            self.remaining_amount = 0
            self.current_installment = self.total_installments
        elif self.current_installment >= self.total_installments:
            self.status = 'completed'
            self.remaining_amount = 0
        
        self.save()
    
    def _calculate_interest_component(self, payment_amount):
        """Calculate interest component of payment"""
        # Simple calculation - in practice, this would be more complex
        monthly_rate = self.interest_rate / (12 * 100)
        interest_due = self.remaining_amount * monthly_rate
        return min(interest_due, payment_amount)
    
    def is_overdue(self):
        """Check if EMI is overdue"""
        return datetime.utcnow() > self.next_due_date and self.status == 'active'
    
    def is_due_soon(self, days=3):
        """Check if EMI is due within specified days"""
        return (self.next_due_date - datetime.utcnow()).days <= days and self.status == 'active'
    
    def get_progress_percentage(self):
        """Get completion percentage"""
        return (self.current_installment / self.total_installments) * 100
    
    def get_remaining_installments(self):
        """Get remaining number of installments"""
        return self.total_installments - self.current_installment
    
    def get_total_interest(self):
        """Get total interest to be paid"""
        return (self.emi_amount * self.total_installments) - self.principal_amount
    
    def enable_auto_pay(self, auto_pay_date=None):
        """Enable auto pay for EMI"""
        self.auto_pay_enabled = True
        if auto_pay_date:
            self.auto_pay_date = auto_pay_date
        self.save()
    
    def disable_auto_pay(self):
        """Disable auto pay"""
        self.auto_pay_enabled = False
        self.save()
    
    def cancel_emi(self):
        """Cancel the EMI"""
        self.status = 'cancelled'
        self.save()
    
    def mark_defaulted(self):
        """Mark EMI as defaulted"""
        self.status = 'defaulted'
        self.save()
    
    def get_formatted_emi_amount(self):
        """Get formatted EMI amount"""
        return f"INR {self.emi_amount:.2f}"
    
    def get_formatted_remaining_amount(self):
        """Get formatted remaining amount"""
        return f"INR {self.remaining_amount:.2f}"
    
    def save(self, *args, **kwargs):
        """Override save to update updated_at timestamp"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def to_dict(self):
        """Convert EMI to dictionary for JSON serialization"""
        return {
            'id': str(self.id),
            'user_id': str(self.user_id) if self.user_id else None,
            'card_id': str(self.card_id) if self.card_id else None,
            'emi_id': self.emi_id,
            'principal_amount': float(self.principal_amount),
            'interest_rate': float(self.interest_rate),
            'tenure_months': self.tenure_months,
            'emi_amount': float(self.emi_amount),
            'status': self.status,
            'current_installment': self.current_installment,
            'total_installments': self.total_installments,
            'total_paid': float(self.total_paid),
            'remaining_amount': float(self.remaining_amount),
            'interest_paid': float(self.interest_paid),
            'principal_paid': float(self.principal_paid),
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'next_due_date': self.next_due_date.isoformat() if self.next_due_date else None,
            'last_payment_date': self.last_payment_date.isoformat() if self.last_payment_date else None,
            'description': self.description,
            'merchant_name': self.merchant_name,
            'product_name': self.product_name,
            'auto_pay_enabled': self.auto_pay_enabled,
            'auto_pay_date': self.auto_pay_date,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_overdue': self.is_overdue(),
            'is_due_soon': self.is_due_soon(),
            'progress_percentage': self.get_progress_percentage(),
            'remaining_installments': self.get_remaining_installments(),
            'total_interest': float(self.get_total_interest()),
            'formatted_emi_amount': self.get_formatted_emi_amount(),
            'formatted_remaining_amount': self.get_formatted_remaining_amount()
        }
    
    def __repr__(self):
        return f'<EMI {self.emi_id} - {self.get_formatted_emi_amount()}/month>'
