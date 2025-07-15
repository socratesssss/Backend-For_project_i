// backend/routers/uploadRouter.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewere/upload');

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Generate full URL
  const fileUrl = `http://localhost:4000/uploads/${req.file.filename}`;

  res.status(200).json({ url: fileUrl });
});

module.exports = router;
