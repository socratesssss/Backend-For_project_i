const express = require('express');
const app = express();
const {PRODUCT_CATEGORIES} = require('./shared2Fronend/Shared')
const cors = require('cors');
const path = require('path');
// middlwere
const verifyToken = require('./middlewere/verifyToken')


// Routers
const ProductRouter = require('./routers/productRouter');
const UploadRouter = require('./routers/uploadRouters');
const bannerRoutes = require('./routers/BannerRouters');
const DeleteImageRouter = require('./routers/deleteImageRouter');
const orderRouter = require('./routers/OrdersRouter')
const AdminRtr = require('./routers/AdminAuth')
const adminReg = require('./routers/AdmReg')
const visitorRoute = require('./routers/visitorRoute');



// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/product', ProductRouter);
app.use('/api/upload',verifyToken, UploadRouter);
app.use('/api/banners', bannerRoutes);
app.use('/api/delete-image',verifyToken, DeleteImageRouter);
app.use("/api/order", orderRouter);
app.use('/api/admin',AdminRtr);

if(process.env.NODE_ENV === 'development'){
  app.use('/api/admin',adminReg)
  console.log('Development Server')
}


app.use('/api/visit', visitorRoute);


// 

// categories
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    categories: PRODUCT_CATEGORIES
  });
});


// 
app.get('/', (req, res) => {
  res.send('API is working...');
});

// Connect MongoDB AND THEN start server
module.exports = app



