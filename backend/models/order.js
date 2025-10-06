const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      // Full product snapshot at time of order
      product: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        category_id: { type: Number, required: true },
        makingPrice: { type: Number, required: true },
        metals: [
          {
            type: { type: String, required: true },
            purity: { type: String, required: true },
            weight: { type: Number, required: true, min: 0 },
            color: { type: String, default: '' }
          }
        ],
        gemstones: [
          {
            type: { type: String, required: true },
            carat: { type: Number, required: true, min: 0 },
            color: { type: String, default: '' },
            clarity: { type: String, default: '' },
            count: { type: Number, required: true, min: 1, default: 1 },
            shape: { type: String, default: '' },
            price: { type: Number, required: true, min: 0 }
          }
        ],
        images: [
          {
            image_url: { type: String, required: true },
            alt_text: { type: String, default: '' },
            is_primary: { type: Boolean, default: false },
            sort_order: { type: Number, required: true, min: 0 }
          }
        ],
        model_3d_url: { type: String, default: '' },
        certificates: [
          {
            name: { type: String, required: true, trim: true },
            file_url: { type: String, required: true }
          }
        ],
        totalPrice: { type: Number, default: null, min: 0 }
      },
      // Full variant snapshot at time of order
      variant: {
        variant_id: { type: String },
        name: { type: String, trim: true },
        making_price: { type: Number, min: 0 },
        metal: [
          {
            type: { type: String },
            purity: { type: String },
            weight: { type: Number, min: 0 },
            color: { type: String, default: '' }
          }
        ],
        totalPrice: { type: Number, default: 0, min: 0 }
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);