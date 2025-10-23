const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return "addr" + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    }
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  // remove if not needed
  // company: {
  //   type: String,
  //   trim: true,
  //   maxlength: 100
  // },
  phone: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  addressLine2: {
    type: String,
    trim: true,
    maxlength: 200
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to ensure id is generated
addressSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = "addr" + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  }
  next();
});

// Pre-save middleware to ensure only one default address per user
addressSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // If this address is being set as default, unset all other default addresses for this user
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Index for efficient queries
addressSchema.index({ userId: 1, isActive: 1 });
addressSchema.index({ userId: 1, isDefault: 1 });

module.exports = mongoose.model('Address', addressSchema);