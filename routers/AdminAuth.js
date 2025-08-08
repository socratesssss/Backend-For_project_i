const express = require("express");
const router = express.Router();
const Admin = require("../models/adminMdl");
const bcrypt = require("bcryptjs");
const verifyToken = require('../middlewere/verifyToken');
const { sendPasswordResetEmail } = require('../utils/emailSender');
const crypto = require('crypto');








// / Forgot password request
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email required' });
    }

    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      // Don't reveal whether email exists for security
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 3600000; // 1 hour expiration

    // Save to database
    admin.resetToken = token;
    admin.resetTokenExpiry = tokenExpiry;
    await admin.save();

    // Send email
    await sendPasswordResetEmail(admin.email, token);

    res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Error processing request' });
  }
});


router.post('/validate-reset-token', async (req, res) => {

  try {
        // Safely check if req.body exists
    if (!req.body || !req.body.token) {
      return res.status(400).json({ message: "Token is required" });
    }
    const { token } = req.body;
console.log("token:"+token)
    if (!token || token.length !== 64) {
      return res.status(400).json({
        isValid: false,
        message: 'Invalid token format'
      });
    }

    const admin = await Admin.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({
        isValid: false,
        message: 'Invalid or expired reset link'
      });
    }

    return res.json({
      isValid: true,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({
      isValid: false,
      message: 'Error validating token. Please try again.'
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || token.length !== 64) {
      return res.status(400).json({ success: false, message: 'Invalid token format' });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const admin = await Admin.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    admin.resetToken = undefined;
    admin.resetTokenExpiry = undefined;

    await admin.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: 'An error occurred while resetting password' });
  }
});





// change pass
router.post('/change-password', verifyToken, async (req, res) => {
  const { userName } = req.user; // Typically set by verifyToken middleware
  const { oldPassword, newPassword } = req.body;

  // Basic validation
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Both old and new passwords are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  try {
    const admin = await Admin.findOne({ userName });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPassword, admin.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must be different from current password' });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.json({ 
      success: true,
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred while changing password' 
    });
  }
});
// change user name
router.post('/change-username', verifyToken, async (req, res) => {
  const { userName } = req.user; // From the verifyToken middleware
  const { newUserName } = req.body;

  // Basic validation
  if (!newUserName || newUserName.length < 3) {
    return res.status(400).json({ message: 'New username must be at least 3 characters' });
  }

  try {
    // Check if the new username already exists
    const existingUser = await Admin.findOne({ userName: newUserName });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Find current admin
    const admin = await Admin.findOne({ userName });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Update username
    admin.userName = newUserName;
    await admin.save();

    res.json({ 
      success: true,
      message: 'Username changed successfully',
      newUserName 
    });

  } catch (error) {
    console.error('Username change error:', error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred while changing username' 
    });
  }
});



// login
router.post("/login", async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const admin = await Admin.findOne({ userName });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
// webtoken
const token = admin.generateJWT();

    res.json({
      message: "Login successful",
      token,
      admin: { id: admin._id, userName: admin.userName }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
