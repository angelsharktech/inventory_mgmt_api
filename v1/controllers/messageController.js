const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User'); 

// @desc    Send new message
// @route   POST /api/v1/messages
exports.sendMessage = async (req, res) => {
  const { content, chatId, attachments } = req.body;

  if (!content && (!attachments || attachments.length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Message content or attachment is required'
    });
  }

  try {
    let message = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId,
      attachments
    });

    message = await message.populate('sender', 'name email');
    message = await message.populate('chat');
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'name email'
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all messages for a chat
// @route   GET /api/v1/messages/:chatId
// Updated getMessages function
exports.getMessages = async (req, res) => {
  try {
    console.log("Fetching messages for chat:", req.params.chatId); // Debug log
    
    const messages = await Message.find({ chat: req.params.chatId })
      .populate({
        path: 'sender',
        select: 'name email'
      })
      .populate({
        path: 'chat',
        populate: {
          path: 'users',
          select: 'name email'
        }
      })
      .sort({ createdAt: 1 });

    console.log("Found messages:", messages.length); // Debug log

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update message status
// @route   PATCH /api/v1/messages/:id/status
exports.updateMessageStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        $addToSet: { readBy: req.user._id }
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/v1/messages/:id
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};