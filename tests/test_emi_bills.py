import unittest
import json
import uuid
import sys
import os
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from models.user import User
from models.card import Card
from models.emi import EMI
from models.bill import Bill
from services.auth import generate_token

class TestEMIAndBills(unittest.TestCase):
    """Test EMI and Bills functionality"""
    
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
            credit_limit=50000,
            due_date=15
        )
        self.test_card.save()
        
        # Test EMI data
        self.test_emi_data = {
            'card_id': str(self.test_card.id),
            'principal_amount': 10000,
            'interest_rate': 12.0,
            'tenure_months': 12,
            'start_date': datetime.utcnow().isoformat(),
            'description': 'Test EMI for laptop purchase',
            'merchant_name': 'Test Store',
            'product_name': 'Laptop'
        }
        
        # Test Bill data
        self.test_bill_data = {
            'card_id': str(self.test_card.id),
            'biller_name': 'Test Utility Company',
            'biller_category': 'Electricity',
            'bill_type': 'utility',
            'amount': 2500,
            'due_date': (datetime.utcnow() + timedelta(days=15)).isoformat(),
            'bill_number': 'BILL123456',
            'consumer_number': 'CONS123456',
            'description': 'Monthly electricity bill',
            'is_recurring': True,
            'recurring_frequency': 'monthly'
        }
    
    def tearDown(self):
        """Clean up after each test"""
        # Clean up test data
        EMI.objects(user_id=self.test_user.id).delete()
        Bill.objects(user_id=self.test_user.id).delete()
        Card.objects(user_id=self.test_user.id).delete()
        User.objects(id=self.test_user.id).delete()
        self.app_context.pop()

    # EMI Model Tests
    def test_emi_creation(self):
        """Test EMI creation and basic properties"""
        emi = EMI.create_emi(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            emi_id='EMI_TEST123',
            principal_amount=10000,
            interest_rate=12.0,
            tenure_months=12,
            start_date=datetime.utcnow(),
            description='Test EMI'
        )
        emi.save()
        
        self.assertEqual(emi.user_id, self.test_user.id)
        self.assertEqual(emi.card_id, self.test_card.id)
        self.assertEqual(emi.principal_amount, 10000)
        self.assertEqual(emi.interest_rate, 12.0)
        self.assertEqual(emi.tenure_months, 12)
        self.assertEqual(emi.status, 'active')
        self.assertEqual(emi.current_installment, 0)
        self.assertEqual(emi.total_installments, 12)
        self.assertEqual(emi.remaining_amount, 10000)
        self.assertTrue(emi.emi_amount > 0)
    
    def test_emi_calculation(self):
        """Test EMI amount calculation"""
        # Test with interest
        emi_amount = EMI._calculate_emi_amount(10000, 12.0, 12)
        self.assertGreater(emi_amount, 0)
        self.assertLess(emi_amount, 10000)  # Should be less than principal
        
        # Test with zero interest
        emi_amount_zero = EMI._calculate_emi_amount(10000, 0, 12)
        self.assertEqual(emi_amount_zero, 10000 / 12)
        
        # Test edge cases
        emi_amount_high = EMI._calculate_emi_amount(10000, 24.0, 6)
        self.assertGreater(emi_amount_high, emi_amount)  # Higher rate should result in higher EMI
    
    def test_emi_payment(self):
        """Test EMI payment processing"""
        emi = EMI.create_emi(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            emi_id='EMI_TEST123',
            principal_amount=10000,
            interest_rate=12.0,
            tenure_months=12,
            start_date=datetime.utcnow()
        )
        emi.save()
        
        initial_remaining = emi.remaining_amount
        initial_installment = emi.current_installment
        
        # Make a payment
        payment_amount = emi.emi_amount
        emi.make_payment(payment_amount)
        
        self.assertEqual(emi.current_installment, initial_installment + 1)
        self.assertLess(emi.remaining_amount, initial_remaining)
        self.assertEqual(emi.total_paid, payment_amount)
        self.assertGreater(emi.interest_paid, 0)
        self.assertGreater(emi.principal_paid, 0)
    
    def test_emi_completion(self):
        """Test EMI completion when fully paid"""
        emi = EMI.create_emi(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            emi_id='EMI_TEST123',
            principal_amount=1000,  # Small amount for easy testing
            interest_rate=12.0,
            tenure_months=1,
            start_date=datetime.utcnow()
        )
        emi.save()
        
        # Pay the full remaining amount
        emi.make_payment(emi.remaining_amount)
        
        self.assertEqual(emi.status, 'completed')
        self.assertEqual(emi.remaining_amount, 0)
    
    def test_emi_status_methods(self):
        """Test EMI status checking methods"""
        emi = EMI.create_emi(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            emi_id='EMI_TEST123',
            principal_amount=10000,
            interest_rate=12.0,
            tenure_months=12,
            start_date=datetime.utcnow()
        )
        emi.save()
        
        # Test overdue check
        emi.next_due_date = datetime.utcnow() - timedelta(days=1)
        self.assertTrue(emi.is_overdue())
        
        # Test due soon check
        emi.next_due_date = datetime.utcnow() + timedelta(days=2)
        self.assertTrue(emi.is_due_soon())
        
        # Test not due soon
        emi.next_due_date = datetime.utcnow() + timedelta(days=5)
        self.assertFalse(emi.is_due_soon())
        
        # Test progress calculation
        emi.current_installment = 6
        emi.total_installments = 12
        self.assertEqual(emi.get_progress_percentage(), 50.0)
        
        # Test remaining installments
        self.assertEqual(emi.get_remaining_installments(), 6)
    
    def test_emi_auto_pay(self):
        """Test EMI auto pay functionality"""
        emi = EMI.create_emi(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            emi_id='EMI_TEST123',
            principal_amount=10000,
            interest_rate=12.0,
            tenure_months=12,
            start_date=datetime.utcnow()
        )
        emi.save()
        
        # Enable auto pay
        emi.enable_auto_pay(15)
        self.assertTrue(emi.auto_pay_enabled)
        self.assertEqual(emi.auto_pay_date, 15)
        
        # Disable auto pay
        emi.disable_auto_pay()
        self.assertFalse(emi.auto_pay_enabled)
    
    def test_emi_cancellation(self):
        """Test EMI cancellation"""
        emi = EMI.create_emi(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            emi_id='EMI_TEST123',
            principal_amount=10000,
            interest_rate=12.0,
            tenure_months=12,
            start_date=datetime.utcnow()
        )
        emi.save()
        
        emi.cancel_emi()
        self.assertEqual(emi.status, 'cancelled')
    
    def test_emi_to_dict(self):
        """Test EMI to_dict serialization"""
        emi = EMI.create_emi(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            emi_id='EMI_TEST123',
            principal_amount=10000,
            interest_rate=12.0,
            tenure_months=12,
            start_date=datetime.utcnow()
        )
        emi.save()
        
        emi_dict = emi.to_dict()
        self.assertIn('id', emi_dict)
        self.assertIn('emi_id', emi_dict)
        self.assertIn('principal_amount', emi_dict)
        self.assertIn('status', emi_dict)
        self.assertIn('is_overdue', emi_dict)
        self.assertIn('progress_percentage', emi_dict)

    # Bill Model Tests
    def test_bill_creation(self):
        """Test Bill creation and basic properties"""
        bill = Bill.create_bill(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            bill_id='BILL_TEST123',
            biller_name='Test Company',
            biller_category='Utility',
            bill_type='utility',
            amount=2500,
            due_date=datetime.utcnow() + timedelta(days=15),
            description='Test Bill'
        )
        bill.save()
        
        self.assertEqual(bill.user_id, self.test_user.id)
        self.assertEqual(bill.card_id, self.test_card.id)
        self.assertEqual(bill.biller_name, 'Test Company')
        self.assertEqual(bill.amount, 2500)
        self.assertEqual(bill.payment_status, 'pending')
        self.assertEqual(bill.paid_amount, 0)
    
    def test_bill_payment(self):
        """Test Bill payment processing"""
        bill = Bill.create_bill(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            bill_id='BILL_TEST123',
            biller_name='Test Company',
            biller_category='Utility',
            bill_type='utility',
            amount=2500,
            due_date=datetime.utcnow() + timedelta(days=15)
        )
        bill.save()
        
        # Pay the bill
        bill.pay_bill(2500)
        
        self.assertEqual(bill.payment_status, 'paid')
        self.assertEqual(bill.paid_amount, 2500)
        self.assertIsNotNone(bill.paid_date)
        self.assertEqual(bill.get_remaining_amount(), 0)
    
    def test_bill_partial_payment(self):
        """Test Bill partial payment"""
        bill = Bill.create_bill(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            bill_id='BILL_TEST123',
            biller_name='Test Company',
            biller_category='Utility',
            bill_type='utility',
            amount=2500,
            due_date=datetime.utcnow() + timedelta(days=15)
        )
        bill.save()
        
        # Make partial payment
        bill.pay_bill(1000)
        
        self.assertEqual(bill.payment_status, 'paid')  # Status changes to paid even with partial
        self.assertEqual(bill.paid_amount, 1000)
        self.assertEqual(bill.get_remaining_amount(), 1500)
    
    def test_bill_overdue_detection(self):
        """Test Bill overdue detection"""
        bill = Bill.create_bill(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            bill_id='BILL_TEST123',
            biller_name='Test Company',
            biller_category='Utility',
            bill_type='utility',
            amount=2500,
            due_date=datetime.utcnow() - timedelta(days=1)  # Past due date
        )
        bill.save()
        
        self.assertTrue(bill.is_overdue())
        
        # Mark as overdue
        bill.mark_overdue()
        self.assertEqual(bill.payment_status, 'overdue')
    
    def test_bill_due_soon_detection(self):
        """Test Bill due soon detection"""
        bill = Bill.create_bill(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            bill_id='BILL_TEST123',
            biller_name='Test Company',
            biller_category='Utility',
            bill_type='utility',
            amount=2500,
            due_date=datetime.utcnow() + timedelta(days=2)  # Due in 2 days
        )
        bill.save()
        
        self.assertTrue(bill.is_due_soon())
        self.assertTrue(bill.is_due_soon(3))  # Within 3 days
        self.assertFalse(bill.is_due_soon(1))  # Not within 1 day
        
        # Test with different due date
        bill.due_date = datetime.utcnow() + timedelta(days=5)
        self.assertFalse(bill.is_due_soon(3))  # Not within 3 days
        
        # Test with past due date
        bill.due_date = datetime.utcnow() - timedelta(days=1)
        self.assertFalse(bill.is_due_soon(3))  # Past due, not due soon
    
    def test_bill_auto_pay(self):
        """Test Bill auto pay functionality"""
        bill = Bill.create_bill(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            bill_id='BILL_TEST123',
            biller_name='Test Company',
            biller_category='Utility',
            bill_type='utility',
            amount=2500,
            due_date=datetime.utcnow() + timedelta(days=15),
            is_recurring=True,
            recurring_frequency='monthly'
        )
        bill.save()
        
        # Enable auto pay for recurring bill
        bill.enable_auto_pay()
        self.assertTrue(bill.auto_pay_enabled)
        
        # Disable auto pay
        bill.disable_auto_pay()
        self.assertFalse(bill.auto_pay_enabled)
    
    def test_bill_cancellation(self):
        """Test Bill cancellation"""
        bill = Bill.create_bill(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            bill_id='BILL_TEST123',
            biller_name='Test Company',
            biller_category='Utility',
            bill_type='utility',
            amount=2500,
            due_date=datetime.utcnow() + timedelta(days=15)
        )
        bill.save()
        
        bill.cancel_bill()
        self.assertEqual(bill.payment_status, 'cancelled')
    
    def test_bill_utility_methods(self):
        """Test Bill utility methods"""
        bill = Bill.create_bill(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            bill_id='BILL_TEST123',
            biller_name='Test Company',
            biller_category='Utility',
            bill_type='utility',
            amount=2500,
            due_date=datetime.utcnow() + timedelta(days=15)
        )
        bill.save()
        
        # Test days until due
        days_until_due = bill.get_days_until_due()
        self.assertGreater(days_until_due, 0)
        self.assertLessEqual(days_until_due, 15)
        
        # Test formatted amount
        formatted_amount = bill.get_formatted_amount()
        self.assertIn('INR', formatted_amount)
        self.assertIn('2500.00', formatted_amount)
    
    def test_bill_to_dict(self):
        """Test Bill to_dict serialization"""
        bill = Bill.create_bill(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            bill_id='BILL_TEST123',
            biller_name='Test Company',
            biller_category='Utility',
            bill_type='utility',
            amount=2500,
            due_date=datetime.utcnow() + timedelta(days=15)
        )
        bill.save()
        
        bill_dict = bill.to_dict()
        self.assertIn('id', bill_dict)
        self.assertIn('bill_id', bill_dict)
        self.assertIn('biller_name', bill_dict)
        self.assertIn('amount', bill_dict)
        self.assertIn('is_overdue', bill_dict)
        self.assertIn('days_until_due', bill_dict)

    # EMI API Tests
    def test_create_emi_api(self):
        """Test EMI creation via API"""
        response = self.client.post('/api/api/emis/', 
                                  json=self.test_emi_data, 
                                  headers=self.headers)
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('emi_id', data)
        self.assertEqual(data['principal_amount'], 10000)
        self.assertEqual(data['status'], 'active')
    
    def test_get_emis_api(self):
        """Test getting EMIs via API"""
        # Create test EMI
        emi = EMI.create_emi(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            emi_id='EMI_TEST123',
            principal_amount=10000,
            interest_rate=12.0,
            tenure_months=12,
            start_date=datetime.utcnow()
        )
        emi.save()
        
        response = self.client.get('/api/api/emis/', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('emis', data)
        self.assertEqual(len(data['emis']), 1)
    
    def test_get_emi_by_id_api(self):
        """Test getting specific EMI via API"""
        emi = EMI.create_emi(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            emi_id='EMI_TEST123',
            principal_amount=10000,
            interest_rate=12.0,
            tenure_months=12,
            start_date=datetime.utcnow()
        )
        emi.save()
        
        response = self.client.get(f'/api/api/emis/{emi.id}', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['emi_id'], 'EMI_TEST123')
    
    def test_pay_emi_api(self):
        """Test EMI payment via API"""
        emi = EMI.create_emi(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            emi_id='EMI_TEST123',
            principal_amount=10000,
            interest_rate=12.0,
            tenure_months=12,
            start_date=datetime.utcnow()
        )
        emi.save()
        
        payment_data = {'amount': emi.emi_amount}
        response = self.client.post(f'/api/emis/{emi.id}/pay', 
                                  json=payment_data, 
                                  headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['current_installment'], 1)
        self.assertGreater(data['total_paid'], 0)
    
    def test_emi_calculator_api(self):
        """Test EMI calculator via API"""
        calculator_data = {
            'principal_amount': 10000,
            'interest_rate': 12.0,
            'tenure_months': 12
        }
        
        response = self.client.post('/api/emis/calculator', 
                                  json=calculator_data, 
                                  headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('emi_amount', data)
        self.assertIn('total_amount', data)
        self.assertIn('total_interest', data)
        self.assertGreater(data['emi_amount'], 0)
    
    def test_emi_summary_api(self):
        """Test EMI summary via API"""
        # Create test EMIs
        emi1 = EMI.create_emi(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            emi_id='EMI_TEST123',
            principal_amount=10000,
            interest_rate=12.0,
            tenure_months=12,
            start_date=datetime.utcnow()
        )
        emi1.save()
        
        emi2 = EMI.create_emi(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            emi_id='EMI_TEST456',
            principal_amount=5000,
            interest_rate=15.0,
            tenure_months=6,
            start_date=datetime.utcnow()
        )
        emi2.save()
        
        response = self.client.get('/api/emis/summary', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['total_emis'], 2)
        self.assertEqual(data['active_emis'], 2)
        self.assertEqual(data['total_principal'], 15000)

    # Bill API Tests
    def test_create_bill_api(self):
        """Test Bill creation via API"""
        response = self.client.post('/api/bills/', 
                                  json=self.test_bill_data, 
                                  headers=self.headers)
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('bill_id', data)
        self.assertEqual(data['biller_name'], 'Test Utility Company')
        self.assertEqual(data['amount'], 2500)
    
    def test_get_bills_api(self):
        """Test getting Bills via API"""
        # Create test bill
        bill = Bill.create_bill(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            bill_id='BILL_TEST123',
            biller_name='Test Company',
            biller_category='Utility',
            bill_type='utility',
            amount=2500,
            due_date=datetime.utcnow() + timedelta(days=15)
        )
        bill.save()
        
        response = self.client.get('/api/bills/', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('bills', data)
        self.assertEqual(len(data['bills']), 1)
    
    def test_get_bill_by_id_api(self):
        """Test getting specific Bill via API"""
        bill = Bill.create_bill(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            bill_id='BILL_TEST123',
            biller_name='Test Company',
            biller_category='Utility',
            bill_type='utility',
            amount=2500,
            due_date=datetime.utcnow() + timedelta(days=15)
        )
        bill.save()
        
        response = self.client.get(f'/api/bills/{bill.id}', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['bill_id'], 'BILL_TEST123')
    
    def test_pay_bill_api(self):
        """Test Bill payment via API"""
        bill = Bill.create_bill(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            bill_id='BILL_TEST123',
            biller_name='Test Company',
            biller_category='Utility',
            bill_type='utility',
            amount=2500,
            due_date=datetime.utcnow() + timedelta(days=15)
        )
        bill.save()
        
        payment_data = {'amount': 2500}
        response = self.client.post(f'/api/bills/{bill.id}/pay', 
                                  json=payment_data, 
                                  headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['payment_status'], 'paid')
        self.assertEqual(data['paid_amount'], 2500)
    
    def test_bill_types_api(self):
        """Test getting bill types via API"""
        response = self.client.get('/api/bills/types', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('bill_types', data)
        self.assertIn('utility', data['bill_types'])
        self.assertIn('mobile', data['bill_types'])
    
    def test_bill_summary_api(self):
        """Test Bill summary via API"""
        # Create test bills
        bill1 = Bill.create_bill(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            bill_id='BILL_TEST123',
            biller_name='Test Company 1',
            biller_category='Utility',
            bill_type='utility',
            amount=2500,
            due_date=datetime.utcnow() + timedelta(days=15)
        )
        bill1.save()
        
        bill2 = Bill.create_bill(
            user_id=self.test_user.id,
            card_id=self.test_card.id,
            bill_id='BILL_TEST456',
            biller_name='Test Company 2',
            biller_category='Mobile',
            bill_type='mobile',
            amount=1000,
            due_date=datetime.utcnow() + timedelta(days=10)
        )
        bill2.save()
        
        response = self.client.get('/api/bills/summary', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['total_bills'], 2)
        self.assertEqual(data['pending_bills'], 2)
        self.assertEqual(data['total_amount'], 3500)

    # Error Handling Tests
    def test_emi_creation_with_invalid_card(self):
        """Test EMI creation with invalid card ID"""
        invalid_data = self.test_emi_data.copy()
        invalid_data['card_id'] = '507f1f77bcf86cd799439011'  # Invalid ObjectId
        
        response = self.client.post('/api/emis/', 
                                  json=invalid_data, 
                                  headers=self.headers)
        
        self.assertEqual(response.status_code, 404)
    
    def test_bill_creation_with_invalid_card(self):
        """Test Bill creation with invalid card ID"""
        invalid_data = self.test_bill_data.copy()
        invalid_data['card_id'] = '507f1f77bcf86cd799439011'  # Invalid ObjectId
        
        response = self.client.post('/api/bills/', 
                                  json=invalid_data, 
                                  headers=self.headers)
        
        self.assertEqual(response.status_code, 404)
    
    def test_emi_payment_with_insufficient_credit(self):
        """Test EMI payment with insufficient credit limit"""
        # Create card with low credit limit
        low_limit_card = Card.create_card(
            user_id=self.test_user.id,
            card_number='4111111111111112',
            card_holder_name='Test User',
            expiry_month=12,
            expiry_year=2025,
            cvv='123',
            card_type='visa',
            card_brand='Visa Classic',
            card_name='Low Limit Card',
            credit_limit=100,  # Very low limit
            due_date=15
        )
        low_limit_card.save()
        
        emi = EMI.create_emi(
            user_id=self.test_user.id,
            card_id=low_limit_card.id,
            emi_id='EMI_TEST123',
            principal_amount=10000,
            interest_rate=12.0,
            tenure_months=12,
            start_date=datetime.utcnow()
        )
        emi.save()
        
        payment_data = {'amount': emi.emi_amount}
        response = self.client.post(f'/api/emis/{emi.id}/pay', 
                                  json=payment_data, 
                                  headers=self.headers)
        
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('Insufficient credit limit', data['error'])
    
    def test_bill_payment_with_insufficient_credit(self):
        """Test Bill payment with insufficient credit limit"""
        # Create card with low credit limit
        low_limit_card = Card.create_card(
            user_id=self.test_user.id,
            card_number='4111111111111112',
            card_holder_name='Test User',
            expiry_month=12,
            expiry_year=2025,
            cvv='123',
            card_type='visa',
            card_brand='Visa Classic',
            card_name='Low Limit Card',
            credit_limit=100,  # Very low limit
            due_date=15
        )
        low_limit_card.save()
        
        bill = Bill.create_bill(
            user_id=self.test_user.id,
            card_id=low_limit_card.id,
            bill_id='BILL_TEST123',
            biller_name='Test Company',
            biller_category='Utility',
            bill_type='utility',
            amount=2500,
            due_date=datetime.utcnow() + timedelta(days=15)
        )
        bill.save()
        
        payment_data = {'amount': 2500}
        response = self.client.post(f'/api/bills/{bill.id}/pay', 
                                  json=payment_data, 
                                  headers=self.headers)
        
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('Insufficient credit limit', data['error'])
    
    def test_unauthorized_access(self):
        """Test unauthorized access to EMI and Bill endpoints"""
        # Test without token
        response = self.client.get('/api/emis/')
        self.assertEqual(response.status_code, 401)
        
        response = self.client.get('/api/bills/')
        self.assertEqual(response.status_code, 401)
        
        # Test with invalid token
        invalid_headers = {'Authorization': 'Bearer invalid_token'}
        response = self.client.get('/api/emis/', headers=invalid_headers)
        self.assertEqual(response.status_code, 401)
        
        response = self.client.get('/api/bills/', headers=invalid_headers)
        self.assertEqual(response.status_code, 401)

if __name__ == '__main__':
    unittest.main()
