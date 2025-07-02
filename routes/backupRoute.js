const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const BackupSchema = require('../models/BackupSchema');
require('dotenv').config(); // ⬅️ Load .env variables

router.post('/', async (req, res) => {
    const { backupData, email } = req.body;

    if (!backupData || !email) {
        return res.status(400).json({ message: 'Backup data and email are required' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email, // <-- use provided email directly
            subject: 'Your CashBook Backup',
            text: 'Attached is your backup JSON from CashBook App.',
            attachments: [
                {
                    filename: 'cashbook_backup.json',
                    content: JSON.stringify(backupData, null, 2),
                    contentType: 'application/json'
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        const BackupObj = new BackupSchema({
            email,
            backup: backupData
        });
        await BackupObj.save();
        res.status(200).json({ message: 'Backup sent to email successfully.' });
    } catch (error) {
        console.error('Backup error:', error);
        res.status(500).json({ message: 'Failed to send backup email.' });
    }
});

router.get('/history/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const backups = await BackupSchema.find({ email }).sort({ date: -1 });
        res.json(backups);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch backups' });
    }
});


module.exports = router;
