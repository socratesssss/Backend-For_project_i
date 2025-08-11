const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  ip: String,
  userAgent: String
});

const visitorSchema = new mongoose.Schema({
  fingerprint: { type: String, required: true, unique: true },
  ip: String,
  userAgent: String,
  firstVisit: { type: Date, default: Date.now },
  lastVisit: { type: Date, default: Date.now },
  visitCount: { type: Number, default: 1 },
  visitHistory: [visitSchema],
  deviceType: String,
  browser: String,
  os: String,
  country: String,
  city: String
}, { timestamps: true });

// Add indexes for faster queries
visitorSchema.index({ fingerprint: 1 });
visitorSchema.index({ lastVisit: -1 });
visitorSchema.index({ visitCount: -1 });

module.exports = mongoose.model('Visitor', visitorSchema);