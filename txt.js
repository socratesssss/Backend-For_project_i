const mongoose = require('mongoose');

// 
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
// Main product schema
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountPrice: Number,
  category: {
    type: String,
    enum: ['Vape', 'Juice', 'Pods'],
    required: true,
  },
  images: {
    type: [String],
    required: true,
    default: [],
  },
  inStock: {
    type: Boolean,
    required: true,
  },
  miniDescription: {
    type: String,
    required: true,
  },
  description: String,
  productColors: {
    type: [ProductColorSchema],
    default: [],
  },
}, { timestamps: true });

 


const Product = mongoose.model('Product', ProductSchema);
 
exports.Product = Product
