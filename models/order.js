const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    lab_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    test_id: [{ // Changed to an array of ObjectId
      type: mongoose.Schema.Types.ObjectId,
      ref: 'labs', // Assuming you have a 'labs' collection
    }],
    fullname: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zip_code: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
    },
    payment_status: {
      type: String,
      default: 'pending'
    },
    amount: {
      type: Number,
      required: true,
    },
    start_time: {
      type: String,
    },
    sessionPlan: {
      type: String,
    },
    yogaType: {
      type: String,
    },
    end_time: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('order', orderSchema);
