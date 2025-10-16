from datetime import datetime, timedelta
from mongoengine import Document, StringField, FloatField, IntField, BooleanField, DateTimeField, ReferenceField, ListField

class CibilScore(Document):
    """CIBIL Score model for tracking credit scores"""
    
    # Core information
    user_id = ReferenceField('User', required=True)
    score = IntField(required=True, min_value=300, max_value=900)
    
    # Score details
    score_date = DateTimeField(required=True)
    score_type = StringField(default='cibil', choices=['cibil', 'experian', 'equifax', 'crif'])
    score_range = StringField(required=True, choices=['poor', 'fair', 'good', 'very_good', 'excellent'])
    
    # Credit factors
    payment_history_score = IntField(min_value=0, max_value=100)
    credit_utilization_score = IntField(min_value=0, max_value=100)
    credit_age_score = IntField(min_value=0, max_value=100)
    credit_mix_score = IntField(min_value=0, max_value=100)
    new_credit_score = IntField(min_value=0, max_value=100)
    
    # Credit report details
    total_accounts = IntField(default=0, min_value=0)
    active_accounts = IntField(default=0, min_value=0)
    closed_accounts = IntField(default=0, min_value=0)
    credit_inquiries = IntField(default=0, min_value=0)
    hard_inquiries = IntField(default=0, min_value=0)
    soft_inquiries = IntField(default=0, min_value=0)
    
    # Financial information
    total_credit_limit = FloatField(default=0.0, min_value=0)
    total_outstanding = FloatField(default=0.0, min_value=0)
    credit_utilization_ratio = FloatField(default=0.0, min_value=0, max_value=100)
    oldest_account_age = IntField(default=0, min_value=0)  # in months
    newest_account_age = IntField(default=0, min_value=0)  # in months
    
    # Negative factors
    late_payments = IntField(default=0, min_value=0)
    missed_payments = IntField(default=0, min_value=0)
    defaults = IntField(default=0, min_value=0)
    bankruptcies = IntField(default=0, min_value=0)
    collections = IntField(default=0, min_value=0)
    
    # Status and tracking
    is_current = BooleanField(default=True)
    is_verified = BooleanField(default=False)
    verification_date = DateTimeField()
    last_updated = DateTimeField(default=datetime.utcnow)
    
    # Additional information
    report_number = StringField(max_length=100)
    bureau_reference = StringField(max_length=100)
    notes = StringField(max_length=1000)
    
    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'cibil_scores',
        'indexes': [
            'user_id',
            'score',
            'score_date',
            'is_current',
            'score_range'
        ]
    }
    
    @classmethod
    def create_cibil_score(cls, user_id, score, score_date, score_type='cibil', 
                          payment_history_score=None, credit_utilization_score=None,
                          credit_age_score=None, credit_mix_score=None, new_credit_score=None):
        """Create a new CIBIL score record"""
        cibil_score = cls()
        cibil_score.user_id = user_id
        cibil_score.score = score
        cibil_score.score_date = score_date
        cibil_score.score_type = score_type
        cibil_score.score_range = cls._get_score_range(score)
        cibil_score.payment_history_score = payment_history_score
        cibil_score.credit_utilization_score = credit_utilization_score
        cibil_score.credit_age_score = credit_age_score
        cibil_score.credit_mix_score = credit_mix_score
        cibil_score.new_credit_score = new_credit_score
        return cibil_score
    
    @staticmethod
    def _get_score_range(score):
        """Get score range based on score value"""
        if score >= 750:
            return 'excellent'
        elif score >= 700:
            return 'very_good'
        elif score >= 650:
            return 'good'
        elif score >= 600:
            return 'fair'
        else:
            return 'poor'
    
    def get_score_description(self):
        """Get description of the score"""
        descriptions = {
            'excellent': 'Excellent credit score. You have a very good chance of getting credit at the best rates.',
            'very_good': 'Very good credit score. You should be able to get credit at competitive rates.',
            'good': 'Good credit score. You should be able to get credit, but may not get the best rates.',
            'fair': 'Fair credit score. You may have difficulty getting credit and may pay higher interest rates.',
            'poor': 'Poor credit score. You will likely have difficulty getting credit and will pay high interest rates.'
        }
        return descriptions.get(self.score_range, 'Unknown score range')
    
    def get_improvement_suggestions(self):
        """Get suggestions to improve credit score"""
        suggestions = []
        
        if self.payment_history_score and self.payment_history_score < 80:
            suggestions.append("Make all payments on time to improve your payment history score")
        
        if self.credit_utilization_ratio > 30:
            suggestions.append("Reduce your credit utilization ratio to below 30%")
        
        if self.credit_age_score and self.credit_age_score < 70:
            suggestions.append("Keep old accounts open to improve your credit age")
        
        if self.new_credit_score and self.new_credit_score < 80:
            suggestions.append("Avoid applying for new credit frequently")
        
        if self.late_payments > 0:
            suggestions.append("Ensure all future payments are made on time")
        
        if self.credit_inquiries > 3:
            suggestions.append("Limit the number of credit applications")
        
        return suggestions
    
    def calculate_credit_utilization(self):
        """Calculate credit utilization ratio"""
        if self.total_credit_limit > 0:
            self.credit_utilization_ratio = (self.total_outstanding / self.total_credit_limit) * 100
        else:
            self.credit_utilization_ratio = 0
        return self.credit_utilization_ratio
    
    def update_score(self, new_score, score_date=None):
        """Update the CIBIL score"""
        # Mark current score as not current
        self.is_current = False
        self.save()
        
        # Create new score record
        new_cibil_score = CibilScore.create_cibil_score(
            user_id=self.user_id,
            score=new_score,
            score_date=score_date or datetime.utcnow(),
            score_type=self.score_type
        )
        new_cibil_score.save()
        return new_cibil_score
    
    def verify_score(self, verification_date=None):
        """Verify the CIBIL score"""
        self.is_verified = True
        self.verification_date = verification_date or datetime.utcnow()
        self.save()
    
    def get_score_trend(self, days=90):
        """Get score trend over specified days"""
        # This would typically query historical scores
        # For now, return a placeholder
        return {
            'trend': 'stable',
            'change': 0,
            'period_days': days
        }
    
    def is_score_good(self):
        """Check if the score is considered good"""
        return self.score >= 650
    
    def get_credit_grade(self):
        """Get credit grade based on score"""
        if self.score >= 750:
            return 'A+'
        elif self.score >= 700:
            return 'A'
        elif self.score >= 650:
            return 'B+'
        elif self.score >= 600:
            return 'B'
        elif self.score >= 550:
            return 'C+'
        elif self.score >= 500:
            return 'C'
        else:
            return 'D'
    
    def save(self, *args, **kwargs):
        """Override save to update updated_at timestamp"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def to_dict(self):
        """Convert CIBIL score to dictionary for JSON serialization"""
        return {
            'id': str(self.id),
            'user_id': str(self.user_id.id) if self.user_id else None,
            'score': self.score,
            'score_date': self.score_date.isoformat() if self.score_date else None,
            'score_type': self.score_type,
            'score_range': self.score_range,
            'payment_history_score': self.payment_history_score,
            'credit_utilization_score': self.credit_utilization_score,
            'credit_age_score': self.credit_age_score,
            'credit_mix_score': self.credit_mix_score,
            'new_credit_score': self.new_credit_score,
            'total_accounts': self.total_accounts,
            'active_accounts': self.active_accounts,
            'closed_accounts': self.closed_accounts,
            'credit_inquiries': self.credit_inquiries,
            'hard_inquiries': self.hard_inquiries,
            'soft_inquiries': self.soft_inquiries,
            'total_credit_limit': float(self.total_credit_limit),
            'total_outstanding': float(self.total_outstanding),
            'credit_utilization_ratio': float(self.credit_utilization_ratio),
            'oldest_account_age': self.oldest_account_age,
            'newest_account_age': self.newest_account_age,
            'late_payments': self.late_payments,
            'missed_payments': self.missed_payments,
            'defaults': self.defaults,
            'bankruptcies': self.bankruptcies,
            'collections': self.collections,
            'is_current': self.is_current,
            'is_verified': self.is_verified,
            'verification_date': self.verification_date.isoformat() if self.verification_date else None,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None,
            'report_number': self.report_number,
            'bureau_reference': self.bureau_reference,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'score_description': self.get_score_description(),
            'improvement_suggestions': self.get_improvement_suggestions(),
            'is_score_good': self.is_score_good(),
            'credit_grade': self.get_credit_grade()
        }
    
    def __repr__(self):
        return f'<CibilScore {self.score} - {self.score_range}>'
