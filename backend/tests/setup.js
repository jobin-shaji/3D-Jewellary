const mongoose = require('mongoose');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/jewelry-test';

// Increase timeout for database operations
jest.setTimeout(10000);

// Global test setup
beforeAll(async () => {
  // Enable verbose logging for debugging
  // if (process.env.VERBOSE_TESTS !== 'true') {
  //   console.log = jest.fn();
  //   console.info = jest.fn();
  //   console.warn = jest.fn();
  // }
});

afterAll(async () => {
  // Close database connection after all tests
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});