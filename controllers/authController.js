const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const { use } = require('../routes/authRoutes');
const labtest = require('../models/labtest');
const order = require('../models/order');
const jwtsecret = "ohcappapijwt";
const mongoose = require("mongoose");
const OneSignal = require('onesignal-node');
const https = require('https');
const oneSignalClient = new OneSignal.Client('41e4de85-be9f-4f97-8458-c3278921f967', 'os_v2_app_ihsn5bn6t5hzpbcyymtysipzm5dqlpwrl4uuf6n3zn2qslnfkli4m73joqfp4azuq7y2wmwyn36s4qqoc246iwpdv4uqapmisekzshq');



// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images'); // Directory to store images
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpeg, .jpg, and .png file types are allowed!'));
    }
  },
}).single('image'); // 'profileImage' should match the key in the request form-data


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

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
        status: false,
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        status: false,
      });
    }

    if (user.verify == false) {
      return res.status(400).json({
        message: 'Please verify your email register again',
        status: false
      })
    }

    // Verify the password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid password',
        status: false,
      });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { email: user.email, userId: user._id },
      jwtsecret,
      { expiresIn: '1y' }
    );

    return res.status(200).json({
      message: 'Login successful',
      status: true,
      token,
      data: user
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      message: 'Error during login',
      status: false,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Validate the input
    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required',
        status: false,
      });
    }

    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        status: false,
      });
    }

    // Check if the provided OTP matches the user's OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        message: 'Invalid OTP',
        status: false,
      });
    }

    // Mark the user as verified
    user.verify = true; // Assuming `verify` is a field in the User model
    user.otp = null; // Clear the OTP after successful verification
    await user.save();

    // Generate a JWT token
    const token = jwt.sign(
      { email: user.email, userId: user._id },
      jwtsecret,
      { expiresIn: '1y' }
    );

    res.status(200).json({
      message: 'OTP verified successfully',
      status: true,
      token,
      data: user
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      message: 'Error verifying OTP',
      status: false,
    });
  }
};

exports.updatePasswordWithOldPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId; // Assuming userId is extracted from the JWT token in middleware

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: 'Old password and new password are required',
        status: false,
      });
    }

    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        status: false,
      });
    }

    // Compare old password with stored hashed password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({
        message: 'Invalid old password',
        status: false,
      });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword; // Update the password in the database
    await user.save(); // Save the updated user document

    return res.status(200).json({
      message: 'Password updated successfully',
      status: true,
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({
      message: 'Error updating password',
      status: false,
    });
  }
};


exports.updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user_id = req.user.userId;

    const user = await User.findOne({ _id: user_id });
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        status: false,
      });
    }
    // // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.save();
    res.status(200).json({
      message: 'Password updated successfully',
      status: true,
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      message: 'Error updating password',
      status: false,
    });
  }
}

exports.update_device_id = async (req, res) => {
  try {
    const { device_id } = req.body;
    const user_id = req.user.userId;

    const user = await User.findOne({ _id: user_id });
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        status: false,
      });
    }
    // // Hash the new password
    user.device_id = device_id;
    user.save();
    res.status(200).json({
      message: 'device_id updated successfully',
      status: true,
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      message: 'Error updating password',
      status: false,
    });
  }
}

exports.otpSend = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = "1234";
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        status: false,
      });
    }
    user.otp = otp;
    user.save();
    return res
      .status(200)
      .json({ message: 'OTP sent to your email', status: true });

  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      message: 'Error updating password',
      status: false,
    });
  }
}



