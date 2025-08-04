// routes/adminRegister.js
const express = require("express");
const router = express.Router();
const Admin = require("../models/adminMdl");
const bcrypt = require("bcryptjs");
const verifyToken = require('../middlewere/verifyToken')

 const registerAdmin =    async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if admin exists
    const existingAdmin = await Admin.findOne({ userName });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin
    const admin = await Admin.create({
      userName,
      password: hashedPassword,
     
    });
    
        const token = admin.generateJWT();

    res.status(201).json({
      message: "Admin created successfully",
      token:token,
      admin: {
        id: admin._id,
        userName: admin.userName,
        
      }
    });
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({ error: "Server error" });
  }
}
// ONLY ENABLE THIS IN DEVELOPMENT!
router.post("/register",registerAdmin);

module.exports = router;