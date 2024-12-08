const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensures category names are unique
    trim: true,
  },
  image: {
    type: String,
    required: true, // Ensure every category has an image
  },
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
