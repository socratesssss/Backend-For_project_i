// models/Visitor.js
const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  visitorId: { type: String, default: null, index: true }, // indexed for fast distinct() and queries
  ip: String,
  userAgent: String,
  visitedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Visitor', visitorSchema);
