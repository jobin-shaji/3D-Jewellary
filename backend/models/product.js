const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: function () {
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
  // sku: {
  //   type: String,
  //   unique: true,
  //   sparse: true,
  //   trim: true
  // },
  stock_quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  // featured: {
  //   type: Boolean,
  //   default: false
  // },
  metals: [{
    type: {
      type: String, // e.g., "Gold", "Silver", "Platinum"
      required: true
    },
    purity: {
      type: String, // e.g., "18k", "14k", "925"
      required: true
    },
    weight: {
      type: Number, // in grams
      required: true,
      min: 0
    },
    color: {
      type: String, // e.g., "White", "Yellow", "Rose"
      default: ''
    },
    // percentage: {
    //   type: Number, // percentage of total weight
    //   min: 0,
    //   max: 100,
    //   default: 0
    // }
  }],
  gemstones: [{
    type: {
      type: String, // e.g., "Diamond", "Ruby", "Emerald"
      required: true
    },
    cut: {
      type: String, // e.g., "Round", "Princess", "Emerald"
      default: ''
    },
    carat: {
      type: Number, // carat weight
      required: true,
      min: 0
    },
    color: {
      type: String, // e.g., "D", "E", "F" for diamonds
      default: ''
    },
    clarity: {
      type: String, // e.g., "FL", "IF", "VVS1"
      default: ''
    },
    count: {
      type: Number, // number of stones of this type
      required: true,
      min: 1,
      default: 1
    },
    // shape: {
    //   type: String, // e.g., "Round", "Oval", "Pear"
    //   default: ''
    // },
    setting: {
      type: String, // e.g., "Prong", "Bezel", "Channel"
      default: ''
    }
  }],
  customizations: {
    type: Array,
    default: []
  },
  images: [{
    image_url: {
      type: String,
      required: true
    },
    alt_text: {
      type: String,
      default: ''
    },
    sort_order: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  model_3d_url: {
    type: String,
    default: ''
  },
  certificates: {
    type: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      file_url: {
        type: String,
        required: true
      }
    }],
    default: []
  }
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