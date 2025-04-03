const { sendPushNotification } = require('../services/notificationService');
const Bill = require('../models/Bill');
const User = require('../models/User');
const schedule = require('node-schedule');

// Run daily at 8 AM
const billReminderJob = schedule.scheduleJob('0 8 * * *', async () => {
  try {
    console.log('Running bill reminder job...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const bills = await Bill.find({ 
      dueDate: { $lte: tomorrow },
      paid: false,
      reminderSent: { $ne: true }
    }).populate('user');

    for (const bill of bills) {
      try {
        if (bill.user.settings.billReminders) {
          // Send push notification
          if (bill.user.pushToken) {
            await sendPushNotification(
              bill.user,
              'Upcoming Bill',
              `${bill.name} for ${bill.amount.toFixed(2)} is due soon`
            );
          }

          // Mark reminder as sent
          bill.reminderSent = true;
          await bill.save();

          console.log(`Sent reminder for ${bill.name} to ${bill.user.email}`);
        }
      } catch (err) {
        console.error(`Failed to send reminder for bill ${bill.id}:`, err);
      }
    }
  } catch (err) {
    console.error('Bill reminder job failed:', err);
  }
});

module.exports = billReminderJob;