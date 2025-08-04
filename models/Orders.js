const mongoose = require("mongoose");
const { Schema } = mongoose;

// ✅ Single Product Schema
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

// ✅ Multi Product Schema
const multiProductSchema = new Schema({
  id: String,
  name: String,
  image: String,
  pricePerUnit: Number,
  quantity: Number,
  total: Number,
});

// ✅ Address Schema with Custom Error Messages
const addressSchema = new Schema({
  name: {
    type: String,
    required: [true, "Full name is required"],
    trim: true
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    validate: {
      validator: function(v) {
        return /^01[3-9]\d{8}$/.test(v); // Bangladeshi phone number validation
      },
      message: props => `${props.value} is not a valid Bangladeshi phone number!`
    }
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // optional
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  country: {
    type: String,
    default: "Bangladesh",
    required: [true, "Country is required"],
    enum: ["Bangladesh"] // Currently only supports Bangladesh
  },
  division: {
    type: String,
    required: [true, "Division/State is required"],
   // Ensures only valid divisions
  },
  district: {  // Changed from 'city' to match your frontend
    type: String,
    required: [true, "District is required"],

  },
  upazila: {  // Changed from 'area' to match your frontend
    type: String,
    required: [true, "Upazila/Thana is required"],

  },
  addressDetails: {  // Changed from 'road' to be more descriptive
    type: String,
    required: [true, "Address details are required"],
    trim: true
  },
  deliveryCost: {
    type: Number,
    required: [true, "Delivery cost is required"],
    min: [0, "Delivery cost cannot be negative"]
  }
}, { timestamps: true });

// ✅ Main Order Schema
const orderSchema = new Schema({
    deliveryDetails: {
    type: {
      email: { type: String, required: false },
      phone: { type: String, required: false }
    },
    required: true
  },

  product: { type: singleProductSchema, required: false },
  products: { type: [multiProductSchema], required: false },
  deliveryDetails: { type: addressSchema, required: false },
  address: { type: addressSchema, required: true },
  deliveryCost: { type: Number },
  pending: { type: Boolean, default: true },
  subtotal: { type: Number },
  total: { type: Number, required: true },
  paymentMethod: { type: String },
  orderDate: { type: Date },
});

// ✅ Export the model
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
