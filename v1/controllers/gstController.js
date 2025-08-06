const GST = require('../models/GST');
const User = require('../models/User');

// Register GST for a user
exports.registerGST = async (req, res) => {
  try {
    const { userId } = req.params;
    const gstData = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create GST record
    const gst = new GST({
      ...gstData,
      user_id: userId
    });

    await gst.save();

    // Update user's GST status
    user.gstRegistered = true;
    user.gst_id = gst._id;
    await user.save();

    res.status(201).json(gst);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get GST details by user ID
exports.getGSTByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const gst = await GST.findOne({ user_id: userId });

    if (!gst) {
      return res.status(404).json({ error: 'GST record not found' });
    }

    res.status(200).json(gst);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update GST details
exports.updateGST = async (req, res) => {
  try {
    const { gstId } = req.params;
    const updates = req.body;

    const gst = await GST.findByIdAndUpdate(
      gstId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!gst) {
      return res.status(404).json({ error: 'GST record not found' });
    }

    res.status(200).json(gst);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Upload GST document
exports.uploadDocument = async (req, res) => {
  try {
    const { gstId } = req.params;
    const { name, url } = req.body;

    const gst = await GST.findByIdAndUpdate(
      gstId,
      { $push: { documents: { name, url } } },
      { new: true }
    );

    if (!gst) {
      return res.status(404).json({ error: 'GST record not found' });
    }

    res.status(200).json(gst);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete GST record
exports.deleteGST = async (req, res) => {
  try {
    const { gstId, userId } = req.params;

    // Delete GST record
    await GST.findByIdAndDelete(gstId);

    // Update user's GST status
    await User.findByIdAndUpdate(userId, {
      gstRegistered: false,
      gst_id: null
    });

    res.status(200).json({ message: 'GST record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};