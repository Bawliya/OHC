const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
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
},
{
  timestamps: true
});

module.exports = mongoose.model('chat', chatSchema);
