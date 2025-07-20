const mongoose = require("mongoose");
const { Schema } = mongoose;

const singleProductSchema = new Schema({
  id: String,
  name: String,
  image: String,
  selectedColor: String,
  selectedImage: String,
  price: Number,
  quantity: Number,
  total: Number,
});

const multiProductSchema = new Schema({
  id: String,
  name: String,
  image: String,
  pricePerUnit: Number,
  quantity: Number,
  total: Number,
});

const addressSchema = new Schema({
  name: String,
  phone: String,
  email: String,
  country: String,
  emirate: String,
  city: String,
  district: String,
  road: String,
});

const orderSchema = new Schema({
  product: { type: singleProductSchema, required: false },
  products: { type: [multiProductSchema], required: false },
  deliveryDetails: { type: addressSchema, required: false },
  address: { type: addressSchema, required: false },
  deliveryCost: Number,
  pending: { type: Boolean, default: true },
  subtotal: { type: Number, required: false },
  total: Number,
  paymentMethod: String,
  orderDate: Date,
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
