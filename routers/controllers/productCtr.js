const mongoose = require('mongoose');
const Product = require('../../models/productsModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 

const getFilteredProducts = async (req, res) => {
  const { 
    categories, 
    minPrice, 
    maxPrice, 
    sort, 
    page = 1, 
    limit = 20,
    q 
  } = req.query;

  const filters = {};

  // Handle categories filter
  if (categories) {
    const categoryArray = Array.isArray(categories) 
      ? categories 
      : categories.split(',');
    filters.category = { $in: categoryArray };
  }

  // Handle price range
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

  // Handle search query
  if (q) {
    filters.$or = [
      { name: { $regex: q, $options: 'i' } },
      { miniDescription: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
  }

  try {
    let query = Product.find(filters);

    // Handle sorting
    if (sort === 'lowToHigh') {
      query = query.sort({ price: 1 });
    } else if (sort === 'highToLow') {
      query = query.sort({ price: -1 });
    }

    const total = await Product.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);

    const products = await query
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      products,
      total,
      totalPages,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};






// ======================
//  CONFIGURATIONS
// ======================
const UPLOAD_DIR = path.join(__dirname, '../public/uploads');

// Ensure upload folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}




// ======================
//  HELPER FUNCTIONS
// ======================


const handleServerError = (res, err, context = 'operation') => {
  console.error(`❌ ${context} error:`, err);
  res.status(500).json({
    success: false,
    message: `Server error during ${context}`,
    error: err.message,
  });
};


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

// delete file and image
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid product ID' 
    });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Delete associated images
    product.images.forEach(img => deleteFile(img));
    product.productColors?.forEach(color => {
      color.images?.forEach(img => deleteFile(img));
    });

    await Product.findByIdAndDelete(id);
    res.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (err) {
    handleServerError(res, err, 'deleting product');
  }
};
// ======================
//  CONTROLLER FUNCTIONS
// ======================
const createProduct = async (req, res) => {
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
    res.status(201).json({ success: true, message: 'Product saved', product });
  } catch (err) {
    handleServerError(res, err, 'product creation');
  }
};

const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const minPrice = Number(req.query.minPrice) || 0;
    const maxPrice = Number(req.query.maxPrice) || Infinity;
    const sortOrder = req.query.sortOrder || '';
    const categories = req.query.categories ? req.query.categories.split(',').filter(Boolean) : [];
    const searchQuery = req.query.q || '';

    // Build filter
    const filter = {
      price: { $gte: minPrice, $lte: maxPrice },
      ...(categories.length > 0 && { category: { $in: categories } }),
      ...(searchQuery.trim() && {
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { miniDescription: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
        ],
      }),
    };

    // Build sort
    let sort = { _id: -1 };
    if (sortOrder === 'lowToHigh') sort = { discountPrice: 1, price: 1 };
    else if (sortOrder === 'highToLow') sort = { discountPrice: -1, price: -1 };

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
      limit,
    });
  } catch (err) {
    handleServerError(res, err, 'fetching products');
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid product ID' 
    });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    res.json({ success: true, product });
  } catch (err) {
    handleServerError(res, err, 'fetching product by ID');
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid product ID' 
    });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Product updated', 
      product: updatedProduct 
    });
  } catch (err) {
    handleServerError(res, err, 'updating product');
  }
};

module.exports = {deleteProduct,createProduct, getProducts,getProductById,updateProduct,getFilteredProducts}