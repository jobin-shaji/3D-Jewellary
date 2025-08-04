# Backend API Documentation for 3D Jewelry E-commerce Platform

## Overview
This document outlines all the backend API endpoints, database schemas, and authentication requirements for your 3D jewelry e-commerce platform.

## Base URL
All API endpoints should be accessible at: `https://your-api-domain.com/api`

## Authentication
Use JWT tokens for authentication. Include in headers as:
```
Authorization: Bearer <token>
```

## Database Schemas

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  parent_id INT REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  category_id INT REFERENCES categories(id),
  sku VARCHAR(100) UNIQUE,
  stock_quantity INT DEFAULT 0,
  weight DECIMAL(8,2),
  dimensions JSON, -- {length, width, height}
  material VARCHAR(100),
  gemstone VARCHAR(100),
  metal_type VARCHAR(50),
  metal_purity VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  model_3d_url VARCHAR(500), -- URL to 3D model file
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Product Images Table
```sql
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Carts Table
```sql
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  session_id VARCHAR(255), -- For guest users
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Cart Items Table
```sql
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INT REFERENCES carts(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL, -- Price at time of adding
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  shipping_address JSON NOT NULL,
  billing_address JSON NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_id VARCHAR(255), -- Stripe payment intent ID
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  product_name VARCHAR(255) NOT NULL, -- Snapshot of product name
  product_sku VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Addresses Table
```sql
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  type ENUM('shipping', 'billing') NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company VARCHAR(100),
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```
Response:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "customer"
  },
  "token": "jwt_token_here"
}
```

#### POST /auth/login
Login user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /auth/refresh
Refresh JWT token
```json
{
  "refresh_token": "refresh_token_here"
}
```

#### POST /auth/logout
Logout user (invalidate token)

### Product Endpoints

#### GET /products
Get all products with pagination and filters
Query parameters:
- `page` (default: 1)
- `limit` (default: 20)
- `category_id`
- `search` (search in name/description)
- `min_price`
- `max_price`
- `material`
- `gemstone`
- `sort` (price_asc, price_desc, name_asc, name_desc, newest)

#### GET /products/:id
Get single product with images and 3D model

#### POST /products (Admin only)
Create new product
```json
{
  "name": "Diamond Ring",
  "description": "Beautiful diamond ring",
  "price": 1299.99,
  "category_id": 1,
  "sku": "DR001",
  "stock_quantity": 5,
  "material": "Gold",
  "gemstone": "Diamond",
  "metal_type": "Yellow Gold",
  "metal_purity": "14K",
  "model_3d_url": "https://storage.com/models/ring.glb"
}
```

#### PUT /products/:id (Admin only)
Update product

#### DELETE /products/:id (Admin only)
Delete product

#### POST /products/:id/images (Admin only)
Upload product images

### Category Endpoints

#### GET /categories
Get all categories in hierarchical structure

#### POST /categories (Admin only)
Create new category

#### PUT /categories/:id (Admin only)
Update category

#### DELETE /categories/:id (Admin only)
Delete category

### Cart Endpoints

#### GET /cart
Get current user's cart

#### POST /cart/items
Add item to cart
```json
{
  "product_id": 1,
  "quantity": 2
}
```

#### PUT /cart/items/:id
Update cart item quantity
```json
{
  "quantity": 3
}
```

#### DELETE /cart/items/:id
Remove item from cart

#### DELETE /cart
Clear entire cart

### Order Endpoints

#### GET /orders
Get user's orders with pagination

#### GET /orders/:id
Get specific order details

#### POST /orders
Create new order from cart
```json
{
  "shipping_address": {
    "first_name": "John",
    "last_name": "Doe",
    "address_line_1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "billing_address": { /* same structure */ },
  "payment_method": "stripe"
}
```

#### PUT /orders/:id/status (Admin only)
Update order status
```json
{
  "status": "shipped",
  "tracking_number": "1Z999AA1234567890"
}
```

### Payment Endpoints

#### POST /payments/create-intent
Create Stripe payment intent
```json
{
  "order_id": 1,
  "amount": 1299.99
}
```

#### POST /payments/confirm
Confirm payment
```json
{
  "payment_intent_id": "pi_1234567890",
  "order_id": 1
}
```

### User Profile Endpoints

#### GET /user/profile
Get current user profile

#### PUT /user/profile
Update user profile

#### GET /user/addresses
Get user addresses

#### POST /user/addresses
Add new address

#### PUT /user/addresses/:id
Update address

#### DELETE /user/addresses/:id
Delete address

### Admin Endpoints

#### GET /admin/dashboard
Get dashboard statistics

#### GET /admin/orders
Get all orders with filters

#### GET /admin/users
Get all users with pagination

#### GET /admin/inventory
Get inventory report

#### PUT /admin/users/:id/role
Update user role

### File Upload Endpoints

#### POST /upload/product-images
Upload product images (returns URLs)

#### POST /upload/3d-models
Upload 3D model files (returns URLs)

## Response Format
All responses should follow this format:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Success message"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { /* additional error info */ }
  }
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Internal Server Error

## File Storage
Store product images and 3D models in cloud storage (AWS S3, Google Cloud Storage, etc.)
- Product images: `/products/{product_id}/images/`
- 3D models: `/products/{product_id}/models/`

## Security Considerations
1. Use HTTPS for all endpoints
2. Implement rate limiting
3. Validate all input data
4. Use parameterized queries to prevent SQL injection
5. Hash passwords with bcrypt
6. Implement CORS properly
7. Log all admin actions

## Environment Variables
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jewelry_store
DB_USER=username
DB_PASSWORD=password
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your-bucket-name
```