exports.register = async (req, res) => {
  const {
    email,
    fullName,
    phoneNumber,
    dob,
    gender,
    address,
    city,
    state,
    zipCode,
    password,
    userType,
  } = req.body;

  try {
    // Check if a user already exists with the given email
    const existingUser = await User.findOne({ email });
    const otp = 1234; // Generate OTP (Consider generating dynamically in production)

    if (existingUser) {
      // If the user exists and is already verified
      if (existingUser.verify) {
        return res
          .status(400)
          .json({ message: 'Email already exists', status: false });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      // If the user exists but is not verified, update their details and resend OTP
      await User.findOneAndUpdate(
        { email },
        {
          $set: {
            fullName,
            otp,
            phoneNumber,
            dob,
            gender,
            address,
            city,
            state,
            zipCode,
            userType,
            password: hashedPassword
          },
        },
        { new: true } // Ensure the updated document is returned
      );

      return res
        .status(200)
        .json({ message: 'OTP sent to your email', status: true });
    }

    // If the user does not exist, create a new user
    const hashedPassword = await bcrypt.hash(password, 12); // Hash the password for security
    const newUser = new User({
      email,
      fullName,
      otp,
      phoneNumber,
      dob,
      gender,
      address,
      city,
      state,
      zipCode,
      password: hashedPassword,
      userType,
    });

    await newUser.save();

    return res
      .status(200)
      .json({ message: 'OTP sent to your email', status: true });
  } catch (error) {
    console.error('Error during registration:', error);
    return res
      .status(500)
      .json({ message: 'Error registering user', status: false });
  }
};

exports.register_lab = async (req, res) => {

  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message, status: false });
    }

    const {
      business_name,
      email,
      fullName,
      phoneNumber,
      whatsapp_number,
      address,
      city,
      state,
      zipCode,
      password,
      userType,
      about_desc,
      tests
    } = req.body;
    var otp = 1234;

    const image = req.file ? req.file.filename : null;

    try {
      // Check if a user already exists with the given email
      const existingUser = await User.findOne({ email });
      const otp = 1234; // Generate OTP (Consider generating dynamically in production)
      const hashedPassword = await bcrypt.hash(password, 12);

      if (existingUser) {
        // If the user exists and is already verified
        if (existingUser.verify) {
          return res
            .status(400)
            .json({ message: 'Email already exists', status: false });
        }
        // If the user exists but is not verified, update their details and resend OTP
        await User.findOneAndUpdate(
          { email },
          {
            $set: {
              business_name,
              fullName,
              phoneNumber,
              whatsapp_number,
              address,
              city,
              state,
              zipCode,
              userType,
              about_desc,
              password: hashedPassword,
              image,
              otp
            },
          },
          { new: true } // Ensure the updated document is returned
        );

        await labtest.deleteMany({ lab_id: existingUser._id });

        if (tests != "") {
          tests_list = JSON.parse(tests);
          if (tests_list.length > 0) {
            for (let i = 0; i < tests_list.length; i++) {
              const test = tests_list[i];
              var lab = new labtest({
                lab_id: existingUser._id,
                name: tests_list[i].name,
                price: tests_list[i].price
              });
              await lab.save();

            }

          }
        }



        return res
          .status(200)
          .json({ message: 'OTP sent to your email', status: true });
      }

      // If the user does not exist, create a new user
      // const hashedPassword = await bcrypt.hash(password, 12); // Hash the password for security
      const newUser = new User({
        business_name,
        email,
        fullName,
        phoneNumber,
        whatsapp_number,
        address,
        city,
        state,
        zipCode,
        password: hashedPassword,
        userType,
        about_desc,
        image,
        otp
      });

      var user = await newUser.save();
      if (tests != "") {
        tests_list = JSON.parse(tests);
        if (tests_list.length > 0) {
          for (let i = 0; i < tests_list.length; i++) {
            const test = tests_list[i];
            var lab = new labtest({
              lab_id: newUser._id,
              name: tests_list[i].name,
              price: tests_list[i].price
            });
            await lab.save();

          }

        }
      }
      return res
        .status(200)
        .json({ message: 'OTP sent to your email', status: true });
    } catch (error) {
      console.error('Error during registration:', error);
      return res
        .status(500)
        .json({ message: 'Error registering user', status: false });
    }
  });
};


exports.register_pharmacy = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message, status: false });
    }

    const {
      email,
      fullName,
      business_name,
      phoneNumber,
      whatsapp_number,
      gender,
      address,
      city,
      state,
      zipCode,
      password,
      userType,
      about_desc,
    } = req.body;
    var otp = 1234;
    const image = req.file ? req.file.filename : null; // Get the uploaded image path

    try {
      const existingUser = await User.findOne({ email });
      const otp = 1234;

      if (existingUser) {
        if (existingUser.verify) {
          return res
            .status(400)
            .json({ message: 'Email already exists', status: false });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.findOneAndUpdate(
          { email },
          {
            $set: {
              fullName,
              otp,
              business_name,
              about_desc,
              phoneNumber,
              whatsapp_number,
              gender,
              address,
              city,
              state,
              zipCode,
              userType,
              password: hashedPassword,
              image,
              otp
            },
          },
          { new: true }
        );

        return res
          .status(200)
          .json({ message: 'OTP sent to your email', status: true });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        fullName,
        otp,
        business_name,
        about_desc,
        phoneNumber,
        whatsapp_number,
        gender,
        address,
        city,
        state,
        zipCode,
        userType,
        password: hashedPassword,
        image,
        otp
      });

      await newUser.save();

      return res
        .status(200)
        .json({ message: 'OTP sent to your email', status: true });
    } catch (error) {
      console.error('Error during registration:', error);
      return res
        .status(500)
        .json({ message: 'Error registering user', status: false });
    }
  });
};

