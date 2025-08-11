const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const visitorRoute = require('../middlewere/verifyToken');
const { v4: uuidv4 } = require('uuid');
const UAParser = require('ua-parser-js');

// Enhanced visitor tracking
router.post('/track', async (req, res) => {
  try {
    const { fingerprint } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    if (!fingerprint) {
      return res.status(400).json({ error: 'Fingerprint is required' });
    }

    // Check for existing visitor
    const existingVisitor = await Visitor.findOneAndUpdate(
      { fingerprint },
      {
        $set: { lastVisit: new Date() },
        $setOnInsert: {
          ip,
          userAgent,
          firstVisit: new Date()
        },
        $inc: { visitCount: 1 }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'Visit tracked',
      isNewVisitor: existingVisitor.visitCount === 1
    });
  } catch (err) {
    console.error('Tracking error:', err);
    res.status(500).json({ error: 'Failed to track visit' });
  }
});

// Get all visitors (paginated)
router.get('/all', visitorRoute, async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = '-lastVisit' } = req.query;
    
    const visitors = await Visitor.find()
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const count = await Visitor.countDocuments();

    res.status(200).json({
      visitors,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalVisitors: count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch visitors' });
  }
});

// Comprehensive stats endpoint
router.get('/stats', visitorRoute, async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // All-time stats
    const [allTimeUnique, allTimeTotalVisits] = await Promise.all([
      Visitor.distinct('fingerprint'),
      Visitor.aggregate([{ $group: { _id: null, total: { $sum: "$visitCount" } }}])
    ]);

    // Current period visitors
    const currentVisitors = await Visitor.find({
      lastVisit: { $gte: startOfToday }
    });

    // Stats by time period
    const periods = [
      { name: 'today', start: startOfToday },
      { name: 'week', start: startOfWeek },
      { name: 'month', start: startOfMonth },
      { name: 'year', start: startOfYear }
    ];

    const periodStats = await Promise.all(
      periods.map(async (period) => {
        const [unique, total] = await Promise.all([
          Visitor.distinct('fingerprint', { lastVisit: { $gte: period.start } }),
          Visitor.aggregate([
            { $match: { lastVisit: { $gte: period.start } } },
            { $group: { _id: null, total: { $sum: "$visitCount" } } }
          ])
        ]);
        
        return {
          name: period.name,
          unique: unique.length,
          total: total[0]?.total || 0
        };
      })
    );

    // Device breakdown
    const deviceStats = await Visitor.aggregate([
      { $group: { _id: "$deviceType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Browser breakdown
    const browserStats = await Visitor.aggregate([
      { $group: { _id: "$browser", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // OS breakdown
    const osStats = await Visitor.aggregate([
      { $group: { _id: "$os", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Geographic data (if available)
    const countryStats = await Visitor.aggregate([
      { $match: { country: { $exists: true } } },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      summary: {
        allTimeUnique: allTimeUnique.length,
        allTimeTotalVisits: allTimeTotalVisits[0]?.total || 0,
        currentActive: currentVisitors.length
      },
      periods: periodStats.reduce((acc, curr) => {
        acc[curr.name] = {
          uniqueVisitors: curr.unique,
          totalVisits: curr.total
        };
        return acc;
      }, {}),
      devices: deviceStats,
      browsers: browserStats,
      operatingSystems: osStats,
      countries: countryStats,
      lastUpdated: new Date()
    });

  } catch (err) {
    console.error('Stats generation error:', err);
    res.status(500).json({ error: 'Failed to generate stats' });
  }
});

// Helper function to determine device type
function getDeviceType(ua) {
  if (ua.device.type === 'mobile') return 'Mobile';
  if (ua.device.type === 'tablet') return 'Tablet';
  if (ua.device.type === 'smarttv') return 'Smart TV';
  if (ua.device.type === 'console') return 'Gaming Console';
  if (ua.device.type === 'embedded') return 'Embedded';
  return 'Desktop';
}

module.exports = router;