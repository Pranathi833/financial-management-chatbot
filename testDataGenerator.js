const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');

async function generateTestData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Find or create test user
    let user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      user = await User.create({
        email: 'test@example.com',
        password: '$2a$10$examplehashedpassword',
        name: 'Test User'
      });
    }
    
    // Clear existing test data
    await Transaction.deleteMany({ user: user._id });
    await Budget.deleteMany({ user: user._id });

    // Sample transactions
    const transactions = [
      { 
        amount: 1500, 
        type: 'income', 
        category: 'Salary', 
        description: 'Monthly salary deposit',
        date: new Date(), 
        user: user._id 
      },
      { 
        amount: 45.99, 
        type: 'expense', 
        category: 'Groceries', 
        description: 'Weekly grocery shopping',
        date: new Date(), 
        user: user._id 
      },
      { 
        amount: 120, 
        type: 'expense', 
        category: 'Utilities', 
        description: 'Electricity bill payment',
        date: new Date(), 
        user: user._id 
      }
    ];
    await Transaction.insertMany(transactions);

    // Sample budgets
    const budgets = [
      { category: 'Groceries', amount: 500, month: new Date().getMonth()+1, user: user._id },
      { category: 'Entertainment', amount: 200, month: new Date().getMonth()+1, user: user._id }
    ];
    await Budget.insertMany(budgets);

    console.log('Test data generated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error generating test data:', err);
    process.exit(1);
  }
}

generateTestData();