const Admin = require('../models/admin');
const order = require('../models/order');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Register Admin
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        status: false,
        message: 'Email is already registered',
      });
    }

    // Create a new admin
    const admin = new Admin({ email, password });
    await admin.save();

    res.status(201).json({
      status: true,
      message: 'Admin registered successfully',
      data: { email: admin.email },
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to register admin',
      error: err.message,
    });
  }
};

// Login Admin
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        status: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      status: true,
      message: 'Admin logged in successfully',
      data: { token },
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to log in admin',
      error: err.message,
    });
  }
};

// get all user api by type  
exports.getUsersByType = async (req, res) => {
  try {
    const { userType = "User", search = "" } = req.query;

    // Build the query
    const query = {
      userType,
    };

    // Add search condition if `search` is provided
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } }, // Case-insensitive search in fullName
        { email: { $regex: search, $options: "i" } }, // Case-insensitive search in email
      ];
    }
    const users = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      status: true,
      message: "User get success",
      data: users
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to get users',
      error: err.message,
    });
  }
};


exports.getDashboardData = async (req, res) => {
  try {
    const users = await User.countDocuments({ userType: "User" });
    const pharmacy_clinic = await User.countDocuments({ userType: "Pharmacy Clinic" });
    const lab_test_doctor = await User.countDocuments({ userType: "Lab Test Doctor" });
    const orders = await order.countDocuments();
    const latest_user = await User.find().sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      status: true,
      message: "User get success",
      data: {
        users,
        pharmacy_clinic,
        lab_test_doctor,
        order: orders,
        latest_user
      }
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to get users',
      error: err.message,
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { type } = req.query;
    console.log(type)
    const data = await order.find({ type });

    res.status(200).json({
      status: true,
      message: "Orders get success",
      data
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to get users',
      error: err.message,
    });
  }
};
