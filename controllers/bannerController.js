const Banner = require('../models/BannersModel');
const fs = require('fs/promises');
const path = require('path');

const MAX_BANNERS = 5;

const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching banners' });
  }
};

const addBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const currentCount = await Banner.countDocuments();
    if (currentCount >= 5) {
      return res.status(400).json({ error: 'Max 5 banners allowed' });
    }

    const imageUrl = `http://localhost:4000/uploads/${req.file.filename}`;
    const newBanner = new Banner({ imageUrl });
    await newBanner.save();
    res.status(201).json(newBanner);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error uploading banner' });
  }
};


const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) return res.status(404).json({ error: 'Banner not found' });

    // ✅ Ensure correct path to 'public/uploads'
    const imagePath = path.join(__dirname, '..', 'public', banner.imageUrl);

    try {
      await fs.unlink(imagePath); // remove image file
    } catch (err) {
      console.error('Failed to delete image file:', err);
    }

    await banner.deleteOne();
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting banner' });
  }
};

module.exports = {
  getBanners,
  addBanner,
  deleteBanner,
};
