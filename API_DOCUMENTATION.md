# Credit Card Management Platform - API Documentation

## Overview

This is a comprehensive Flask-based backend API for a credit card management platform. The API provides endpoints for managing credit cards, transactions, bills, EMIs, CIBIL scores, and notifications.

## Base URL
```
http://localhost:5000/api
```

## Authentication

All endpoints (except health check) require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Authentication (`/api/users`)

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

#### Signup
```http
POST /api/users/signup
Content-Type: application/json

{
  "username": "new_user",
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "age": 25,
  "phone_number": "+1234567890",
  "employment_type": "salaried",
  "annual_income": 50000
}
```

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

### 2. Credit Cards (`/api/cards`)

#### Get All Cards
```http
GET /api/cards
Authorization: Bearer <token>
```

#### Get Specific Card
```http
GET /api/cards/{card_id}
Authorization: Bearer <token>
```

#### Add New Card
```http
POST /api/cards
Authorization: Bearer <token>
Content-Type: application/json

{
  "card_number": "1234567890123456",
  "card_holder_name": "John Doe",
  "expiry_month": 12,
  "expiry_year": 2025,
  "cvv": "123",
  "card_type": "visa",
  "card_brand": "Visa Platinum",
  "card_name": "My Credit Card",
  "credit_limit": 50000,
  "due_date": 15
}
```

#### Update Card
```http
PUT /api/cards/{card_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "card_name": "Updated Card Name",
  "due_date": 20
}
```

#### Block Card
```http
PUT /api/cards/{card_id}/block
Authorization: Bearer <token>
```

#### Unblock Card
```http
PUT /api/cards/{card_id}/unblock
Authorization: Bearer <token>
```

#### Update PIN
```http
PUT /api/cards/{card_id}/pin
Authorization: Bearer <token>
Content-Type: application/json

{
  "pin": "1234"
}
```

#### Get Card Transactions
```http
GET /api/cards/{card_id}/transactions?page=1&per_page=10&status=completed
Authorization: Bearer <token>
```

#### Delete Card
```http
DELETE /api/cards/{card_id}
Authorization: Bearer <token>
```

### 3. Transactions (`/api/transactions`)

#### Get All Transactions
```http
GET /api/transactions?page=1&per_page=10&card_id=card_id&status=completed&type=debit&merchant=amazon&start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer <token>
```

#### Get Specific Transaction
```http
GET /api/transactions/{transaction_id}
Authorization: Bearer <token>
```

#### Create Transaction
```http
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "card_id": "card_id",
  "merchant_name": "Amazon",
  "merchant_category": "online_shopping",
  "amount": 150.00,
  "description": "Online purchase",
  "transaction_type": "debit",
  "location": "New York, NY",
  "device_type": "mobile",
  "payment_method": "contactless",
  "reference_number": "TXN123456"
}
```

#### Refund Transaction
```http
POST /api/transactions/{transaction_id}/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 75.00
}
```

#### Get Transaction Categories
```http
GET /api/transactions/categories
Authorization: Bearer <token>
```

#### Get Transaction Summary
```http
GET /api/transactions/summary?days=30
Authorization: Bearer <token>
```

### 4. Bills (`/api/bills`)

#### Get All Bills
```http
GET /api/bills?page=1&per_page=10&card_id=card_id&status=pending&type=utility&due_soon=true
Authorization: Bearer <token>
```

#### Get Specific Bill
```http
GET /api/bills/{bill_id}
Authorization: Bearer <token>
```

#### Create Bill
```http
POST /api/bills
Authorization: Bearer <token>
Content-Type: application/json

{
  "card_id": "card_id",
  "biller_name": "Electric Company",
  "biller_category": "utilities",
  "bill_type": "utility",
  "amount": 120.50,
  "due_date": "2024-02-15T00:00:00Z",
  "bill_number": "BILL123456",
  "consumer_number": "CONS789",
  "description": "Monthly electricity bill",
  "is_recurring": true,
  "recurring_frequency": "monthly",
  "bill_period_start": "2024-01-01T00:00:00Z",
  "bill_period_end": "2024-01-31T00:00:00Z"
}
```

#### Pay Bill
```http
POST /api/bills/{bill_id}/pay
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 120.50
}
```

#### Toggle Auto Pay
```http
PUT /api/bills/{bill_id}/auto-pay
Authorization: Bearer <token>
Content-Type: application/json

{
  "enable": true
}
```

#### Update Bill
```http
PUT /api/bills/{bill_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "biller_name": "Updated Electric Company",
  "amount": 130.00,
  "due_date": "2024-02-20T00:00:00Z"
}
```

#### Delete Bill
```http
DELETE /api/bills/{bill_id}
Authorization: Bearer <token>
```

#### Get Bill Types
```http
GET /api/bills/types
Authorization: Bearer <token>
```

#### Get Bills Summary
```http
GET /api/bills/summary
Authorization: Bearer <token>
```

### 5. EMIs (`/api/emis`)

