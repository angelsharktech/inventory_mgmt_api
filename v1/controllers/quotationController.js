// controllers/quotationController.js
const Quotation = require('../models/Quotation');
const User = require('../models/User');
const Scheme = require('../models/Scheme');

// Create a new quotation
exports.createQuotation = async (req, res) => {
  try {
    const {
      quotationNo,
      customer,
      status,
      products,
      organization_id,
      // taxPercent,
      createdBy
    } = req.body;

    // Basic validation
    if (!customer || !customer.name) {
      return res.status(400).json({ message: "Customer name is required" });
    }
    if (!products || products.length === 0) {
      return res.status(400).json({ message: "At least one product is required" });
    }

    // Create new quotation
    const quotation = new Quotation({
      quotationNo,
      customer,
      status,
      products,
      organization_id,
      // taxPercent,
      createdBy
    });

    const savedQuotation = await quotation.save();

    res.status(201).json({
      status:true,
      message: "Quotation created successfully",
      quotation: savedQuotation,
    });
  } catch (error) {
    console.error("Error creating quotation:", error);
    res.status(500).json({ message: "Failed to create quotation",status:false, error: error.message });
  }
};
// Get all quotations
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find()
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
// Get single quotation by organization ID
exports.getQuotationByOrganizationId = async (req, res) => {
  try {
    const quotation = await Quotation.find({organization_id:req.params.id})
      .populate(['organization_id','createdBy'])

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a quotation
// controllers/quotationController.js
exports.updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

   
    quotation.customer = req.body.customer || quotation.customer;
    quotation.products = req.body.products || quotation.products;

    // Saving triggers pre("save")
    await quotation.save();

    res.status(201).json({
      status:true,
      message: "Quotation Updated successfully",
      quotation: quotation,
    });
  } catch (error) {
    res.status(400).json({status:false, message: error.message });
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
