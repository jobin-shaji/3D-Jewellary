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
// Export the authenticateToken middleware for use in other routes
module.exports = { authenticateToken };

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

// Configure multer for certificate uploads
const certificateStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products/certificates',
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    resource_type: 'auto'
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

const uploadCertificate = multer({ 
  storage: certificateStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for certificates
});

// const uploadMultiple = multer({ 
//   storage: imageStorage,
//   limits: { fileSize: 5 * 1024 * 1024 }
// });

const uploadModel = multer({ 
  storage: modelStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for 3D models
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

// Verify token endpoint (for checking if token is still valid)
app.get('/api/verify-token', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});


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

// Multiple images upload for product
app.post('/api/products/:id/images', authenticateToken, uploadImage.array('images', 10), async (req, res) => {
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

    // Add images to product's images array
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      const imageObject = {
        image_url: file.path, // Cloudinary URL
        alt_text: `${product.name} image ${product.images.length + i + 1}`,
        is_primary: product.images.length === 0 && i === 0, // First image of first upload is primary
        sort_order: product.images.length + i
      };
      
      product.images.push(imageObject);
    }

    // Save the updated product
    await product.save();

    res.status(201).json({
      message: 'Product images uploaded successfully',
      images: product.images
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

// Upload certificates for product
app.post('/api/products/:id/certificates', authenticateToken, uploadCertificate.array('certificates', 10), async (req, res) => {
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
      return res.status(400).json({ message: 'At least one certificate file is required' });
    }

    // Extract certificate names from request body
    const certificateNames = [];
    for (let i = 0; i < req.files.length; i++) {
      const nameKey = `certificates[${i}][name]`;
      if (req.body[nameKey]) {
        certificateNames.push(req.body[nameKey]);
      } else {
        certificateNames.push(`Certificate ${i + 1}`);
      }
    }

    // Add certificate objects to product's certificates array
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const certificateName = certificateNames[i];
      
      const certificateObject = {
        name: certificateName,
        file_url: file.path
      };
      
      product.certificates.push(certificateObject);
    }

    // Save the updated product with new certificate data
    await product.save();

    res.status(201).json({
      message: 'Product certificates uploaded successfully',
      certificates: product.certificates
    });

  } catch (error) {
    console.error('Upload certificates error:', error);
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

// Get all products with primary images
app.get('/api/products', async (req, res) => {
  try {
    // Get all active products with limit for performance
    const products = await Product.find({ is_active: true })
      .populate('category')
      .sort({ createdAt: -1 })
      .limit(50);

    // Add primary image for each product
    const productsWithImages = products.map(product => {
      const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
      
      return {
        ...product.toObject(),
        primaryImage: primaryImage
      };
    });

    res.json({
      products: productsWithImages,
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

// Get product with images populated
app.get('/api/products/:id/full', async (req, res) => {
  try {
    const productId = req.params.id;

    // Get product
    const product = await Product.findOne({ id: productId, is_active: true })
      .populate('category');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get primary image (first image or one marked as primary)
    const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];

    res.json({
      ...product.toObject(),
      primaryImage: primaryImage
    });

  } catch (error) {
    console.error('Get product full error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});