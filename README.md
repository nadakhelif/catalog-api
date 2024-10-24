# Catalog API

A robust e-commerce catalog API built with Node.js, featuring user management, product catalog, shopping cart functionality, and role-based access control.

## 📋 Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Installation & Running](#installation--running)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)

## ✨ Features

### Current Implementation Status
✅ Completed Features:
- Basic CRUD operations for products
- User authentication and authorization
- Shopping cart functionality
- Product visibility control based on user status
- Database integration with PostgreSQL
- Swagger API documentation
- Docker setup for testing
- Production deployment configuration with Azure



### Admin Functionalities
- Complete product catalog management (CRUD operations)
- User cart monitoring
- User management
- Product inventory management

### Customer Functionalities
- Product browsing with authentication-based visibility
- Shopping cart management
- Product quantity tracking
- Secure checkout process

### Core Features
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation using DTOs
- Comprehensive error handling
- Product inventory management
- Quantity tracking and validation

### Improvements and Future Work

#### Payment Integration
- Implement Stripe payment gateway integration
  - Add payment service module
  - Create secure payment processing flow
  - Implement webhook handlers for payment status updates
  - Add payment status tracking to orders
  - Implement refund functionality

#### Monitoring and Logging
- Implement comprehensive monitoring system
  - Add Prometheus metrics collection
  - Set up Grafana dashboards for visualization

## 🏗 Architecture

### Core Entities

#### User
- Manages user data and authentication
- One-to-one relationship with Cart
- Role-based access (Admin/Customer)

#### Product
- Represents catalog items
- Includes inventory tracking
- Managed by admin users

#### Cart
- One-to-one relationship with User
- One-to-many relationship with CartItems
- Handles shopping session data

#### CartItem
- Many-to-one relationship with Product
- Tracks quantity per product
- Links products to carts

### Modules

#### UsersModule
- `UsersController`: HTTP request handling
- `UsersService`: User operations logic
- `User` entity: Data representation

#### ProductsModule
- `ProductsController`: Product-related endpoints
- `ProductsService`: Product management logic
- `Product` entity: Product data structure

#### CartsModule
- `CartsController`: Cart operation endpoints
- `CartsService`: Shopping cart logic
- `Cart` & `CartItem` entities

#### AuthModule
- `AuthController`: Authentication endpoints
- `AuthService`: Authentication logic
- `JwtStrategy`: JWT implementation

#### Guard
- `JwtAuthGuard`:  JWT implementation
- `OptionalJwtAuthGuard`: It's to manage the option of having a logged in user or not
- `RolesGuard`: Role


## 🛠 Prerequisites
- Node.js 
- npm or yarn
- Docker and Docker Compose (for local development)
- A deployed Azure postgress db 

## 🌍 Environment Setup

### Development Environment
```bash
# Clone the repository
git clone https://github.com/nadakhelif/catalog-api.git
cd catalog-api

# Copy environment file
cp .env.example .env

```

### Test Environment
```bash
# Configure test environment
cp .env.example .env.test
```


## 🚀 Installation & Running

### Local Development
```bash
# Install dependencies
npm install

# Start the database (Development)
# Connect to tha deployed DB

# Run migrations
npm run migration:run

# Start the application
npm run start

# The API will be available at http://localhost:3000
# Swagger documentation at http://localhost:3000/api/docs
```


## 🧪 Testing

### Running Tests
```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Run all available tests
npm run test

```

## 📚 API Documentation

### Swagger Documentation
After starting the application, visit: You can find all the end points and you can test them
```
http://localhost:3000/api/docs
```



## 📊 Database Schema

### Production Database
- Hosted on Azure PostgreSQL
- Configured for high availability
- Automated backups

### Test Database
- Local PostgreSQL instance via Docker
- Isolated testing environment
- Matches production schema

## 🔒 Security
- JWT-based authentication
- Role-based access control
- Input validation
- Secure password hashing

