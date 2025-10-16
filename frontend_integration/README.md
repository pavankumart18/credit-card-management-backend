# Frontend Integration Guide

This directory contains examples and utilities for integrating your React frontend with the Credit Card Management Platform backend API.

## Files Overview

- **`api_client.py`** - Python API client for backend integration
- **`react_hooks.py`** - React hooks for state management and API calls
- **`react_components.py`** - Example React components for the UI
- **`README.md`** - This integration guide

## Quick Start

### 1. Python API Client

The `api_client.py` provides a comprehensive Python client for the backend API:

```python
from frontend_integration.api_client import CreditCardAPIClient

# Create client
client = CreditCardAPIClient("http://localhost:5000/api")

# Login
result = client.login("username", "password")
if result.get('token'):
    print("Login successful!")

# Get user's cards
cards = client.get_cards()
print(f"User has {len(cards.get('cards', []))} cards")

# Create a transaction
transaction_data = {
    'card_id': 'card_id_here',
    'merchant_name': 'Test Store',
    'merchant_category': 'shopping',
    'amount': 100.00,
    'description': 'Test purchase'
}
result = client.create_transaction(transaction_data)
```

### 2. React Integration

#### Install Dependencies

```bash
npm install axios react-query
# or
yarn add axios react-query
```

#### Setup API Client

Create `src/api/client.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

#### Use React Hooks

Copy the hooks from `react_hooks.py` to `src/hooks/useApi.js`:

```javascript
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/users/login', { username, password });
      
      if (response.data.token) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      return { success: false, error: err.response?.data?.error };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return { user, token, loading, error, login, logout, isAuthenticated: !!token };
};

export const useCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/cards');
      setCards(response.data.cards || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCard = async (cardData) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/cards', cardData);
      setCards(prev => [...prev, response.data]);
      return { success: true, card: response.data };
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create card');
      return { success: false, error: err.response?.data?.error };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  return { cards, loading, error, loadCards, createCard };
};
```

#### Create React Components

Copy the components from `react_components.py` to separate `.jsx` files:

**`src/components/CardList.jsx`:**

```jsx
import React from 'react';
import { useCards } from '../hooks/useApi';

const CardList = () => {
  const { cards, loading, error } = useCards();

  if (loading) return <div>Loading cards...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="card-list">
      <h2>Your Credit Cards</h2>
      {cards.map(card => (
        <div key={card.id} className="card-item">
          <h3>{card.card_name}</h3>
          <p>{card.card_number}</p>
          <p>Credit Limit: ${card.credit_limit.toLocaleString()}</p>
          <p>Available: ${card.available_credit.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default CardList;
```

**`src/components/Dashboard.jsx`:**

```jsx
import React from 'react';
import { useAuth } from '../hooks/useApi';
import CardList from './CardList';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login to view dashboard</div>;
  }

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.first_name}!</h1>
      <CardList />
    </div>
  );
};

export default Dashboard;
```

## API Endpoints Reference

### Authentication
- `POST /api/users/login` - Login user
- `POST /api/users/signup` - Register user
- `GET /api/users/me` - Get current user

### Cards
- `GET /api/cards` - Get all cards
- `POST /api/cards` - Create card
- `GET /api/cards/{id}` - Get specific card
- `PUT /api/cards/{id}` - Update card
- `PUT /api/cards/{id}/block` - Block card
- `PUT /api/cards/{id}/unblock` - Unblock card
- `DELETE /api/cards/{id}` - Delete card

### Transactions
- `GET /api/transactions` - Get transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/{id}` - Get specific transaction
- `POST /api/transactions/{id}/refund` - Refund transaction

### Bills
- `GET /api/bills` - Get bills
- `POST /api/bills` - Create bill
- `POST /api/bills/{id}/pay` - Pay bill
- `PUT /api/bills/{id}/auto-pay` - Toggle auto pay

### EMIs
- `GET /api/emis` - Get EMIs
- `POST /api/emis` - Create EMI
- `POST /api/emis/{id}/pay` - Pay EMI
- `POST /api/emis/calculator` - Calculate EMI

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/{id}/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Authentication

Include the JWT token in the Authorization header:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Example Usage

### Login Flow

```javascript
const LoginComponent = () => {
  const { login, loading, error } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(credentials.username, credentials.password);
    if (result.success) {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={credentials.username}
        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
      />
      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

### Card Management

```javascript
const CardManagement = () => {
  const { cards, createCard, loading } = useCards();
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCard = async (cardData) => {
    const result = await createCard(cardData);
    if (result.success) {
      setShowAddForm(false);
      // Show success message
    }
  };

  return (
    <div>
      <button onClick={() => setShowAddForm(true)}>Add New Card</button>
      
      {cards.map(card => (
        <div key={card.id} className="card">
          <h3>{card.card_name}</h3>
          <p>{card.card_number}</p>
          <p>Limit: ${card.credit_limit}</p>
          <p>Available: ${card.available_credit}</p>
        </div>
      ))}
      
      {showAddForm && (
        <AddCardForm onSubmit={handleAddCard} onCancel={() => setShowAddForm(false)} />
      )}
    </div>
  );
};
```

## Styling

Use the CSS styles provided in `react_components.py` or create your own styles based on your design system.

## Testing

Test your integration using the provided test suite:

```bash
# Run backend tests
python tests/run_tests.py

# Test specific modules
python tests/run_tests.py test_auth test_cards
```

## Production Considerations

1. **Environment Variables**: Use environment variables for API URLs
2. **Error Handling**: Implement comprehensive error handling
3. **Loading States**: Show loading indicators for better UX
4. **Validation**: Validate form inputs on both client and server
5. **Security**: Never store sensitive data in localStorage
6. **Performance**: Implement pagination and lazy loading
7. **Monitoring**: Add error tracking and analytics

## Support

For questions or issues with the integration, refer to the main API documentation or create an issue in the project repository.
