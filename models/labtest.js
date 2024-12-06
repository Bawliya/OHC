const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    lab_id: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    name: { 
      type: String, 
      required: true, 
      trim: true,
    },
    price: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v) {
          return /^\d+(\.\d{1,2})?$/.test(v);
        },
        message: props => `${props.value} is not a valid price format!`
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LabTest', labTestSchema);
