import unittest
import json
import uuid
from app import create_app
from models.user import User
from models.card import Card
from models.transaction import Transaction
from models.bill import Bill
from models.emi import EMI
from models.notification import Notification
from services.card_service import CardService
from services.notification_service import NotificationService
from services.encryption import encryption_service
from services.auth import generate_token

class TestServices(unittest.TestCase):
    """Test business logic services"""
    
    def setUp(self):
        """Set up test client and test data"""
        self.app = create_app('testing')
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        # Generate unique test user data
        unique_id = str(uuid.uuid4())[:8]
        self.test_username = f'testuser_{unique_id}'
        self.test_email = f'test_{unique_id}@example.com'
        
        # Create test user
        self.test_user = User.create_user(
            username=self.test_username,
            email=self.test_email,
            password='TestPassword123!',
            first_name='Test',
            last_name='User'
        )
        self.test_user.save()
        
        # Create test card
        self.test_card = Card.create_card(
            user_id=self.test_user.id,
            card_number='4111111111111111',
            card_holder_name='Test User',
            expiry_month=12,
            expiry_year=2025,
            cvv='123',
            card_type='visa',
            card_brand='Visa Classic',
            card_name='Test Card',
            credit_limit=10000
        )
        self.test_card.save()
    
    def tearDown(self):
        """Clean up after tests"""
        Notification.objects(user_id=self.test_user.id).delete()
        Transaction.objects(user_id=self.test_user.id).delete()
        Bill.objects(user_id=self.test_user.id).delete()
        EMI.objects(user_id=self.test_user.id).delete()
        Card.objects(user_id=self.test_user.id).delete()
        User.objects(username=self.test_username).delete()
        self.app_context.pop()
    
    def test_card_service_create_card(self):
        """Test CardService.create_card"""
        card_data = {
            'card_number': '4111111111111111',
            'card_holder_name': 'Test User',
            'expiry_month': 12,
            'expiry_year': 2025,
            'cvv': '123',
            'card_type': 'visa',
            'card_brand': 'Visa Classic',
            'card_name': 'Service Test Card',
            'credit_limit': 5000
        }
        
        result = CardService.create_card(self.test_user.id, card_data)
        
        self.assertTrue(result['success'])
        self.assertIn('card', result)
        self.assertEqual(result['card']['card_name'], 'Service Test Card')
    
    def test_card_service_create_invalid_card(self):
        """Test CardService.create_card with invalid data"""
        invalid_card_data = {
            'card_number': '1234',  # Invalid card number
            'card_holder_name': 'Test User',
            'expiry_month': 12,
            'expiry_year': 2025,
            'cvv': '123',
            'card_type': 'visa',
            'card_brand': 'Visa Classic',
            'card_name': 'Invalid Card',
            'credit_limit': 5000
        }
        
        result = CardService.create_card(self.test_user.id, invalid_card_data)
        
        self.assertFalse(result['success'])
        self.assertIn('error', result)
    
    def test_card_service_process_transaction(self):
        """Test CardService.process_transaction"""
        transaction_data = {
            'merchant_name': 'Test Store',
            'merchant_category': 'shopping',
            'amount': 100.00,
            'description': 'Test purchase',
            'transaction_type': 'debit',
            'location': 'Test City',
            'device_type': 'mobile'
        }
        
        result = CardService.process_transaction(self.test_card.id, transaction_data)
        
        self.assertTrue(result['success'])
        self.assertIn('transaction', result)
        self.assertEqual(result['transaction']['amount'], 100.00)
        self.assertEqual(result['transaction']['status'], 'completed')
    
    def test_card_service_block_card(self):
        """Test CardService.block_card"""
        result = CardService.block_card(self.test_card.id, "Test block")
        
        self.assertTrue(result['success'])
        self.assertIn('card', result)
        self.assertTrue(result['card']['is_blocked'])
    
    def test_card_service_analytics(self):
        """Test CardService.get_card_analytics"""
        # Create some test transactions
        for i in range(3):
            transaction = Transaction.create_transaction(
                user_id=self.test_user.id,
                card_id=self.test_card.id,
                transaction_id=f'TXN_ANALYTICS_{i}',
                merchant_name=f'Store {i}',
                merchant_category='shopping',
                amount=100.00 * (i + 1)
            )
            transaction.process_transaction()
            transaction.save()
        
        result = CardService.get_card_analytics(self.test_card.id, days=30)
        
        self.assertTrue(result['success'])
        self.assertIn('analytics', result)
        self.assertEqual(result['analytics']['transaction_count'], 3)
        self.assertEqual(result['analytics']['total_spent'], 600.00)  # 100 + 200 + 300
    
    def test_notification_service_send_transaction_notification(self):
        """Test NotificationService.send_transaction_notification"""
        # Create a test transaction
        transaction = Transaction.create_transaction(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            transaction_id='TXN_NOTIFICATION_TEST',
            merchant_name='Test Store',
            merchant_category='shopping',
            amount=100.00
        )
        transaction.process_transaction()
        transaction.save()
        
        result = NotificationService.send_transaction_notification(self.test_user.id, transaction)
        
        self.assertTrue(result['success'])
        self.assertIn('notification', result)
        self.assertEqual(result['notification']['notification_type'], 'transaction')
    
    def test_notification_service_send_bill_reminder(self):
        """Test NotificationService.send_bill_reminder"""
        from datetime import datetime, timedelta
        
        # Create a test bill due in 2 days
        bill = Bill.create_bill(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            bill_id='BILL_TEST',
            biller_name='Test Utility',
            biller_category='utilities',
            bill_type='utility',
            amount=150.00,
            due_date=datetime.utcnow() + timedelta(days=2)
        )
        bill.save()
        
        result = NotificationService.send_bill_reminder(self.test_user.id, bill)
        
        self.assertTrue(result['success'])
        self.assertIn('notification', result)
        self.assertEqual(result['notification']['notification_type'], 'bill')
    
    def test_notification_service_send_security_alert(self):
        """Test NotificationService.send_security_alert"""
        result = NotificationService.send_security_alert(
            self.test_user.id,
            'card_blocked',
            {'reason': 'Suspicious activity'}
        )
        
        self.assertTrue(result['success'])
        self.assertIn('notification', result)
        self.assertEqual(result['notification']['notification_type'], 'security')
        self.assertEqual(result['notification']['priority'], 'urgent')
    
    def test_notification_service_get_summary(self):
        """Test NotificationService.get_notification_summary"""
        # Create some test notifications
        for i in range(3):
            notification = Notification.create_notification(
                user_id=self.test_user.id,
                title=f'Test Notification {i}',
                message=f'Test message {i}',
                notification_type='transaction',
                priority='medium'
            )
            notification.save()
        
        result = NotificationService.get_notification_summary(self.test_user.id)
        
        self.assertTrue(result['success'])
        self.assertIn('summary', result)
        self.assertEqual(result['summary']['total_notifications'], 3)
    
    def test_notification_service_mark_all_as_read(self):
        """Test NotificationService.mark_all_as_read"""
        # Create some test notifications
        for i in range(3):
            notification = Notification.create_notification(
                user_id=self.test_user.id,
                title=f'Test Notification {i}',
                message=f'Test message {i}',
                notification_type='transaction',
                priority='medium'
            )
            notification.save()
        
        result = NotificationService.mark_all_as_read(self.test_user.id)
        
        self.assertTrue(result['success'])
        self.assertEqual(result['marked_count'], 3)
    
    def test_encryption_service(self):
        """Test encryption service"""
        # Test card number encryption
        card_number = '4111111111111111'
        encrypted = encryption_service.encrypt_card_number(card_number)
        decrypted = encryption_service.decrypt_card_number(encrypted)
        self.assertEqual(decrypted, card_number)
        
        # Test CVV encryption
        cvv = '123'
        encrypted_cvv = encryption_service.encrypt_cvv(cvv)
        decrypted_cvv = encryption_service.decrypt_cvv(encrypted_cvv)
        self.assertEqual(decrypted_cvv, cvv)
        
        # Test PIN encryption
        pin = '1234'
        encrypted_pin = encryption_service.encrypt_pin(pin)
        decrypted_pin = encryption_service.decrypt_pin(encrypted_pin)
        self.assertEqual(decrypted_pin, pin)
        
        # Test masking
        masked_number = encryption_service.mask_card_number(card_number)
        self.assertIn('****', masked_number)
        self.assertTrue(masked_number.endswith('1111'))
    
    def test_card_service_suspicious_transaction_detection(self):
        """Test suspicious transaction detection"""
        # Create a high-value transaction (should trigger suspicion)
        high_value_transaction = {
            'merchant_name': 'Expensive Store',
            'merchant_category': 'shopping',
            'amount': 9000.00,  # 90% of credit limit
            'description': 'High value purchase',
            'transaction_type': 'debit',
            'location': 'Test City',
            'device_type': 'mobile'
        }
        
        # This should be detected as suspicious
        result = CardService.process_transaction(self.test_card.id, high_value_transaction)
        
        # The transaction should be blocked due to suspicious activity
        self.assertFalse(result['success'])
        self.assertIn('Suspicious activity detected', result['error'])

if __name__ == '__main__':
    unittest.main()
