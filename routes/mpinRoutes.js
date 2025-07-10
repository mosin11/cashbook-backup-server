const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware'); // must decode JWT
const router = express.Router();

// Set MPIN (once after login)
router.post('/set', authMiddleware, async (req, res) => {
  const { mpin } = req.body;

  if (!mpin || mpin.length !== 4) {
    return res.status(400).json({ message: 'MPIN must be 4 digits' });
  }

  try {
    const hashed = await bcrypt.hash(mpin, 10);
    await User.findOneAndUpdate({ email: req.user.email }, { mpin: hashed });
    res.json({ message: 'MPIN set successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to set MPIN' });
  }
});

// Verify MPIN login
router.post('/verify', async (req, res) => {
  const { email, mpin } = req.body;

  if (!email || !mpin) {
    return res.status(400).json({ message: 'Email and MPIN are required' });
  }

  const user = await User.findOne({ email });
  if (!user || !user.mpin) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(mpin, user.mpin);
  if (!isMatch) {
    return res.status(401).json({ message: 'Incorrect MPIN' });
  }

  // Issue token for session
  
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({
  token,
  userName: user.name
});
});

module.exports = router;
