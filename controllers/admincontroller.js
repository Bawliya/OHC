const Admin = require('../models/admin');
const order = require('../models/order');
const User = require('../models/userModel');
const Notificaion = require('../models/notification');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');

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

    if (userType == "Lab Test Doctor") {
      const result = await User.aggregate([
        {
          $match: {
            userType: "Lab Test Doctor",
          }
        },
        {
          $lookup: {
            from: "orders", // Join with the orders collection
            localField: "_id", // Match the user ID with the lab_id in orders
            foreignField: "lab_id",
            as: "user_orders",
          },
        },
        {
          $lookup: {
            from: "labtests", // Join with the labtests collection
            localField: "user_orders.test_id", // Match test IDs from orders
            foreignField: "_id",
            as: "test_details",
          },
        },
        {
          $lookup: {
            from: "labtests", // Join with the labtests collection
            localField: "_id", // Match test IDs from orders
            foreignField: "lab_id",
            as: "tests",
          },
        },
        {
          $addFields: {
            totalAmount: {
              $sum: {
                $map: {
                  input: "$test_details", // Map over the test details
                  as: "test",
                  in: { $toDouble: "$$test.price" }, // Convert price to a number and sum it
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            fullName: 1,
            email: 1,
            phoneNumber: 1,
            address: 1,
            city: 1,
            state: 1,
            zipCode: 1,
            business_name: 1,
            whatsapp_number: 1,
            about_desc: 1,
            image: 1,
            userType: 1,
            device_id: 1,
            tests: 1,
            total_order: { $size: "$user_orders" },
            totalAmount: 1, // Include the total amount for the user
          },
        },
      ]);

      return res.status(200).json({
        status: true,
        message: "User get success",
        data: result
      });
    }

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
        hbot: "1200",
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
    // if (type == "") {
    //   const result = await Order.aggregate([
    //     {
    //       $match: {
    //         lab_id: mongoose.Types.ObjectId(labId), // Match the lab_id
    //       },
    //     },
    //     {
    //       $unwind: "$test_id", // Flatten the test_id array
    //     },
    //     {
    //       $lookup: {
    //         from: "tests", // Name of the tests collection
    //         localField: "test_id",
    //         foreignField: "_id",
    //         as: "test_details",
    //       },
    //     },
    //     {
    //       $unwind: "$test_details", // Flatten the test_details array
    //     },
    //     {
    //       $group: {
    //         _id: "$lab_id", // Group by lab_id
    //         totalAmount: { $sum: "$test_details.price" }, // Sum up the prices
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "users", // Name of the users collection
    //         localField: "_id", // lab_id from the group stage
    //         foreignField: "_id",
    //         as: "user_details",
    //       },
    //     },
    //     {
    //       $unwind: "$user_details", // Flatten the user_details array
    //     },
    //     {
    //       $project: {
    //         _id: 0, // Exclude the _id field from the output
    //         lab_id: "$_id",
    //         totalAmount: 1,
    //         userDetails: {
    //           fullName: "$user_details.fullName",
    //           email: "$user_details.email",
    //           phoneNumber: "$user_details.phoneNumber",
    //           address: "$user_details.address",
    //           city: "$user_details.city",
    //           state: "$user_details.state",
    //           zipCode: "$user_details.zipCode",
    //           business_name: "$user_details.business_name",
    //           whatsapp_number: "$user_details.whatsapp_number",
    //           about_desc: "$user_details.about_desc",
    //           image: "$user_details.image",
    //           userType: "$user_details.userType",
    //           device_id: "$user_details.device_id",
    //         },
    //       },
    //     },
    //   ]);
    //   res.status(200).json({
    //     status: true,
    //     message: "Orders get success",
    //     data
    //   });
    // }
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

exports.getNotification = async (req, res) => {
  try {
    const data = await Notificaion.find({ noti_type: "admin" });

    res.status(200).json({
      status: true,
      message: "Notification get success",
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
