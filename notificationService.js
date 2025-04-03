const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Initialize Twilio if credentials exist
let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  if (!process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    console.warn('Invalid Twilio Account SID format - must start with "AC"');
  } else {
    const twilio = require('twilio');
    twilioClient = new twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('Twilio SMS service initialized');
  }
}

// Email transporter configuration
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send email notification
 */
async function sendEmail({ to, subject, text, html }) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html
    };
    await emailTransporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
}

/**
 * Send SMS notification
 */
async function sendSMS(to, body) {
  if (!twilioClient) {
    console.warn('SMS not sent - Twilio not configured');
    return false;
  }

  try {
    await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    return true;
  } catch (err) {
    console.error('SMS send error:', err);
    return false;
  }
}

/**
 * Send push notification
 */
async function sendPushNotification(deviceToken, message) {
  // Implementation depends on your push service
  console.log(`Push notification to ${deviceToken}: ${message}`);
  return true;
}

module.exports = {
  sendEmail,
  sendSMS,
  sendPushNotification
};