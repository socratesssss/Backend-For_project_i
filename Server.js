const mongoose = require('mongoose');

const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const app = require('./App');
const port = process.env.PORT;






// console.log(process.env)
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
