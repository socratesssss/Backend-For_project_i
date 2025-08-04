const express = require("express");
const multer = require("multer");
const verifyToken = require('../middlewere/verifyToken')
const {
  getBanners,
  addBanner,
  deleteBanner,
} = require("./controllers/bannerController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"), // ✅ ensure public/uploads
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.get("/", getBanners);
router.post("/", upload.single("image"),verifyToken, addBanner);
router.delete("/:id",verifyToken, deleteBanner);

module.exports = router;
