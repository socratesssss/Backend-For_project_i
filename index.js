const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// Routers
const ProductRouter = require('./routers/productRouter');
const UploadRouter = require('./routers/uploadRouters');
const bannerRoutes = require('./routers/BannerRouters');
const DeleteImageRouter = require('./routers/deleteImageRouter');
const orderRouter = require('./routers/OrdersRouter')

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/product', ProductRouter);
app.use('/api/upload', UploadRouter);
app.use('/api/banners', bannerRoutes);
app.use('/api/delete-image', DeleteImageRouter);
app.use("/api/order", orderRouter);

// 



// 
app.get('/', (req, res) => {
  res.send('API is working...');
});

// Connect MongoDB AND THEN start server
const port = 4000;
mongoose.connect('mongodb://localhost:27017/ecommerce-data')
  .then(() => {
    console.log("✅ Connected to MongoDB");
  
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });




