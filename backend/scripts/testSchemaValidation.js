const Product = require('../models/product');

// Test creating a variant with the correct schema
const testVariant = {
  variant_id: 'test_variant_123',
  name: 'Test Variant',
  stock_quantity: 10,
  making_price: 100,
  metal: [{
    type: 'Gold', // Using lowercase 'type'
    purity: '18k',
    weight: 2.5,
    color: 'Yellow'
  }],
  totalPrice: 0
};

console.log('✅ Test variant structure:', JSON.stringify(testVariant, null, 2));
console.log('✅ Schema should accept this variant structure with lowercase "type"');

// Test if the schema validation passes
try {
  const testProduct = new Product({
    name: 'Test Product',
    makingPrice: 50,
    category_id: 1,
    description: 'Test description',
    variants: [testVariant]
  });

  // Just validate, don't save
  const error = testProduct.validateSync();
  if (error) {
    console.log('❌ Schema validation failed:', error.message);
  } else {
    console.log('✅ Schema validation passed! The Type->type fix is working.');
  }
} catch (err) {
  console.log('❌ Test failed:', err.message);
}