const mongoose = require('mongoose');

const dotenv = require('dotenv')
dotenv.config({path:'.env'})
const app = require('./App');


const DB = process.env.MONGODB_SERVER.replace('<PASSWORD>',process.env.DB_PASSWORD)
const PORT = process.env.PORT || 5000





// console.log(process.env)
mongoose.connect('mongodb://127.0.0.1:27017/test-e-com')
  .then(() => {
    console.log("✅ Connected to MongoDB");
  
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
  });


    app.listen(PORT,'0.0.0.0', () => {
      console.log(`🚀 Server running on:.. http://localhost:${PORT}`);
    });
