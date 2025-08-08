const express = require("express");
const router = express.Router();
const verifyToken = require('../middlewere/verifyToken')


const { createOrder,getAllOrders,dashboardCard, topProduct,updatePending,deleteOrder} = require('./controllers/orderControllar')


//  GET: Stats including daily and monthly sales
router.get("/stats",verifyToken,dashboardCard);

// 📌 GET: Top ordered products
router.get("/top-products", topProduct);

// 📌 GET: Fetch all orders



// 📌 PATCH: Update an order's pending status
router.patch("/:id",verifyToken,updatePending);

// 📌 DELETE: Delete an order
router.delete("/:id",verifyToken,deleteOrder);

// 📌 Routes
router.post("/", createOrder);
router.get("/", getAllOrders);

module.exports = router;
