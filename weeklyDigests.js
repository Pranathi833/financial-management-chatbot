const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { sendEmail } = require('../services/emailService');
const { format, subDays } = require('date-fns');

async function sendWeeklyDigests() {
  try {
    const users = await User.find();
    const weekStart = subDays(new Date(), 7);
    
    for (const user of users) {
      // Get weekly transactions
      const transactions = await Transaction.find({
        user: user._id,
        date: { $gte: weekStart }
      }).sort({ date: -1 }).limit(50);

      // Calculate weekly totals
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Prepare digest content
      const digest = {
        weekStart: format(weekStart, 'MMM d, yyyy'),
        transactionCount: transactions.length,
        income,
        expenses,
        net: income - expenses,
        recentTransactions: transactions.slice(0, 5)
      };

      // Send email
      await sendEmail({
        to: user.email,
        subject: `Your Weekly Financial Digest - ${format(new Date(), 'MMM d, yyyy')}`,
        text: `Weekly Financial Digest\n\n` +
              `Period: ${digest.weekStart} to ${format(new Date(), 'MMM d, yyyy')}\n` +
              `Transactions: ${digest.transactionCount}\n` +
              `Income: $${digest.income.toFixed(2)}\n` +
              `Expenses: $${digest.expenses.toFixed(2)}\n` +
              `Net: $${digest.net.toFixed(2)}`
      });
    }

    console.log(`Weekly digests sent to ${users.length} users`);
  } catch (err) {
    console.error('Error sending weekly digests:', err);
  }
}

module.exports = sendWeeklyDigests;