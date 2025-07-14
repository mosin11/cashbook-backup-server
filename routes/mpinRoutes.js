const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Set MPIN (once after login)
router.post('/set', authMiddleware, async (req, res) => {
  const { mpin } = req.body;

  if (!mpin || mpin.length !== 4 || !/^\d{4}$/.test(mpin)) {
    logger.warn(`Invalid MPIN format by user ${req.user?.email}`);
    return res.status(400).json({ message: 'MPIN must be 4 numeric digits' });
  }

  try {
    const hashed = await bcrypt.hash(mpin, 10);
    await User.findOneAndUpdate({ email: req.user.email }, { mpin: hashed });
    logger.info(`MPIN set for user: ${req.user.email}`);
    res.json({ message: 'MPIN set successfully' });
  } catch (err) {
    logger.error(`Failed to set MPIN for user ${req.user.email}: ${err.message}`);
    res.status(500).json({ message: 'Failed to set MPIN' });
  }
});

// Verify MPIN login
router.post('/verify', async (req, res) => {
  const { email, mpin } = req.body;

  if (!email || !mpin) {
    logger.warn('MPIN verification attempt with missing fields');
    return res.status(400).json({ message: 'Email and MPIN are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !user.mpin) {
      logger.warn(`MPIN verification failed: No MPIN set for ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(mpin, user.mpin);
    if (!isMatch) {
      logger.warn(`Incorrect MPIN attempt for user ${email}`);
      return res.status(401).json({ message: 'Incorrect MPIN' });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    logger.info(`MPIN verified, token issued for user ${email}`);
    res.json({ token, userName: user.name });
  } catch (err) {
    logger.error(`MPIN verification error for user ${email}: ${err.message}`);
    res.status(500).json({ message: 'Failed to verify MPIN' });
  }
});

module.exports = router;
