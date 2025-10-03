// Script to clear the Product collection in MongoDB
// Usage: node scripts/clearProducts.js

const mongoose = require('mongoose');
const Product = require('../models/product');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-demo';

async function clearProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    const result = await Product.deleteMany({});
    console.log(`Deleted ${result.deletedCount} products.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error clearing products:', err);
    process.exit(1);
  }
}

clearProducts();
