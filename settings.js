const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/settings
// @desc    Get user settings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings devices');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/settings/notifications
// @desc    Update notification preferences
// @access  Private
router.put('/notifications', protect, async (req, res) => {
  try {
    const { settings } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { settings } },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/settings/device
// @desc    Register device for push notifications
// @access  Private
router.post('/device', protect, async (req, res) => {
  try {
    const { token, platform } = req.body;
    
    // Remove existing device if same token exists
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { devices: { token } } }
    );

    // Add new device
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $push: { 
          devices: { 
            token, 
            platform,
            lastActive: new Date() 
          } 
        },
        pushToken: token
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/settings/device/:token
// @desc    Remove registered device
// @access  Private
router.delete('/device/:token', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $pull: { devices: { token: req.params.token } },
        $unset: { pushToken: 1 }
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;