exports.hbot_order = async (req, res) => {
  try {
    const { fullname, phone_number, address, city, state, zip_code, date, start_time, end_time } = req.body;
    // console.log(req.user)
    await order.create({
      user_id: req.user.userId,
      type: "HBOT",
      fullname,
      phone_number,
      address,
      city,
      state,
      zip_code,
      date: new Date(date),
      start_time,
      end_time
    });
    return res.status(200).json({
      message: 'Appointment Submit successfull',
      status: true,
    });


  } catch (error) {
    console.error('Error Submitting HBOT appointment:', error);
    res.status(500).json({
      message: 'Something went wrong',
      status: false,
    });
  }
}

exports.yoga_order = async (req, res) => {
  try {
    const { fullname, phone_number, address, city, state, zip_code } = req.body;
    // console.log(req.user)
    await order.create({
      user_id: req.user.userId,
      type: "YOGA",
      fullname,
      phone_number,
      address,
      city,
      state,
      zip_code,
    });
    return res.status(200).json({
      message: 'Query Submit successfull',
      status: true,
    });


  } catch (error) {
    console.error('Error Submitting HBOT appointment:', error);
    res.status(500).json({
      message: 'Something went wrong',
      status: false,
    });
  }
}

exports.lab_order = async (req, res) => {
  try {
    const { lab_id, test_id, fullname, phone_number, address, city, state, zip_code, date, start_time, end_time } = req.body;
    // console.log(req.user)
    await order.create({
      lab_id,
      test_id,
      user_id: req.user.userId,
      type: "LAB",
      fullname,
      phone_number,
      address,
      city,
      state,
      zip_code,
      date: new Date(date),
      start_time,
      end_time
    });
    // Fetch the lab's player ID (device_id) from the User table
    const labUser = await User.findById({ _id: lab_id });

    if (!labUser || !labUser.device_id) {
      return res.status(404).json({
        message: 'Lab user not found or device_id missing',
        status: false,
      });
    }

    const playerId = labUser.device_id; // Player ID for the lab's device
    console.log([playerId])
    const notificationMessage = `New Lab Appointment: ${fullname} has booked an appointment.`;
    const notificationTitle = "Lab Appointment Notification";
    const notificationData = {
      fullname,
      phone_number,
      address,
      city,
      state,
      zip_code,
      date,
      start_time,
      end_time,
    };

    sendNotification([playerId], notificationMessage, notificationTitle, notificationData);

    // Send notification to the lab using OneSignal
    // const notification = {
    //   app_id: "41e4de85-be9f-4f97-8458-c3278921f967",
    //   contents: {
    //     en: `New Lab Appointment: ${fullname} has booked an appointment.`,
    //   },
    //   headings: {
    //     en: "Lab Appointment Notification",
    //   },
    //   include_player_ids: ["0487e67b-106d-4289-915e-1a07cf936fba"], // Send notification to the lab's device
    // };

    // var abc = await oneSignalClient.createNotification(notification);
    // console.log(abc)

    return res.status(200).json({
      message: 'Lab Appointment Submit successfull',
      status: true,
    });


  } catch (error) {
    console.error('Error Submitting HBOT appointment:', error);
    res.status(500).json({
      message: 'Something went wrong',
      status: false,
    });
  }
}

