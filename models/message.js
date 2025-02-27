const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  chat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chats',
    required: true,
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: "text"
  },
  time: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }

},
  {
    timestamps: true
  });

module.exports = mongoose.model('message', messageSchema);
