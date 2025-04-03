const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['Utilities', 'Rent', 'Loan', 'Subscription', 'Insurance', 'Other'],
    default: 'Other'
  },
  paid: {
    type: Boolean,
    default: false
  },
  paymentMethod: String,
  reminderSent: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bill', BillSchema);