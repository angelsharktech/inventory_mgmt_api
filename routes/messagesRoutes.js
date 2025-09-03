const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, messageController.sendMessage);

router.route('/:chatId')
  .get(protect, messageController.getMessages);

router.route('/:id/status')
  .patch(protect, messageController.updateMessageStatus);

router.route('/:id')
  .delete(protect, messageController.deleteMessage);

module.exports = router;