const Image = require('../models/Image');
const fs = require('fs');
const path = require('path');


exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const image = new Image({
      name: file.originalname,
      filename: file.filename,
      size: (file.size / 1024).toFixed(2) + ' KB',
      mimetype: file.mimetype,
      uploadTime: new Date(),
      path: `/uploads/${file.filename}`
    });

       const savedImage = await image.save();
       res.status(201).json({
       message: 'Image uploaded successfully',
       image: savedImage
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};


exports.getImages = async (req, res) => {
  try {
    const images = await Image.find().sort({ uploadTime: -1 });
    res.json(images);
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ message: 'Failed to fetch images', error: error.message });
  }
};

exports.getImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json(image);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ message: 'Failed to fetch image', error: error.message });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Image.findByIdAndDelete(id);
    res.json({ message: 'Image deleted successfully', id });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
};

exports.replaceImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const existingImage = await Image.findById(id);
    if (!existingImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const oldFilePath = path.join(__dirname, '..', 'uploads', existingImage.filename);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }

    const file = req.file;
    const updatedImage = await Image.findByIdAndUpdate(
      id,
      {
        name: file.originalname,
        filename: file.filename,
        size: (file.size / 1024).toFixed(2) + ' KB',
        mimetype: file.mimetype,
        uploadTime: new Date(),
        path: `/uploads/${file.filename}`
      },
      { new: true }
    );

    res.json({
        message: 'Image replaced successfully',
        image: updatedImage
    });
  } catch (error) {
    console.error('Replace error:', error);
    res.status(500).json({ message: 'Failed to replace image', error: error.message });
  }
};