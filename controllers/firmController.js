const Firm = require('../models/Firm');

// Create firm
exports.createFirm = async (req, res) => {
  try {
    const { name } = req.body;
    const firm = new Firm({ name });
    await firm.save();
    res.status(201).json(firm);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Get all firms
exports.getFirms = async (req, res) => {
  try {
    const firms = await Firm.find();
    res.status(200).json(firms);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Get firm by ID
exports.getFirmById = async (req, res) => {
  try {
    const firm = await Firm.findById(req.params.id);
    if (!firm) {
      return res.status(404).send('Firm not found');
    }
    res.status(200).json(firm);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Update firm
exports.updateFirm = async (req, res) => {
  try {
    const { name } = req.body;
    const firm = await Firm.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );
    
    if (!firm) {
      return res.status(404).send('Firm not found');
    }
    
    res.status(200).json(firm);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Delete firm
exports.deleteFirm = async (req, res) => {
  try {
    const firm = await Firm.findByIdAndDelete(req.params.id);
    
    if (!firm) {
      return res.status(404).send('Firm not found');
    }
    
    res.status(200).json({ message: 'Firm deleted successfully' });
  } catch (error) {
    res.status(500).send(error.message);
  }
};