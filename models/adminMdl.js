
const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema({
  userName: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true,
    minLength: 5,
    maxLength: 1024 
  },
  email: { // Required for sending reset emails
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, "Please enter a valid email"]
  },
  resetToken: String,
resetTokenExpiry: Number,  // Token expiry time
}, { timestamps: true });

// Generate JWT (existing method)
adminSchema.methods.generateJWT = function() {
  return jwt.sign(
    { id: this._id, userName: this.userName },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// Generate a password reset token
adminSchema.methods.createResetToken = function() {
  // Generate a random token (unhashed, sent via email)
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash the token before storing in DB
  this.resetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expiry (1 hour)
  this.resetTokenExpires = Date.now() + 3600000;

  return resetToken; // Return the unhashed token for email
};

// Clear reset token after use
adminSchema.methods.clearResetToken = function() {
  this.resetToken = undefined;
  this.resetTokenExpires = undefined;
  return this.save();
};

module.exports = mongoose.model("Admin", adminSchema);
