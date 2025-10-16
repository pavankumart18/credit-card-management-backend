from datetime import datetime, timedelta
from models.card import Card
from models.transaction import Transaction
from models.notification import Notification
from services.encryption import encryption_service
from services.auth import log_authentication_event
import uuid

class CardService:
    """Business logic service for credit card operations"""
    
    @staticmethod
    def create_card(user_id, card_data):
        """Create a new credit card with business logic validation"""
        try:
            # Validate card number using Luhn algorithm
            if not CardService._validate_card_number(card_data['card_number']):
                return {'success': False, 'error': 'Invalid card number'}
            
            # Validate expiry date
            if not CardService._validate_expiry_date(card_data['expiry_month'], card_data['expiry_year']):
                return {'success': False, 'error': 'Card has expired or invalid expiry date'}
            
            # Check if user already has too many cards
            existing_cards = Card.objects(user_id=user_id, is_active=True).count()
            max_cards = 5  # Business rule: max 5 cards per user
            if existing_cards >= max_cards:
                return {'success': False, 'error': 'Maximum number of cards reached'}
            
            # Create card
            card = Card.create_card(
                user_id=user_id,
                card_number=card_data['card_number'],
                card_holder_name=card_data['card_holder_name'],
                expiry_month=card_data['expiry_month'],
                expiry_year=card_data['expiry_year'],
                cvv=card_data['cvv'],
                card_type=card_data['card_type'],
                card_brand=card_data['card_brand'],
                card_name=card_data['card_name'],
                credit_limit=card_data['credit_limit'],
                due_date=card_data.get('due_date')
            )
            
            # Set PIN if provided
            if 'pin' in card_data:
                card.set_pin(card_data['pin'])
            
            card.save()
            
            # Create notification
            Notification.create_notification(
                user_id=user_id,
                title="New Card Added",
                message=f"Your {card.card_brand} card ending in {card.get_masked_number()[-4:]} has been added successfully.",
                notification_type="card",
                priority="medium"
            ).save()
            
            # Log security event
            log_authentication_event(
                user_id=str(user_id),
                event_type="card_created",
                success=True,
                details={'card_brand': card.card_brand, 'credit_limit': card.credit_limit}
            )
            
            return {'success': True, 'card': card.to_dict()}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def process_transaction(card_id, transaction_data):
        """Process a credit card transaction with business logic"""
        try:
            card = Card.objects.get(id=card_id)
            
            # Check if card is active and not blocked
            if not card.is_active or card.is_blocked:
                return {'success': False, 'error': 'Card is not active or is blocked'}
            
            # Check available credit
            if transaction_data['amount'] > card.available_credit:
                return {'success': False, 'error': 'Insufficient credit limit'}
            
            # Check for suspicious activity
            if CardService._is_suspicious_transaction(card, transaction_data):
                # Block card and notify user
                card.block_card()
                Notification.create_notification(
                    user_id=card.user_id,
                    title="Suspicious Activity Detected",
                    message="Your card has been temporarily blocked due to suspicious activity. Please contact support.",
                    notification_type="security",
                    priority="urgent"
                ).save()
                return {'success': False, 'error': 'Suspicious activity detected. Card blocked for security.'}
            
            # Create transaction
            transaction = Transaction.create_transaction(
                user_id=card.user_id,
                card_id=card_id,
                transaction_id=f"TXN_{uuid.uuid4().hex[:12].upper()}",
                merchant_name=transaction_data['merchant_name'],
                merchant_category=transaction_data['merchant_category'],
                amount=transaction_data['amount'],
                description=transaction_data.get('description'),
                transaction_type=transaction_data.get('transaction_type', 'debit'),
                location=transaction_data.get('location'),
                device_type=transaction_data.get('device_type')
            )
            
            # Set additional fields
            transaction.payment_method = transaction_data.get('payment_method', 'online')
            transaction.reference_number = transaction_data.get('reference_number')
            transaction.is_recurring = transaction_data.get('is_recurring', False)
            transaction.is_international = transaction_data.get('is_international', False)
            
            # Process transaction
            transaction.process_transaction()
            
            # Update card balance
            card.update_balance(transaction_data['amount'], 'debit')
            card.last_used = datetime.utcnow()
            card.save()
            
            # Create notification
            Notification.create_notification(
                user_id=card.user_id,
                title="Transaction Alert",
                message=f"Transaction of {transaction.get_formatted_amount()} at {transaction.merchant_name}",
                notification_type="transaction",
                priority="medium",
                related_entity_type="transaction",
                related_entity_id=str(transaction.id)
            ).save()
            
            return {'success': True, 'transaction': transaction.to_dict()}
            
        except Card.DoesNotExist:
            return {'success': False, 'error': 'Card not found'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def block_card(card_id, reason="User requested"):
        """Block a credit card with business logic"""
        try:
            card = Card.objects.get(id=card_id)
            card.block_card()
            
            # Create notification
            Notification.create_notification(
                user_id=card.user_id,
                title="Card Blocked",
                message=f"Your card ending in {card.get_masked_number()[-4:]} has been blocked. Reason: {reason}",
                notification_type="card",
                priority="high"
            ).save()
            
            # Log security event
            log_authentication_event(
                user_id=str(card.user_id),
                event_type="card_blocked",
                success=True,
                details={'reason': reason, 'card_id': str(card_id)}
            )
            
            return {'success': True, 'card': card.to_dict()}
            
        except Card.DoesNotExist:
            return {'success': False, 'error': 'Card not found'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def unblock_card(card_id):
        """Unblock a credit card with business logic"""
        try:
            card = Card.objects.get(id=card_id)
            card.unblock_card()
            
            # Create notification
            Notification.create_notification(
                user_id=card.user_id,
                title="Card Unblocked",
                message=f"Your card ending in {card.get_masked_number()[-4:]} has been unblocked and is now active.",
                notification_type="card",
                priority="medium"
            ).save()
            
            return {'success': True, 'card': card.to_dict()}
            
        except Card.DoesNotExist:
            return {'success': False, 'error': 'Card not found'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def update_pin(card_id, old_pin, new_pin):
        """Update card PIN with security validation"""
        try:
            card = Card.objects.get(id=card_id)
            
            # Verify old PIN
            if not card.check_pin(old_pin):
                return {'success': False, 'error': 'Invalid current PIN'}
            
            # Validate new PIN
            if not CardService._validate_pin(new_pin):
                return {'success': False, 'error': 'Invalid PIN format. PIN must be 4 digits.'}
            
            # Set new PIN
            card.set_pin(new_pin)
            card.save()
            
            # Create notification
            Notification.create_notification(
                user_id=card.user_id,
                title="PIN Updated",
                message=f"PIN for your card ending in {card.get_masked_number()[-4:]} has been updated successfully.",
                notification_type="security",
                priority="high"
            ).save()
            
            # Log security event
            log_authentication_event(
                user_id=str(card.user_id),
                event_type="pin_updated",
                success=True,
                details={'card_id': str(card_id)}
            )
            
            return {'success': True, 'message': 'PIN updated successfully'}
            
        except Card.DoesNotExist:
            return {'success': False, 'error': 'Card not found'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def get_card_analytics(card_id, days=30):
        """Get analytics for a specific card"""
        try:
            card = Card.objects.get(id=card_id)
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Get transactions
            transactions = Transaction.objects(
                card_id=card_id,
                transaction_date__gte=start_date,
                transaction_date__lte=end_date,
                status='completed'
            )
            
            # Calculate analytics
            total_spent = sum(t.amount for t in transactions)
            transaction_count = len(transactions)
            avg_transaction = total_spent / transaction_count if transaction_count > 0 else 0
            
            # Category breakdown
            category_breakdown = {}
            for transaction in transactions:
                category = transaction.merchant_category
                if category not in category_breakdown:
                    category_breakdown[category] = {'count': 0, 'amount': 0}
                category_breakdown[category]['count'] += 1
                category_breakdown[category]['amount'] += transaction.amount
            
            # Monthly spending trend
            monthly_spending = {}
            for transaction in transactions:
                month_key = transaction.transaction_date.strftime('%Y-%m')
                if month_key not in monthly_spending:
                    monthly_spending[month_key] = 0
                monthly_spending[month_key] += transaction.amount
            
            return {
                'success': True,
                'analytics': {
                    'period_days': days,
                    'total_spent': float(total_spent),
                    'transaction_count': transaction_count,
                    'average_transaction': float(avg_transaction),
                    'category_breakdown': category_breakdown,
                    'monthly_spending': monthly_spending,
                    'credit_utilization': (card.outstanding_balance / card.credit_limit) * 100 if card.credit_limit > 0 else 0
                }
            }
            
        except Card.DoesNotExist:
            return {'success': False, 'error': 'Card not found'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def _validate_card_number(card_number):
        """Validate card number using Luhn algorithm"""
        # Remove any non-digit characters
        digits = ''.join(filter(str.isdigit, card_number))
        
        if len(digits) < 13 or len(digits) > 19:
            return False
        
        # Luhn algorithm
        def luhn_checksum(card_num):
            def digits_of(n):
                return [int(d) for d in str(n)]
            digits = digits_of(card_num)
            odd_digits = digits[-1::-2]
            even_digits = digits[-2::-2]
            checksum = sum(odd_digits)
            for d in even_digits:
                checksum += sum(digits_of(d*2))
            return checksum % 10
        
        return luhn_checksum(digits) == 0
    
    @staticmethod
    def _validate_expiry_date(month, year):
        """Validate card expiry date"""
        current_date = datetime.utcnow()
        current_year = current_date.year
        current_month = current_date.month
        
        if year < current_year:
            return False
        if year == current_year and month < current_month:
            return False
        if month < 1 or month > 12:
            return False
        
        return True
    
    @staticmethod
    def _validate_pin(pin):
        """Validate PIN format"""
        return pin.isdigit() and len(pin) == 4
    
    @staticmethod
    def _is_suspicious_transaction(card, transaction_data):
        """Check for suspicious transaction patterns"""
        # Check for high-value transactions
        if transaction_data['amount'] > card.credit_limit * 0.8:  # 80% of credit limit
            return True
        
        # Check for multiple transactions in short time
        recent_transactions = Transaction.objects(
            card_id=card.id,
            transaction_date__gte=datetime.utcnow() - timedelta(minutes=10),
            status='completed'
        ).count()
        
        if recent_transactions > 5:  # More than 5 transactions in 10 minutes
            return True
        
        # Check for international transactions if not expected
        if transaction_data.get('is_international') and not card.is_international:
            return True
        
        return False
