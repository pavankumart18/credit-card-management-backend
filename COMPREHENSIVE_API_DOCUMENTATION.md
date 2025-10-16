# Credit Card Management System - Comprehensive API Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Models](#database-models)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [Business Logic](#business-logic)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

---

## System Overview

The Credit Card Management System is a Flask-based REST API that provides comprehensive credit card management functionality including:

- **User Management**: Registration, authentication, profile management
- **Card Management**: Credit card creation, activation, deactivation, limit management
- **Transaction Management**: Purchase transactions, refunds, transaction history
- **EMI Management**: EMI creation, payment tracking, completion status
- **Bill Management**: Bill creation, payment tracking, due date management
- **Product Management**: Credit card product catalog
- **Order Management**: Credit card application orders
- **Chat Support**: AI-powered customer support
- **CIBIL Score Management**: Credit score tracking
- **Notification System**: User notifications and alerts

---

## Database Models

### 1. User Model (`models/user.py`)

**Purpose**: Manages user accounts and authentication

**Fields**:
- `id`: ObjectId (Primary Key)
- `username`: StringField (Required, Unique)
- `email`: EmailField (Required, Unique)
- `password_hash`: StringField (Required)
- `first_name`: StringField (Required)
- `last_name`: StringField (Required)
- `phone`: StringField (Required)
- `date_of_birth`: DateTimeField (Required)
- `address`: EmbeddedDocumentField (Address)
- `is_active`: BooleanField (Default: True)
- `is_admin`: BooleanField (Default: False)
- `created_at`: DateTimeField (Auto-generated)
- `updated_at`: DateTimeField (Auto-updated)

**Methods**:
- `set_password(password)`: Hash and set password
- `check_password(password)`: Verify password
- `to_dict()`: Convert to dictionary for JSON serialization

**Address Subdocument**:
- `street`: StringField
- `city`: StringField
- `state`: StringField
- `zip_code`: StringField
- `country`: StringField (Default: "India")

---

### 2. Card Model (`models/card.py`)

**Purpose**: Manages credit card information and status

**Fields**:
- `id`: ObjectId (Primary Key)
- `user_id`: ObjectId (Reference to User)
- `card_number`: StringField (Required, Unique)
- `card_name`: StringField (Required)
- `card_type`: StringField (Required, Choices: ['visa', 'mastercard', 'amex'])
- `expiry_date`: DateTimeField (Required)
- `cvv`: StringField (Required)
- `credit_limit`: FloatField (Required)
- `available_credit`: FloatField (Required)
- `status`: StringField (Required, Choices: ['active', 'inactive', 'suspended', 'cancelled'])
- `is_primary`: BooleanField (Default: False)
- `created_at`: DateTimeField (Auto-generated)
- `updated_at`: DateTimeField (Auto-updated)

**Methods**:
- `to_dict()`: Convert to dictionary for JSON serialization
- `is_expired()`: Check if card is expired
- `can_make_transaction(amount)`: Check if transaction is possible
- `make_transaction(amount)`: Process transaction
- `refund_transaction(amount)`: Process refund

---

### 3. Transaction Model (`models/transaction.py`)

**Purpose**: Tracks all credit card transactions

**Fields**:
- `id`: ObjectId (Primary Key)
- `user_id`: ObjectId (Reference to User)
- `card_id`: ObjectId (Reference to Card)
- `transaction_id`: StringField (Required, Unique)
- `amount`: FloatField (Required)
- `transaction_type`: StringField (Required, Choices: ['purchase', 'refund', 'payment', 'fee'])
- `merchant`: StringField (Required)
- `description`: StringField
- `status`: StringField (Required, Choices: ['pending', 'completed', 'failed', 'cancelled'])
- `transaction_date`: DateTimeField (Required)
- `created_at`: DateTimeField (Auto-generated)
- `updated_at`: DateTimeField (Auto-updated)

**Methods**:
- `to_dict()`: Convert to dictionary for JSON serialization

---

### 4. EMI Model (`models/emi.py`)

**Purpose**: Manages Equated Monthly Installments

