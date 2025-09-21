// const validator = require('validator');
// const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const Product = require('./models/product');

// Import routers
const authRouter = require('./routes/auth');
const products = require('./routes/products');
const categories = require('./routes/categories');
const metalPricesRouter = require('./routes/metalPrices');

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081'], // Add Vite's default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Cross-Origin-Opener-Policy', 'Cross-Origin-Embedder-Policy']
}));

app.use(express.json());

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api/metal-prices', metalPricesRouter);
app.use('/api/categories', categories);
app.use('/api/products', products);


//Hosting 
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-demo';
const authenticateToken = require('./utils/jwt').authenticateToken;

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

// Mount routers for existing routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});