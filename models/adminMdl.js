
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const adminSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true,minLength:5,maxLength:1024 },
});
adminSchema.methods.generateJWT = function(){
     const token = jwt.sign(
        { id: this._id, userName: this.userName },
        process.env.JWT_SECRET,
        // { expiresIn: "1m" }
      );
      return token
}
module.exports = mongoose.model("Admin", adminSchema);
