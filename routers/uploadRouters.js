// backend/routers/uploadRouter.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewere/upload');
const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})

// port
const port = process.env.PORT;




router.post('/',
   upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Generate full URL
  const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;

  res.status(200).json({ url: fileUrl });
});

module.exports = router;
