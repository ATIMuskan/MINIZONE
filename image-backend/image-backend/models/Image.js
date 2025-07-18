const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  name: String, // original file name
  filename: String, // stored file name
  path: String, // relative path to file
  originalname: String, // original file name (duplicate, but kept for compatibility)
  mimetype: String,
  size: String, // stored as string with units (e.g., '123 KB')
  uploadTime: { type: Date, default: Date.now }, // for upload timestamp
  createdAt: { type: Date, default: Date.now } // for creation timestamp
});

module.exports = mongoose.model('Image', imageSchema);