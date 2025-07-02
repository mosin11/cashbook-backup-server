const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
const backupRoutes = require('./routes/backupRoute');
// app.use('/api/backup', authMiddleware, backupRoutes);
app.use('/api/backup', backupRoutes);

// Optional: Friendly root route
app.get('/', (req, res) => {
    res.send('✅ CashBook Backup Server is running!');
});

// ✅ Use PORT from environment or fallback to 5000 or a random one
const DEFAULT_PORT = 5000;
const port = process.env.PORT || DEFAULT_PORT;

const server = app.listen(port, () => {
    console.log(`✅ Server running on port ${server.address().port}`);
});
