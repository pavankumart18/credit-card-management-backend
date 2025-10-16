from datetime import datetime
from mongoengine import Document, StringField, FloatField, IntField, BooleanField, DateTimeField, ReferenceField, ListField

class Notification(Document):
    """Notification model for user notifications"""
    
    # Core notification information
    user_id = ReferenceField('User', required=True)
    title = StringField(required=True, max_length=200)
    message = StringField(required=True, max_length=1000)
    
    # Notification details
    notification_type = StringField(required=True, choices=[
        'transaction', 'payment', 'bill', 'emi', 'card', 'security', 'promotional', 'system'
    ])
    priority = StringField(default='medium', choices=['low', 'medium', 'high', 'urgent'])
    
    # Status and delivery
    is_read = BooleanField(default=False)
    is_sent = BooleanField(default=False)
    read_at = DateTimeField()
    sent_at = DateTimeField()
    
    # Delivery channels
    channels = ListField(StringField(choices=['in_app', 'email', 'sms', 'push']))
    delivery_status = StringField(default='pending', choices=['pending', 'sent', 'delivered', 'failed'])
    
    # Related entities
    related_entity_type = StringField(choices=['card', 'transaction', 'bill', 'emi', 'user'])
    related_entity_id = StringField(max_length=100)
    
    # Action and navigation
    action_url = StringField(max_length=500)
    action_text = StringField(max_length=100)
    requires_action = BooleanField(default=False)
    
    # Additional data
    metadata = StringField(max_length=1000)  # JSON string for additional data
    tags = ListField(StringField(max_length=50))
    
    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    expires_at = DateTimeField()
    
    # Relationships
    user = ReferenceField('User')
    
    meta = {
        'collection': 'notifications',
        'indexes': [
            'user_id',
            'notification_type',
            'is_read',
            'created_at',
            'priority',
            'expires_at'
        ]
    }
    
    @classmethod
    def create_notification(cls, user_id, title, message, notification_type, 
                           priority='medium', channels=None, related_entity_type=None,
                           related_entity_id=None, action_url=None, action_text=None,
                           requires_action=False, metadata=None, tags=None, expires_at=None):
        """Create a new notification"""
        notification = cls()
        notification.user_id = user_id
        notification.title = title
        notification.message = message
        notification.notification_type = notification_type
        notification.priority = priority
        notification.channels = channels or ['in_app']
        notification.related_entity_type = related_entity_type
        notification.related_entity_id = related_entity_id
        notification.action_url = action_url
        notification.action_text = action_text
        notification.requires_action = requires_action
        notification.metadata = metadata
        notification.tags = tags or []
        notification.expires_at = expires_at
        return notification
    
    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        self.read_at = datetime.utcnow()
        self.save()
    
    def mark_as_unread(self):
        """Mark notification as unread"""
        self.is_read = False
        self.read_at = None
        self.save()
    
    def mark_as_sent(self):
        """Mark notification as sent"""
        self.is_sent = True
        self.sent_at = datetime.utcnow()
        self.delivery_status = 'sent'
        self.save()
    
    def mark_as_delivered(self):
        """Mark notification as delivered"""
        self.delivery_status = 'delivered'
        self.save()
    
    def mark_as_failed(self):
        """Mark notification as failed"""
        self.delivery_status = 'failed'
        self.save()
    
    def is_expired(self):
        """Check if notification is expired"""
        if self.expires_at:
            return datetime.utcnow() > self.expires_at
        return False
    
    def is_urgent(self):
        """Check if notification is urgent"""
        return self.priority == 'urgent'
    
    def is_high_priority(self):
        """Check if notification is high priority"""
        return self.priority in ['high', 'urgent']
    
    def get_time_since_created(self):
        """Get time since notification was created"""
        return datetime.utcnow() - self.created_at
    
    def get_formatted_time(self):
        """Get formatted time string"""
        time_diff = self.get_time_since_created()
        
        if time_diff.days > 0:
            return f"{time_diff.days} day{'s' if time_diff.days > 1 else ''} ago"
        elif time_diff.seconds > 3600:
            hours = time_diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif time_diff.seconds > 60:
            minutes = time_diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"
    
    def add_tag(self, tag):
        """Add a tag to the notification"""
        if tag not in self.tags:
            self.tags.append(tag)
            self.save()
    
    def remove_tag(self, tag):
        """Remove a tag from the notification"""
        if tag in self.tags:
            self.tags.remove(tag)
            self.save()
    
    def set_metadata(self, data):
        """Set metadata for the notification"""
        import json
        self.metadata = json.dumps(data)
        self.save()
    
    def get_metadata(self):
        """Get metadata for the notification"""
        if self.metadata:
            import json
            try:
                return json.loads(self.metadata)
            except:
                return {}
        return {}
    
    def save(self, *args, **kwargs):
        """Override save to update updated_at timestamp"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def to_dict(self):
        """Convert notification to dictionary for JSON serialization"""
        return {
            'id': str(self.id),
            'user_id': str(self.user_id) if self.user_id else None,
            'title': self.title,
            'message': self.message,
            'notification_type': self.notification_type,
            'priority': self.priority,
            'is_read': self.is_read,
            'is_sent': self.is_sent,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'channels': self.channels,
            'delivery_status': self.delivery_status,
            'related_entity_type': self.related_entity_type,
            'related_entity_id': self.related_entity_id,
            'action_url': self.action_url,
            'action_text': self.action_text,
            'requires_action': self.requires_action,
            'metadata': self.get_metadata(),
            'tags': self.tags,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_expired': self.is_expired(),
            'is_urgent': self.is_urgent(),
            'is_high_priority': self.is_high_priority(),
            'formatted_time': self.get_formatted_time()
        }
    
    def __repr__(self):
        return f'<Notification {self.title} - {self.notification_type}>'
