const validator = require('validator');
const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const User = require('./models/user');
const Product = require('./models/product');
const ProductImage = require('./models/productImage');
const Category = require('./models/category');

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081'], // Add Vite's default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Cross-Origin-Opener-Policy', 'Cross-Origin-Embedder-Policy']
}));

// Add these headers for Google OAuth
// Remove or comment out these lines if Google OAuth issues persist
// app.use((req, res, next) => {
//   res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
//   res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
//   next();
// });

app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

//Hosting 
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-demo';

// JWT Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // console.log('Auth header:', authHeader);
  // console.log('Extracted token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    console.log('Token verified for user:', user.email);
    req.user = user;
    next();
  });
};

// Helper function to generate JWT token
const generateToken = (user) => {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    totalOrders: user.totalOrders,
    totalSpent: user.totalSpent,
    loyaltyPoints: user.loyaltyPoints
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Helper function to verify Google token
const verifyGoogleToken = async (token) => {
  try {
    console.log('BACKEND: Verifying Google token with Google servers...');
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    console.log('BACKEND: Google token verified successfully by Google!');

    const payload = ticket.getPayload();
    return {
      email: payload.email,
      name: payload.name,
      // emailVerified: payload.email_verified
    };
  } catch (error) {
    console.error('BACKEND: Google token verification FAILED:', error.message);
    throw new Error('Invalid Google token');
  }
};


// Connect to MongoDB
if (!MONGODB_URI || !PORT) {
  console.error('Missing required environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for image uploads
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
    ]
  }
});

// Configure multer for 3D model uploads
const modelStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products/models',
    allowed_formats: ['glb', 'gltf', 'obj', 'fbx'],
    resource_type: 'raw'
  }
});

