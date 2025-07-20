const mongoose = require('mongoose');

// Color Sub-Schema
const ProductColorSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: true,
    default: [],
  },
});

// Main Product Schema
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ['Vape', 'Juice', 'Pods'], // Make sure this matches your frontend
      required: true,
    },
    images: {
      type: [String], // File URLs or public paths
      required: true,
      default: [],
    },
    inStock: {
      type: Boolean,
      required: true,
      default: true,
    },
    miniDescription: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    productColors: {
      type: [ProductColorSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Prevent model overwrite error in dev (important for Next.js/Hot Reloading)
const Product = mongoose.model('Product', ProductSchema);
 
module.exports = Product

