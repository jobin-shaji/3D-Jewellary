const mongoose = require('mongoose');
const Product = require('../models/product');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-demo';

async function migratePriceToMakingPrice() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all products that still have the old 'price' field
    const productsWithOldPrice = await mongoose.connection.db.collection('products').find({
      price: { $exists: true },
      makingPrice: { $exists: false }
    }).toArray();

    console.log(`Found ${productsWithOldPrice.length} products with old 'price' field`);

    if (productsWithOldPrice.length === 0) {
      console.log('No products need migration');
      return;
    }

    // Update each product: copy price to makingPrice and remove old price field
    for (const product of productsWithOldPrice) {
      const result = await mongoose.connection.db.collection('products').updateOne(
        { _id: product._id },
        {
          $set: { makingPrice: product.price },
          $unset: { price: "" }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`Migrated product: ${product.name} (${product._id})`);
      }
    }

    console.log('\nMigration completed successfully!');
    
    // Verify migration
    const remainingOldProducts = await mongoose.connection.db.collection('products').countDocuments({
      price: { $exists: true }
    });
    
    const newProducts = await mongoose.connection.db.collection('products').countDocuments({
      makingPrice: { $exists: true }
    });
    
    console.log(`\nVerification:`);
    console.log(`- Products with old 'price' field: ${remainingOldProducts}`);
    console.log(`- Products with new 'makingPrice' field: ${newProducts}`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the migration script
if (require.main === module) {
  migratePriceToMakingPrice();
}

module.exports = { migratePriceToMakingPrice };