const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '../public/uploads');

router.post('/', (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ message: 'Image URL is required' });
  }

  try {
    const fileName = imageUrl.split('/uploads/')[1];
    if (!fileName) {
      return res.status(400).json({ message: 'Invalid image path' });
    }

    const filePath = path.join(UPLOAD_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ message: 'Image deleted successfully' });
    } else {
      return res.status(404).json({ message: 'File not found on server' });
    }
  } catch (err) {
    console.error('Failed to delete file:', err.message);
    return res.status(500).json({ message: 'Error deleting file' });
  }
});

module.exports = router;
