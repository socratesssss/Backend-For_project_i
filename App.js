const express = require('express');
const app = express();
const {PRODUCT_CATEGORIES} = require('./shared2Fronend/Shared')
const cors = require('cors');
const path = require('path');
const compression = require('compression')

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
app.use(compression())
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.set('trust proxy', true);



// Routes
app.use('/api/product', ProductRouter);
app.use('/api/upload',verifyToken, UploadRouter);
app.use('/api/banners', bannerRoutes);
app.use('/api/delete-image',verifyToken, DeleteImageRouter);
app.use("/api/order", orderRouter);
app.use('/api/admin',AdminRtr);

// development only------------------
// {
//  "userName":"admin" ,
//  "password": "admin",
//  "email":"admin@gmail.com"
// }
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
// Add this route in your app.js file, before the final app.get('/') route
app.get('/', (req, res) => {
  const apiMap = {
    message: 'Welcome to the API. Available endpoints:',
    endpoints: [
      { method: 'GET', path: '/api/categories', description: 'Get all product categories' },
      { method: 'GET', path: '/', description: 'API documentation (this page)' },
      { method: 'POST', path: '/api/admin/login', description: 'Admin login' },
      { method: 'POST', path: '/api/admin/register', description: 'Admin registration (development only)' },
      { method: 'POST', path: '/api/admin/forgot-password', description: 'Request password reset' },
      { method: 'POST', path: '/api/admin/reset-password', description: 'Reset password with token' },
      { method: 'POST', path: '/api/admin/change-password', description: 'Change password (requires auth)' },
      { method: 'POST', path: '/api/admin/change-username', description: 'Change username (requires auth)' },
      { method: 'GET', path: '/api/product', description: 'Product operations' },
      { method: 'POST', path: '/api/upload', description: 'Upload images (requires auth)' },
      { method: 'GET|POST', path: '/api/banners', description: 'Banner operations' },
      { method: 'DELETE', path: '/api/delete-image', description: 'Delete images (requires auth)' },
      { method: 'GET|POST', path: '/api/order', description: 'Order operations' },
      { method: 'GET', path: '/api/visit', description: 'Visitor tracking' },
      { method: 'GET', path: '/uploads/:filename', description: 'Access uploaded files' }
    ],
    note: 'Endpoints marked with "(requires auth)" need valid JWT token in Authorization header',
    development: process.env.NODE_ENV === 'development' ? {
      registerEnabled: true,
      note: 'Admin registration is enabled in development mode'
    } : {
      registerEnabled: false,
      note: 'Admin registration is disabled in production'
    }
  };

  res.json(apiMap);
});

// Connect MongoDB AND THEN start server
module.exports = app



