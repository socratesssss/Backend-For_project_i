// routes/visitorRoute.js
const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor.js');
const visitorRoute = require('../middlewere/verifyToken.js');

// routes/visitorRoute.js
router.post('/track', async (req, res) => {
 const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

  const userAgent = req.headers['user-agent'];

  try {
    const existing = await Visitor.findOne({ ip });

 if (existing) {
  return res.status(200).json({ message: 'Returning visitor' });
}


    // New visitor
    await Visitor.create({ ip, userAgent });
    res.status(200).json({ message: 'New visitor' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to track visit' });
  }
});


// all
router.get('/all',visitorRoute, async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ visitedAt: -1 }); // recent first
    res.status(200).json(visitors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch visitors' });
  }
});


// GET total number of visits
router.get('/count',visitorRoute, async (req, res) => {
  try {
    const total = await Visitor.countDocuments();
    res.status(200).json({ total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to count visitors' });
  }
});

// Count total, new, and returning
// routes/visitorRoute.js
router.get('/stats',visitorRoute, async (req, res) => {
  try {
    const now = new Date();

    // Start of today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Start of the current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // ================================
    // ALL-TIME STATS
    // ================================
    const allTimeUniqueIps = await Visitor.distinct('ip');
    const allTimeNew = allTimeUniqueIps.length;

    const allTimeTotalVisits = await Visitor.countDocuments();
    const allTimeReturning = allTimeTotalVisits - allTimeNew;

    // ================================
    // MONTHLY STATS
    // ================================
    const monthlyVisitors = await Visitor.find({
      visitedAt: { $gte: startOfMonth },
    });

    const monthlyTotal = monthlyVisitors.length;

    const monthlyUniqueIps = [...new Set(monthlyVisitors.map((v) => v.ip))];
    const monthlyNew = monthlyUniqueIps.length;
    const monthlyReturning = monthlyTotal - monthlyNew;

    // ================================
    // TODAY'S STATS
    // ================================
    const todayVisitors = await Visitor.find({
      visitedAt: { $gte: startOfToday },
    });

    const todayTotal = todayVisitors.length;

    const todayUniqueIps = [...new Set(todayVisitors.map((v) => v.ip))];
    const todayNew = todayUniqueIps.length;
    const todayReturning = todayTotal - todayNew;

    // ================================
    // RESPONSE
    // ================================
    res.status(200).json({
      allTime: {
        totalVisits: allTimeTotalVisits,
        newVisitors: allTimeNew,
        returningVisitors: allTimeReturning,
      },
      monthly: {
        month: startOfMonth.toLocaleString('default', { month: 'long' }),
        totalVisits: monthlyTotal,
        newVisitors: monthlyNew,
        returningVisitors: monthlyReturning,
      },
      today: {
        date: startOfToday.toDateString(),
        totalVisits: todayTotal,
        newVisitors: todayNew,
        returningVisitors: todayReturning,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});





module.exports = router;
