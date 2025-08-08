const bcrypt = require("bcryptjs");
const Admin = require("../models/adminMdl"); // adjust path if needed

const registerAdmin = async (req, res) => {
  const { userName, password, email } = req.body;

  // Validate input
  if (!userName || !password || !email) {
    return res.status(400).json({ message: "All fields are required " });
  }

  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ $or: [{ userName }, { email }] });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists with this username or email" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new admin
    const admin = await Admin.create({
      userName,
      password: hashedPassword,
      email
    });

    // Optional: Generate JWT if you have a method defined on the model
    const token = admin.generateJWT ? admin.generateJWT() : null;

    res.status(201).json({
      message: "Admin created successfully",
      token: token,
      admin: {
        id: admin._id,
        userName: admin.userName,
        email: admin.email
      }
    });
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({ error: "Server error" });
  }
};



module.exports = registerAdmin;
