# Flask Backend API with MongoDB

A professional Flask backend with MongoDB integration, models, routes, and blueprints following industrial best practices.

## Project Structure

```
backend/
├── app.py                 # Main Flask application
├── config.py             # Configuration settings
├── requirements.txt      # Python dependencies
├── env.example          # Environment variables template
├── models/              # MongoDB models
│   ├── __init__.py
│   ├── user.py         # User model
│   ├── product.py      # Product model
│   └── order.py        # Order and OrderItem models
└── routes/             # API routes (blueprints)
    ├── __init__.py
    ├── users.py        # User endpoints
    ├── products.py     # Product endpoints
    └── orders.py       # Order endpoints
```

## Features

- **Models**: User, Product, Order, and OrderItem with MongoDB relationships
- **Blueprints**: Organized route structure with separate blueprints
- **Configuration**: Environment-based configuration (dev, test, prod)
- **Database**: MongoDB with MongoEngine ODM
- **CORS**: Cross-origin resource sharing enabled
- **Error Handling**: Proper error responses and status codes
- **Validation**: Input validation and data sanitization
- **MongoDB Atlas**: Pre-configured for cloud MongoDB connection

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **MongoDB Connection**:
   - The application is pre-configured to connect to your MongoDB Atlas cluster
   - Connection string: `mongodb+srv://ktbis_user:user@123@cluster0.9xe82yv.mongodb.net/ccms_db`
   - Database name: `ccms_db`

4. **Run the application**:
   ```bash
   python app.py
   ```

5. **Test the connection**:
   ```bash
   curl http://localhost:5000/health
   ```

## API Endpoints

### Users (`/api/users`)
- `GET /` - Get all users (with pagination and search)
- `GET /<id>` - Get user by ID
- `POST /` - Create new user
- `PUT /<id>` - Update user
- `DELETE /<id>` - Delete user
- `GET /<id>/orders` - Get user's orders

### Products (`/api/products`)
- `GET /` - Get all products (with filtering)
- `GET /<id>` - Get product by ID
- `POST /` - Create new product
- `PUT /<id>` - Update product
- `DELETE /<id>` - Deactivate product
- `PUT /<id>/stock` - Update stock quantity
- `GET /categories` - Get all categories

### Orders (`/api/orders`)
- `GET /` - Get all orders (with filtering)
- `GET /<id>` - Get order by ID
- `POST /` - Create new order
- `PUT /<id>` - Update order
- `DELETE /<id>` - Cancel order
- `GET /<id>/items` - Get order items
- `GET /statuses` - Get order statuses

### Health Check
- `GET /health` - Application health status

## Models

### User
- Authentication and user management
- Password hashing with Werkzeug
- Admin and active status flags

### Product
- E-commerce product management
- Stock tracking and categories
- SKU-based identification

### Order & OrderItem
- Order management with status tracking
- Automatic stock updates
- Order item relationships

## Configuration

The application supports three environments:
- **Development**: Debug mode, SQLite database
- **Testing**: Test database, CSRF disabled
- **Production**: Optimized settings, production database

## MongoDB Collections

The application creates the following collections in your `ccms_db` database:

- **users**: User accounts and authentication data
- **products**: Product catalog and inventory
- **orders**: Customer orders with embedded order items

## Testing the API

1. **Health Check**:
   ```bash
   curl http://localhost:5000/health
   ```

2. **Create a User**:
   ```bash
   curl -X POST http://localhost:5000/api/users/ \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"password123","first_name":"Test","last_name":"User"}'
   ```

3. **Get All Users**:
   ```bash
   curl http://localhost:5000/api/users/
   ```

4. **Create a Product**:
   ```bash
   curl -X POST http://localhost:5000/api/products/ \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Product","price":29.99,"sku":"TEST001","category":"Electronics","description":"A test product"}'
   ```
# credit-card-management-backend
# credit-card-management-backend
