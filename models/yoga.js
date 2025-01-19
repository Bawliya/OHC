const mongoose = require('mongoose');

const YogaSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('yoga', YogaSchema);
