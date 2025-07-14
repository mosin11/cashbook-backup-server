const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');
const  {decryptData}  = require('../utils/decryptor');



// 🔹 Add new transaction

router.post('/add', async (req, res) => {
  logger.info('POST /api/transactions/add');

  logger.info('Raw body:',req.body);

  const payload = req.body.data;

  if (!payload || typeof payload !== 'object') {
    logger.error('Invalid payload structure');
    return res.status(400).json({ message: 'Missing or malformed payload.data' });
  }

  let data;
  try {
    data = decryptData(payload);
    logger.info('POST /api/transactions/add:data', data);
  } catch (err) {
    logger.error('Decryption failed: ' + err.message);
    return res.status(400).json({ message: 'Invalid encrypted data' });
  }

  const { id, amount, desc, type, date, email } = data;

  // 🔒 Validation
  if (!amount || !desc || !type || !email) {
    logger.warn('Missing required fields');
    return res.status(400).json({ message: 'Amount, desc, type, and email are required' });
  }
  if (isNaN(amount) || Number(amount) <= 0) {
    logger.warn('Invalid amount');
    return res.status(400).json({ message: 'Amount must be a positive number' });
  }
  if (!['in', 'out'].includes(type)) {
    logger.warn('Invalid type');
    return res.status(400).json({ message: 'Type must be either "in" or "out"' });
  }

  const transactionType = type === 'in' ? 'cash_in' : 'cash_out';

  try {
    const newTransaction = new Transaction({
      description: desc,
      amount,
      id,
      type: transactionType,
      date,
      email,
    });

    const saved = await newTransaction.save();
    logger.info(`✅ Transaction added | ID: ${saved.id} | Email: ${email}`);
    res.status(201).json(saved);
  } catch (error) {
    logger.error('Error saving transaction: ' + error.message);
    res.status(500).json({ message: 'Failed to save transaction' });
  }
});


// 🔹 Get all transactions by email
router.get('/getAllTransaction/:email', async (req, res) => {
  const { email } = req.params;
  logger.info(`➡️ GET /api/transactions/getAllTransaction/${email}`);

  if (!email) {
    logger.warn('Missing email parameter');
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const transactions = await Transaction.find({ email }).sort({ id: -1 });
    logger.info(`Found ${transactions.length} transactions for ${email}`);
    res.json(transactions);
  } catch (error) {
    logger.error('Error fetching transactions: ' + error.message);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// 🔹 Update transaction
router.put('/update', async (req, res) => {
  logger.info('PUT /api/transactions/update');
  const data = decryptData(req.body.data);
  const { id, amount, desc, type, date, email } = data;

  if (!id || !amount || !desc || !type || !email) {
    logger.warn('Missing fields for update');
    return res.status(400).json({ message: 'All fields are required for update' });
  }

  try {
    const updated = await Transaction.findOneAndUpdate(
      {id, email },
      {
        description: desc,
        amount,
        type: type === 'in' ? 'cash_in' : 'cash_out',
        date: date,
      },
      { new: true }
    );

    if (!updated) {
      logger.warn(`Transaction not found | ID: ${id}`);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    logger.info(`✅ Transaction updated | ID: ${updated._id}`);
    res.json(updated);
  } catch (error) {
    logger.error('Error updating transaction: ' + error.message);
    res.status(500).json({ message: 'Failed to update transaction' });
  }
});

// 🔹 Delete transaction

router.post('/delete', async (req, res) => {
  const data = decryptData(req.body.data);
  const { id, email } = data;

  logger.info(`POST /api/transactions/delete | ID: ${id} | Email: ${email}`);

  if (!id || !email) {
    return res.status(400).json({ message: 'Transaction ID and email are required' });
  }

  try {
    const deleted = await Transaction.findOneAndDelete({ id, email });

    if (!deleted) {
      logger.warn(`Transaction not found or unauthorized | ID: ${id}`);
      return res.status(404).json({ message: 'Transaction not found or not authorized' });
    }

    logger.info(`✅ Transaction deleted | ID: ${deleted._id}`);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    logger.error('Error deleting transaction: ' + error.message);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
});

module.exports = router;
