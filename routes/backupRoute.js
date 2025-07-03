const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const getBackupEmailTemplate = require('../emailTemplates/backupEmailTemplate');
const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024 * 1024// 10MB
    }
});
const router = express.Router();
const BackupSchema = require('../models/BackupSchema');
require('dotenv').config(); // ⬅️ Load .env variables
const logger = require('../utils/logger'); // ⬅️ Import logger utility

router.post('/', upload.single('pdf'), async (req, res) => {
    logger.info('entering backup route');

    const { email } = req.body;
    const { subject, text, html } = getBackupEmailTemplate(email);
    let backupData;
    try {
        backupData = JSON.parse(req.body.backupData);
    } catch (err) {
        logger.error('❌ Invalid JSON in backupData');
        return res.status(400).json({ message: 'Invalid backup data format' });
    }

    if (!email || !req.file) {
        logger.info('❌ Missing email or PDF file');
        return res.status(400).json({ message: 'Email and PDF attachment are required' });
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
            subject,
            text,
            html,
            attachments: [
                {
                    filename: 'Cashbook_Report.pdf',
                    content: req.file.buffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        logger.info(`✅ Backup PDF sent to ${email}`);
        const BackupObj = new BackupSchema({
            email,
            backup: backupData
        });
        await BackupObj.save();
        logger.info('data saved to database');
        res.status(200).json({ message: 'Backup sent to email successfully.' });
    } catch (error) {

        logger.error('Backup error:' + error.message);
        res.status(500).json({ message: 'Failed to send backup email.' });
    }
});

router.get('/history/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const backups = await BackupSchema.find({ email }).sort({ date: -1 });
        logger.info(`Fetched backups for ${email}: ${backups.length} records found`);
        res.json(backups);
    } catch (err) {
        logger.error('Failed to fetch backups' + err.message);
        res.status(500).json({ message: 'Failed to fetch backups' });
    }
});


module.exports = router;
