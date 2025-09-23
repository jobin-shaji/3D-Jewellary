const mongoose = require('mongoose');

const metalSchema = new mongoose.Schema({
  metal: {
    type: String,
    required: true,
    enum: ['Gold', 'Silver', 'Platinum', 'Palladium'],
    trim: true
  },
  purity: {
    type: String,
    required: true,
    trim: true
  },
  pricePerGram: {
    type: Number,
    required: true,
    min: 0
  },
  change: {
    type: Number,
    required: true,
    default: 0
  },
  absoluteChange: {
    type: Number,
    required: true,
    default: 0
  },
  source: {
    type: String,
    required: true,
    enum: ['manual', 'api', 'calculated'],
    default: 'manual'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This will add createdAt and updatedAt automatically
});

// Create compound index for efficient querying
metalSchema.index({ metal: 1, purity: 1 }, { unique: true });

// Create index for updatedAt for sorting
metalSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Metal', metalSchema);