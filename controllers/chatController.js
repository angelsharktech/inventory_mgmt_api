const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose')

// @desc    Create or fetch one-to-one chat
// @route   POST /api/v1/chats
exports.createOrFetchChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'UserId param not sent with request'
    });
  }

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } }
      ]
    })
    .populate('users', '-password')
    .populate('latestMessage');

    isChat = await User.populate(isChat, {
      path: 'latestMessage.sender',
      select: 'name email'
    });

    if (isChat.length > 0) {
      return res.status(200).json({
        success: true,
        data: isChat[0]
      });
    } else {
      const chatData = {
        chatName: 'sender',
        isGroupChat: false,
        users: [req.user._id, userId]
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id })
        .populate('users', '-password');

      res.status(201).json({
        success: true,
        data: fullChat
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create group chat
// @route   POST /api/v1/chats/group
exports.createGroupChat = async (req, res) => {
  const { users, chatName } = req.body;

  if (!users || !chatName) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all the fields'
    });
  }

  if (users.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'More than 2 users are required to form a group chat'
    });
  }

  try {
    users.push(req.user._id);

    const groupChat = await Chat.create({
      chatName,
      users,
      isGroupChat: true,
      groupAdmin: req.user._id
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(201).json({
      success: true,
      data: fullGroupChat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all chats for a user
// @route   GET /api/v1/chats
exports.getUserChats = async (req, res) => {
  try {
    let chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: 'latestMessage.sender',
      select: 'name email'
    });

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};



// @desc    Get chat by ID with full details
// @route   GET /api/v1/chats/:id
exports.getChatById = async (req, res) => {
  try {
    // Validate chat ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat ID format'
      });
    }

    // Find the chat and populate all necessary fields
    const chat = await Chat.findOne({
      _id: req.params.id,
      users: { $elemMatch: { $eq: req.user._id } // Ensure user is part of chat
    }})
      .populate({
        path: 'users',
        select: '-password -__v -createdAt -updatedAt' // Exclude sensitive fields
      })
      .populate({
        path: 'groupAdmin',
        select: 'name email avatar'
      })
      .populate({
        path: 'latestMessage',
        populate: {
          path: 'sender',
          select: 'name email avatar'
        }
      })
      .lean(); // Convert to plain JavaScript object

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or you are not a participant'
      });
    }

    // Get all messages for this chat (paginated would be better for production)
    const messages = await Message.find({ chat: chat._id })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 }) // Newest first
      .limit(50); // Limit to 50 most recent messages

    // Prepare the response object
    const chatDetails = {
      ...chat,
      messages,
      participantsCount: chat.users.length
    };

    res.status(200).json({
      success: true,
      data: chatDetails
    });
  } catch (error) {
    console.error('Error fetching chat details:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update group chat name
// @route   PUT /api/v1/chats/group/:id
exports.updateGroupChat = async (req, res) => {
  const { chatName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      req.params.id,
      { chatName },
      { new: true }
    )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

    if (!updatedChat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedChat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete chat
// @route   DELETE /api/v1/chats/:id
exports.deleteChat = async (req, res) => {
  try {
    const deletedChat = await Chat.findByIdAndDelete(req.params.id);

    if (!deletedChat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Delete all messages in this chat
    await Message.deleteMany({ chat: req.params.id });

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