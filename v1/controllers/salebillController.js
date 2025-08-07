// controllers/saleBill.controller.js
const SaleBill = require('../models/SaleBill');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { generateBillNumber } = require('../utils/helpers');
const mongoosePaginate = require('mongoose-paginate-v2');

/**
 * @desc    Create a new sale bill
 * @route   POST /api/salebills
 * @access  Private
 */
exports.createSaleBill = async (req, res) => {
  try {
    const {
      bill_to,
      products,
      billType,
      gstPercent,
      qty,
      paymentType,
      advance,
      balance,
      advancePayments,
      balancePayments,
      fullPaid,
      fullPayment,
      subtotal,
      discount,
      gstTotal,
      cgst,
      sgst,
      igst,
      roundOff,
      grandTotal,
      org,
      notes,
      dueDate,
      status
    } = req.body;

  const formattedProducts = await Promise.all(products.map(async (product) => {
      // You might want to fetch the product details from your Product collection
      const productDetails = await Product.findById(product._id);
      if (!productDetails) {
        throw new Error(`Product with ID ${product._id} not found`);
      }

      return {
        _id: product._id,
        name: productDetails.name, // or product.name if you want to allow override
        hsnCode: productDetails.hsnCode || product.hsnCode,
        qty: product.qty,
        discount: product.discount || 0,
        price: product.price || productDetails.price,
        unitPrice : product.compareAtPrice || productDetails.compareAtPrice
      };
    }));

    // Generate bill number if not provided
    const bill_number = req.body.bill_number || await generateBillNumber(org);

    const newSaleBill = new SaleBill({
      bill_number,
      bill_to,
      products: formattedProducts,
      billType,
      gstPercent,
      qty,
      paymentType,
      advance,
      balance,
      advancePayments,
      balancePayments,
      fullPaid,
      fullPayment,
      subtotal,
      discount,
      gstTotal,
      cgst,
      sgst,
      igst,
      roundOff,
      grandTotal,
      org,
      createdBy: req.user.id,
      notes,
      dueDate,
      status
    });
    console.log(newSaleBill);
    

    const savedSaleBill = await newSaleBill.save();

    res.status(201).json({
      success: true,
      data: savedSaleBill
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all sale bills
 * @route   GET /api/salebills
 * @access  Private
 */
// controllers/saleBill.controller.js
exports.getAllSaleBills = async (req, res) => {
  try {
    const { org, status, startDate, endDate } = req.query;
    
    const query = { isActive: true };
    
    if (org) query.org = mongoose.Types.ObjectId(org);
    if (status) query.status = status;
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const options = {
      // page: parseInt(page),
      // limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: ['bill_to', 'org', 'createdBy']
    };
    
    // Manual pagination implementation
    const skip = (options.page - 1) * options.limit;
    const countPromise = SaleBill.countDocuments(query);
    const itemsPromise = SaleBill.find(query)
      // .skip(skip)
      // .limit(options.limit)
      .sort(options.sort)
      .populate(options.populate);
    
    const [total, saleBills] = await Promise.all([countPromise, itemsPromise]);
    
    const result = {
      docs: saleBills,
      totalDocs: total,
      // limit: options.limit,
      // page: options.page,
      // totalPages: Math.ceil(total / options.limit),
      // hasNextPage: options.page * options.limit < total,
      // hasPrevPage: options.page > 1
    };
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

/**
 * @desc    Get single sale bill by ID
 * @route   GET /api/salebills/:id
 * @access  Private
 */
exports.getSaleBillById = async (req, res) => {
  try {
    const saleBill = await SaleBill.findById(req.params.id)
      .populate('bill_to')
      // .populate('products')
      .populate('org')
      .populate('createdBy')
      .populate('advancePayments')
      .populate('balancePayments')
      .populate('fullPayment');
    
    if (!saleBill || !saleBill.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Sale bill not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: saleBill
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

/**
 * @desc    Update a sale bill
 * @route   PUT /api/salebills/:id
 * @access  Private
 */
exports.updateSaleBill = async (req, res) => {
  try {
    const {
      bill_to,
      products,
      billType,
      gstPercent,
      qty,
      paymentType,
      advance,
      balance,
      advancePayments,
      balancePayments,
      fullPaid,
      fullPayment,
      subtotal,
      discount,
      gstTotal,
      cgst,
      sgst,
      igst,
      roundOff,
      grandTotal,
      notes,
      dueDate,
      status
    } = req.body;

    const saleBill = await SaleBill.findById(req.params.id);
    
    if (!saleBill || !saleBill.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Sale bill not found'
      });
    }
    
    // Check if bill is already issued/cancelled/refunded
    if (saleBill.status !== 'draft' && req.body.status !== saleBill.status) {
      return res.status(400).json({
        success: false,
        message: 'Only draft bills can be modified'
      });
    }
    
    // Update fields
    saleBill.bill_to = bill_to || saleBill.bill_to;
    saleBill.products = products || saleBill.products;
    saleBill.billType = billType || saleBill.billType;
    saleBill.gstPercent = gstPercent || saleBill.gstPercent;
    saleBill.qty = qty || saleBill.qty;
    saleBill.paymentType = paymentType || saleBill.paymentType;
    saleBill.advance = advance || saleBill.advance;
    saleBill.balance = balance || saleBill.balance;
    saleBill.advancePayments = advancePayments || saleBill.advancePayments;
    saleBill.balancePayments = balancePayments || saleBill.balancePayments;
    saleBill.fullPaid = fullPaid || saleBill.fullPaid;
    saleBill.fullPayment = fullPayment || saleBill.fullPayment;
    saleBill.subtotal = subtotal || saleBill.subtotal;
    saleBill.discount = discount || saleBill.discount;
    saleBill.gstTotal = gstTotal || saleBill.gstTotal;
    saleBill.cgst = cgst || saleBill.cgst;
    saleBill.sgst = sgst || saleBill.sgst;
    saleBill.igst = igst || saleBill.igst;
    saleBill.roundOff = roundOff || saleBill.roundOff;
    saleBill.grandTotal = grandTotal || saleBill.grandTotal;
    saleBill.notes = notes || saleBill.notes;
    saleBill.dueDate = dueDate || saleBill.dueDate;
    saleBill.status = status || saleBill.status;
    
    const updatedSaleBill = await saleBill.save();
    
    res.status(200).json({
      success: true,
      data: updatedSaleBill
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete a sale bill (soft delete)
 * @route   DELETE /api/salebills/:id
 * @access  Private
 */
exports.deleteSaleBill = async (req, res) => {
  try {
    const saleBill = await SaleBill.findById(req.params.id);
    
    if (!saleBill || !saleBill.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Sale bill not found'
      });
    }
    
    // Check if bill can be deleted (only drafts or cancelled bills)
    if (saleBill.status !== 'draft' && saleBill.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Only draft or cancelled bills can be deleted'
      });
    }
    
    saleBill.isActive = false;
    await saleBill.save();
    
    res.status(200).json({
      success: true,
      message: 'Sale bill deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

/**
 * @desc    Cancel a sale bill
 * @route   PUT /api/salebills/:id/cancel
 * @access  Private
 */
exports.cancelSaleBill = async (req, res) => {
  try {
    const saleBill = await SaleBill.findById(req.params.id);
    
    if (!saleBill || !saleBill.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Sale bill not found'
      });
    }
    
    // Check if bill can be cancelled
    if (saleBill.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Bill is already cancelled'
      });
    }
    
    if (saleBill.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Refunded bills cannot be cancelled'
      });
    }
    
    saleBill.status = 'cancelled';
    await saleBill.save();
    
    res.status(200).json({
      success: true,
      data: saleBill,
      message: 'Sale bill cancelled successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
/**
 * @desc    Get sale bills by organization (manual pagination)
 * @route   GET /api/salebills/organization/:orgId
 * @access  Private
 */
exports.getSaleBillsByOrganization = async (req, res) => {
  try {
    const { status, startDate, endDate} = req.query;
    
    const query = { 
      org: req.params.orgId,
      isActive: true
    };
    
    if (status) query.status = status;
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // const skip = (page - 1) * limit;
    const countPromise = SaleBill.countDocuments(query);
    const itemsPromise = SaleBill.find(query)
      // .skip(skip)
      // .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate(['bill_to', 'createdBy']);
    
    const [total, saleBills] = await Promise.all([countPromise, itemsPromise]);
    
    const result = {
      docs: saleBills,
      totalDocs: total,
      // limit: parseInt(limit),
      // page: parseInt(page),
      // totalPages: Math.ceil(total / limit),
      // hasNextPage: (page * limit) < total,
      // hasPrevPage: page > 1
    };
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

/**
 * @desc    Get sale bills by customer (manual pagination)
 * @route   GET /api/salebills/customer/:customerId
 * @access  Private
 */
exports.getSaleBillsByCustomer = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    const query = { 
      bill_to: req.params.customerId,
      isActive: true
    };
    
    if (status) query.status = status;
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // const skip = (page - 1) * limit;
    const countPromise = SaleBill.countDocuments(query);
    const itemsPromise = SaleBill.find(query)
      // .skip(skip)
      // .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate(['org', 'createdBy']);
    
    const [total, saleBills] = await Promise.all([countPromise, itemsPromise]);
    
    const result = {
      docs: saleBills,
      totalDocs: total,
      // limit: parseInt(limit),
      // page: parseInt(page),
      // totalPages: Math.ceil(total / limit),
      // hasNextPage: (page * limit) < total,
      // hasPrevPage: page > 1
    };
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

/**
 * @desc    Get sale bills summary (for dashboard)
 * @route   GET /api/salebills/summary
 * @access  Private
 */
exports.getSaleBillsSummary = async (req, res) => {
  try {
    const { org, startDate, endDate } = req.query;
    
    const matchQuery = { isActive: true };
    if (org) matchQuery.org = mongoose.Types.ObjectId(org);
    
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const summary = await SaleBill.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalBills: { $sum: 1 },
          totalAmount: { $sum: "$grandTotal" },
          totalPaid: { 
            $sum: { 
              $cond: [
                { $eq: ["$paymentType", "full"] },
                "$grandTotal",
                "$advance"
              ]
            }
          },
          totalPending: {
            $sum: {
              $cond: [
                { $eq: ["$paymentType", "advance"] },
                "$balance",
                0
              ]
            }
          },
          issuedBills: {
            $sum: {
              $cond: [
                { $eq: ["$status", "issued"] },
                1,
                0
              ]
            }
          },
          cancelledBills: {
            $sum: {
              $cond: [
                { $eq: ["$status", "cancelled"] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: summary[0] || {
        totalBills: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalPending: 0,
        issuedBills: 0,
        cancelledBills: 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};