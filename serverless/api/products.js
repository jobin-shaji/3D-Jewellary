  // GET /api/products/all - fetch all non-deleted products (admin)
  if (req.method === 'GET' && req.url.startsWith('/api/products/all')) {
    try {
      const products = await Product.find({ is_deleted: false })
        .populate('category')
        .sort({ createdAt: -1 })
        .limit(50);
      const productsWithImages = products.map(product => {
        const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
        return {
          ...product.toObject(),
          primaryImage: primaryImage
        };
      });
      res.status(200).json({
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
    return;
  }
  // PATCH /api/products/toggle-active?id=PRODUCT_ID - toggle product active status
  if (req.method === 'PATCH' && req.url.startsWith('/api/products/toggle-active')) {
    try {
      const productId = req.query.id;
      const product = await Product.findOne({ id: productId });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
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
    return;
  }
  // POST /api/products/certificates?id=PRODUCT_ID - upload product certificates
  if (req.method === 'POST' && req.url.startsWith('/api/products/certificates')) {
    try {
      const productId = req.query.id;
      const { certificates } = req.body; // expects array of certificate objects { name, file_url }
      if (!productId || !certificates || !Array.isArray(certificates) || certificates.length === 0) {
        return res.status(400).json({ message: 'Product ID and certificates array required' });
      }
      const product = await Product.findOne({ id: productId });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      for (let i = 0; i < certificates.length; i++) {
        const cert = certificates[i];
        product.certificates.push({
          name: cert.name || `Certificate ${product.certificates.length + 1}`,
          file_url: cert.file_url
        });
      }
      await product.save();
      res.status(201).json({
        message: 'Product certificates uploaded successfully',
        certificates: product.certificates
      });
    } catch (error) {
      console.error('Upload certificates error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }
  // POST /api/products/model?id=PRODUCT_ID - upload 3D model URL
  if (req.method === 'POST' && req.url.startsWith('/api/products/model')) {
    try {
      const productId = req.query.id;
      const { model_url } = req.body; // expects model_url string
      if (!productId || !model_url) {
        return res.status(400).json({ message: 'Product ID and model_url required' });
      }
      const product = await Product.findOne({ id: productId });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      product.model_3d_url = model_url;
      await product.save();
      res.status(201).json({
        message: '3D model uploaded successfully',
        model_url: product.model_3d_url,
        product
      });
    } catch (error) {
      console.error('Upload 3D model error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }
  // POST /api/products/images?id=PRODUCT_ID - upload product images (expects image URLs)
  if (req.method === 'POST' && req.url.startsWith('/api/products/images')) {
    try {
      const productId = req.query.id;
      const { images } = req.body; // expects array of image objects { image_url, alt_text, is_primary, sort_order }
      if (!productId || !images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ message: 'Product ID and images array required' });
      }
      const product = await Product.findOne({ id: productId });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        product.images.push({
          image_url: img.image_url,
          alt_text: img.alt_text || `${product.name} image ${product.images.length + 1}`,
          is_primary: img.is_primary || false,
          sort_order: typeof img.sort_order === 'number' ? img.sort_order : product.images.length
        });
      }
      await product.save();
      res.status(201).json({
        message: 'Product images uploaded successfully',
        images: product.images
      });
    } catch (error) {
      console.error('Upload product images error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }
  // DELETE /api/products?id=PRODUCT_ID - delete a product (soft delete)
  if (req.method === 'DELETE' && req.query.id) {
    try {
      const productId = req.query.id;
      const product = await Product.findOne({ id: productId });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      if (product.is_deleted) {
        return res.status(400).json({ message: 'Product is already deleted' });
      }
      product.is_deleted = true;
      product.deleted_at = new Date();
      product.is_active = false;
      await product.save();
      res.json({
        message: 'Product deleted successfully',
        deletedProductId: productId
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }
  // PUT /api/products?id=PRODUCT_ID - update a product
  if (req.method === 'PUT' && req.query.id) {
    try {
      const productId = req.query.id;
      const updateData = req.body;

      // Optionally recalculate price if relevant fields are updated
      if (updateData.variants || updateData.metals || updateData.makingPrice || updateData.gemstones) {
        try {
          const tempProduct = { ...updateData };
          const priceResult = await computeProductPrice(tempProduct);
          if (priceResult.success && priceResult.data && priceResult.data.length > 0) {
            updateData.totalPrice = Math.round(priceResult.data[0].subtotal || 0);
          }
        } catch (error) {
          // Keep existing price on error
        }
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { id: productId },
        updateData,
        { new: true, runValidators: true }
      );
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found for update' });
      }
      res.status(200).json({
        message: 'Product updated successfully',
        product: updatedProduct
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }
const connectToDatabase = require('../utils/mongodb');
const Product = require('../models/product');
const Category = require('../models/category');
const { computeProductPrice } = require('../utils/priceUtils');

module.exports = async (req, res) => {
  await connectToDatabase();

  // GET /api/products - list products
  if (req.method === 'GET' && !req.query.id) {
    try {
      const products = await Product.find({ is_active: true, is_deleted: false })
        .populate('category')
        .sort({ createdAt: -1 })
        .limit(50);
      const productsWithImages = products.map(product => {
        const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
        return {
          ...product.toObject(),
          primaryImage: primaryImage
        };
      });
      res.status(200).json({
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
    return;
  }

  // GET /api/products?id=PRODUCT_ID - fetch single product
  if (req.method === 'GET' && req.query.id) {
    try {
      const productId = req.query.id;
      const product = await Product.findOne({ id: productId, is_deleted: false }).populate('category');
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
      res.status(200).json({
        product: {
          ...product.toObject(),
          primaryImage: primaryImage
        }
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // POST /api/products - create a new product
  if (req.method === 'POST') {
    try {
      const {
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

      // Basic validation
      if (!name || !category_id) {
        return res.status(400).json({ message: 'Name and category are required' });
      }

      // Calculate price (optional, can be expanded)
      let baseTotalPrice = 0;
      try {
        const tempProduct = {
          name,
          makingPrice,
          category_id,
          description,
          is_active,
          variants,
          metals,
          gemstones,
          stock_quantity
        };
        const priceResult = await computeProductPrice(tempProduct);
        if (priceResult.success && Array.isArray(priceResult.data) && priceResult.data.length > 0) {
          baseTotalPrice = Math.round(priceResult.data[0].subtotal || 0);
        }
      } catch (error) {
        baseTotalPrice = 0;
      }

      // Create product
      const product = new Product({
        name,
        makingPrice,
        category_id,
        description,
        is_active,
        variants,
        metals,
        gemstones,
        stock_quantity,
        totalPrice: baseTotalPrice
      });
      await product.save();
      res.status(201).json({
        message: 'Product created successfully',
        product
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
};
