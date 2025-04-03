const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// @route   GET api/finance/transactions
// @desc    Get all transactions
// @access  Private
router.get('/transactions', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/finance/transactions
// @desc    Add new transaction
// @access  Private
router.post(
  '/transactions',
  [
    protect,
    [
      check('amount', 'Amount is required').not().isEmpty(),
      check('category', 'Category is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, description, category, type } = req.body;

    try {
      const newTransaction = new Transaction({
        user: req.user.id,
        amount,
        description,
        category,
        type
      });

      const transaction = await newTransaction.save();
      res.json(transaction);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/finance/budgets
// @desc    Get all budgets
// @access  Private
router.get('/budgets', protect, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.json(budgets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/finance/budgets
// @desc    Add new budget
// @access  Private
router.post(
  '/budgets',
  [
    protect,
    [
      check('category', 'Category is required').not().isEmpty(),
      check('amount', 'Amount is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, amount } = req.body;

    try {
      const newBudget = new Budget({
        user: req.user.id,
        category,
        amount
      });

      const budget = await newBudget.save();
      res.json(budget);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;