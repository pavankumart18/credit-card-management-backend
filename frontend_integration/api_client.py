"""
API Client for Credit Card Management Platform
A comprehensive client for integrating with the backend API
"""

import requests
import json
from typing import Dict, List, Optional, Any
from datetime import datetime

class CreditCardAPIClient:
    """API Client for Credit Card Management Platform"""
    
    def __init__(self, base_url: str = "http://localhost:5000/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.token = None
    
    def set_token(self, token: str):
        """Set authentication token"""
        self.token = token
        self.session.headers.update({'Authorization': f'Bearer {token}'})
    
    def clear_token(self):
        """Clear authentication token"""
        self.token = None
        if 'Authorization' in self.session.headers:
            del self.session.headers['Authorization']
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> Dict:
        """Make HTTP request to API"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, params=params)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, params=params)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, params=params)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, params=params)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            return {'error': str(e), 'status_code': getattr(e.response, 'status_code', None)}
    
    # Authentication Methods
    def login(self, username: str, password: str) -> Dict:
        """Login user"""
        data = {'username': username, 'password': password}
        result = self._make_request('POST', '/users/login', data)
        
        if 'token' in result:
            self.set_token(result['token'])
        
        return result
    
    def signup(self, user_data: Dict) -> Dict:
        """Signup new user"""
        return self._make_request('POST', '/users/signup', user_data)
    
    def get_current_user(self) -> Dict:
        """Get current user profile"""
        return self._make_request('GET', '/users/me')
    
    def update_user(self, user_id: str, user_data: Dict) -> Dict:
        """Update user profile"""
        return self._make_request('PUT', f'/users/{user_id}', user_data)
    
    # Card Management Methods
    def get_cards(self) -> Dict:
        """Get all user cards"""
        return self._make_request('GET', '/cards')
    
    def get_card(self, card_id: str) -> Dict:
        """Get specific card"""
        return self._make_request('GET', f'/cards/{card_id}')
    
    def create_card(self, card_data: Dict) -> Dict:
        """Create new credit card"""
        return self._make_request('POST', '/cards', card_data)
    
    def update_card(self, card_id: str, card_data: Dict) -> Dict:
        """Update credit card"""
        return self._make_request('PUT', f'/cards/{card_id}', card_data)
    
    def block_card(self, card_id: str) -> Dict:
        """Block credit card"""
        return self._make_request('PUT', f'/cards/{card_id}/block')
    
    def unblock_card(self, card_id: str) -> Dict:
        """Unblock credit card"""
        return self._make_request('PUT', f'/cards/{card_id}/unblock')
    
    def update_pin(self, card_id: str, pin: str) -> Dict:
        """Update card PIN"""
        return self._make_request('PUT', f'/cards/{card_id}/pin', {'pin': pin})
    
    def delete_card(self, card_id: str) -> Dict:
        """Delete credit card"""
        return self._make_request('DELETE', f'/cards/{card_id}')
    
    def get_card_transactions(self, card_id: str, page: int = 1, per_page: int = 10, **filters) -> Dict:
        """Get transactions for specific card"""
        params = {'page': page, 'per_page': per_page, **filters}
        return self._make_request('GET', f'/cards/{card_id}/transactions', params=params)
    
    # Transaction Methods
    def get_transactions(self, page: int = 1, per_page: int = 10, **filters) -> Dict:
        """Get all user transactions"""
        params = {'page': page, 'per_page': per_page, **filters}
        return self._make_request('GET', '/transactions', params=params)
    
    def get_transaction(self, transaction_id: str) -> Dict:
        """Get specific transaction"""
        return self._make_request('GET', f'/transactions/{transaction_id}')
    
    def create_transaction(self, transaction_data: Dict) -> Dict:
        """Create new transaction"""
        return self._make_request('POST', '/transactions', transaction_data)
    
    def refund_transaction(self, transaction_id: str, amount: Optional[float] = None) -> Dict:
        """Refund transaction"""
        data = {'amount': amount} if amount else {}
        return self._make_request('POST', f'/transactions/{transaction_id}/refund', data)
    
    def get_transaction_categories(self) -> Dict:
        """Get transaction categories"""
        return self._make_request('GET', '/transactions/categories')
    
    def get_transaction_summary(self, days: int = 30) -> Dict:
        """Get transaction summary"""
        return self._make_request('GET', '/transactions/summary', params={'days': days})
    
    # Bill Management Methods
    def get_bills(self, page: int = 1, per_page: int = 10, **filters) -> Dict:
        """Get all user bills"""
        params = {'page': page, 'per_page': per_page, **filters}
        return self._make_request('GET', '/bills', params=params)
    
    def get_bill(self, bill_id: str) -> Dict:
        """Get specific bill"""
        return self._make_request('GET', f'/bills/{bill_id}')
    
    def create_bill(self, bill_data: Dict) -> Dict:
        """Create new bill"""
        return self._make_request('POST', '/bills', bill_data)
    
    def pay_bill(self, bill_id: str, amount: Optional[float] = None) -> Dict:
        """Pay bill"""
        data = {'amount': amount} if amount else {}
        return self._make_request('POST', f'/bills/{bill_id}/pay', data)
    
    def toggle_auto_pay(self, bill_id: str, enable: bool = True) -> Dict:
        """Toggle auto pay for bill"""
        return self._make_request('PUT', f'/bills/{bill_id}/auto-pay', {'enable': enable})
    
    def update_bill(self, bill_id: str, bill_data: Dict) -> Dict:
        """Update bill"""
        return self._make_request('PUT', f'/bills/{bill_id}', bill_data)
    
    def delete_bill(self, bill_id: str) -> Dict:
        """Delete bill"""
        return self._make_request('DELETE', f'/bills/{bill_id}')
    
    def get_bill_types(self) -> Dict:
        """Get bill types"""
        return self._make_request('GET', '/bills/types')
    
    def get_bills_summary(self) -> Dict:
        """Get bills summary"""
        return self._make_request('GET', '/bills/summary')
    
    # EMI Management Methods
    def get_emis(self, page: int = 1, per_page: int = 10, **filters) -> Dict:
        """Get all user EMIs"""
        params = {'page': page, 'per_page': per_page, **filters}
        return self._make_request('GET', '/emis', params=params)
    
    def get_emi(self, emi_id: str) -> Dict:
        """Get specific EMI"""
        return self._make_request('GET', f'/emis/{emi_id}')
    
    def create_emi(self, emi_data: Dict) -> Dict:
        """Create new EMI"""
        return self._make_request('POST', '/emis', emi_data)
    
    def pay_emi(self, emi_id: str, amount: Optional[float] = None, payment_date: Optional[str] = None) -> Dict:
        """Pay EMI"""
        data = {}
        if amount:
            data['amount'] = amount
        if payment_date:
            data['payment_date'] = payment_date
        return self._make_request('POST', f'/emis/{emi_id}/pay', data)
    
    def toggle_emi_auto_pay(self, emi_id: str, enable: bool = True, auto_pay_date: Optional[int] = None) -> Dict:
        """Toggle auto pay for EMI"""
        data = {'enable': enable}
        if auto_pay_date:
            data['auto_pay_date'] = auto_pay_date
        return self._make_request('PUT', f'/emis/{emi_id}/auto-pay', data)
    
    def pre_close_emi(self, emi_id: str, amount: Optional[float] = None) -> Dict:
        """Pre-close EMI"""
        data = {'amount': amount} if amount else {}
        return self._make_request('POST', f'/emis/{emi_id}/pre-close', data)
    
    def update_emi(self, emi_id: str, emi_data: Dict) -> Dict:
        """Update EMI"""
        return self._make_request('PUT', f'/emis/{emi_id}', emi_data)
    
    def cancel_emi(self, emi_id: str) -> Dict:
        """Cancel EMI"""
        return self._make_request('DELETE', f'/emis/{emi_id}')
    
    def calculate_emi(self, principal_amount: float, interest_rate: float, tenure_months: int) -> Dict:
        """Calculate EMI amount"""
        data = {
            'principal_amount': principal_amount,
            'interest_rate': interest_rate,
            'tenure_months': tenure_months
        }
        return self._make_request('POST', '/emis/calculator', data)
    
    def get_emis_summary(self) -> Dict:
        """Get EMIs summary"""
        return self._make_request('GET', '/emis/summary')
    
    # CIBIL Score Methods
    def get_cibil_scores(self, page: int = 1, per_page: int = 10, current_only: bool = True) -> Dict:
        """Get all user CIBIL scores"""
        params = {'page': page, 'per_page': per_page, 'current_only': current_only}
        return self._make_request('GET', '/cibil', params=params)
    
    def get_current_cibil_score(self) -> Dict:
        """Get current CIBIL score"""
        return self._make_request('GET', '/cibil/current')
    
    def create_cibil_score(self, cibil_data: Dict) -> Dict:
        """Create new CIBIL score"""
        return self._make_request('POST', '/cibil', cibil_data)
    
    def get_cibil_score(self, score_id: str) -> Dict:
        """Get specific CIBIL score"""
        return self._make_request('GET', f'/cibil/{score_id}')
    
    def verify_cibil_score(self, score_id: str, verification_date: Optional[str] = None) -> Dict:
        """Verify CIBIL score"""
        data = {'verification_date': verification_date} if verification_date else {}
        return self._make_request('PUT', f'/cibil/{score_id}/verify', data)
    
    def update_cibil_score(self, score_id: str, cibil_data: Dict) -> Dict:
        """Update CIBIL score"""
        return self._make_request('PUT', f'/cibil/{score_id}', cibil_data)
    
    def delete_cibil_score(self, score_id: str) -> Dict:
        """Delete CIBIL score"""
        return self._make_request('DELETE', f'/cibil/{score_id}')
    
    def get_cibil_trend(self, days: int = 365) -> Dict:
        """Get CIBIL score trend"""
        return self._make_request('GET', '/cibil/trend', params={'days': days})
    
    def get_cibil_summary(self) -> Dict:
        """Get CIBIL summary"""
        return self._make_request('GET', '/cibil/summary')
    
    # Notification Methods
    def get_notifications(self, page: int = 1, per_page: int = 10, **filters) -> Dict:
        """Get all user notifications"""
        params = {'page': page, 'per_page': per_page, **filters}
        return self._make_request('GET', '/notifications', params=params)
    
    def get_notification(self, notification_id: str) -> Dict:
        """Get specific notification"""
        return self._make_request('GET', f'/notifications/{notification_id}')
    
    def create_notification(self, notification_data: Dict) -> Dict:
        """Create new notification"""
        return self._make_request('POST', '/notifications', notification_data)
    
    def mark_notification_read(self, notification_id: str) -> Dict:
        """Mark notification as read"""
        return self._make_request('PUT', f'/notifications/{notification_id}/read')
    
    def mark_notification_unread(self, notification_id: str) -> Dict:
        """Mark notification as unread"""
        return self._make_request('PUT', f'/notifications/{notification_id}/unread')
    
    def mark_all_notifications_read(self) -> Dict:
        """Mark all notifications as read"""
        return self._make_request('PUT', '/notifications/mark-all-read')
    
    def update_notification(self, notification_id: str, notification_data: Dict) -> Dict:
        """Update notification"""
        return self._make_request('PUT', f'/notifications/{notification_id}', notification_data)
    
    def delete_notification(self, notification_id: str) -> Dict:
        """Delete notification"""
        return self._make_request('DELETE', f'/notifications/{notification_id}')
    
    def get_notification_types(self) -> Dict:
        """Get notification types"""
        return self._make_request('GET', '/notifications/types')
    
    def get_notifications_summary(self) -> Dict:
        """Get notifications summary"""
        return self._make_request('GET', '/notifications/summary')
    
    # Health Check
    def health_check(self) -> Dict:
        """Check API health"""
        response = requests.get(f"{self.base_url.replace('/api', '')}/health")
        return response.json()

# Example usage and helper functions
def create_api_client(base_url: str = "http://localhost:5000/api") -> CreditCardAPIClient:
    """Create and return a new API client instance"""
    return CreditCardAPIClient(base_url)

def example_usage():
    """Example of how to use the API client"""
    # Create client
    client = create_api_client()
    
    # Login
    login_result = client.login("testuser", "password123")
    if 'error' in login_result:
        print(f"Login failed: {login_result['error']}")
        return
    
    print("Login successful!")
    
    # Get user profile
    user = client.get_current_user()
    print(f"User: {user.get('first_name')} {user.get('last_name')}")
    
    # Get cards
    cards = client.get_cards()
    print(f"User has {len(cards.get('cards', []))} cards")
    
    # Get transactions
    transactions = client.get_transactions(page=1, per_page=5)
    print(f"User has {transactions.get('total', 0)} transactions")
    
    # Get notifications
    notifications = client.get_notifications()
    unread_count = sum(1 for n in notifications.get('notifications', []) if not n.get('is_read'))
    print(f"User has {unread_count} unread notifications")
    
    # Create a new transaction (example)
    if cards.get('cards'):
        card_id = cards['cards'][0]['id']
        transaction_data = {
            'card_id': card_id,
            'merchant_name': 'Test Store',
            'merchant_category': 'shopping',
            'amount': 50.00,
            'description': 'Test purchase',
            'transaction_type': 'debit',
            'location': 'Test City',
            'device_type': 'mobile'
        }
        
        result = client.create_transaction(transaction_data)
        if 'error' in result:
            print(f"Transaction failed: {result['error']}")
        else:
            print(f"Transaction created: {result['transaction_id']}")

if __name__ == "__main__":
    example_usage()
