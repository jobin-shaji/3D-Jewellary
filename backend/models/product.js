const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
  },
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  category_id: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  stock_quantity: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  is_active: { 
    type: Boolean, 
    default: true 
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  specifications: {
    type: Object,
    default: {}
  },
  customizations: {
    type: Array,
    default: []
  },
  model_3d_url: {
    type: String,
    default: ''
  }
  // Removed: images array - using separate ProductImage collection
}, {
  timestamps: true
});

// Add text index for search functionality
productSchema.index({ 
  name: 'text', 
  description: 'text' 
});

// Virtual for category population
productSchema.virtual('category', {
  ref: 'Category',
  localField: 'category_id',
  foreignField: 'id',
  justOne: true
});

// Virtual for images population - this allows easy access when needed
productSchema.virtual('productImages', {
  ref: 'ProductImage',
  localField: 'id',
  foreignField: 'product_id'
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);