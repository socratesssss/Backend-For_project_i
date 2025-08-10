const mongoose = require('mongoose');

const dotenv = require('dotenv')
dotenv.config({path:'.env'})
const app = require('./App');


const DB = process.env.MONGODB_SERVER.replace('<PASSWORD>',process.env.DB_PASSWORD)





// console.log(process.env)
mongoose.connect(DB)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
  });


    app.listen( process.env.PORT, () => {
      console.log(`🚀 Server running on${ process.env.PORT}`);
    });