**Fields**:
- `id`: ObjectId (Primary Key)
- `user_id`: ObjectId (Reference to User)
- `card_id`: ObjectId (Reference to Card)
- `emi_id`: StringField (Required, Unique)
- `principal_amount`: FloatField (Required)
- `interest_rate`: FloatField (Required)
- `tenure_months`: IntField (Required)
- `emi_amount`: FloatField (Required)
- `remaining_amount`: FloatField (Required)
- `current_installment`: IntField (Default: 0)
- `total_installments`: IntField (Required)
- `start_date`: DateTimeField (Required)
- `end_date`: DateTimeField (Required)
- `status`: StringField (Required, Choices: ['active', 'completed', 'cancelled'])
- `created_at`: DateTimeField (Auto-generated)
- `updated_at`: DateTimeField (Auto-updated)

**Methods**:
- `to_dict()`: Convert to dictionary for JSON serialization
- `calculate_emi_amount()`: Calculate EMI amount
- `make_payment(amount)`: Process EMI payment
- `is_completed()`: Check if EMI is completed
- `get_remaining_installments()`: Get remaining installments

---

### 5. Bill Model (`models/bill.py`)

**Purpose**: Manages credit card bills and payments

**Fields**:
- `id`: ObjectId (Primary Key)
- `user_id`: ObjectId (Reference to User)
- `card_id`: ObjectId (Reference to Card)
- `bill_id`: StringField (Required, Unique)
- `biller_name`: StringField (Required)
- `biller_category`: StringField (Required)
- `bill_type`: StringField (Required, Choices: ['credit_card', 'loan', 'utility', 'insurance', 'other'])
- `amount`: FloatField (Required)
- `due_date`: DateTimeField (Required)
- `paid_amount`: FloatField (Default: 0)
- `paid_date`: DateTimeField
- `payment_status`: StringField (Required, Choices: ['pending', 'paid', 'overdue'])
- `auto_pay_enabled`: BooleanField (Default: False)
- `created_at`: DateTimeField (Auto-generated)
- `updated_at`: DateTimeField (Auto-updated)

**Methods**:
- `to_dict()`: Convert to dictionary for JSON serialization
- `pay_bill(amount, payment_date)`: Process bill payment
- `is_overdue()`: Check if bill is overdue
- `is_due_soon(days)`: Check if bill is due soon
- `get_remaining_amount()`: Get remaining amount to pay

---

### 6. Product Model (`models/product.py`)

**Purpose**: Manages credit card product catalog

**Fields**:
- `id`: ObjectId (Primary Key)
- `product_id`: StringField (Required, Unique)
- `name`: StringField (Required)
- `description`: StringField (Required)
- `card_type`: StringField (Required, Choices: ['visa', 'mastercard', 'amex'])
- `annual_fee`: FloatField (Required)
- `interest_rate`: FloatField (Required)
- `credit_limit_min`: FloatField (Required)
- `credit_limit_max`: FloatField (Required)
- `rewards_program`: StringField
- `benefits`: ListField (StringField)
- `eligibility_criteria`: StringField
- `is_active`: BooleanField (Default: True)
- `created_at`: DateTimeField (Auto-generated)
- `updated_at`: DateTimeField (Auto-updated)

**Methods**:
- `to_dict()`: Convert to dictionary for JSON serialization

---

### 7. Order Model (`models/order.py`)

**Purpose**: Tracks credit card application orders

**Fields**:
- `id`: ObjectId (Primary Key)
- `user_id`: ObjectId (Reference to User)
- `product_id`: ObjectId (Reference to Product)
- `order_id`: StringField (Required, Unique)
- `status`: StringField (Required, Choices: ['pending', 'approved', 'rejected', 'cancelled'])
- `application_date`: DateTimeField (Required)
- `approval_date`: DateTimeField
- `rejection_reason`: StringField
- `created_at`: DateTimeField (Auto-generated)
- `updated_at`: DateTimeField (Auto-updated)

**Methods**:
- `to_dict()`: Convert to dictionary for JSON serialization

---

### 8. Chat Model (`models/chat.py`)

**Purpose**: Manages chat sessions with AI support

**Fields**:
- `id`: ObjectId (Primary Key)
- `user_id`: ObjectId (Reference to User)
- `session_id`: StringField (Required, Unique)
- `messages`: ListField (EmbeddedDocumentField)
- `status`: StringField (Required, Choices: ['active', 'closed'])
- `created_at`: DateTimeField (Auto-generated)
- `updated_at`: DateTimeField (Auto-updated)

