const express = require("express");
const router = express.Router();
const Admin = require("../models/adminMdl");
const bcrypt = require("bcryptjs");


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
