const Position = require('../models/Position');

// Create Position
exports.createPosition = async (req, res) => {
  try {
    const { name } = req.body;
    const position = new Position({ name });
    await position.save();
    res.status(201).json(position);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Positions
exports.getPositions = async (req, res) => {
  try {
    const positions = await Position.find();
    res.status(200).json(positions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Position by ID
exports.getPositionById = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    res.status(200).json(position);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Position
exports.updatePosition = async (req, res) => {
  try {
    const { name } = req.body;
    const position = await Position.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );
    
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.status(200).json(position);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Position
exports.deletePosition = async (req, res) => {
  try {
    const position = await Position.findByIdAndDelete(req.params.id);
    
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.status(200).json({ message: 'Position deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};