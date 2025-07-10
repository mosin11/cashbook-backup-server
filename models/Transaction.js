const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['cash_in', 'cash_out'], required: true },
  category: { type: String },
  date: { type: Date, default: Date.now },
  email: { type: String, required: true }
});

module.exports = mongoose.model('Transaction', transactionSchema);
