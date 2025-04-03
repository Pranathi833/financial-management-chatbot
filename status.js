const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'operational',
    services: {
      database: process.env.MONGO_URI ? 'configured' : 'down',
      email: process.env.EMAIL_USER ? 'ready' : 'not configured',
      sms: process.env.TWILIO_ACCOUNT_SID ? 'ready' : 'not configured'
    },
    version: '1.0.0'
  });
});

module.exports = router;