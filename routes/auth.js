const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const logger = require('../utils/logger'); // ✅ logger import
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'fallback_secret_m!2w';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// 🔸 Register Step 1: Send OTP
// 🔸 Register Step 1: Send OTP
router.post('/register/send-otp', async (req, res) => {
  try {
    const { email, name, mobile } = req.body;
    logger.info(`Register OTP request for: ${email}`);

    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      logger.warn(`Register: Already verified user attempted again: ${email}`);
      return res.status(400).json({ message: 'Email already registered' });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    logger.info(`OTP generated: ${otp}, expires at: ${otpExpiry}`);

    if (existingUser) {
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      existingUser.name = name || existingUser.name;
      existingUser.mobile = mobile || existingUser.mobile;
      await existingUser.save();
    } else {
      await User.create({ email, name, mobile, otp, otpExpiry });
    }

    await sendEmail(email, 'OTP Verification - Register', `Your OTP is: ${otp}`);
    logger.info(`OTP sent to: ${email}`);
    res.json({ message: 'OTP sent to email' });

  } catch (err) {
    logger.error(`Register OTP Error: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});


// 🔸 Register Step 2: Verify OTP

router.post('/register/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    logger.info(`Verifying registration OTP for: ${email}`);

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry.getTime() < Date.now()) {
      logger.warn(`Invalid or expired OTP for: ${email}`);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    logger.info(`Registration complete for: ${email}`);
    res.json({ message: 'Registration complete' });

  } catch (err) {
    logger.error(`Register Verify Error: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});


// 🔹 Login Step 1: Send OTP
router.post('/login/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    logger.info(`Login OTP request for: ${email}`);

    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      logger.warn(`Login attempt for unregistered or unverified user: ${email}`);
      return res.status(404).json({ message: 'User not registered or verified' });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendEmail(email, 'OTP Verification - Login', `Your OTP is: ${otp}`);
    logger.info(`Login OTP sent to: ${email}`);
    res.json({ message: 'OTP sent to email' });

  } catch (err) {
    logger.error(`Login OTP Error: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔹 Login Step 2: Verify OTP
router.post('/login/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    logger.info(`Verifying login OTP for: ${email}`);

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry.getTime() < Date.now()) {
      logger.warn(`Invalid login OTP for: ${email}`);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign({ email: user.email }, SECRET, { expiresIn: '1h' });
    logger.info(`Login successful for: ${email}`);
    res.json({ token });

  } catch (err) {
    logger.error(`Login Verify Error: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
