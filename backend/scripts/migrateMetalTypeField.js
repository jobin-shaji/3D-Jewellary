const mongoose = require('mongoose');
const Product = require('../models/product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/3d-marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const migrateMetalTypeField = async () => {
  try {
    console.log('🔄 Starting migration to convert Type to type in variant metals...');

    // Find all products with variants that have metals
    const products = await Product.find({
      'variants.metal': { $exists: true }
    });

    console.log(`📊 Found ${products.length} products with variants containing metals`);

    let updatedCount = 0;

    for (const product of products) {
      let productUpdated = false;

      for (const variant of product.variants) {
        if (variant.metal && Array.isArray(variant.metal)) {
          for (const metal of variant.metal) {
            // Check if metal has old 'Type' property
            if (metal.Type && !metal.type) {
              console.log(`🔧 Converting Type to type for product ${product.id}, variant ${variant.variant_id}`);
              metal.type = metal.Type;
              delete metal.Type;
              productUpdated = true;
            }
          }
        }
      }

      if (productUpdated) {
        await product.save();
        updatedCount++;
        console.log(`✅ Updated product: ${product.id} - ${product.name}`);
      }
    }

    console.log(`🎉 Migration completed! Updated ${updatedCount} products`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
migrateMetalTypeField();