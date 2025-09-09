const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  image_url: {
    type: String,
    default: ''
  },
  parent_id: {
    type: Number,
    default: null
  },
  is_active: {
    type: Boolean,
    default: true
  },
  sort_order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for children categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: 'id',
  foreignField: 'parent_id'
});

// Ensure virtual fields are serialized
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);