#### Get All EMIs
```http
GET /api/emis?page=1&per_page=10&card_id=card_id&status=active
Authorization: Bearer <token>
```

#### Get Specific EMI
```http
GET /api/emis/{emi_id}
Authorization: Bearer <token>
```

#### Create EMI
```http
POST /api/emis
Authorization: Bearer <token>
Content-Type: application/json

{
  "card_id": "card_id",
  "principal_amount": 10000.00,
  "interest_rate": 12.5,
  "tenure_months": 12,
  "start_date": "2024-01-01T00:00:00Z",
  "description": "Laptop purchase EMI",
  "merchant_name": "Electronics Store",
  "product_name": "MacBook Pro"
}
```

#### Pay EMI
```http
POST /api/emis/{emi_id}/pay
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 900.00,
  "payment_date": "2024-02-01T00:00:00Z"
}
```

#### Toggle Auto Pay
```http
PUT /api/emis/{emi_id}/auto-pay
Authorization: Bearer <token>
Content-Type: application/json

{
  "enable": true,
  "auto_pay_date": 5
}
```

#### Pre-close EMI
```http
POST /api/emis/{emi_id}/pre-close
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000.00
}
```

#### Update EMI
```http
PUT /api/emis/{emi_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated EMI description",
  "merchant_name": "Updated Store"
}
```

#### Cancel EMI
```http
DELETE /api/emis/{emi_id}
Authorization: Bearer <token>
```

#### Calculate EMI
```http
POST /api/emis/calculator
Authorization: Bearer <token>
Content-Type: application/json

{
  "principal_amount": 10000.00,
  "interest_rate": 12.5,
  "tenure_months": 12
}
```

#### Get EMIs Summary
```http
GET /api/emis/summary
Authorization: Bearer <token>
```

### 6. CIBIL Scores (`/api/cibil`)

#### Get All CIBIL Scores
```http
GET /api/cibil?page=1&per_page=10&current_only=true
Authorization: Bearer <token>
```

#### Get Current CIBIL Score
```http
GET /api/cibil/current
Authorization: Bearer <token>
```

#### Create CIBIL Score
```http
POST /api/cibil
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 750,
  "score_date": "2024-01-15T00:00:00Z",
  "score_type": "cibil",
  "payment_history_score": 85,
  "credit_utilization_score": 90,
  "credit_age_score": 75,
  "credit_mix_score": 80,
  "new_credit_score": 85,
  "total_accounts": 5,
  "active_accounts": 3,
  "credit_inquiries": 2,
  "total_credit_limit": 100000,
  "total_outstanding": 25000,
  "late_payments": 0,
  "missed_payments": 0
}
```

#### Get Specific CIBIL Score
```http
GET /api/cibil/{score_id}
Authorization: Bearer <token>
```

#### Verify CIBIL Score
```http
PUT /api/cibil/{score_id}/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "verification_date": "2024-01-20T00:00:00Z"
}
```

#### Update CIBIL Score
```http
PUT /api/cibil/{score_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Updated score information",
  "total_credit_limit": 120000,
  "total_outstanding": 30000
}
```

#### Delete CIBIL Score
```http
DELETE /api/cibil/{score_id}
Authorization: Bearer <token>
```

#### Get CIBIL Trend
```http
GET /api/cibil/trend?days=365
Authorization: Bearer <token>
```

#### Get CIBIL Summary
```http
GET /api/cibil/summary
Authorization: Bearer <token>
```

### 7. Notifications (`/api/notifications`)

#### Get All Notifications
```http
GET /api/notifications?page=1&per_page=10&type=transaction&priority=high&is_read=false&unread_only=true
Authorization: Bearer <token>
```

#### Get Specific Notification
```http
GET /api/notifications/{notification_id}
Authorization: Bearer <token>
```

#### Create Notification
```http
POST /api/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Transaction Alert",
  "message": "A transaction of $150.00 was made on your card",
  "notification_type": "transaction",
  "priority": "medium",
  "channels": ["in_app", "email"],
  "related_entity_type": "transaction",
  "related_entity_id": "transaction_id",
  "action_url": "/transactions/transaction_id",
  "action_text": "View Transaction",
  "requires_action": false,
  "tags": ["transaction", "alert"]
}
```

#### Mark Notification as Read
```http
PUT /api/notifications/{notification_id}/read
Authorization: Bearer <token>
```

#### Mark Notification as Unread
```http
PUT /api/notifications/{notification_id}/unread
Authorization: Bearer <token>
```

#### Mark All Notifications as Read
```http
PUT /api/notifications/mark-all-read
Authorization: Bearer <token>
```

#### Update Notification
```http
PUT /api/notifications/{notification_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "message": "Updated message",
  "priority": "high"
}
```

#### Delete Notification
```http
DELETE /api/notifications/{notification_id}
Authorization: Bearer <token>
```

#### Get Notification Types
```http
GET /api/notifications/types
Authorization: Bearer <token>
```

#### Get Notifications Summary
```http
GET /api/notifications/summary
Authorization: Bearer <token>
```

