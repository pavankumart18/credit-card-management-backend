import unittest
import json
import uuid
from app import create_app
from models.user import User
from services.auth import validate_password_strength, generate_token, decode_token

class TestAuthentication(unittest.TestCase):
    """Test authentication functionality"""
    
    def setUp(self):
        """Set up test client and test data"""
        self.app = create_app('testing')
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        # Generate unique test user data
        unique_id = str(uuid.uuid4())[:8]
        self.test_user_data = {
            'username': f'testuser_{unique_id}',
            'email': f'test_{unique_id}@example.com',
            'password': 'TestPassword123!',
            'first_name': 'Test',
            'last_name': 'User'
        }
        self.test_username = self.test_user_data['username']
    
    def tearDown(self):
        """Clean up after tests"""
        # Clean up test data
        User.objects(username=self.test_username).delete()
        self.app_context.pop()
    
    def test_password_validation(self):
        """Test password strength validation"""
        # Test strong password
        result = validate_password_strength('StrongPass123!')
        self.assertTrue(result['is_valid'])
        self.assertEqual(result['strength_level'], 'strong')
        
        # Test weak password
        result = validate_password_strength('weak')
        self.assertFalse(result['is_valid'])
        self.assertGreater(len(result['errors']), 0)
        
        # Test very weak password
        result = validate_password_strength('123')
        self.assertFalse(result['is_valid'])
        self.assertEqual(result['strength_level'], 'very_weak')
    
    def test_user_registration(self):
        """Test user registration"""
        response = self.client.post('/api/users/signup',
                                  data=json.dumps(self.test_user_data),
                                  content_type='application/json')
    
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('token', data)
        self.assertIn('user', data)
        self.assertEqual(data['user']['username'], self.test_username)
    
    def test_user_login(self):
        """Test user login"""
        # First create a user
        self.client.post('/api/users/signup',
                        data=json.dumps(self.test_user_data),
                        content_type='application/json')
    
        # Test login
        login_data = {
            'username': self.test_username,
            'password': 'TestPassword123!'
        }
        
        response = self.client.post('/api/users/login',
                                  data=json.dumps(login_data),
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('token', data)
        self.assertIn('user', data)
    
    def test_invalid_login(self):
        """Test invalid login credentials"""
        login_data = {
            'username': 'nonexistent',
            'password': 'wrongpassword'
        }
        
        response = self.client.post('/api/users/login',
                                  data=json.dumps(login_data),
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertIn('error', data)
    
    def test_protected_endpoint(self):
        """Test accessing protected endpoint without token"""
        response = self.client.get('/api/users/me')
        self.assertEqual(response.status_code, 401)
    
    def test_protected_endpoint_with_token(self):
        """Test accessing protected endpoint with valid token"""
        # Create user and get token
        self.client.post('/api/users/signup', 
                        data=json.dumps(self.test_user_data),
                        content_type='application/json')
        
        login_data = {
            'username': self.test_username,
            'password': 'TestPassword123!'
        }
        
        response = self.client.post('/api/users/login',
                                  data=json.dumps(login_data),
                                  content_type='application/json')
        
        data = json.loads(response.data)
        token = data['token']
        
        # Test protected endpoint
        headers = {'Authorization': f'Bearer {token}'}
        response = self.client.get('/api/users/me', headers=headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['username'], self.test_username)
    
    def test_duplicate_username(self):
        """Test registration with duplicate username"""
        # Create first user
        self.client.post('/api/users/signup', 
                        data=json.dumps(self.test_user_data),
                        content_type='application/json')
        
        # Try to create user with same username
        response = self.client.post('/api/users/signup', 
                                  data=json.dumps(self.test_user_data),
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
    
    def test_duplicate_email(self):
        """Test registration with duplicate email"""
        # Create first user
        self.client.post('/api/users/signup', 
                        data=json.dumps(self.test_user_data),
                        content_type='application/json')
        
        # Try to create user with same email
        duplicate_data = self.test_user_data.copy()
        duplicate_data['username'] = 'differentuser'
        
        response = self.client.post('/api/users/signup', 
                                  data=json.dumps(duplicate_data),
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
    
    def test_token_generation(self):
        """Test JWT token generation and validation"""
        payload = {'user_id': '123', 'username': 'testuser'}
        token = generate_token(payload)
        
        # Verify token can be decoded
        decoded = decode_token(token)
        self.assertEqual(decoded['user_id'], '123')
        self.assertEqual(decoded['username'], 'testuser')
    
    def test_invalid_token(self):
        """Test invalid token handling"""
        headers = {'Authorization': 'Bearer invalid_token'}
        response = self.client.get('/api/users/me', headers=headers)
        
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertIn('error', data)

if __name__ == '__main__':
    unittest.main()