const sendNotification = (playerIds, message, title, dataItem) => {
  const app_id = "41e4de85-be9f-4f97-8458-c3278921f967";
  const apiKey = "os_v2_app_ihsn5bn6t5hzpbcyymtysipzm5dqlpwrl4uuf6n3zn2qslnfkli4m73joqfp4azuq7y2wmwyn36s4qqoc246iwpdv4uqapmisekzshq";

  const notification = {
    app_id: app_id,
    contents: { en: message },
    headings: { en: title },
    data: dataItem,
    include_player_ids: playerIds,
    url: "https://example.com/lab-appointment-details", // Replace with the actual URL
    image: "https://example.com/logo.png", // Replace with your logo URL
  };

  const options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Basic ${apiKey}`
    }
  };

  const req = https.request(options, (res) => {
    res.on('data', (data) => {
      console.log("Notification Response:", JSON.parse(data.toString()));
    });
  });

  req.on('error', (e) => {
    console.error("Notification Error:", e);
  });

  req.write(JSON.stringify(notification));
  req.end();
};

exports.get_booked_appoinment = async (req, res) => {
  try {
    if (req.body.type === "LAB") {


      const bookedAppointments = await order.aggregate([
        {
          $match: {
            type: req.body.type,
            user_id: new mongoose.Types.ObjectId(req.user.userId)
          }, // Filter orders based on user_id and type
        },
        {
          $lookup: {
            from: "labtests", // Name of the 'test' collection
            let: { testIds: "$test_id" }, // Pass the test_id array to the pipeline
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$testIds"], // Match all test IDs in the array
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1, // Include only the fields you need from the 'tests' collection
                },
              },
            ],
            as: "test_details", // Alias for the joined test data
          },
        },
        {
          $lookup: {
            from: "users", // Name of the 'user' collection
            localField: "lab_id", // Field in the order collection
            foreignField: "_id", // Field in the user collection
            as: "lab_details", // Alias for the joined lab data
          },
        },
        {
          $unwind: "$lab_details"
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            type: 1,
            lab_id: 1,
            fullname: 1,
            phone_number: 1,
            address: 1,
            city: 1,
            state: 1,
            zip_code: 1,
            date: 1,
            start_time: 1,
            end_time: 1,
            createdAt: 1,
            updatedAt: 1,
            test_details: "$test_details",
            lab_details: {
              _id: 1,
              fullName: 1, // Include only the 'name' field from the lab/user
            },
          },
        },
      ]);

      return res.status(200).json({
        message: "Lab Appointment fetched successfully",
        status: true,
        data: bookedAppointments,
      });
    } else {
      const bookedAppointments = await order.find({ type: req.body.type, user_id: req.user.userId });

      return res.status(200).json({
        message: "HBOT Appointment fetched successfully",
        status: true,
        data: bookedAppointments,
      });
    }
  } catch (error) {
    console.error("Error fetching lab appointments:", error);
    res.status(500).json({
      message: "Something went wrong",
      status: false,
    });
  }
};
exports.get_lab_order = async (req, res) => {
  try {
    console.log(req.user.userId)
    const matchCondition = { lab_id: new mongoose.Types.ObjectId(req.user.userId) };

    const bookedAppointments = await order.aggregate([
      {
        $match: matchCondition, // Filter orders based on user_id and type
      },
      {
        $lookup: {
          from: "labtests", // Name of the 'test' collection
          let: { testIds: "$test_id" }, // Pass the test_id array to the pipeline
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$testIds"], // Match all test IDs in the array
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1, // Include only the fields you need from the 'tests' collection
              },
            },
          ],
          as: "test_details", // Alias for the joined test data
        },
      },
      {
        $lookup: {
          from: "users", // Name of the 'user' collection
          localField: "user_id", // Field in the order collection
          foreignField: "_id", // Field in the user collection
          as: "user_details", // Alias for the joined lab data
        },
      },
      {
        $unwind: "$user_details"
      },
      {
        $project: {
          _id: 1,
          user_id: 1,
          type: 1,
          lab_id: 1,
          fullname: 1,
          phone_number: 1,
          address: 1,
          city: 1,
          state: 1,
          zip_code: 1,
          date: 1,
          start_time: 1,
          end_time: 1,
          createdAt: 1,
          updatedAt: 1,
          test_details: "$test_details",
          user_details: {
            _id: 1,
            fullName: 1, // Include only the 'name' field from the lab/user
            phoneNumber: 1,
            address: 1,
            city: 1,
            state: 1
          },
        },
      },
    ]);

    return res.status(200).json({
      message: "Lab Appointment fetched successfully",
      status: true,
      data: bookedAppointments,
    });

  } catch (error) {
    console.error("Error fetching lab appointments:", error);
    res.status(500).json({
      message: "Something went wrong",
      status: false,
    });
  }
};