### 8. Health Check

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "Flask backend with MongoDB is running",
  "database": "connected"
}
```

## Error Responses

All endpoints return consistent error responses:

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

## Data Models

### Card
- `id`: Unique identifier
- `user_id`: Reference to user
- `card_number`: Masked card number
- `card_holder_name`: Name on card
- `expiry_month`: Expiry month (1-12)
- `expiry_year`: Expiry year
- `card_type`: visa, mastercard, amex, rupay
- `card_brand`: Card brand name
- `card_name`: User-friendly name
- `credit_limit`: Total credit limit
- `available_credit`: Available credit
- `outstanding_balance`: Outstanding amount
- `minimum_payment`: Minimum payment due
- `due_date`: Due date (day of month)
- `is_active`: Card status
- `is_blocked`: Block status

### Transaction
- `id`: Unique identifier
- `user_id`: Reference to user
- `card_id`: Reference to card
- `transaction_id`: Unique transaction ID
- `merchant_name`: Merchant name
- `merchant_category`: Transaction category
- `amount`: Transaction amount
- `currency`: Currency code
- `transaction_type`: debit, credit, refund
- `status`: pending, completed, failed, cancelled, refunded
- `payment_method`: Payment method used
- `location`: Transaction location
- `device_type`: Device used
- `transaction_date`: Transaction date
- `is_recurring`: Recurring transaction flag
- `is_international`: International transaction flag

### Bill
- `id`: Unique identifier
- `user_id`: Reference to user
- `card_id`: Reference to card
- `bill_id`: Unique bill ID
- `biller_name`: Biller name
- `biller_category`: Biller category
- `bill_type`: utility, mobile, internet, insurance, loan, credit_card, other
- `amount`: Bill amount
- `due_date`: Due date
- `payment_status`: pending, paid, overdue, cancelled
- `paid_amount`: Amount paid
- `paid_date`: Payment date
- `is_recurring`: Recurring bill flag
- `auto_pay_enabled`: Auto pay status

### EMI
- `id`: Unique identifier
- `user_id`: Reference to user
- `card_id`: Reference to card
- `emi_id`: Unique EMI ID
- `principal_amount`: Principal amount
- `interest_rate`: Interest rate (annual %)
- `tenure_months`: Tenure in months
- `emi_amount`: Monthly EMI amount
- `status`: active, completed, cancelled, defaulted
- `current_installment`: Current installment
- `total_installments`: Total installments
- `total_paid`: Total amount paid
- `remaining_amount`: Remaining amount
- `next_due_date`: Next due date
- `auto_pay_enabled`: Auto pay status

### CIBIL Score
- `id`: Unique identifier
- `user_id`: Reference to user
- `score`: CIBIL score (300-900)
- `score_date`: Score date
- `score_type`: cibil, experian, equifax, crif
- `score_range`: poor, fair, good, very_good, excellent
- `payment_history_score`: Payment history score
- `credit_utilization_score`: Credit utilization score
- `credit_age_score`: Credit age score
- `credit_mix_score`: Credit mix score
- `new_credit_score`: New credit score
- `total_accounts`: Total accounts
- `active_accounts`: Active accounts
- `credit_inquiries`: Credit inquiries
- `total_credit_limit`: Total credit limit
- `total_outstanding`: Total outstanding
- `credit_utilization_ratio`: Credit utilization ratio
- `late_payments`: Late payments count
- `missed_payments`: Missed payments count
- `defaults`: Defaults count
- `is_current`: Current score flag
- `is_verified`: Verification status

### Notification
- `id`: Unique identifier
- `user_id`: Reference to user
- `title`: Notification title
- `message`: Notification message
- `notification_type`: transaction, payment, bill, emi, card, security, promotional, system
- `priority`: low, medium, high, urgent
- `is_read`: Read status
- `is_sent`: Sent status
- `channels`: Delivery channels
- `delivery_status`: pending, sent, delivered, failed
- `related_entity_type`: Related entity type
- `related_entity_id`: Related entity ID
- `action_url`: Action URL
- `action_text`: Action text
- `requires_action`: Requires action flag
- `tags`: Notification tags
- `created_at`: Creation date
- `expires_at`: Expiration date

## Setup and Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **Run the application:**
   ```bash
   python app.py
   ```

4. **Test the connection:**
   ```bash
   curl http://localhost:5000/health
   ```

## Security Considerations

- All sensitive data (card numbers, CVVs, PINs) should be encrypted in production
- Use HTTPS in production
- Implement rate limiting
- Add input validation and sanitization
- Use secure JWT secret keys
- Implement proper error handling without exposing sensitive information

## Rate Limiting

Consider implementing rate limiting for:
- Login attempts
- Transaction creation
- API calls per user
- Password reset requests

## Monitoring and Logging

- Implement comprehensive logging
- Monitor API performance
- Track error rates
- Set up alerts for critical failures
- Monitor database performance

## Testing

- Write unit tests for all endpoints
- Implement integration tests
- Test error scenarios
- Validate data models
- Test authentication and authorization
