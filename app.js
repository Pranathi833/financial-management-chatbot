require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const financeRoutes = require('./routes/finance');
const statusRoutes = require('./routes/status');
const chatRoutes = require('./routes/chat');
const plaidRoutes = require('./routes/plaid');
// const insightsRoutes = require('./routes/insights');
// const billsRoutes = require('./routes/bills');
const settingsRoutes = require('./routes/settings');
const connectDB = require('./config/db');

const app = express();

// Database connection
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/plaid', plaidRoutes);
// app.use('/api/insights', insightsRoutes);
// app.use('/api/bills', billsRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Initialize scheduled jobs
require('./jobs/monthlyReports');
require('./jobs/weeklyDigests');
require('./jobs/billReminders');
require('./jobs/deviceCleanup');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});