**Message Subdocument**:
- `role`: StringField (Choices: ['user', 'assistant'])
- `content`: StringField (Required)
- `timestamp`: DateTimeField (Required)

**Methods**:
- `to_dict()`: Convert to dictionary for JSON serialization
- `add_message(role, content)`: Add message to chat

---

### 9. CIBIL Score Model (`models/cibil_score.py`)

**Purpose**: Tracks user credit scores

**Fields**:
- `id`: ObjectId (Primary Key)
- `user_id`: ObjectId (Reference to User)
- `score`: IntField (Required)
- `score_date`: DateTimeField (Required)
- `score_range`: StringField (Required, Choices: ['excellent', 'good', 'fair', 'poor'])
- `factors`: ListField (StringField)
- `created_at`: DateTimeField (Auto-generated)
- `updated_at`: DateTimeField (Auto-updated)

**Methods**:
- `to_dict()`: Convert to dictionary for JSON serialization

---

### 10. Notification Model (`models/notification.py`)

**Purpose**: Manages user notifications

**Fields**:
- `id`: ObjectId (Primary Key)
- `user_id`: ObjectId (Reference to User)
- `title`: StringField (Required)
- `message`: StringField (Required)
- `notification_type`: StringField (Required, Choices: ['info', 'warning', 'error', 'success'])
- `is_read`: BooleanField (Default: False)
- `created_at`: DateTimeField (Auto-generated)
- `updated_at`: DateTimeField (Auto-updated)

**Methods**:
- `to_dict()`: Convert to dictionary for JSON serialization

---

## API Endpoints

### Authentication Endpoints (`/api/users/`)

#### 1. User Registration
- **POST** `/api/users/register`
- **Input**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "date_of_birth": "YYYY-MM-DD",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "zip_code": "string",
      "country": "string"
    }
  }
  ```
- **Output**:
  ```json
  {
    "message": "User registered successfully",
    "user_id": "string"
  }
  ```

#### 2. User Login
- **POST** `/api/users/login`
- **Input**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Output**:
  ```json
  {
    "access_token": "string",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "first_name": "string",
      "last_name": "string"
    }
  }
  ```

#### 3. Get User Profile
- **GET** `/api/users/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Output**:
  ```json
  {
    "id": "string",
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "date_of_birth": "YYYY-MM-DD",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "zip_code": "string",
      "country": "string"
    },
    "is_active": true,
    "created_at": "YYYY-MM-DDTHH:MM:SS"
  }
  ```

