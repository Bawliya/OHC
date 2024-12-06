const express = require('express');
const { login, verifyOtp, register,register_lab,register_pharmacy } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/register_lab', register_lab);
router.post('/register_pharmacy', register_pharmacy);

module.exports = router;
