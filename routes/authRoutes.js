const express = require('express');
const { sendOtp, verifyOtp, register } = require('../controllers/authController');

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);

module.exports = router;