#### 4. Update User Profile
- **PUT** `/api/users/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Input**:
  ```json
  {
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "zip_code": "string",
      "country": "string"
    }
  }
  ```

---

### Card Management Endpoints (`/api/cards/`)

#### 1. Create Credit Card
- **POST** `/api/cards/`
- **Headers**: `Authorization: Bearer <token>`
- **Input**:
  ```json
  {
    "card_name": "string",
    "card_type": "visa|mastercard|amex",
    "expiry_date": "YYYY-MM-DD",
    "cvv": "string",
    "credit_limit": 10000.0,
    "is_primary": true
  }
  ```
- **Output**:
  ```json
  {
    "message": "Card created successfully",
    "card": {
      "id": "string",
      "card_number": "string",
      "card_name": "string",
      "card_type": "string",
      "expiry_date": "YYYY-MM-DD",
      "credit_limit": 10000.0,
      "available_credit": 10000.0,
      "status": "active",
      "is_primary": true
    }
  }
  ```

#### 2. Get User Cards
- **GET** `/api/cards/`
- **Headers**: `Authorization: Bearer <token>`
- **Output**:
  ```json
  {
    "cards": [
      {
        "id": "string",
        "card_number": "string",
        "card_name": "string",
        "card_type": "string",
        "expiry_date": "YYYY-MM-DD",
        "credit_limit": 10000.0,
        "available_credit": 8000.0,
        "status": "active",
        "is_primary": true
      }
    ]
  }
  ```

#### 3. Get Card Details
- **GET** `/api/cards/<card_id>`
- **Headers**: `Authorization: Bearer <token>`
- **Output**:
  ```json
  {
    "card": {
      "id": "string",
      "card_number": "string",
      "card_name": "string",
      "card_type": "string",
      "expiry_date": "YYYY-MM-DD",
      "credit_limit": 10000.0,
      "available_credit": 8000.0,
      "status": "active",
      "is_primary": true,
      "created_at": "YYYY-MM-DDTHH:MM:SS"
    }
  }
  ```

#### 4. Update Card
- **PUT** `/api/cards/<card_id>`
- **Headers**: `Authorization: Bearer <token>`
- **Input**:
  ```json
  {
    "card_name": "string",
    "credit_limit": 15000.0,
    "is_primary": true
  }
  ```

#### 5. Deactivate Card
- **DELETE** `/api/cards/<card_id>`
- **Headers**: `Authorization: Bearer <token>`
- **Output**:
  ```json
  {
    "message": "Card deactivated successfully"
  }
  ```

---

### Transaction Endpoints (`/api/transactions/`)

#### 1. Create Transaction
- **POST** `/api/transactions/`
- **Headers**: `Authorization: Bearer <token>`
- **Input**:
  ```json
  {
    "card_id": "string",
    "amount": 100.0,
    "merchant": "string",
    "description": "string"
  }
  ```
- **Output**:
  ```json
  {
    "message": "Transaction created successfully",
    "transaction": {
      "id": "string",
      "transaction_id": "string",
      "amount": 100.0,
      "merchant": "string",
      "description": "string",
      "status": "completed",
      "transaction_date": "YYYY-MM-DDTHH:MM:SS"
    }
  }
  ```

#### 2. Get User Transactions
- **GET** `/api/transactions/`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `page`, `limit`, `card_id`, `status`
- **Output**:
  ```json
  {
    "transactions": [
      {
        "id": "string",
        "transaction_id": "string",
        "amount": 100.0,
        "merchant": "string",
        "description": "string",
        "status": "completed",
        "transaction_date": "YYYY-MM-DDTHH:MM:SS"
      }
    ],
    "total": 50,
    "page": 1,
    "pages": 5
  }
  ```

#### 3. Get Transaction Details
- **GET** `/api/transactions/<transaction_id>`
- **Headers**: `Authorization: Bearer <token>`
- **Output**:
  ```json
  {
    "transaction": {
      "id": "string",
      "transaction_id": "string",
      "amount": 100.0,
      "merchant": "string",
      "description": "string",
      "status": "completed",
      "transaction_date": "YYYY-MM-DDTHH:MM:SS",
      "created_at": "YYYY-MM-DDTHH:MM:SS"
    }
  }
  ```

---

### EMI Endpoints (`/api/emis/`)

#### 1. Create EMI
- **POST** `/api/emis/`
- **Headers**: `Authorization: Bearer <token>`
- **Input**:
  ```json
  {
    "card_id": "string",
    "principal_amount": 10000.0,
    "interest_rate": 12.0,
    "tenure_months": 12
  }
  ```
- **Output**:
  ```json
  {
    "message": "EMI created successfully",
    "emi": {
      "id": "string",
      "emi_id": "string",
      "principal_amount": 10000.0,
      "interest_rate": 12.0,
      "tenure_months": 12,
      "emi_amount": 888.49,
      "remaining_amount": 10000.0,
      "current_installment": 0,
      "total_installments": 12,
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "status": "active"
    }
  }
  ```

#### 2. Get User EMIs
- **GET** `/api/emis/`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `status`, `card_id`
- **Output**:
  ```json
  {
    "emis": [
      {
        "id": "string",
        "emi_id": "string",
        "principal_amount": 10000.0,
        "interest_rate": 12.0,
        "tenure_months": 12,
        "emi_amount": 888.49,
        "remaining_amount": 8000.0,
        "current_installment": 2,
        "total_installments": 12,
        "start_date": "YYYY-MM-DD",
        "end_date": "YYYY-MM-DD",
        "status": "active"
      }
    ]
  }
  ```

#### 3. Make EMI Payment
- **POST** `/api/emis/<emi_id>/pay`
- **Headers**: `Authorization: Bearer <token>`
- **Input**:
  ```json
  {
    "amount": 888.49
  }
  ```
- **Output**:
  ```json
  {
    "message": "EMI payment successful",
    "emi": {
      "id": "string",
      "emi_id": "string",
      "remaining_amount": 7111.51,
      "current_installment": 3,
      "status": "active"
    }
  }
  ```

---

### Bill Endpoints (`/api/bills/`)

#### 1. Create Bill
- **POST** `/api/bills/`
- **Headers**: `Authorization: Bearer <token>`
- **Input**:
  ```json
  {
    "card_id": "string",
    "biller_name": "string",
    "biller_category": "string",
    "bill_type": "credit_card|loan|utility|insurance|other",
    "amount": 500.0,
    "due_date": "YYYY-MM-DD",
    "auto_pay_enabled": false
  }
  ```
- **Output**:
  ```json
  {
    "message": "Bill created successfully",
    "bill": {
      "id": "string",
      "bill_id": "string",
      "biller_name": "string",
      "biller_category": "string",
      "bill_type": "credit_card",
      "amount": 500.0,
      "due_date": "YYYY-MM-DD",
      "paid_amount": 0.0,
      "payment_status": "pending",
      "auto_pay_enabled": false
    }
  }
  ```

#### 2. Get User Bills
- **GET** `/api/bills/`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `status`, `card_id`, `bill_type`
- **Output**:
  ```json
  {
    "bills": [
      {
        "id": "string",
        "bill_id": "string",
        "biller_name": "string",
        "biller_category": "string",
        "bill_type": "credit_card",
        "amount": 500.0,
        "due_date": "YYYY-MM-DD",
        "paid_amount": 0.0,
        "payment_status": "pending",
        "auto_pay_enabled": false
      }
    ]
  }
  ```

#### 3. Pay Bill
- **POST** `/api/bills/<bill_id>/pay`
- **Headers**: `Authorization: Bearer <token>`
- **Input**:
  ```json
  {
    "amount": 500.0
  }
  ```
- **Output**:
  ```json
  {
    "message": "Bill payment successful",
    "bill": {
      "id": "string",
      "bill_id": "string",
      "paid_amount": 500.0,
      "payment_status": "paid",
      "paid_date": "YYYY-MM-DDTHH:MM:SS"
    }
  }
  ```

---

### Product Endpoints (`/api/products/`)

#### 1. Get All Products
- **GET** `/api/products/`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `card_type`, `is_active`
- **Output**:
  ```json
  {
    "products": [
      {
        "id": "string",
        "product_id": "string",
        "name": "string",
        "description": "string",
        "card_type": "visa",
        "annual_fee": 1000.0,
        "interest_rate": 12.0,
        "credit_limit_min": 10000.0,
        "credit_limit_max": 100000.0,
        "rewards_program": "string",
        "benefits": ["benefit1", "benefit2"],
        "eligibility_criteria": "string",
        "is_active": true
      }
    ]
  }
  ```

#### 2. Get Product Details
- **GET** `/api/products/<product_id>`
- **Headers**: `Authorization: Bearer <token>`
- **Output**:
  ```json
  {
    "product": {
      "id": "string",
      "product_id": "string",
      "name": "string",
      "description": "string",
      "card_type": "visa",
      "annual_fee": 1000.0,
      "interest_rate": 12.0,
      "credit_limit_min": 10000.0,
      "credit_limit_max": 100000.0,
      "rewards_program": "string",
      "benefits": ["benefit1", "benefit2"],
      "eligibility_criteria": "string",
      "is_active": true
    }
  }
  ```

---

### Order Endpoints (`/api/orders/`)

#### 1. Create Order
- **POST** `/api/orders/`
- **Headers**: `Authorization: Bearer <token>`
- **Input**:
  ```json
  {
    "product_id": "string"
  }
  ```
- **Output**:
  ```json
  {
    "message": "Order created successfully",
    "order": {
      "id": "string",
      "order_id": "string",
      "product_id": "string",
      "status": "pending",
      "application_date": "YYYY-MM-DDTHH:MM:SS"
    }
  }
  ```

#### 2. Get User Orders
- **GET** `/api/orders/`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `status`
- **Output**:
  ```json
  {
    "orders": [
      {
        "id": "string",
        "order_id": "string",
        "product_id": "string",
        "status": "pending",
        "application_date": "YYYY-MM-DDTHH:MM:SS",
        "approval_date": null,
        "rejection_reason": null
      }
    ]
  }
  ```

---

### Chat Endpoints (`/api/chat/`)

#### 1. Create Chat Session
- **POST** `/api/chat/sessions`
- **Headers**: `Authorization: Bearer <token>`
- **Output**:
  ```json
  {
    "message": "Chat session created successfully",
    "session": {
      "id": "string",
      "session_id": "string",
      "status": "active",
      "created_at": "YYYY-MM-DDTHH:MM:SS"
    }
  }
  ```

#### 2. Send Message
- **POST** `/api/chat/sessions/<session_id>/messages`
- **Headers**: `Authorization: Bearer <token>`
- **Input**:
  ```json
  {
    "message": "string"
  }
  ```
- **Output**:
  ```json
  {
    "message": "Message sent successfully",
    "response": "AI response string"
  }
  ```

#### 3. Get Chat History
- **GET** `/api/chat/sessions/<session_id>/messages`
- **Headers**: `Authorization: Bearer <token>`
- **Output**:
  ```json
  {
    "messages": [
      {
        "role": "user",
        "content": "string",
        "timestamp": "YYYY-MM-DDTHH:MM:SS"
      },
      {
        "role": "assistant",
        "content": "string",
        "timestamp": "YYYY-MM-DDTHH:MM:SS"
      }
    ]
  }
  ```

---

### CIBIL Score Endpoints (`/api/cibil-scores/`)

#### 1. Get User CIBIL Scores
- **GET** `/api/cibil-scores/`
- **Headers**: `Authorization: Bearer <token>`
- **Output**:
  ```json
  {
    "cibil_scores": [
      {
        "id": "string",
        "score": 750,
        "score_date": "YYYY-MM-DD",
        "score_range": "good",
        "factors": ["factor1", "factor2"]
      }
    ]
  }
  ```

#### 2. Add CIBIL Score
- **POST** `/api/cibil-scores/`
- **Headers**: `Authorization: Bearer <token>`
- **Input**:
  ```json
  {
    "score": 750,
    "score_date": "YYYY-MM-DD",
    "factors": ["factor1", "factor2"]
  }
  ```

---

### Notification Endpoints (`/api/notifications/`)

#### 1. Get User Notifications
- **GET** `/api/notifications/`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `is_read`, `notification_type`
- **Output**:
  ```json
  {
    "notifications": [
      {
        "id": "string",
        "title": "string",
        "message": "string",
        "notification_type": "info",
        "is_read": false,
        "created_at": "YYYY-MM-DDTHH:MM:SS"
      }
    ]
  }
  ```

#### 2. Mark Notification as Read
- **PUT** `/api/notifications/<notification_id>/read`
- **Headers**: `Authorization: Bearer <token>`
- **Output**:
  ```json
  {
    "message": "Notification marked as read"
  }
  ```

---

## Authentication

### JWT Token Authentication

The system uses JWT (JSON Web Tokens) for authentication. All protected endpoints require the `Authorization` header with a Bearer token.

**Token Format**: `Authorization: Bearer <jwt_token>`

**Token Expiration**: 24 hours (configurable)

**Token Claims**:
- `user_id`: User identifier
- `username`: Username
- `exp`: Expiration timestamp
- `iat`: Issued at timestamp

### Authentication Flow

1. **Login**: User provides credentials → Server returns JWT token
2. **API Calls**: Client includes JWT token in Authorization header
3. **Token Validation**: Server validates token and extracts user information
4. **Access Control**: Server checks user permissions for requested resource

---

## Business Logic

### EMI Calculation

**Formula**: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)

Where:
- P = Principal amount
- r = Monthly interest rate (annual rate / 12)
- n = Number of installments

**Example**:
- Principal: ₹10,000
- Annual Interest: 12%
- Tenure: 12 months
- Monthly Interest: 12% / 12 = 1%
- EMI = ₹888.49

### Bill Payment Logic

**Payment Status Updates**:
- `pending`: Initial status, payment not made
- `paid`: Full payment received
- `overdue`: Payment past due date

**Auto-pay Logic**:
- Bills with `auto_pay_enabled = true` are automatically paid on due date
- Requires sufficient credit limit on associated card

### Transaction Processing

**Transaction Types**:
- `purchase`: Regular purchase transaction
- `refund`: Refund transaction
- `payment`: Payment towards bill/EMI
- `fee`: Service charges

**Credit Limit Management**:
- Available credit decreases with purchases
- Available credit increases with payments/refunds
- Transactions fail if insufficient credit

---

## Error Handling

### HTTP Status Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not found
- **409**: Conflict (duplicate resource)
- **422**: Unprocessable entity (business logic errors)
- **500**: Internal server error

### Error Response Format

```json
{
  "error": "Error type",
  "message": "Human readable error message",
  "details": {
    "field": "Specific field error"
  }
}
```

### Common Error Scenarios

1. **Validation Errors**: Missing required fields, invalid data types
2. **Authentication Errors**: Invalid token, expired token
3. **Authorization Errors**: User not authorized for resource
4. **Business Logic Errors**: Insufficient credit, invalid transaction
5. **Database Errors**: Duplicate records, constraint violations

---

## Testing

### Test Structure

The system includes comprehensive test suites:

1. **Unit Tests**: Test individual model methods and business logic
2. **API Tests**: Test endpoint functionality and responses
3. **Integration Tests**: Test complete workflows
4. **Edge Case Tests**: Test boundary conditions and error scenarios

### Test Files

- `tests/test_emi_bills.py`: Main EMI and Bill functionality tests
- `tests/test_emi_bills_edge_cases.py`: Edge cases and complex scenarios
- `tests/test_cards.py`: Card management tests
- `tests/test_transactions.py`: Transaction tests
- `tests/test_auth.py`: Authentication tests
- `tests/test_services.py`: Service layer tests

### Running Tests

```bash
# Run all tests
python tests/run_emi_bills_tests.py

