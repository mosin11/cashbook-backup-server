const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
    email: { type: String, required: true },
    date: { type: Date, default: Date.now },
    backup: [mongoose.Schema.Types.Mixed] // Can hold array of transactions
});

module.exports = mongoose.model('backupSchema', backupSchema);
