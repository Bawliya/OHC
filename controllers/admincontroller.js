const Admin = require('../models/admin');
const order = require('../models/order');
const User = require('../models/userModel');
const Notificaion = require('../models/notification');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const yoga = require('../models/yoga');

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

// exports.getOrders = async (req, res) => {
//   try {
//     const { type, payment_status, start_date, end_date } = req.query;

//     // Build the query object
//     let query = {};

//     // Filter by type if provided
//     if (type) {
//       if(type != "All"){
//         query.type = type;
//       }
//     }

//     // Filter by payment status if provided
//     if (payment_status) {
//       query.payment_status = payment_status.toLowerCase();
//     }

//     // Filter by date range if provided
//     if (start_date || end_date) {
//       query.date = {};
//       if (start_date) {
//         query.date.$gte = new Date(start_date);
//       }
//       if (end_date) {
//         query.date.$lte = new Date(end_date);
//       }
//     }

//     // Fetch the filtered data
//     const data = await order.find(query);

//     // Respond with the results
//     res.status(200).json({
//       status: true,
//       message: "Orders retrieved successfully",
//       data,
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: false,
//       message: "Failed to retrieve orders",
//       error: err.message,
//     });
//   }
// };

exports.getOrders = async (req, res) => {
  try {
    const { type, payment_status, start_date, end_date } = req.query;

    // Build match conditions
    let matchStage = {};

    if (type && type !== "All") {
      matchStage.type = type;
    }

    if (payment_status) {
      matchStage.payment_status = payment_status.toLowerCase();
    }

    if (start_date || end_date) {
      matchStage.date = {};
      if (start_date) {
        matchStage.date.$gte = new Date(start_date);
      }
      if (end_date) {
        matchStage.date.$lte = new Date(end_date);
      }
    }

    // Aggregation pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',       // collection name in MongoDB
          localField: 'lab_id',     // field in orders
          foreignField: '_id',     // field in labtests
          as: 'labInfo'
        }
      },
      {
        $unwind: {
          path: '$labInfo',
          preserveNullAndEmptyArrays: true   // agar labInfo naa ho to bhi record aaye
        }
      },
      {
        $addFields: {
          labName: '$labInfo.name'  // labInfo se sirf name pick karo
        }
      },
      {
        $project: {
          labInfo: 0  // labInfo hata do result se
        }
      }
    ];

    const data = await order.aggregate(pipeline);

    res.status(200).json({
      status: true,
      message: "Orders retrieved successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve orders",
      error: err.message,
    });
  }
};


exports.getYoga = async (req, res) => {
  try {
   
   
    const data = await yoga.findOne();

    res.status(200).json({
      status: true,
      message: "Yoga get success",
      data
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to get yoga',
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
