const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const { use } = require('../routes/authRoutes');
const labtest = require('../models/labtest');


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
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
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
    const user = await User.findOne({ email });

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
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
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

        if(tests != ""){
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
      if(tests != ""){
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

