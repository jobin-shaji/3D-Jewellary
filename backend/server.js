const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Product = require('./models/product');

// Import routers
const authRouter = require('./routes/auth');
const products = require('./routes/products');
const categories = require('./routes/categories');
const metalPricesRouter = require('./routes/metals');
const adminRouter = require('./routes/admin');
const cartRouter = require('./routes/cart');
const addressRouter = require('./routes/addresses');
const ordersRouter = require('./routes/orders');
const pricingRouter = require('./routes/pricing');
const paymentsRouter = require('./routes/payments');
const usersRouter = require('./routes/users');
const invoicesRouter = require('./routes/invoices');

const app = express(); 
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL].filter(Boolean)  // Remove undefined values
  : ['http://localhost:5173','http://localhost:8080','http://localhost:8081'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'production') {
      console.warn(`Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    } else {
      // In development, allow all origins (for testing)
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Cross-Origin-Opener-Policy', 'Cross-Origin-Embedder-Policy']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Production Security Headers
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
}

//Hosting 
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-demo';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate required environment variables
if (!MONGODB_URI || !PORT) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

if (NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  console.warn('⚠️  Warning: FRONTEND_URL not set in production environment');
}

console.log('🚀 Starting server...');
console.log(`📌 Environment: ${NODE_ENV}`);
console.log(`📌 Port: ${PORT}`);
console.log(`📌 Frontend URL: ${process.env.FRONTEND_URL || 'localhost'}`);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📦 Database: ${mongoose.connection.db.databaseName}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api/metal', metalPricesRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/categories', categories);
app.use('/api/products', products);
app.use('/api/admin', adminRouter);
app.use('/api/cart', cartRouter);
app.use('/api/addresses', addressRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/users', usersRouter);
app.use('/api/invoices', invoicesRouter);

// Mount routers for existing routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Health check endpoint (important for hosting platforms)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: Math.floor(process.uptime()),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: '3D Marketplace API',
    version: '1.0.0',
    status: 'running',
    environment: NODE_ENV,
    endpoints: {
      health: '/health',
      test: '/api/test',
      api: '/api'
    }
  });
});

// 404 Handler - must be AFTER all valid routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  // Don't leak error details in production
  const errorResponse = NODE_ENV === 'production'
    ? {
        error: 'Internal server error',
        message: 'Something went wrong'
      }
    : {
        error: err.message,
        stack: err.stack,
        path: req.originalUrl
      };
  
  res.status(err.status || 500).json(errorResponse);
});

// Graceful Shutdown Handlers
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} signal received: closing server gracefully`);
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start Server
app.listen(PORT, () => {
  console.log('=================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log('=================================');
});

module.exports = app;