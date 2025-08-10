// backend/routers/uploadRouter.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewere/upload');
const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})

// port
const url =  process.env.BACKEND_URL || 'http://localhost:5000' ;




router.post('/',
   upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Generate full URL
  const fileUrl = `${url}/uploads/${req.file.filename}`;

  res.status(200).json({ url: fileUrl });
});

module.exports = router;
