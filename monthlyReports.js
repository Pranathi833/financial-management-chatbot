const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { sendEmail } = require('../services/emailService');
const { format } = require('date-fns');

async function generateMonthlyReports() {
  try {
    const users = await User.find();
    const currentMonth = format(new Date(), 'yyyy-MM');
    
    for (const user of users) {
      // Get monthly transactions
      const transactions = await Transaction.find({
        user: user._id,
        date: {
          $gte: new Date(`${currentMonth}-01`),
          $lt: new Date(`${currentMonth}-31`)
        }
      }).sort({ date: -1 });

      // Calculate totals
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Generate report
      const report = {
        month: currentMonth,
        income,
        expenses,
        savings: income - expenses,
        transactionCount: transactions.length
      };

      // Send email (implementation depends on your email service)
      await sendEmail({
        to: user.email,
        subject: `Your Monthly Financial Report - ${currentMonth}`,
        text: `Monthly Financial Report\n\n` +
              `Income: $${income.toFixed(2)}\n` +
              `Expenses: $${expenses.toFixed(2)}\n` +
              `Savings: $${report.savings.toFixed(2)}\n` +
              `Transactions: ${report.transactionCount}`
      });
    }

    console.log(`Monthly reports generated for ${users.length} users`);
  } catch (err) {
    console.error('Error generating monthly reports:', err);
  }
}

module.exports = generateMonthlyReports;