const uploadImage = multer({ 
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadModel = multer({ 
  storage: modelStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for 3D models
});

const uploadMultiple = multer({ 
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with bcrypt
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google OAuth Login/Register endpoint
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Google token is required' });
  }

  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: 'Google OAuth not configured' });
  }

  try {
    // Verify Google token
    const googleUser = await verifyGoogleToken(token);

    // Check if user already exists
    let user = await User.findOne({ email: googleUser.email });

    if (user) {
      // User exists - login
      // Update verification status if needed
      // if (!user.isVerified && googleUser.emailVerified) {
      //   user.isVerified = true;
      //   await user.save();
      // }
    } else {
      // User doesn't exist - register
      user = new User({
        name: googleUser.name,
        email: googleUser.email,
        password: 'google-oauth-user' // Placeholder password for Google users
        // isVerified: googleUser.emailVerified,
      });

      await user.save();
    }

    // Generate JWT token
    const jwtToken = generateToken(user);

    res.json({
      message: user.isNew ? 'Registration successful' : 'Login successful',
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      }
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

// Get current user endpoint (protected route)
// app.get('/api/user', authenticateToken, (req, res) => {
//   res.json({
//     user: req.user
//   });
// });

// Check auth status endpoint (protected route)
// app.get('/api/auth-status', authenticateToken, (req, res) => {
//   res.json({
//     isLoggedIn: true,
//     user: req.user
//   });
// });

// Verify token endpoint (for checking if token is still valid)
app.get('/api/verify-token', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

// Export the authenticateToken middleware for use in other routes
module.exports = { authenticateToken };

// Product creation endpoint (admin only)
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    let { 
      name, 
      price, 
      category_id, 
      description = '',
      is_active = true,
      specifications = {},
      customizations = [],
      metals = [],
      gemstones = [],
      stock_quantity = 0
    } = req.body;

    // Parse possible string fields
    price = Number(price);
    stock_quantity = Number(stock_quantity);
    
    // if your category_id is numeric in DB:
    // category_id = isNaN(Number(category_id)) ? category_id : Number(category_id);
    category_id = Number(category_id);

    // Parse JSON if front-end sent strings
    if (typeof specifications === 'string') {
      try { specifications = JSON.parse(specifications); } catch (e) { specifications = {}; }
    }
    if (typeof customizations === 'string') {
      try { customizations = JSON.parse(customizations); } catch (e) { customizations = []; }
    }
    if (typeof metals === 'string') {
      try { metals = JSON.parse(metals); } catch (e) { metals = []; }
    }
    if (typeof gemstones === 'string') {
      try { gemstones = JSON.parse(gemstones); } catch (e) { gemstones = []; }
    }

    // Validation
    if (!name || !price || !category_id) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }
    if (price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }
    if (!Number.isFinite(stock_quantity) || stock_quantity < 0) {
      return res.status(400).json({ message: 'stock_quantity must be a non-negative number' });
    }

    // Validate metals array
    if (metals && Array.isArray(metals)) {
      for (const metal of metals) {
        if (!metal.type || !metal.purity || !metal.weight || metal.weight <= 0) {
          return res.status(400).json({ 
            message: 'Each metal must have type, purity, and weight > 0' 
          });
        }
      }
    }

    // Validate gemstones array
    if (gemstones && Array.isArray(gemstones)) {
      for (const gemstone of gemstones) {
        if (!gemstone.type || !gemstone.carat || gemstone.carat <= 0 || !gemstone.count || gemstone.count <= 0) {
          return res.status(400).json({ 
            message: 'Each gemstone must have type, carat > 0, and count > 0' 
          });
        }
      }
    }

    // Let the Product schema generate its own string ID
    const product = new Product({
      name,
      price,
      category_id,
      description,
      is_active,
      specifications,
      customizations,
      metals,
      gemstones,
      stock_quantity
    });

    await product.save();

    return res.status(201).json({
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('❌ Create product error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Request body:', req.body);
    return res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Initialize default categories (run once)
app.post('/api/setup/categories', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const defaultCategories = [
      { id: 1, name: 'Rings', description: 'Engagement rings, wedding bands, and fashion rings' },
      { id: 2, name: 'Necklaces', description: 'Chains, pendants, and statement necklaces' },
      { id: 3, name: 'Earrings', description: 'Studs, hoops, and drop earrings' },
      { id: 4, name: 'Bracelets', description: 'Tennis bracelets, bangles, and charm bracelets' },
      { id: 5, name: 'Watches', description: 'Luxury timepieces and smart watches' }
    ];

    for (const categoryData of defaultCategories) {
      const existingCategory = await Category.findOne({ id: categoryData.id });
      if (!existingCategory) {
        const category = new Category(categoryData);
        await category.save();
        console.log(`Created category: ${category.name}`);
      }
    }

    const allCategories = await Category.find();
    console.log('All categories after setup:', allCategories);

    res.json({ 
      message: 'Default categories created successfully',
      categories: allCategories
    });
  } catch (error) {
    console.error('Setup categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Single image upload for product
app.post('/api/products/:id/images', authenticateToken, uploadImage.single('image'), async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const productId = req.params.id;
    const { alt_text, is_primary, sort_order } = req.body;

    // Check if product exists
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    // If this is set as primary, unset other primary images for this product
    if (is_primary === 'true') {
      await ProductImage.updateMany(
        { product_id: productId },
        { is_primary: false }
      );
    }

    const productImage = new ProductImage({
      product_id: productId,
      image_url: req.file.path, // Cloudinary URL
      alt_text: alt_text || `${product.name} image`,
      is_primary: is_primary === 'true',
      sort_order: parseInt(sort_order) || 0
    });

    await productImage.save();

    res.status(201).json({
      message: 'Product image uploaded successfully',
      image: productImage
    });

  } catch (error) {
    console.error('Upload product image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Multiple images upload for product
app.post('/api/products/:id/images/bulk', authenticateToken, uploadMultiple.array('images', 10), async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const productId = req.params.id;

    // Check if product exists
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image file is required' });
    }

    const uploadedImages = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      const productImage = new ProductImage({
        product_id: productId,
        image_url: file.path, // Cloudinary URL
        alt_text: `${product.name} image ${i + 1}`,
        is_primary: i === 0, // First image is primary
        sort_order: i
      });

      await productImage.save();
      uploadedImages.push(productImage);
    }

    res.status(201).json({
      message: 'Product images uploaded successfully',
      images: uploadedImages
    });

  } catch (error) {
    console.error('Upload product images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 3D model upload for product
app.post('/api/products/:id/model', authenticateToken, uploadModel.single('model'), async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const productId = req.params.id;

    // Check if product exists
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: '3D model file is required' });
    }

    // Update product with 3D model URL
    product.model_3d_url = req.file.path; // Cloudinary URL
    await product.save();

    res.status(201).json({
      message: '3D model uploaded successfully',
      model_url: req.file.path,
      product
    });

  } catch (error) {
    console.error('Upload 3D model error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product images
app.get('/api/products/:id/images', async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if product exists
    const product = await Product.findOne({ id: productId, is_active: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const images = await ProductImage.find({ product_id: productId })
      .sort({ sort_order: 1, created_at: 1 });

    res.json(images);

  } catch (error) {
    console.error('Get product images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true })
      .sort({ sort_order: 1, name: 1 });

    console.log('Categories found:', categories.length);
    res.json(categories);

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single category by ID
app.get('/api/categories/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    const category = await Category.findOne({ id: categoryId })
      .populate('children');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new category (admin only)
app.post('/api/categories', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { name, description, image_url, parent_id } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // If parent_id is provided, validate it exists
    if (parent_id) {
      const parentCategory = await Category.findOne({ id: parent_id });
      if (!parentCategory) {
        return res.status(400).json({ message: 'Invalid parent category ID' });
      }
    }

    // Get the next ID for the category
    const lastCategory = await Category.findOne().sort({ id: -1 });
    const nextId = lastCategory ? lastCategory.id + 1 : 1;

    const category = new Category({
      id: nextId,
      name,
      description,
      image_url,
      parent_id
    });

    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    // Hard limit of 50 products for academic project
    const MAX_LIMIT = 50;
    
    // Get all active products with limit
    const products = await Product.find({ is_active: true })
      .populate('category')
      .sort({ created_at: -1 })
      .limit(MAX_LIMIT);

    res.json({
      products,
      // Still return pagination info for frontend consistency
      pagination: {
        page: 1,
        limit: products.length,
        total: products.length,
        pages: 1
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// app.get('/api/products', async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 12;
//     const category = req.query.category;
//     const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : undefined;
//     const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined;
//     const featured = req.query.featured === 'true';
//     const sortBy = req.query.sortBy || 'created_at';
//     const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

//     // Build filter object
//     const filter = { is_active: true };
    
//     if (category) {
//       filter.category_id = parseInt(category);
//     }
    
//     if (minPrice !== undefined || maxPrice !== undefined) {
//       filter.price = {};
//       if (minPrice !== undefined) filter.price.$gte = minPrice;
//       if (maxPrice !== undefined) filter.price.$lte = maxPrice;
//     }
    
//     if (featured) {
//       filter.featured = true;
//     }

//     // Execute query with pagination
//     const skip = (page - 1) * limit;
//     const sortObj = {};
//     sortObj[sortBy] = sortOrder;

//     const products = await Product.find(filter)
//       .populate('category')
//       .sort(sortObj)
//       .skip(skip)
//       .limit(limit);

//     const total = await Product.countDocuments(filter);

//     res.json({
//       products,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     });

//   } catch (error) {
//     console.error('Get products error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// Update product (admin only)
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const productId = req.params.id;
    const updateData = req.body;

    const product = await Product.findOneAndUpdate(
      { id: productId },
      { ...updateData, updated_at: new Date() },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (admin only) - soft delete
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const productId = req.params.id;

    // Soft delete - set is_active to false instead of actually deleting
    const product = await Product.findOneAndUpdate(
      { id: productId },
      { is_active: false, updated_at: new Date() },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
      
    }

    // Also delete associated images (optional - you might want to keep them)
    await ProductImage.deleteMany({ product_id: productId });

    res.json({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product with images populated
app.get('/api/products/:id/full', async (req, res) => {
  try {
    const productId = req.params.id;

    // Get product
    const product = await Product.findOne({ id: productId, is_active: true })
      .populate('category');

    if (!product) {
      // Return mock data for development/testing when product not found
      const mockProduct = {
        id: productId,
        name: "Diamond Engagement Ring",
        price: 2499,
        category_id: 1,
        category: {
          id: 1,
          name: "Rings",
          description: "Engagement rings, wedding bands, and fashion rings"
        },
        description: "Exquisite diamond engagement ring crafted with precision and elegance. This stunning piece features a brilliant cut diamond set in premium white gold.",
        stock_quantity: 15,
        is_active: true,
        featured: true,
        model_3d_url: "", // No 3D model - will use fallback
        specifications: {
          "Material": "18k White Gold",
          "Diamond Weight": "1.5 carats",
          "Diamond Cut": "Brilliant",
          "Diamond Color": "D (Colorless)",
          "Diamond Clarity": "VVS1",
          "Ring Size": "Adjustable",
          "Certification": "GIA Certified"
        },
        metals: [
          {
            type: "Gold",
            purity: "18k",
            weight: 3.5,
            color: "White",
            percentage: 75
          }
        ],
        gemstones: [
          {
            type: "Diamond",
            cut: "Brilliant",
            carat: 1.5,
            color: "D",
            clarity: "VVS1",
            count: 1,
            shape: "Round",
            setting: "Prong"
          },
          {
            type: "Diamond",
            cut: "Brilliant",
            carat: 0.05,
            color: "F",
            clarity: "VS1",
            count: 12,
            shape: "Round",
            setting: "Channel"
          }
        ],
        customizations: [
          {
            id: "ring_size",
            name: "Ring Size",
            type: "select",
            options: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"],
            required: true,
            default_value: "7"
          },
          {
            id: "metal_type",
            name: "Metal Type",
            type: "select",
            options: ["White Gold", "Yellow Gold", "Rose Gold", "Platinum"],
            required: true,
            default_value: "White Gold"
          },
          {
            id: "engraving",
            name: "Engraving",
            type: "text",
            required: false,
            default_value: ""
          }
        ],
        images: [
          {
            id: 1,
            product_id: productId,
            image_url: "/placeholder.svg",
            alt_text: "Diamond Engagement Ring - Main View",
            is_primary: true,
            sort_order: 0
          },
          {
            id: 2,
            product_id: productId,
            image_url: "/placeholder.svg",
            alt_text: "Diamond Engagement Ring - Side View",
            is_primary: false,
            sort_order: 1
          },
          {
            id: 3,
            product_id: productId,
            image_url: "/placeholder.svg",
            alt_text: "Diamond Engagement Ring - Top View",
            is_primary: false,
            sort_order: 2
          }
        ],
        primaryImage: {
          id: 1,
          product_id: productId,
          image_url: "/placeholder.svg",
          alt_text: "Diamond Engagement Ring - Main View",
          is_primary: true,
          sort_order: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log(`🔧 Returning mock data for product ID: ${productId}`);
      return res.json(mockProduct);
    }

    // Get images for this product
    const images = await ProductImage.find({ product_id: productId })
      .sort({ sort_order: 1, createdAt: 1 });

    // Get primary image
    const primaryImage = images.find(img => img.is_primary) || images[0];

    res.json({
      ...product.toObject(),
      images: images,
      primaryImage: primaryImage
    });

  } catch (error) {
    console.error('Get product full error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products with their primary images (for listing pages)
app.get('/api/products/with-primary-images', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Get products
    const products = await Product.find({ is_active: true })
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get primary images for all products
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const primaryImage = await ProductImage.findOne({ 
          product_id: product.id, 
          is_primary: true 
        });
        
        return {
          ...product.toObject(),
          primaryImage: primaryImage
        };
      })
    );

    const total = await Product.countDocuments({ is_active: true });

    res.json({
      products: productsWithImages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get products with primary images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product image
app.delete('/api/products/:productId/images/:imageId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { productId, imageId } = req.params;

    // Find and delete the image
    const deletedImage = await ProductImage.findOneAndDelete({ 
      id: imageId, 
      product_id: productId 
    });

    if (!deletedImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // If this was the primary image, make the first remaining image primary
    if (deletedImage.is_primary) {
      const firstImage = await ProductImage.findOne({ product_id: productId })
        .sort({ sort_order: 1 });
      
      if (firstImage) {
        firstImage.is_primary = true;
        await firstImage.save();
      }
    }

    res.json({ message: 'Image deleted successfully' });

  } catch (error) {
    console.error('Delete product image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set primary image
app.put('/api/products/:productId/images/:imageId/primary', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { productId, imageId } = req.params;

    // Unset all primary images for this product
    await ProductImage.updateMany(
      { product_id: productId },
      { is_primary: false }
    );

    // Set the specified image as primary
    const updatedImage = await ProductImage.findOneAndUpdate(
      { id: imageId, product_id: productId },
      { is_primary: true },
      { new: true }
    );

    if (!updatedImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json({ 
      message: 'Primary image updated successfully',
      image: updatedImage
    });

  } catch (error) {
    console.error('Set primary image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

