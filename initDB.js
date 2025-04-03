const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from parent directory
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Default local MongoDB URI if not specified
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/finsmart';

async function initDatabase() {
  try {
    console.log(`Connecting to MongoDB at: ${mongoURI}`);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });

    // Create collections
    const db = mongoose.connection.db;
    const collections = ['users', 'transactions', 'budgets', 'bills'];
    
    for (const collection of collections) {
      if (!(await db.listCollections({ name: collection }).hasNext())) {
        await db.createCollection(collection);
        console.log(`Created collection: ${collection}`);
      }
    }

    console.log('Database initialized successfully');
    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  }
}

initDatabase();