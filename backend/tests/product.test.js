const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/product');
const User = require('../models/user');
const Metal = require('../models/metal');
const jwt = require('jsonwebtoken');

// Mock authentication
const mockAdmin = {
  id: 'admin123',
  email: 'admin@test.com',
  role: 'admin'
};

const generateToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
};

const adminToken = generateToken(mockAdmin);

describe('Product API with Variants', () => {
  let productId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/jewelry-test');
    }

    // Create test metal prices for price calculations using upsert to avoid conflicts
    await Metal.deleteMany({});
    const metals = [
      { metal: 'Gold', purity: '18k', pricePerGram: 5000 },
      { metal: 'Gold', purity: '14k', pricePerGram: 3500 },
      { metal: 'Silver', purity: '925', pricePerGram: 80 }
    ];
    
    for (const metalData of metals) {
      await Metal.findOneAndUpdate(
        { metal: metalData.metal, purity: metalData.purity },
        metalData,
        { upsert: true, new: true }
      );
    }
  });

  beforeEach(async () => {
    // Clear products before each test
    await Product.deleteMany({});
  });

  afterAll(async () => {
    // Clean up after tests
    await Product.deleteMany({});
    await Metal.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/products - Create product with variants', () => {
    test('should create a product with variants successfully', async () => {
      const productData = {
        name: 'Gold Ring Collection',
        makingPrice: 1000,
        category_id: 1,
        description: 'Beautiful gold rings with different sizes',
        is_active: true,
        variants: [
          {
            name: 'Ring size 6',
            stock_quantity: 10,
            making_price: 500,
            metal: [
              {
                Type: 'Gold',
                purity: '18k',
                weight: 4.8
              }
            ]
          },
          {
            name: 'Ring size 8',
            stock_quantity: 5,
            making_price: 600,
            metal: [
              {
                Type: 'Gold',
                purity: '14k',
                weight: 5.2
              }
            ]
          }
        ],
        metals: [],
        gemstones: [],
        stock_quantity: 15
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.message).toBe('Product created successfully');
      expect(response.body.product).toBeDefined();
      expect(response.body.product.variants).toHaveLength(2);
      
      // Check that totalPrice is calculated for each variant
      expect(response.body.product.variants[0].totalPrice).toBeGreaterThan(0);
      expect(response.body.product.variants[1].totalPrice).toBeGreaterThan(0);
      
      // Check that customizations field is not present
      expect(response.body.product.customizations).toBeUndefined();

      productId = response.body.product.id;
    });

    test('should reject product creation with invalid variant data', async () => {
      const productData = {
        name: 'Invalid Product',
        makingPrice: 1000,
        category_id: 1,
        description: 'Product with invalid variants',
        variants: [
          {
            name: 'Invalid Variant',
            // missing making_price
            stock_quantity: 10,
            metal: []
          }
        ]
      };

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(400);
    });

    test('should reject variant with invalid metal data', async () => {
      const productData = {
        name: 'Invalid Metal Product',
        makingPrice: 1000,
        category_id: 1,
        description: 'Product with invalid metal in variant',
        variants: [
          {
            name: 'Valid Variant Name',
            making_price: 500,
            stock_quantity: 10,
            metal: [
              {
                Type: 'Gold',
                purity: '18k',
                // missing weight
              }
            ]
          }
        ]
      };

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(400);
    });
  });

  describe('PUT /api/products/:id - Update product with variants', () => {
    beforeEach(async () => {
      // Create a product first
      const product = new Product({
        name: 'Test Product',
        makingPrice: 1000,
        category_id: 1,
        description: 'Test description',
        variants: [
          {
            variant_id: 'var_original',
            name: 'Original Variant',
            stock_quantity: 5,
            making_price: 300,
            metal: [{ Type: 'Silver', purity: '925', weight: 3.0 }],
            totalPrice: 540
          }
        ]
      });
      const savedProduct = await product.save();
      productId = savedProduct.id;
    });

    test('should update product with new variants', async () => {
      const updateData = {
        name: 'Updated Product Name',
        variants: [
          {
            name: 'Updated Variant',
            stock_quantity: 8,
            making_price: 700,
            metal: [
              {
                Type: 'Gold',
                purity: '18k',
                weight: 4.5
              }
            ]
          },
          {
            name: 'New Additional Variant',
            stock_quantity: 12,
            making_price: 800,
            metal: [
              {
                Type: 'Gold',
                purity: '14k',
                weight: 5.0
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Product updated successfully');
      expect(response.body.product.name).toBe('Updated Product Name');
      expect(response.body.product.variants).toHaveLength(2);
      
      // Check that totalPrice is recalculated
      expect(response.body.product.variants[0].totalPrice).toBeGreaterThan(0);
      expect(response.body.product.variants[1].totalPrice).toBeGreaterThan(0);
    });

    test('should reject update with invalid variant data', async () => {
      const updateData = {
        variants: [
          {
            name: 'Invalid Variant',
            stock_quantity: -5, // Invalid negative stock
            making_price: 500,
            metal: []
          }
        ]
      };

      await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('GET /api/products/:id - Fetch product with variants', () => {
    beforeEach(async () => {
      // Create a product with variants
      const product = new Product({
        name: 'Fetch Test Product',
        makingPrice: 1000,
        category_id: 1,
        description: 'Product for fetch testing',
        variants: [
          {
            variant_id: 'var_variant1',
            name: 'Variant 1',
            stock_quantity: 10,
            making_price: 400,
            metal: [{ Type: 'Gold', purity: '18k', weight: 3.5 }],
            totalPrice: 18620
          },
          {
            variant_id: 'var_variant2',
            name: 'Variant 2',
            stock_quantity: 7,
            making_price: 500,
            metal: [{ Type: 'Silver', purity: '925', weight: 4.0 }],
            totalPrice: 835
          }
        ]
      });
      const savedProduct = await product.save();
      productId = savedProduct.id;
    });

    test('should fetch product with variants correctly', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(response.body.product).toBeDefined();
      expect(response.body.product.name).toBe('Fetch Test Product');
      expect(response.body.product.variants).toHaveLength(2);
      
      // Check variant structure
      const variant1 = response.body.product.variants[0];
      expect(variant1.name).toBe('Variant 1');
      expect(variant1.stock_quantity).toBe(10);
      expect(variant1.making_price).toBe(400);
      expect(variant1.totalPrice).toBe(18620);
      expect(variant1.metal).toHaveLength(1);
      expect(variant1.metal[0].Type).toBe('Gold');

      // Ensure customizations field is not present
      expect(response.body.product.customizations).toBeUndefined();
    });

    test('should return 404 for non-existent product', async () => {
      await request(app)
        .get('/api/products/nonexistent123/full')
        .expect(404);
    });
  });

  describe('Price calculation tests', () => {
    test('should calculate totalPrice correctly based on metal and making costs', async () => {
      const productData = {
        name: 'Price Test Product',
        makingPrice: 1000,
        category_id: 1,
        description: 'Product for price testing',
        variants: [
          {
            name: 'Gold Variant',
            stock_quantity: 5,
            making_price: 1000,
            metal: [
              {
                Type: 'Gold',
                purity: '18k',
                weight: 5.0 // 5 grams * 5000 per gram = 25000
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      const variant = response.body.product.variants[0];
      
      // Expected calculation:
      // Metal cost: 5.0 * 5000 = 25000
      // Making price: 1000
      // Subtotal: 26000
      // Tax (3%): 780
      // Total: 26780
      expect(variant.totalPrice).toBe(26780);
    });

    test('should calculate totalPrice for multiple metal types in variant', async () => {
      const productData = {
        name: 'Multi-Metal Product',
        makingPrice: 1000,
        category_id: 1,
        description: 'Product with multiple metals',
        variants: [
          {
            name: 'Mixed Metal Variant',
            stock_quantity: 3,
            making_price: 500,
            metal: [
              {
                Type: 'Gold',
                purity: '18k',
                weight: 2.0 // 2 * 5000 = 10000
              },
              {
                Type: 'Silver',
                purity: '925',
                weight: 3.0 // 3 * 80 = 240
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      const variant = response.body.product.variants[0];
      
      // Expected calculation:
      // Metal cost: (2.0 * 5000) + (3.0 * 80) = 10000 + 240 = 10240
      // Making price: 500
      // Subtotal: 10740
      // Tax (3%): 322.2
      // Total: 11062.2, rounded = 11062
      expect(variant.totalPrice).toBe(11062);
    });
  });

  describe('Customization field removal tests', () => {
    test('should not accept customizations field in product creation', async () => {
      const productData = {
        name: 'Test Product',
        makingPrice: 1000,
        category_id: 1,
        description: 'Test description',
        customizations: ['old field'], // This should be ignored
        variants: [
          {
            name: 'Test Variant',
            stock_quantity: 5,
            making_price: 300,
            metal: [{ Type: 'Gold', purity: '18k', weight: 2.0 }]
          }
        ]
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      // Product should be created successfully but without customizations
      expect(response.body.product.customizations).toBeUndefined();
      expect(response.body.product.variants).toHaveLength(1);
    });

    test('should remove customizations field when updating product', async () => {
      // First create a product
      const product = new Product({
        name: 'Test Product',
        makingPrice: 1000,
        category_id: 1,
        description: 'Test description',
        variants: []
      });
      const savedProduct = await product.save();

      const updateData = {
        name: 'Updated Product',
        customizations: ['should be ignored'], // This should be ignored
        variants: [
          {
            name: 'New Variant',
            stock_quantity: 8,
            making_price: 400,
            metal: [{ Type: 'Silver', purity: '925', weight: 3.0 }]
          }
        ]
      };

      const response = await request(app)
        .put(`/api/products/${savedProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.product.customizations).toBeUndefined();
      expect(response.body.product.variants).toHaveLength(1);
    });
  });
});