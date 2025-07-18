const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const controller = require('../controllers/imageController');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files  allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, 
  }
});


router.post('/upload', upload.single('image'), controller.uploadImage);
router.get('/', controller.getImages);
router.get('/:id', controller.getImage);
router.delete('/:id', controller.deleteImage);
router.put('/:id', upload.single('image'), controller.replaceImage);

module.exports = router;