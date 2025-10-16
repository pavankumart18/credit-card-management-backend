import unittest
import json
import uuid
from app import create_app
from models.user import User
from models.card import Card
from models.transaction import Transaction
from services.auth import generate_token

class TestTransactions(unittest.TestCase):
    """Test transaction functionality"""
    
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
        
        # Generate token for test user
        self.token = generate_token({'user_id': str(self.test_user.id), 'username': self.test_username})
        self.headers = {'Authorization': f'Bearer {self.token}'}
        
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
        
        # Test transaction data
        self.test_transaction_data = {
            'card_id': str(self.test_card.id),
            'merchant_name': 'Test Store',
            'merchant_category': 'shopping',
            'amount': 100.00,
            'description': 'Test purchase',
            'transaction_type': 'debit',
            'location': 'Test City',
            'device_type': 'mobile',
            'payment_method': 'contactless'
        }
    
    def tearDown(self):
        """Clean up after tests"""
        Transaction.objects(user_id=self.test_user.id).delete()
        Card.objects(user_id=self.test_user.id).delete()
        User.objects(username=self.test_username).delete()
        self.app_context.pop()
    
    def test_create_transaction(self):
        """Test creating a new transaction"""
        response = self.client.post('/api/transactions/',
                                  data=json.dumps(self.test_transaction_data),
                                  content_type='application/json',
                                  headers=self.headers)
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('id', data)
        self.assertEqual(data['merchant_name'], 'Test Store')
        self.assertEqual(data['amount'], 100.00)
        self.assertEqual(data['status'], 'completed')
    
    def test_create_transaction_insufficient_credit(self):
        """Test creating transaction with insufficient credit"""
        # Set card credit limit to 50
        self.test_card.credit_limit = 50
        self.test_card.available_credit = 50
        self.test_card.save()
        
        # Try to make transaction for 100
        response = self.client.post('/api/transactions/',
                                data=json.dumps(self.test_transaction_data),
                                content_type='application/json',
                                headers=self.headers)
        
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
    
    def test_create_transaction_blocked_card(self):
        """Test creating transaction with blocked card"""
        # Block the card
        self.test_card.block_card()
        self.test_card.save()
        
        response = self.client.post('/api/transactions/',
                                data=json.dumps(self.test_transaction_data),
                                content_type='application/json',
                                headers=self.headers)
        
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
    
    def test_get_transactions(self):
        """Test getting user's transactions"""
        # Create a test transaction
        transaction = Transaction.create_transaction(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            transaction_id=f'TXN_TEST123_{self.test_username}',
            merchant_name='Test Store',
            merchant_category='shopping',
            amount=100.00
        )
        transaction.process_transaction()
        transaction.save()
        
        response = self.client.get('/api/transactions/', headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('transactions', data)
        self.assertEqual(len(data['transactions']), 1)
        self.assertEqual(data['transactions'][0]['merchant_name'], 'Test Store')
    
    def test_get_transaction_by_id(self):
        """Test getting a specific transaction"""
        # Create a test transaction
        transaction = Transaction.create_transaction(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            transaction_id='TXN_TEST123',
            merchant_name='Test Store',
            merchant_category='shopping',
            amount=100.00
        )
        transaction.process_transaction()
        transaction.save()
        
        response = self.client.get(f'/api/transactions/{transaction.id}', headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['merchant_name'], 'Test Store')
        self.assertEqual(data['amount'], 100.00)
    
    def test_refund_transaction(self):
        """Test refunding a transaction"""
        # Create a test transaction
        transaction = Transaction.create_transaction(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            transaction_id=f'TXN_TEST123_{self.test_username}',
            merchant_name='Test Store',
            merchant_category='shopping',
            amount=100.00
        )
        transaction.process_transaction()
        transaction.save()
        
        # Refund the transaction
        refund_data = {'amount': 50.00}
        response = self.client.post(f'/api/transactions/{transaction.id}/refund',
                                data=json.dumps(refund_data),
                                content_type='application/json',
                                headers=self.headers)
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['amount'], 50.00)
        self.assertEqual(data['transaction_type'], 'refund')
    
    def test_get_transaction_categories(self):
        """Test getting transaction categories"""
        response = self.client.get('/api/transactions/categories', headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('categories', data)
        self.assertIsInstance(data['categories'], list)
        self.assertGreater(len(data['categories']), 0)
    
    def test_get_transaction_summary(self):
        """Test getting transaction summary"""
        # Create some test transactions
        for i in range(3):
            transaction = Transaction.create_transaction(
                user_id=self.test_user.id,
                card_id=self.test_card.id,
                transaction_id=f'TXN_TEST{i}_{self.test_username}',
                merchant_name=f'Store {i}',
                merchant_category='shopping',
                amount=100.00 * (i + 1)
            )
            transaction.process_transaction()
            transaction.save()
        
        response = self.client.get('/api/transactions/summary?days=30', headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('total_amount', data)
        self.assertIn('total_transactions', data)
        self.assertIn('category_breakdown', data)
        self.assertEqual(data['total_transactions'], 3)
    
    def test_filter_transactions_by_card(self):
        """Test filtering transactions by card"""
        # Create transactions for the test card
        for i in range(2):
            transaction = Transaction.create_transaction(
                user_id=self.test_user.id,
                card_id=self.test_card.id,
                transaction_id=f'TXN_TEST{i}_{self.test_username}',
                merchant_name=f'Store {i}',
                merchant_category='shopping',
                amount=100.00
            )
            transaction.process_transaction()
            transaction.save()
        
        response = self.client.get(f'/api/transactions/?card_id={self.test_card.id}', headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data['transactions']), 2)
    
    def test_filter_transactions_by_status(self):
        """Test filtering transactions by status"""
        # Create a completed transaction
        transaction = Transaction.create_transaction(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            transaction_id=f'TXN_COMPLETED_{self.test_username}',
            merchant_name='Test Store',
            merchant_category='shopping',
            amount=100.00
        )
        transaction.process_transaction()
        transaction.save()
        
        # Create a pending transaction
        pending_transaction = Transaction.create_transaction(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            transaction_id=f'TXN_PENDING_{self.test_username}',
            merchant_name='Test Store',
            merchant_category='shopping',
            amount=100.00
        )
        pending_transaction.save()
        
        # Filter by completed status
        response = self.client.get('/api/transactions/?status=completed', headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data['transactions']), 1)
        self.assertEqual(data['transactions'][0]['status'], 'completed')
    
    def test_unauthorized_access(self):
        """Test accessing transactions without authentication"""
        response = self.client.get('/api/transactions/')
        self.assertEqual(response.status_code, 401)
    
    def test_access_other_user_transaction(self):
        """Test accessing another user's transaction"""
        # Generate unique ID for this test
        unique_id = str(uuid.uuid4())[:8]
        
        # Create another user
        other_user = User.create_user(
            username=f'otheruser_{unique_id}',
            email=f'other_{unique_id}@example.com',
            password='TestPassword123!',
            first_name='Other',
            last_name='User'
        )
        other_user.save()
        
        # Create transaction for other user
        other_card = Card.create_card(
            user_id=other_user.id,
            card_number='4111111111111111',
            card_holder_name='Other User',
            expiry_month=12,
            expiry_year=2025,
            cvv='123',
            card_type='visa',
            card_brand='Visa Classic',
            card_name='Other Card',
            credit_limit=10000
        )
        other_card.save()
        
        transaction = Transaction.create_transaction(
            user_id=other_user.id,
            card_id=other_card.id,
            transaction_id=f'TXN_OTHER_{unique_id}',
            merchant_name='Other Store',
            merchant_category='shopping',
            amount=100.00
        )
        transaction.process_transaction()
        transaction.save()
        
        # Try to access other user's transaction
        response = self.client.get(f'/api/transactions/{transaction.id}', headers=self.headers)
        
        self.assertEqual(response.status_code, 404)  # Should not find the transaction
        
        # Clean up
        other_user.delete()

if __name__ == '__main__':
    unittest.main()
