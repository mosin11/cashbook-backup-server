const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

// 🔹 Add new transaction
router.post('/add', async (req, res) => {
  logger.info('POST /api/transactions/add');

  const { id, amount, desc, type, date, email } = req.body;

  // 🛡️ Validation
  if (!amount || !desc || !type || !email) {
    logger.warn(' Missing required fields');
    return res.status(400).json({
      message: 'Amount, desc, type, and email are required',
    });
  }

  if (isNaN(amount) || Number(amount) <= 0) {
    logger.warn(' Invalid amount');
    return res.status(400).json({ message: 'Amount must be a positive number' });
  }

  if (!['in', 'out'].includes(type)) {
    logger.warn(' Invalid type');
    return res.status(400).json({ message: 'Type must be either "in" or "out"' });
  }

  // 🧠 Transform type
  const transactionType = type === 'in' ? 'cash_in' : 'cash_out';

  // 🕒 Parse date
  let parsedDate = new Date();
  if (date) {
    const [dd, mm, yyyyAndTime] = date.split('-');
    const [yyyy, hhmm] = yyyyAndTime.split(' ');
    parsedDate = new Date(`${yyyy}-${mm}-${dd}T${hhmm}:00`);
  }

  try {
    const newTransaction = new Transaction({
      description: desc,
      amount,
      type: transactionType,
      date: parsedDate,
      email,
    });

    const saved = await newTransaction.save();
    logger.info(`✅ Transaction added | ID: ${saved._id} | Email: ${email}`);
    res.status(201).json(saved);
  } catch (error) {
    logger.error(' Error saving transaction: ' + error.message);
    res.status(500).json({ message: 'Failed to save transaction' });
  }
});

// 🔹 Get all transactions by email
router.get('/getAllTransaction/:email', async (req, res) => {
  const { email } = req.params;
  logger.info(`➡️ GET /api/transactions/getAllTransaction/${email}`);

  if (!email) {
    logger.warn(' Missing email parameter');
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const transactions = await Transaction.find({ email }).sort({ date: -1 });
    logger.info(` Found ${transactions.length} transactions for ${email}`);
    res.json(transactions);
  } catch (error) {
    logger.error(' Error fetching transactions: ' + error.message);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

module.exports = router;
