// controllers/quotationController.js
const Quotation = require('../models/Quotation');
const User = require('../models/User');
const Scheme = require('../models/Scheme');

// Create a new quotation
exports.createQuotation = async (req, res) => {
  try {
    const { client_id, scheme_id, total_fee, expiry_date, notes } = req.body;

    // Validate client exists
    const client = await User.findById(client_id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Validate scheme exists
    const scheme = await Scheme.findById(scheme_id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    const quotation = new Quotation({
      client_id,
      scheme_id,
      total_fee,
      expiry_date,
      notes
    });

    const savedQuotation = await quotation.save();
    res.status(201).json(savedQuotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all quotations
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .populate('client_id', 'name email phone')
      .populate('scheme_id', 'name description');
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single quotation by ID
exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('client_id', 'name email phone')
      .populate('scheme_id', 'name description');

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a quotation
exports.updateQuotation = async (req, res) => {
  try {
    const { client_id, scheme_id, total_fee, status, expiry_date, notes } = req.body;

    const updatedQuotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      {
        client_id,
        scheme_id,
        total_fee,
        status,
        expiry_date,
        notes,
        updated_at: Date.now()
      },
      { new: true }
    ).populate('client_id', 'name email phone')
     .populate('scheme_id', 'name description');

    if (!updatedQuotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    res.json(updatedQuotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a quotation
exports.deleteQuotation = async (req, res) => {
  try {
    const deletedQuotation = await Quotation.findByIdAndDelete(req.params.id);

    if (!deletedQuotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get quotations by client ID
exports.getQuotationsByClient = async (req, res) => {
  try {
    const quotations = await Quotation.find({ client_id: req.params.clientId })
      .populate('client_id', 'name email phone')
      .populate('scheme_id', 'name description');
      
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