# Run specific test file
python -m pytest tests/test_emi_bills.py -v

# Run with coverage
python -m pytest tests/ --cov=. --cov-report=html
```

### Test Database

Tests use a separate MongoDB database (`credit_card_test`) to avoid affecting production data.

---

## Configuration

### Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET_KEY`: Secret key for JWT token generation
- `FLASK_ENV`: Environment (development, testing, production)
- `GEMINI_API_KEY`: API key for AI chat functionality

### Database Configuration

- **Production**: MongoDB Atlas or local MongoDB instance
- **Testing**: Separate test database
- **Development**: Local MongoDB instance

---

## Security Considerations

### Data Protection

- Passwords are hashed using bcrypt
- Sensitive data (CVV, card numbers) should be encrypted
- JWT tokens are signed and verified
- Input validation on all endpoints

### Access Control

- User can only access their own data
- Admin users have additional privileges
- Token-based authentication for all protected endpoints

### Best Practices

- Use HTTPS in production
- Implement rate limiting
- Log security events
- Regular security audits
- Input sanitization

---

## Deployment

### Production Setup

1. **Environment Setup**:
   - Set production environment variables
   - Configure MongoDB connection
   - Set up SSL certificates

2. **Application Deployment**:
   - Use WSGI server (Gunicorn)
   - Set up reverse proxy (Nginx)
   - Configure load balancing

