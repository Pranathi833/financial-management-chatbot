const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const ChatSession = require('../models/ChatSession');
const { analyzeQuery } = require('../services/nlpService');

// @route   POST api/chat
// @desc    Process user message and get AI response
// @access  Private
router.post(
  '/',
  [
    protect,
    [
      check('message', 'Message is required').not().isEmpty(),
      check('sessionId', 'Session ID is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, sessionId } = req.body;

    try {
      // Get or create chat session
      let session = await ChatSession.findOne({ 
        _id: sessionId,
        user: req.user.id 
      });

      if (!session) {
        session = new ChatSession({
          user: req.user.id,
          title: 'New Chat',
          messages: []
        });
      }

      // Add user message to session
      session.messages.push({
        role: 'user',
        content: message
      });

      // Process message with NLP
      const aiResponse = await analyzeQuery(message, req.user.id);

      // Add AI response to session
      session.messages.push({
        role: 'assistant',
        content: aiResponse
      });

      await session.save();

      res.json({
        response: aiResponse,
        sessionId: session._id,
        messages: session.messages
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/chat/sessions
// @desc    Get all chat sessions
// @access  Private
router.get('/sessions', protect, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .select('_id title updatedAt');
    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/chat/sessions/:id
// @desc    Get chat session by ID
// @access  Private
router.get('/sessions/:id', protect, async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;