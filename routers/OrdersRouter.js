const express = require("express");
const router = express.Router();
const Order = require("../models/Orders");

// 📌 POST: Save new order
const createOrder = async (req, res) => {
  try {
    const {
      product,
      products,
      deliveryDetails,
      address,
      deliveryCost,
      subtotal,
      total,
      paymentMethod,
      orderDate,
    } = req.body;

    const newOrder = new Order({
      product: product || undefined,
      products: products || undefined,
      deliveryDetails: deliveryDetails || undefined,
      address: address || undefined,
      deliveryCost,
      subtotal,
      total,
      paymentMethod,
      orderDate,
    });

    await newOrder.save();
    res.status(201).json({ message: "Order saved", order: newOrder });
  } catch (error) {
    console.error("Order save error:", error);
    res.status(500).json({ message: "Failed to save order", error });
  }
};

// 📌 GET: Fetch all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 }); // latest first
    res.status(200).json({ message: "Orders fetched", orders });
  } catch (error) {
    console.error("Order fetch error:", error);
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
};

// 📌 Routes
router.post("/", createOrder);
router.get("/", getAllOrders);

module.exports = router;
