const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');
const cors = require('cors');
const logger = require('./utils/logger');
const mongoose = require('mongoose');
const transactionRoutes = require('./routes/transactionRoutes');
const mpinRoutes = require('./routes/mpinRoutes');
const backupRoutes = require('./routes/backupRoute');




const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
// Routes
app.use('/api/auth', authRoutes);

// app.use('/api/backup', authMiddleware, backupRoutes);
app.use('/api/backup', authMiddleware, backupRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/mpin', mpinRoutes);

// Optional: Friendly root route
app.get('/', (req, res) => {
    res.send('✅ CashBook Backup Server is running!');
});

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    logger.info('Connected to MongoDB');
}).catch((err) => {
    logger.error('MongoDB connection error: ' + err.message);
});

// ✅ Use PORT from environment or fallback to 5000 or a random on
const DEFAULT_PORT = 5000;
const port = process.env.PORT || DEFAULT_PORT;

const server = app.listen(port, () => {
    console.log(`✅ Server running on port ${server.address().port}`);
});
