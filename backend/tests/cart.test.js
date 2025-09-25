const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Cart = require('../models/cart');
const Product = require('../models/product');
const User = require('../models/user');
const Metal = require('../models/metal');
const jwt = require('jsonwebtoken');

// Mock users for testing
const mockUser1 = {
  id: 'user123',
  email: 'user1@test.com',
  role: 'user'
};

const mockUser2 = {
  id: 'user456',
  email: 'user2@test.com',
  role: 'user'
};

const generateToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
};

const user1Token = generateToken(mockUser1);
const user2Token = generateToken(mockUser2);

describe('Cart API', () => {
  let testProduct1, testProduct2, testProductNoVariants;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/jewelry-test');
    }

    // Create test metal prices for price calculations using upsert to avoid conflicts
    await Metal.deleteMany({});
    const metals = [
      { metal: 'Gold', purity: '18k', pricePerGram: 5000 },
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
    // Clear all data before each test
    await Cart.deleteMany({});
    await Product.deleteMany({});

    // Create test products with variants
    testProduct1 = new Product({
      name: 'Gold Ring Collection',
      makingPrice: 1000,
      category_id: 1,
      description: 'Beautiful gold rings',
      is_active: true,
      variants: [
        {
          variant_id: 'var_ring_size6',  
          name: 'Ring size 6',
          stock_quantity: 10,
          making_price: 500,
          metal: [{ Type: 'Gold', purity: '18k', weight: 3.0 }],
          totalPrice: 16545 // Pre-calculated: (3.0 * 5000) + 500 + 3% tax
        },
        {
          variant_id: 'var_ring_size8',
          name: 'Ring size 8', 
          stock_quantity: 5,
          making_price: 600,
          metal: [{ Type: 'Gold', purity: '18k', weight: 3.5 }],
          totalPrice: 18645 // Pre-calculated: (3.5 * 5000) + 600 + 3% tax
        }
      ]
    });

    testProduct2 = new Product({
      name: 'Silver Necklace',
      makingPrice: 800,
      category_id: 2,
      description: 'Elegant silver necklace',
      is_active: true,
      variants: [
        {
          variant_id: 'var_necklace_16inch',
          name: 'Necklace 16 inch',
          stock_quantity: 8,
          making_price: 300,
          metal: [{ Type: 'Silver', purity: '925', weight: 15.0 }],
          totalPrice: 1545 // Pre-calculated: (15.0 * 80) + 300 + 3% tax
        }
      ]
    });

    // Create test product without variants (traditional product)
    testProductNoVariants = new Product({
      name: 'Simple Gold Pendant',
      makingPrice: 800,
      category_id: 3,
      description: 'Classic gold pendant without variants',
      is_active: true,
      stock_quantity: 15,
      totalPrice: 2060, // Pre-calculated total price for the entire product
      variants: [] // No variants - empty array
    });

    await testProduct1.save();
    await testProduct2.save();
    await testProductNoVariants.save();

    console.log('Test products created:', {
      product1Id: testProduct1.id,
      product2Id: testProduct2.id,
      productNoVariantsId: testProductNoVariants.id
    });
  });

  afterAll(async () => {
    // Clean up after tests
    await Cart.deleteMany({});
    await Product.deleteMany({});
    await Metal.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/cart/add - Add items to cart', () => {
    test('should add new item to empty cart', async () => {
      const itemData = {
        productId: testProduct1.id,
        variant_id: 'var_ring_size6',
        quantity: 2
      };

      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(itemData)
        .expect(200);

      expect(response.body.message).toBe('Item added to cart successfully');
      expect(response.body.cart.items).toHaveLength(1);
      expect(response.body.cart.items[0].productId).toBe(testProduct1.id);
      expect(response.body.cart.items[0].variant_id).toBe('var_ring_size6');
      expect(response.body.cart.items[0].quantity).toBe(2);
      expect(response.body.cart.items[0].priceAtPurchase).toBe(16545);
      expect(response.body.cart.items[0].name).toBe('Gold Ring Collection - Ring size 6');
      expect(response.body.cart.totalItems).toBe(2);
      expect(response.body.cart.totalAmount).toBe(33090); // 16545 * 2
    });

    test('should increase quantity when adding existing item', async () => {
      // First add an item
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 1
        });

      // Add the same item again
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 2
        })
        .expect(200);

      expect(response.body.cart.items).toHaveLength(1);
      expect(response.body.cart.items[0].quantity).toBe(3); // 1 + 2
      expect(response.body.cart.totalItems).toBe(3);
      expect(response.body.cart.totalAmount).toBe(49635); // 16545 * 3
    });

    test('should add different variants as separate items', async () => {
      // Add first variant
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 1
        });

      // Add second variant
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size8',
          quantity: 1
        })
        .expect(200);

      expect(response.body.cart.items).toHaveLength(2);
      expect(response.body.cart.totalItems).toBe(2);
      expect(response.body.cart.totalAmount).toBe(35190); // 16545 + 18645
    });

    test('should reject adding item with insufficient stock', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size8', // Has stock_quantity: 5
          quantity: 6 // Requesting more than available
        })
        .expect(400);

      expect(response.body.message).toContain('Insufficient stock');
    });

    test('should reject adding non-existent product', async () => {
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: 'nonexistent123',
          variant_id: 'var_ring_size6',
          quantity: 1
        })
        .expect(404);
    });

    test('should reject adding non-existent variant', async () => {
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'nonexistent_variant',
          quantity: 1
        })
        .expect(404);
    });

    test('should reject invalid quantity', async () => {
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 0
        })
        .expect(400);
    });

    test('should reject unauthorized request', async () => {
      await request(app)
        .post('/api/cart/add')
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 1
        })
        .expect(401);
    });

    test('should add product without variants to cart', async () => {
      const itemData = {
        productId: testProductNoVariants.id,
        variant_id: testProductNoVariants.id, // For non-variant products, use productId as variant_id
        quantity: 3
      };

      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(itemData)
        .expect(200);

      expect(response.body.message).toBe('Item added to cart successfully');
      expect(response.body.cart.items).toHaveLength(1);
      expect(response.body.cart.items[0].productId).toBe(testProductNoVariants.id);
      expect(response.body.cart.items[0].variant_id).toBe(testProductNoVariants.id);
      expect(response.body.cart.items[0].quantity).toBe(3);
      expect(response.body.cart.items[0].priceAtPurchase).toBe(2060);
      expect(response.body.cart.items[0].name).toBe('Simple Gold Pendant');
      expect(response.body.cart.totalItems).toBe(3);
      expect(response.body.cart.totalAmount).toBe(6180); // 2060 * 3
    });

    test('should reject adding product without variants using wrong variant_id', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProductNoVariants.id,
          variant_id: 'wrong_variant_id', // Should be same as productId for non-variant products
          quantity: 1
        })
        .expect(404);

      expect(response.body.message).toContain('Product variant not found');
    });

    test('should handle mixed cart with variant and non-variant products', async () => {
      // Add variant product
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 1
        });

      // Add non-variant product
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProductNoVariants.id,
          variant_id: testProductNoVariants.id,
          quantity: 2
        })
        .expect(200);

      expect(response.body.cart.items).toHaveLength(2);
      expect(response.body.cart.totalItems).toBe(3); // 1 + 2
      expect(response.body.cart.totalAmount).toBe(20665); // 16545 + (2060 * 2)
    });

    test('should reject insufficient stock for non-variant product', async () => {
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProductNoVariants.id,
          variant_id: testProductNoVariants.id,
          quantity: 20 // More than stock_quantity: 15
        })
        .expect(400);
    });
  });

  describe('PATCH /api/cart/update - Update cart items', () => {
    beforeEach(async () => {
      // Add initial items to cart
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 3
        });
    });

    test('should update item quantity', async () => {
      const response = await request(app)
        .patch('/api/cart/update')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 2
        })
        .expect(200);

      expect(response.body.message).toContain('updated in cart');
      expect(response.body.cart.items[0].quantity).toBe(2);
      expect(response.body.cart.totalItems).toBe(2);
      expect(response.body.cart.totalAmount).toBe(33090); // 16545 * 2
    });

    test('should remove item when quantity is 0', async () => {
      const response = await request(app)
        .patch('/api/cart/update')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 0
        })
        .expect(200);

      expect(response.body.message).toContain('removed from cart');
      expect(response.body.cart.items).toHaveLength(0);
      expect(response.body.cart.totalItems).toBe(0);
      expect(response.body.cart.totalAmount).toBe(0);
    });

    test('should reject updating with insufficient stock', async () => {
      await request(app)
        .patch('/api/cart/update')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6', // Has stock_quantity: 10
          quantity: 15 // More than available
        })
        .expect(400);
    });

    test('should reject updating non-existent item', async () => {
      await request(app)
        .patch('/api/cart/update')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct2.id, // Different product not in cart
          variant_id: 'var_necklace_16inch',
          quantity: 1
        })
        .expect(404);
    });

    test('should reject invalid quantity', async () => {
      await request(app)
        .patch('/api/cart/update')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: -1
        })
        .expect(400);
    });

    test('should update non-variant product quantity', async () => {
      // Clear cart and add only non-variant product
      await request(app)
        .delete('/api/cart/clear')
        .set('Authorization', `Bearer ${user1Token}`);

      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProductNoVariants.id,
          variant_id: testProductNoVariants.id,
          quantity: 3
        });

      // Update quantity
      const response = await request(app)
        .patch('/api/cart/update')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProductNoVariants.id,
          variant_id: testProductNoVariants.id,
          quantity: 5
        })
        .expect(200);

      expect(response.body.cart.items[0].quantity).toBe(5);
      expect(response.body.cart.totalItems).toBe(5);
      expect(response.body.cart.totalAmount).toBe(10300); // 2060 * 5
    });

    test('should remove non-variant product when quantity is 0', async () => {
      // Clear cart and add only non-variant product
      await request(app)
        .delete('/api/cart/clear')
        .set('Authorization', `Bearer ${user1Token}`);

      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProductNoVariants.id,
          variant_id: testProductNoVariants.id,
          quantity: 2
        });

      // Remove by setting quantity to 0
      const response = await request(app)
        .patch('/api/cart/update')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProductNoVariants.id,
          variant_id: testProductNoVariants.id,
          quantity: 0
        })
        .expect(200);

      expect(response.body.message).toContain('removed from cart');
      expect(response.body.cart.items).toHaveLength(0);
    });
  });

  describe('GET /api/cart - Fetch cart', () => {
    test('should return empty cart for new user', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.message).toBe('Cart fetched successfully');
      expect(response.body.cart.items).toHaveLength(0);
      expect(response.body.cart.totalItems).toBe(0);
      expect(response.body.cart.totalAmount).toBe(0);
      expect(response.body.summary.totalItems).toBe(0);
    });

    test('should return cart with items', async () => {
      // Add items to cart first
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 2
        });

      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct2.id,
          variant_id: 'var_necklace_16inch',
          quantity: 1
        });

      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.cart.items).toHaveLength(2);
      expect(response.body.cart.totalItems).toBe(3);
      expect(response.body.cart.totalAmount).toBe(34635); // (16545 * 2) + 1545
      expect(response.body.summary.itemCount).toBe(2);
    });

    test('should return different carts for different users', async () => {
      // Add item to user1's cart
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 1
        });

      // Check user1's cart
      const user1Response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Check user2's cart (should be empty)
      const user2Response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(user1Response.body.cart.items).toHaveLength(1);
      expect(user2Response.body.cart.items).toHaveLength(0);
    });

    test('should reject unauthorized request', async () => {
      await request(app)
        .get('/api/cart')
        .expect(401);
    });

    test('should fetch cart with non-variant products', async () => {
      // Add non-variant product
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProductNoVariants.id,
          variant_id: testProductNoVariants.id,
          quantity: 2
        });

      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.cart.items).toHaveLength(1);
      expect(response.body.cart.items[0].productId).toBe(testProductNoVariants.id);
      expect(response.body.cart.items[0].variant_id).toBe(testProductNoVariants.id);
      expect(response.body.cart.items[0].name).toBe('Simple Gold Pendant');
      expect(response.body.cart.items[0].priceAtPurchase).toBe(2060);
      expect(response.body.cart.totalItems).toBe(2);
    });
  });

  describe('DELETE /api/cart/clear - Clear cart', () => {
    beforeEach(async () => {
      // Add items to cart
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 2
        });

      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct2.id,
          variant_id: 'var_necklace_16inch',
          quantity: 1
        });
    });

    test('should clear all items from cart', async () => {
      const response = await request(app)
        .delete('/api/cart/clear')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.message).toBe('Cart cleared successfully');
      expect(response.body.cart.items).toHaveLength(0);
      expect(response.body.cart.totalItems).toBe(0);
      expect(response.body.cart.totalAmount).toBe(0);
    });

    test('should not affect other users carts', async () => {
      // Add item to user2's cart
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 1
        });

      // Clear user1's cart
      await request(app)
        .delete('/api/cart/clear')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Check user2's cart is still intact
      const user2Response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(user2Response.body.cart.items).toHaveLength(1);
    });
  });

  describe('GET /api/cart/count - Get cart count', () => {
    test('should return 0 for empty cart', async () => {
      const response = await request(app)
        .get('/api/cart/count')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.count).toBe(0);
    });

    test('should return correct count for cart with items', async () => {
      // Add items
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 3
        });

      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct2.id,
          variant_id: 'var_necklace_16inch',
          quantity: 2
        });

      const response = await request(app)
        .get('/api/cart/count')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.count).toBe(5); // 3 + 2
    });
  });

  describe('Validation and edge cases', () => {
    test('should handle inactive products', async () => {
      // Deactivate product
      testProduct1.is_active = false;
      await testProduct1.save();

      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 1
        })
        .expect(404);
    });

    test('should handle missing required fields', async () => {
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          // missing variant_id
          quantity: 1
        })
        .expect(400);
    });

    test('should handle stock validation when combining quantities', async () => {
      // Add 8 items (stock is 10)
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 8
        });

      // Try to add 3 more (total would be 11, exceeding stock of 10)
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProduct1.id,
          variant_id: 'var_ring_size6',
          quantity: 3
        })
        .expect(400);
    });

    test('should handle stock validation for non-variant products', async () => {
      // Add 12 items (stock is 15)
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProductNoVariants.id,
          variant_id: testProductNoVariants.id,
          quantity: 12
        });

      // Try to add 5 more (total would be 17, exceeding stock of 15)
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProductNoVariants.id,
          variant_id: testProductNoVariants.id,
          quantity: 5
        })
        .expect(400);
    });

    test('should handle products that become inactive after being added to cart', async () => {
      // Add item to cart first
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProductNoVariants.id,
          variant_id: testProductNoVariants.id,
          quantity: 1
        });

      // Deactivate product
      testProductNoVariants.is_active = false;
      await testProductNoVariants.save();

      // Try to add more of the same item
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          productId: testProductNoVariants.id,
          variant_id: testProductNoVariants.id,
          quantity: 1
        })
        .expect(404);
    });
  });
});