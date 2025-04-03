const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email service function
const sendEmail = async ({to, subject, text, html}) => {
  try {
    const mailOptions = {
      from: `FinSmart <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = { sendEmail };