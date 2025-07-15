
const express = require('express');
const multer = require('multer');
const  {getBanners, addBanner, deleteBanner,} = require('../controllers/bannerController');

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'), // ✅ ensure public/uploads
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.get('/', getBanners);
router.post('/', upload.single('image'), addBanner);
router.delete('/:id', deleteBanner);

module.exports =router;
