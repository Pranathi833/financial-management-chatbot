const mongoose = require('mongoose');

const BankAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plaidItemId: {
    type: String,
    required: true,
    unique: true
  },
  plaidAccessToken: {
    type: String,
    required: true
  },
  institutionName: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: ['checking', 'savings', 'credit', 'loan', 'investment'],
    required: true
  },
  accountId: {
    type: String,
    required: true
  },
  lastSynced: {
    type: Date
  },
  balance: {
    current: Number,
    available: Number,
    limit: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('BankAccount', BankAccountSchema);