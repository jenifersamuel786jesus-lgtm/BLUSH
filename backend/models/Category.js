const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    summary: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    products: {
      type: [productSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
