// routes/visitorRoute.js
const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor.js');
const visitorRoute = require('../middlewere/verifyToken.js');

// routes/visitorRoute.js
function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '')
    .split(',')[0]
    .trim();
}

router.post('/track', async (req, res) => {
  const visitorId = req.body?.visitorId || null;
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || '';

  try {
    // Check if this visitorId or IP already exists (to decide new vs returning)
    let isReturning = false;
    if (visitorId) {
      const prev = await Visitor.findOne({ visitorId }).lean();
      isReturning = !!prev;
    } else {
      // fallback to IP-based check
      const prev = await Visitor.findOne({ ip }).lean();
      isReturning = !!prev;
    }

    // Log this visit (every visit is a document)
    await Visitor.create({ visitorId, ip, userAgent });

    return res.status(200).json({ message: isReturning ? 'Returning visitor' : 'New visitor' });
  } catch (err) {
    console.error('Failed to track visit:', err);
    return res.status(500).json({ error: 'Failed to track visit' });
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
    // example for all-time
const totalVisits = await Visitor.countDocuments();
const uniqueVisitorIds = await Visitor.distinct('visitorId', { visitorId: { $ne: null } });
const uniqueByVisitorId = uniqueVisitorIds.length;

// optionally merge with distinct IPs for entries without visitorId
const visitorsWithoutIdCount = await Visitor.distinct('ip', { visitorId: null });
const uniqueTotal = uniqueByVisitorId + visitorsWithoutIdCount.length;

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
