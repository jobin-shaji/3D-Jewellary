# Backend

This folder contains the traditional Node.js/Express backend for the 3D Jewelry Marketplace project.

## Features
- RESTful API for product, user, order, and category management
- JWT authentication and role-based access control
- Integration with MongoDB for data storage
- Business logic for cart, wishlist, analytics, and invoicing
- File uploads for product images and 3D models

## Structure
- `models/`: Mongoose models for database entities
- `routes/`: Express route handlers for API endpoints
- `services/`: Business logic and helpers
- `templates/`: EJS templates for invoices
- `utils/`: Utility functions (JWT, pricing, uploads)

## Usage
Refer to the main server file (`server.js`) for starting the backend. This backend will be migrated to serverless functions in the future.