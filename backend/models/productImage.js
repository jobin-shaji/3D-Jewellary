const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
  },
  product_id: {
    type: String,
    required: true
  },
  image_url: {
    type: String,
    required: true
  },
  alt_text: {
    type: String,
    default: ''
  },
  is_primary: {
    type: Boolean,
    default: false
  },
  sort_order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
productImageSchema.index({ product_id: 1, sort_order: 1 });

module.exports = mongoose.model('ProductImage', productImageSchema);