const User = require('../models/User');
const { subDays } = require('date-fns');

async function cleanupInactiveDevices() {
  try {
    const inactiveThreshold = subDays(new Date(), 90); // 90 days inactive
    const result = await User.updateMany(
      {},
      {
        $pull: {
          devices: {
            lastActive: { $lt: inactiveThreshold }
          }
        }
      }
    );
    
    console.log(`Cleaned up inactive devices from ${result.modifiedCount} users`);
    return result.modifiedCount;
  } catch (err) {
    console.error('Device cleanup error:', err);
    throw err;
  }
}

// Run weekly
setInterval(cleanupInactiveDevices, 7 * 24 * 60 * 60 * 1000);

module.exports = cleanupInactiveDevices;