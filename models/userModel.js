const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  otp: { type: String },
  fullName: { type: String },
  verify: { type: Boolean, default: false },
  password: { type: String },
  phoneNumber: { type: String },
  dob: { type: String },
  gender: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },

  business_name: { type: String },
  whatsapp_number: { type: String },
  about_desc: { type: String },

  image: { type: String },
  device_id: { type: String },


  userType: { type: String, enum: ['User', 'Pharmacy Clinic', 'Lab Test Doctor'], required: true },
},
  {
    timestamps: true
  });

module.exports = mongoose.model('User', userSchema);
