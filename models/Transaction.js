const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['cash_in', 'cash_out'], required: true },
  category: { type: String },
  date: { type: String },
  email: { type: String, required: true }
});

module.exports = mongoose.model('Transaction', transactionSchema);
