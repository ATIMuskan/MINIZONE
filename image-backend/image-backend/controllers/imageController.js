const ProductImage = require('../models/Image');
const fs = require('fs');
const path = require('path');

exports.uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const uploadedFile = req.file;
    const productImage = new ProductImage({
      name: uploadedFile.originalname,
      filename: uploadedFile.filename,
      size: (uploadedFile.size / 1024).toFixed(2) + ' KB',
      mimetype: uploadedFile.mimetype,
      uploadTime: new Date(),
      path: `/uploads/${uploadedFile.filename}`
    });

    const savedProductImage = await productImage.save();
    res.status(201).json({
      message: 'Image uploaded successfully',
      image: savedProductImage
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

exports.getProductImages = async (req, res) => {
  try {
    const productImages = await ProductImage.find().sort({ uploadTime: -1 });
    res.json(productImages);
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ message: 'Failed to fetch images', error: error.message });
  }
};

exports.getProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const productImage = await ProductImage.findById(id);
    
    if (!productImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json(productImage);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ message: 'Failed to fetch image', error: error.message });
  }
};

exports.deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const productImage = await ProductImage.findById(id);
    
    if (!productImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', productImage.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await ProductImage.findByIdAndDelete(id);
    res.json({ message: 'Image deleted successfully', id });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
};

exports.replaceProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const productImage = await ProductImage.findById(id);
    if (!productImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const oldFilePath = path.join(__dirname, '..', 'uploads', productImage.filename);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }

    const uploadedFile = req.file;
    const updatedProductImage = await ProductImage.findByIdAndUpdate(
      id,
      {
        name: uploadedFile.originalname,
        filename: uploadedFile.filename,
        size: (uploadedFile.size / 1024).toFixed(2) + ' KB',
        mimetype: uploadedFile.mimetype,
        uploadTime: new Date(),
        path: `/uploads/${uploadedFile.filename}`
      },
      { new: true }
    );

    res.json({
      message: 'Image replaced successfully',
      image: updatedProductImage
    });
  } catch (error) {
    console.error('Replace error:', error);
    res.status(500).json({ message: 'Failed to replace image', error: error.message });
  }
};