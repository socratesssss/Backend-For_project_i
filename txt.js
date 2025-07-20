const express = require('express');
const router = express.Router();
const Order = require('../models/OrderModel'); // Make sure path is correct

router.get('/', async (req, res) => {
  try {
    const today = new Date();
    const thirtyOneDaysAgo = new Date(today);
    thirtyOneDaysAgo.setDate(today.getDate() - 30);

    // 📅 DAILY AGGREGATION (Last 30 Days)
    const dailyAggregated = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: thirtyOneDaysAgo,
            $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
          },
          pending: false // Optional: filter delivered only
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$orderDate" },
            month: { $month: "$orderDate" },
            day: { $dayOfMonth: "$orderDate" }
          },
          sales: { $sum: "$total" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);

    const dailySales = dailyAggregated.map((entry) => {
      const { year, month, day } = entry._id;
      return {
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        sales: entry.sales,
      };
    });

    // 📅 MONTHLY AGGREGATION (Last 12 Months)
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(today.getMonth() - 11);
    twelveMonthsAgo.setDate(1); // Ensure start from beginning of month

    const monthlyAggregated = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: twelveMonthsAgo,
            $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
          },
          pending: false
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$orderDate" },
            month: { $month: "$orderDate" },
          },
          sales: { $sum: "$total" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const monthlySales = monthlyAggregated.map((entry) => {
      const { year, month } = entry._id;
      return {
        month: `${year}-${String(month).padStart(2, '0')}`,
        sales: entry.sales,
      };
    });

    res.json({ dailySales, monthlySales });
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
