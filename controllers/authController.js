const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const sendOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}`,
  };

  await transporter.sendMail(mailOptions);
  return otp;
};

exports.sendOtp = async (req, res) => {
  const { email,userType } = req.body;
  try {
    let user = await User.findOne({ email });
    // const otp = await sendOTP(email);
    const otp = 1234;
    if (!user) {
      user = new User({ email, otp ,userType});
      await user.save();
    } else {
      user.otp = otp;
      user.userType = userType;
      await user.save();
    }
    res.status(200).json({ message: 'OTP sent',status:true });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', status:false });
  }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || user.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
  
      // Check if user is already registered
      const alreadyRegistered = !!user.fullName && !!user.userType;
  
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.status(200).json({
        message: 'OTP verified',
        status:true,
        token,
        alreadyRegistered, // Indicate if user is already registered
      });
    } catch (error) {
      res.status(500).json({ message: 'Error verifying OTP', status:false });
    }
  };
  

exports.register = async (req, res) => {
  const { email, fullName, phoneNumber, dob, gender, address, city, state, zipCode } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { fullName, phoneNumber, dob, gender, address, city, state, zipCode },
      { new: true }
    );
    res.status(200).json({ message: 'User registered', user ,status:true});
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', status:false });
  }
};
