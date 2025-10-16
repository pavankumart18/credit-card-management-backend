import unittest
import json
import uuid
from app import create_app
from models.user import User
from models.card import Card
from services.auth import generate_token

class TestCards(unittest.TestCase):
    """Test credit card functionality"""
    
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
        
        # Test card data
        self.test_card_data = {
            'card_number': '4111111111111111',  # Valid test card number
            'card_holder_name': 'Test User',
            'expiry_month': 12,
            'expiry_year': 2025,
            'cvv': '123',
            'card_type': 'visa',
            'card_brand': 'Visa Classic',
            'card_name': 'Test Card',
            'credit_limit': 10000,
            'due_date': 15
        }
    
    def tearDown(self):
        """Clean up after tests"""
        Card.objects(user_id=self.test_user.id).delete()
        User.objects(username=self.test_username).delete()
        self.app_context.pop()
    
    def test_create_card(self):
        """Test creating a new credit card"""
        response = self.client.post('/api/cards/',
                                  data=json.dumps(self.test_card_data),
                                  content_type='application/json',
                                  headers=self.headers)
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('id', data)
        self.assertEqual(data['card_name'], 'Test Card')
        self.assertEqual(data['credit_limit'], 10000)
    
    def test_create_card_invalid_number(self):
        """Test creating card with invalid card number"""
        invalid_card_data = self.test_card_data.copy()
        invalid_card_data['card_number'] = '1234'  # Invalid card number
        
        response = self.client.post('/api/cards/',
                                data=json.dumps(invalid_card_data),
                                content_type='application/json',
                                headers=self.headers)
        
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
    
    def test_create_card_expired(self):
        """Test creating card with expired date"""
        expired_card_data = self.test_card_data.copy()
        expired_card_data['expiry_year'] = 2020  # Expired year
        
        response = self.client.post('/api/cards/',
                                data=json.dumps(expired_card_data),
                                content_type='application/json',
                                headers=self.headers)
        
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
    
    def test_get_cards(self):
        """Test getting user's cards"""
        # Create a test card
        card = Card.create_card(
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
        card.save()
        
        response = self.client.get('/api/cards/', headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('cards', data)
        self.assertEqual(len(data['cards']), 1)
        self.assertEqual(data['cards'][0]['card_name'], 'Test Card')
    
    def test_get_specific_card(self):
        """Test getting a specific card"""
        # Create a test card
        card = Card.create_card(
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
        card.save()
        
        response = self.client.get(f'/api/cards/{card.id}', headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['card_name'], 'Test Card')
    
    def test_update_card(self):
        """Test updating a card"""
        # Create a test card
        card = Card.create_card(
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
        card.save()
        
        update_data = {
            'card_name': 'Updated Card Name',
            'due_date': 20
        }
        
        response = self.client.put(f'/api/cards/{card.id}',
                                data=json.dumps(update_data),
                                content_type='application/json',
                                headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['card_name'], 'Updated Card Name')
        self.assertEqual(data['due_date'], 20)
    
    def test_block_card(self):
        """Test blocking a card"""
        # Create a test card
        card = Card.create_card(
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
        card.save()
        
        response = self.client.put(f'/api/cards/{card.id}/block', headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['is_blocked'])
        self.assertFalse(data['is_active'])
    
    def test_unblock_card(self):
        """Test unblocking a card"""
        # Create a test card
        card = Card.create_card(
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
        card.block_card()  # Block the card first
        card.save()
        
        response = self.client.put(f'/api/cards/{card.id}/unblock', headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertFalse(data['is_blocked'])
        self.assertTrue(data['is_active'])
    
    def test_update_pin(self):
        """Test updating card PIN"""
        # Create a test card
        card = Card.create_card(
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
        card.save()
        
        pin_data = {'pin': '1234'}
        
        response = self.client.put(f'/api/cards/{card.id}/pin',
                                data=json.dumps(pin_data),
                                content_type='application/json',
                                headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('message', data)
    
    def test_delete_card(self):
        """Test deleting a card"""
        # Create a test card
        card = Card.create_card(
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
        card.save()
        
        response = self.client.delete(f'/api/cards/{card.id}', headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('message', data)
    
    def test_unauthorized_access(self):
        """Test accessing cards without authentication"""
        response = self.client.get('/api/cards/')
        self.assertEqual(response.status_code, 401)
    
    def test_access_other_user_card(self):
        """Test accessing another user's card"""
        # Generate unique ID for other user
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
        
        # Create card for other user
        card = Card.create_card(
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
        card.save()
        
        # Try to access other user's card
        response = self.client.get(f'/api/cards/{card.id}', headers=self.headers)
        
        self.assertEqual(response.status_code, 404)  # Should not find the card
        
        # Clean up
        other_user.delete()

if __name__ == '__main__':
    unittest.main()