3. **Monitoring**:
   - Application logs
   - Performance metrics
   - Error tracking
   - Database monitoring

### Docker Deployment

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

---

## API Rate Limiting

### Rate Limits

- **Authentication endpoints**: 5 requests per minute
- **General API endpoints**: 100 requests per minute
- **Chat endpoints**: 20 requests per minute

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Logging

### Log Levels

- **DEBUG**: Detailed information for debugging
- **INFO**: General information about application flow
- **WARNING**: Warning messages for potential issues
- **ERROR**: Error messages for failed operations
- **CRITICAL**: Critical errors that may cause application failure

### Log Files

- `logs/application.log`: General application logs
- `logs/error.log`: Error logs
- `logs/security.log`: Security-related logs
- `logs/audit.log`: Audit trail logs
- `logs/performance.log`: Performance metrics

---

## Conclusion

This comprehensive documentation covers all aspects of the Credit Card Management System, including:

- Complete model structures and relationships
- Detailed API endpoint specifications
- Authentication and authorization mechanisms
- Business logic implementation
- Error handling strategies
- Testing methodologies
- Security considerations
- Deployment guidelines

The system provides a robust foundation for credit card management with features like EMI tracking, bill management, transaction processing, and AI-powered customer support. The modular architecture allows for easy extension and maintenance.

For additional support or questions, please refer to the individual model and route files, or contact the development team.
