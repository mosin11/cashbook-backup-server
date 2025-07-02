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
//app.use('/api/backup', authMiddleware, backupRoutes);
app.use('/api/backup', backupRoutes);


// TODO: Apply authMiddleware to backup route
// app.post('/api/backup', authMiddleware, ...)

app.listen(5000, () => console.log('Server started on port 5000'));
