const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { Product } = require('../models/productsModel');

const router = express.Router();

// Set upload folder path
const UPLOAD_DIR = path.join(__dirname, '../public/uploads');

// Ensure upload folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Field groups: 1 gallery + multiple color image slots
const uploadFields = [
  { name: 'galleryImages', maxCount: 5 },
  { name: 'colorImages-0' },
  { name: 'colorImages-1' },
  { name: 'colorImages-2' },
  { name: 'colorImages-3' },
  { name: 'colorImages-4' },
];

// Helper to delete file
const deleteFile = (urlPath) => {
  try {
    const fileName = urlPath.split('/uploads/')[1];
    if (!fileName) return;

    const fullPath = path.join(UPLOAD_DIR, fileName);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error('Failed to delete file:', err.message);
  }
};

// POST /api/product
router.post('/', upload.fields(uploadFields), async (req, res) => {
  try {
    const {
      name,
      price,
      discountPrice,
      category,
      inStock,
      miniDescription,
      description,
      colorsData,
    } = req.body;

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const galleryImages = (req.files['galleryImages'] || []).map(
      (file) => `${baseUrl}/uploads/${file.filename}`
    );

    const parsedColors = JSON.parse(colorsData || '[]');
    const productColors = [];

    parsedColors.forEach((colorObj, idx) => {
      if (!colorObj.color?.trim()) return;

      const images = (req.files[`colorImages-${idx}`] || []).map(
        (file) => `${baseUrl}/uploads/${file.filename}`
      );

      productColors.push({
        color: colorObj.color,
        images,
      });
    });

    const product = new Product({
      name,
      price,
      discountPrice,
      category,
      inStock: inStock === 'true',
      miniDescription,
      description,
      images: galleryImages,
      productColors,
    });

    await product.save();
    res.status(201).json({ message: 'Product saved', product });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});



// In your products route file
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page)) || 1;
    const limit = Math.max(1, parseInt(req.query.limit)) || 10;
    const skip = (page - 1) * limit;

    const minPrice = Number(req.query.minPrice) || 0;
    const maxPrice = Number(req.query.maxPrice) || Infinity;
    const sortOrder = req.query.sortOrder || '';
    const categories = req.query.categories ? req.query.categories.split(',').filter(Boolean) : [];
    const searchQuery = req.query.q || '';

    // Build MongoDB filter
    const filter = {
      price: { $gte: minPrice, $lte: maxPrice }
    };

    if (categories.length > 0) {
      filter.category = { $in: categories };
    }

    // Add text search if query exists
    if (searchQuery.trim()) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { miniDescription: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Build sort
    let sort = {};
    if (sortOrder === 'lowToHigh') {
      sort = { discountPrice: 1, price: 1 };
    } else if (sortOrder === 'highToLow') {
      sort = { discountPrice: -1, price: -1 };
    }

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      products,
      total,
      totalPages,
      page,
      limit
    });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: err.message 
    });
  }
});









// GET by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid product ID');
  }

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).send('Product not found');

    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).send('Error fetching product');
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) return res.status(404).send('Product not found');
    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).send('Error updating product');
  }
});

// DELETE product and images
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Delete gallery images
    product.images.forEach(deleteFile);

    // Delete color variant images
    product.productColors.forEach((color) => {
      color.images.forEach(deleteFile);
    });

    // Delete from DB
    await Product.findByIdAndDelete(id);

    res.json({ message: 'Product and all related images deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
