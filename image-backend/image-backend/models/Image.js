const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  filename: {
    type: String,
    required: true
  },
  size: {
     type: String,
    required: true
  },

  
  mimetype: {
     type: String,
    required: true
  },
  uploadTime: {
     type: Date,
    default: Date.now
  },
  path: {
      type: String,
    required: true
  }
}, {
    timestamps: true
});

module.exports = mongoose.model('Image', ImageSchema);