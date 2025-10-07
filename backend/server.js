// const validator = require('validator');
// const bcrypt = require('bcrypt');
// const cloudinary = require('cloudinary').v2;
// const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
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
const pricingRouter = require('./routes/pricing');

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081'], // Add Vite's default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Cross-Origin-Opener-Policy', 'Cross-Origin-Embedder-Policy']
}));

app.use(express.json());

//Hosting 
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-demo';

// Connect to MongoDB
if (!MONGODB_URI || !PORT) {
  console.error('Missing required environment variables');
  process.exit(1);
}
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api/metal', metalPricesRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/categories', categories);
app.use('/api/products', products);
app.use('/api/admin', adminRouter);
app.use('/api/cart', cartRouter);
app.use('/api/addresses', addressRouter);

// Mount routers for existing routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;