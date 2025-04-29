const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const testsubCategorySchema = new mongoose.Schema({
  testCategoryId: {
    type: Schema.Types.ObjectId,
  },
  name: {
    type: String,
    required: true,
    unique: true, // Ensures category names are unique
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    unique: true, // Ensures category names are unique
    trim: true,
  },
  image: {
    type: String,
    required: true, // Ensure every category has an image
  },
}, { timestamps: true });

module.exports = mongoose.model('test_subcategory', testsubCategorySchema);
