const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, chatController.createOrFetchChat)
  .get(protect, chatController.getUserChats);

router.route('/group')
  .post(protect, chatController.createGroupChat);

router.route('/group/:id')
  .put(protect, chatController.updateGroupChat);

router.route('/:id')
  .delete(protect, chatController.deleteChat);
  
router.route('/:id')
  .get(protect, chatController.getChatById)

module.exports = router;