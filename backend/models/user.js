const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return "u" + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    }
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  role: { type: String, enum: ['admin', 'client'], default: 'client' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  wishlist: [{
    productId: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
  }]
}, {
  // This ensures createdAt and updatedAt are automatically managed
  timestamps: true
});

// Pre-save middleware to ensure id is generated
userSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = "u" + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
