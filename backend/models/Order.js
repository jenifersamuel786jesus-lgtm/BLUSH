const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      name: { type: String, required: true, trim: true },
      price: { type: String, required: true, trim: true },
      image: { type: String, required: true, trim: true }
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    details: {
      name: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true }
    },
    items: {
      type: [orderItemSchema],
      validate: [(items) => items.length > 0, 'Order needs at least one item']
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    deliveryWindow: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
