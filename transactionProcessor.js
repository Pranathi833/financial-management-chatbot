const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const User = require('../models/User');

const processTransactions = async (userId) => {
  try {
    const transactions = await Transaction.find({ user: userId });
    const budgets = await Budget.find({ user: userId });
    const user = await User.findById(userId);

    // Calculate spending by category
    const spending = transactions.reduce((acc, tx) => {
      if (tx.type === 'expense') {
        acc[tx.category] = (acc[tx.category] || 0) + Math.abs(tx.amount);
      }
      return acc;
    }, {});

    // Generate budget insights
    const budgetInsights = budgets.map(budget => {
      const spent = spending[budget.category] || 0;
      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;

      return {
        category: budget.category,
        budget: budget.amount,
        spent,
        remaining,
        percentage,
        status: percentage > 100 ? 'over' : percentage > 80 ? 'near' : 'under'
      };
    });

    // Calculate monthly trends
    const monthlyTrends = transactions.reduce((acc, tx) => {
      const month = new Date(tx.date).toISOString().slice(0, 7);
      if (!acc[month]) acc[month] = { income: 0, expense: 0, savings: 0 };
      if (tx.type === 'income') acc[month].income += tx.amount;
      else acc[month].expense += Math.abs(tx.amount);
      acc[month].savings = acc[month].income - acc[month].expense;
      return acc;
    }, {});

    // Update user's financial summary
    user.financialSummary = {
      netWorth: Object.values(monthlyTrends).reduce((sum, month) => sum + month.savings, 0),
      monthlyTrends,
      budgetInsights,
      lastUpdated: new Date()
    };

    await user.save();
    return user.financialSummary;
  } catch (err) {
    console.error('Transaction processing error:', err);
    throw err;
  }
};

module.exports = { processTransactions };