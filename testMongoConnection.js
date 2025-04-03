const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('Successfully connected to MongoDB Atlas');
    process.exit(0);
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
}

testConnection();