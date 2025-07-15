const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bannerRoutes = require('./routers/BannerRouters');
const DeleteImageRouter = require('./routers/deleteImageRouter');


// Import routers
const ProductRouter = require('./routers/productRouter');
const UploadRouter = require('./routers/uploadRouters');

// Connect MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce-data')
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection failed:", err));

// Middlewares
app.use(cors());
app.use(express.json());


// Routes

// Serve uploads folder statically for images
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));





app.use('/api/product', ProductRouter);
app.use('/api/upload', UploadRouter); // ✅ NEW
// banner
app.use('/api/banners', bannerRoutes);
// delete img
app.use('/api/delete-image', DeleteImageRouter);



app.get('/', (req, res) => {
  res.send('API is working...');
});

// Start server
const port = 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
