const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Product = require('../models/product');
const { authenticateToken } = require('../utils/jwt');
const { computeProductPrice, computeVariantPrice } = require('../utils/priceUtils');

const router = express.Router();

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
    resource_type: 'raw',
    // Remove allowed_formats to allow any format for now
    // allowed_formats: ['glb', 'gltf', 'obj', 'fbx'],
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

const uploadModel = multer({ 
  storage: modelStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit to match Cloudinary free plan
  fileFilter: (req, file, cb) => {
    console.log('File filter - Original name:', file.originalname);
    console.log('File filter - Mimetype:', file.mimetype);
    console.log('File filter - Size:', file.size || 'Size not available at this stage');
    
    // Check file extension
    const allowedExtensions = ['.glb', '.gltf', '.obj', '.fbx'];
    const fileExtension = file.originalname.toLowerCase().split('.').pop();
    
    if (allowedExtensions.includes(`.${fileExtension}`)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed formats: ${allowedExtensions.join(', ')}`), false);
    }
  }
});

/**
 * @route   GET /api/products
 * @desc    Get all products with primary images
 * @access  Public
 */
router.get('/', async (req, res) => {
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

    // Trigger background batch price update in-process if many products have stale `latestPriceUpdate`
    try {
      const PRICE_REFRESH_HOURS = Number(process.env.PRICE_REFRESH_HOURS) || 4;
      const staleThreshold = new Date(Date.now() - PRICE_REFRESH_HOURS * 60 * 60 * 1000);
      const staleCount = await Product.countDocuments({ is_active: true, $or: [ { latestPriceUpdate: { $lt: staleThreshold } }, { latestPriceUpdate: null } ] });
      if (staleCount > 0) {
        // Fire-and-forget: run update in the same process without blocking the response
        (async () => {
          try {
            const limit = 100; // cap per run to avoid long blocking work
            const staleProducts = await Product.find({ is_active: true, $or: [ { latestPriceUpdate: { $lt: staleThreshold } }, { latestPriceUpdate: null } ] }).limit(limit);
            let updated = 0;
            for (const p of staleProducts) {
              try {
                const res = await computeProductPrice(p);
                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                  // Use the first result (base product or first variant) for the main totalPrice
                  const basePricing = res.data[0];
                  p.totalPrice = basePricing.roundedTotal || Math.round(basePricing.total || 0);
                  
                  // Update variant prices if variants exist
                  if (p.variants && p.variants.length > 0) {
                    for (const variant of p.variants) {
                      const variantPricing = res.data.find(item => item.variant_id === variant.variant_id);
                      if (variantPricing) {
                        variant.totalPrice = variantPricing.roundedTotal || Math.round(variantPricing.total || 0);
                      }
                    }
                  }
                  
                  p.latestPriceUpdate = new Date();
                  await p.save();
                  updated++;
                }
              } catch (err) {
                console.error('Error updating product price in background for', p.id, err);
              }
            }
            console.log(`Background price update completed. Updated ${updated} products.`);
          } catch (err) {
            console.error('Background price updater failed', err);
          }
        })();
      }

    } catch (bgErr) {
      console.error('Error evaluating background price update:', bgErr);
    }

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

/**
 * @route   GET /api/products
 * @desc    Get all products with primary images
 * @access  admin
 */
router.get('/all',authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    // Get all active products with limit for performance
    const products = await Product.find()
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



/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Get product
    const product = await Product.findOne({ id: productId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product fetched successfully',
      product: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/products/:id/full
 * @desc    Get product with images populated
 * @access  Public
 */
router.get('/:id/full', async (req, res) => {
  try {
    const productId = req.params.id;

    // Get product
    const product = await Product.findOne({ id: productId})
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


/**
 * @route   POST /api/products
 * @desc    Create a new product (admin only)
 * @access  Private (Admin)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    let { 
      name, 
      makingPrice, 
      category_id, 
      description = '',
      is_active = true,
      variants = [],
      metals = [],
      gemstones = [],
      stock_quantity = 0
    } = req.body;

    // Parse possible string fields
    makingPrice = Number(makingPrice);
    stock_quantity = Number(stock_quantity);
    
    // if your category_id is numeric in DB:
    // category_id = isNaN(Number(category_id)) ? category_id : Number(category_id);
    category_id = Number(category_id);

    // Parse JSON if front-end sent strings
    if (typeof variants === 'string') {
      try { variants = JSON.parse(variants); } catch (e) { variants = []; }
    }
    if (typeof metals === 'string') {
      try { metals = JSON.parse(metals); } catch (e) { metals = []; }
    }
    if (typeof gemstones === 'string') {
      try { gemstones = JSON.parse(gemstones); } catch (e) { gemstones = []; }
    }

    // Validation
    if (!name || !category_id) {
      return res.status(400).json({ message: 'Name and category are required' });
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

    // Validate variants array
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        // Generate variant_id if not provided
        if (!variant.variant_id) {
          variant.variant_id = 'var_' + Date.now().toString() + Math.random().toString(36).substr(2, 9);
        }

        if (!variant.name || !variant.making_price || variant.making_price <= 0) {
          return res.status(400).json({ 
            message: 'Each variant must have name and making_price > 0' 
          });
        }
        if (!Number.isFinite(variant.stock_quantity) || variant.stock_quantity < 0) {
          return res.status(400).json({ 
            message: 'Each variant stock_quantity must be a non-negative number' 
          });
        }
        if (variant.metal && Array.isArray(variant.metal)) {
          for (const metal of variant.metal) {
            if (!metal.type || !metal.purity || !metal.weight || metal.weight <= 0) {
              return res.status(400).json({ 
                message: 'Each variant metal must have type, purity, and weight > 0' 
              });
            }
          }
        }
      }
    }

    // Calculate totalPrice for each variant
    for (const variant of variants) {
      try {
        const priceResult = await computeVariantPrice(variant);
        if (priceResult.success) {
          variant.totalPrice = priceResult.data.roundedTotal;
        } else {
          variant.totalPrice = 0;
        }
      } catch (error) {
        console.error('Error calculating variant price:', error);
        variant.totalPrice = 0;
      }
    }

    // Let the Product schema generate its own string ID
    const product = new Product({
      name,
      makingPrice,
      category_id,
      description,
      is_active,
      variants,
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

/**
 * @route   POST /api/products/:id/images
 * @desc    Upload multiple images for a product (admin only)
 * @access  Private (Admin)
 */
router.post('/:id/images', authenticateToken, uploadImage.array('images', 10), async (req, res) => {
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

/**
 * @route   POST /api/products/:id/model
 * @desc    Upload 3D model for a product (admin only)
 * @access  Private (Admin)
 */
router.post('/:id/model', authenticateToken, (req, res, next) => {
  uploadModel.single('model')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            message: 'File too large. Maximum size is 10MB due to Cloudinary free plan limits. Please compress your 3D model or upgrade the Cloudinary plan.' 
          });
        }
        return res.status(400).json({ message: err.message });
      }
      // Handle Cloudinary-specific errors
      if (err.message && err.message.includes('File size too large')) {
        return res.status(400).json({ 
          message: 'File too large. Maximum size is 10MB due to Cloudinary free plan limits. Please compress your 3D model or consider upgrading the Cloudinary plan.' 
        });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('3D Model upload request received for product:', req.params.id);
    console.log('File details:', req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file received');

    // Check if user is admin
    if (req.user.role !== 'admin') {
      console.log('Unauthorized: User is not admin');
      return res.status(403).json({ message: 'Admin access required' });
    }

    const productId = req.params.id;

    // Check if product exists
    const product = await Product.findOne({ id: productId });
    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!req.file) {
      console.log('No 3D model file received');
      return res.status(400).json({ message: '3D model file is required' });
    }

    console.log('Cloudinary file path:', req.file.path);

    // Update product with 3D model URL
    product.model_3d_url = req.file.path; // Cloudinary URL
    await product.save();

    console.log('3D model uploaded successfully for product:', productId);

    res.status(201).json({
      message: '3D model uploaded successfully',
      model_url: req.file.path,
      product
    });

  } catch (error) {
    console.error('Upload 3D model error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/products/:id/certificates
 * @desc    Upload certificates for a product (admin only)
 * @access  Private (Admin)
 */
router.post('/:id/certificates', authenticateToken, uploadCertificate.array('certificates', 10), async (req, res) => {
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

/**
 * @route   PATCH /api/products/:id/toggle-active
 * @desc    Toggle product active status (admin only)
 * @access  Private (Admin)
 */
router.patch('/:id/toggle-active', authenticateToken, async (req, res) => {
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

    // Toggle the is_active field
    product.is_active = !product.is_active;
    await product.save();

    res.json({ 
      message: `Product ${product.is_active ? 'activated' : 'deactivated'} successfully`,
      product: {
        id: product.id,
        name: product.name,
        is_active: product.is_active
      }
    });

  } catch (error) {
    console.error('Error toggling product active status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product (admin only)
 * @access  Private (Admin)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const productId = req.params.id;
    const updateData = req.body;

    console.log('🔄 Updating product:', productId);
    console.log('📝 Update data:', updateData);

    // Find the existing product using custom id field
    const existingProduct = await Product.findOne({ id: productId });
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If variants are being updated, calculate totalPrice for each variant
    if (updateData.variants && Array.isArray(updateData.variants)) {
      for (const variant of updateData.variants) {
        // Generate variant_id if not provided
        if (!variant.variant_id) {
          variant.variant_id = 'var_' + Date.now().toString() + Math.random().toString(36).substr(2, 9);
        }

        // Validate variant structure
        if (!variant.name || !variant.making_price || variant.making_price <= 0) {
          return res.status(400).json({ 
            message: 'Each variant must have name and making_price > 0' 
          });
        }
        if (!Number.isFinite(variant.stock_quantity) || variant.stock_quantity < 0) {
          return res.status(400).json({ 
            message: 'Each variant stock_quantity must be a non-negative number' 
          });
        }
        if (variant.metal && Array.isArray(variant.metal)) {
          for (const metal of variant.metal) {
            if (!metal.type || !metal.purity || !metal.weight || metal.weight <= 0) {
              return res.status(400).json({ 
                message: 'Each variant metal must have type, purity, and weight > 0' 
              });
            }
          }
        }

        // Calculate totalPrice for the variant
        try {
          const priceResult = await computeVariantPrice(variant);
          if (priceResult.success) {
            variant.totalPrice = priceResult.data.roundedTotal;
          } else {
            variant.totalPrice = 0;
          }
        } catch (error) {
          console.error('Error calculating variant price:', error);
          variant.totalPrice = 0;
        }
      }
    }

    // Update the product with new data using custom id field
    const updatedProduct = await Product.findOneAndUpdate(
      { id: productId },
      updateData,
      { 
        new: true,  // Return the updated document
        runValidators: true  // Run schema validations
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found for update' });
    }

    console.log('✅ Product updated successfully:', updatedProduct.name);

    res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('❌ Error updating product:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }

    res.status(500).json({ 
      message: 'Server error while updating product',
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product (admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
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

    // TODO: Optionally delete associated files from Cloudinary
    // - product.images (image files)
    // - product.model_3d_url (3D model file)
    // - product.certificates (certificate files)

    // Delete the product from database
    await Product.deleteOne({ id: productId });

    res.json({
      message: 'Product deleted successfully',
      deletedProductId: productId
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// /**
//  * @route   POST /api/products/update-prices
//  * @desc    Batch update products' totalPrice and latestPriceUpdate
//  * @access  Public (safe operation) - accepts optional { productIds: [] }
//  */
// router.post('/update-prices', async (req, res) => {
//   try {
//     const { productIds } = req.body || {};

//     const filter = { is_active: true };
//     if (Array.isArray(productIds) && productIds.length) {
//       filter.id = { $in: productIds };
//     }

//     const products = await Product.find(filter);

//     let updatedCount = 0;

//     for (const product of products) {
//       try {
//         const result = await computeProductPrice(product);
//         if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
//           // Use the first result (base product or first variant) for the main totalPrice
//           const basePricing = result.data[0];
//           product.totalPrice = basePricing.roundedTotal || Math.round(basePricing.total || 0);
          
//           // Update variant prices if variants exist
//           if (product.variants && product.variants.length > 0) {
//             for (const variant of product.variants) {
//               const variantPricing = result.data.find(item => item.variant_id === variant.variant_id);
//               if (variantPricing) {
//                 variant.totalPrice = variantPricing.roundedTotal || Math.round(variantPricing.total || 0);
//               }
//             }
//           }
          
//           product.latestPriceUpdate = new Date();
//           await product.save();
//           updatedCount++;
//         }
//       } catch (innerErr) {
//         console.error('Error computing price for product', product.id, innerErr);
//         // continue with next product
//       }
//     }

//     return res.json({ success: true, updated: updatedCount });
//   } catch (error) {
//     console.error('Batch update prices error:', error);
//     return res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

module.exports = router;
