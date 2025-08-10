const mongoose = require('mongoose');

const dotenv = require('dotenv')
dotenv.config({path:'.env'})
const app = require('./App');


const DB = process.env.MONGODB_SERVER.replace('<PASSWORD>',process.env.DB_PASSWORD)
const PORT = process.env.PORT || 4000





// console.log(process.env)
mongoose.connect(DB)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
  });


    app.listen( PORT, () => {
      console.log(`🚀 Server running on:.. ${ process.env.PORT}`);
    });
