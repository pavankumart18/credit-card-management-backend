from datetime import datetime, timedelta
from models.notification import Notification
from models.user import User
from models.card import Card
from models.transaction import Transaction
from models.bill import Bill
from models.emi import EMI
from services.auth import log_authentication_event

class NotificationService:
    """Business logic service for notification operations"""
    
    @staticmethod
    def send_transaction_notification(user_id, transaction):
        """Send notification for a transaction"""
        try:
            notification = Notification.create_notification(
                user_id=user_id,
                title="Transaction Alert",
                message=f"Transaction of {transaction.get_formatted_amount()} at {transaction.merchant_name}",
                notification_type="transaction",
                priority="medium",
                related_entity_type="transaction",
                related_entity_id=str(transaction.id),
                action_url=f"/transactions/{transaction.id}",
                action_text="View Transaction"
            )
            notification.save()
            return {'success': True, 'notification': notification.to_dict()}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def send_bill_reminder(user_id, bill):
        """Send bill payment reminder"""
        try:
            days_until_due = bill.get_days_until_due()
            
            if days_until_due <= 3 and days_until_due > 0:
                priority = "high" if days_until_due == 1 else "medium"
                message = f"Bill payment of {bill.get_formatted_amount()} is due in {days_until_due} day{'s' if days_until_due > 1 else ''}"
            elif days_until_due <= 0:
                priority = "urgent"
                message = f"Bill payment of {bill.get_formatted_amount()} is overdue!"
            else:
                return {'success': False, 'error': 'No reminder needed'}
            
            notification = Notification.create_notification(
                user_id=user_id,
                title="Bill Payment Reminder",
                message=message,
                notification_type="bill",
                priority=priority,
                related_entity_type="bill",
                related_entity_id=str(bill.id),
                action_url=f"/bills/{bill.id}",
                action_text="Pay Bill"
            )
            notification.save()
            return {'success': True, 'notification': notification.to_dict()}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def send_emi_reminder(user_id, emi):
        """Send EMI payment reminder"""
        try:
            days_until_due = (emi.next_due_date - datetime.utcnow()).days
            
            if days_until_due <= 3 and days_until_due > 0:
                priority = "high" if days_until_due == 1 else "medium"
                message = f"EMI payment of {emi.get_formatted_emi_amount()} is due in {days_until_due} day{'s' if days_until_due > 1 else ''}"
            elif days_until_due <= 0:
                priority = "urgent"
                message = f"EMI payment of {emi.get_formatted_emi_amount()} is overdue!"
            else:
                return {'success': False, 'error': 'No reminder needed'}
            
            notification = Notification.create_notification(
                user_id=user_id,
                title="EMI Payment Reminder",
                message=message,
                notification_type="emi",
                priority=priority,
                related_entity_type="emi",
                related_entity_id=str(emi.id),
                action_url=f"/emis/{emi.id}",
                action_text="Pay EMI"
            )
            notification.save()
            return {'success': True, 'notification': notification.to_dict()}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def send_security_alert(user_id, alert_type, details):
        """Send security alert notification"""
        try:
            alert_messages = {
                'card_blocked': f"Your card has been blocked for security reasons. {details.get('reason', '')}",
                'suspicious_activity': "Suspicious activity detected on your account. Please verify your transactions.",
                'password_changed': "Your password has been changed successfully.",
                'pin_updated': "Your card PIN has been updated successfully.",
                'login_from_new_device': "Login detected from a new device. If this wasn't you, please contact support."
            }
            
            message = alert_messages.get(alert_type, "Security alert on your account.")
            
            notification = Notification.create_notification(
                user_id=user_id,
                title="Security Alert",
                message=message,
                notification_type="security",
                priority="urgent",
                requires_action=True,
                action_text="Review Security"
            )
            notification.save()
            return {'success': True, 'notification': notification.to_dict()}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def send_credit_limit_alert(user_id, card, usage_percentage):
        """Send credit limit usage alert"""
        try:
            if usage_percentage >= 90:
                priority = "urgent"
                message = f"Your card is at {usage_percentage:.1f}% of credit limit. Consider making a payment."
            elif usage_percentage >= 80:
                priority = "high"
                message = f"Your card is at {usage_percentage:.1f}% of credit limit."
            else:
                return {'success': False, 'error': 'No alert needed'}
            
            notification = Notification.create_notification(
                user_id=user_id,
                title="Credit Limit Alert",
                message=message,
                notification_type="card",
                priority=priority,
                related_entity_type="card",
                related_entity_id=str(card.id),
                action_url=f"/cards/{card.id}",
                action_text="View Card"
            )
            notification.save()
            return {'success': True, 'notification': notification.to_dict()}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def send_promotional_notification(user_id, title, message, action_url=None):
        """Send promotional notification"""
        try:
            notification = Notification.create_notification(
                user_id=user_id,
                title=title,
                message=message,
                notification_type="promotional",
                priority="low",
                action_url=action_url,
                action_text="Learn More" if action_url else None
            )
            notification.save()
            return {'success': True, 'notification': notification.to_dict()}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def process_auto_notifications():
        """Process automatic notifications (bills, EMIs, etc.)"""
        try:
            processed_count = 0
            
            # Process bill reminders
            bills = Bill.objects(
                payment_status='pending',
                due_date__gte=datetime.utcnow() - timedelta(days=1),
                due_date__lte=datetime.utcnow() + timedelta(days=3)
            )
            
            for bill in bills:
                result = NotificationService.send_bill_reminder(bill.user_id, bill)
                if result['success']:
                    processed_count += 1
            
            # Process EMI reminders
            emis = EMI.objects(
                status='active',
                next_due_date__gte=datetime.utcnow() - timedelta(days=1),
                next_due_date__lte=datetime.utcnow() + timedelta(days=3)
            )
            
            for emi in emis:
                result = NotificationService.send_emi_reminder(emi.user_id, emi)
                if result['success']:
                    processed_count += 1
            
            # Process credit limit alerts
            cards = Card.objects(is_active=True, is_blocked=False)
            for card in cards:
                usage_percentage = (card.outstanding_balance / card.credit_limit) * 100
                if usage_percentage >= 80:
                    result = NotificationService.send_credit_limit_alert(card.user_id, card, usage_percentage)
                    if result['success']:
                        processed_count += 1
            
            return {'success': True, 'processed_count': processed_count}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def get_notification_summary(user_id):
        """Get notification summary for user"""
        try:
            notifications = Notification.objects(user_id=user_id)
            
            total = len(notifications)
            unread = len([n for n in notifications if not n.is_read])
            urgent = len([n for n in notifications if n.is_urgent()])
            high_priority = len([n for n in notifications if n.is_high_priority()])
            
            # Type breakdown
            type_breakdown = {}
            for notification in notifications:
                notification_type = notification.notification_type
                if notification_type not in type_breakdown:
                    type_breakdown[notification_type] = {'total': 0, 'unread': 0}
                type_breakdown[notification_type]['total'] += 1
                if not notification.is_read:
                    type_breakdown[notification_type]['unread'] += 1
            
            return {
                'success': True,
                'summary': {
                    'total_notifications': total,
                    'unread_notifications': unread,
                    'urgent_notifications': urgent,
                    'high_priority_notifications': high_priority,
                    'type_breakdown': type_breakdown
                }
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def mark_all_as_read(user_id):
        """Mark all notifications as read for user"""
        try:
            notifications = Notification.objects(user_id=user_id, is_read=False)
            count = 0
            
            for notification in notifications:
                notification.mark_as_read()
                count += 1
            
            return {'success': True, 'marked_count': count}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def cleanup_old_notifications(days=30):
        """Clean up old notifications"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            old_notifications = Notification.objects(
                created_at__lt=cutoff_date,
                is_read=True
            )
            
            count = len(old_notifications)
            old_notifications.delete()
            
            return {'success': True, 'deleted_count': count}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
