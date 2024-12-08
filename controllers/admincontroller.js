const Admin = require('../models/admin');
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
