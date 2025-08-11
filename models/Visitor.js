const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  date: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  ip: {
    type: String,
    required: true,
    trim: true
  },
  userAgent: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  referrer: String,
  duration: Number, // in seconds
  events: [{
    type: String, // e.g. 'page_view', 'button_click'
    timestamp: Date,
    data: mongoose.Schema.Types.Mixed
  }]
}, { _id: false }); // No need for separate IDs for each visit

const visitorSchema = new mongoose.Schema({
  fingerprint: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
    immutable: true // Should never change
  },
  ip: {
    type: String,
    required: true,
    trim: true
  },
  userAgent: {
    type: String,
    required: true
  },
  firstVisit: { 
    type: Date, 
    default: Date.now,
    immutable: true
  },
  lastVisit: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  visitCount: { 
    type: Number, 
    default: 1,
    min: 1
  },
  visitHistory: {
    type: [visitSchema],
    default: [],
    select: false // Hide by default for performance
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'bot', 'other'],
    required: true
  },
  browser: {
    name: String,
    version: String
  },
  os: {
    name: String,
    version: String
  },
  screenResolution: {
    width: Number,
    height: Number
  },
  country: {
    type: String,
    index: true,
    uppercase: true,
    trim: true,
    maxlength: 2 // ISO country code
  },
  region: String,
  city: String,
  isp: String,
  // For GDPR compliance
  consent: {
    type: Boolean,
    default: false
  },
  // For marketing attribution
  campaign: {
    source: String,
    medium: String,
    name: String
  },
  // For bot detection
  isBot: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
visitorSchema.index({ lastVisit: -1 });
visitorSchema.index({ visitCount: -1 });
visitorSchema.index({ country: 1, region: 1 });
visitorSchema.index({ 'browser.name': 1, 'os.name': 1 });
visitorSchema.index({ isBot: 1 });

// Virtual for average visit duration
visitorSchema.virtual('avgDuration').get(function() {
  if (!this.visitHistory || this.visitHistory.length === 0) return 0;
  const total = this.visitHistory.reduce((sum, visit) => sum + (visit.duration || 0), 0);
  return total / this.visitHistory.length;
});

// Pre-save hook for device detection
visitorSchema.pre('save', function(next) {
  if (!this.deviceType) {
    const ua = this.userAgent || '';
    this.deviceType = 
      /mobile/i.test(ua) ? 'mobile' :
      /tablet|ipad/i.test(ua) ? 'tablet' :
      /bot|spider|crawl/i.test(ua) ? 'bot' :
      'desktop';
  }
  next();
});

// Static method for bot detection
visitorSchema.statics.isLikelyBot = function(userAgent) {
  const bots = [
    'bot', 'spider', 'crawl', 'slurp', 
    'bing', 'google', 'yandex', 'duckduck'
  ];
  return bots.some(bot => userAgent.toLowerCase().includes(bot));
};

module.exports = mongoose.model('Visitor', visitorSchema);