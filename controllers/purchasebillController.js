// controllers/purchaseBill.controller.js
const PurchaseBill = require('../models/PurchaseBill');
const mongoose = require('mongoose');
const { generateBillNumber } = require('../utils/helpers');
const mongoosePaginate = require('mongoose-paginate-v2');
const Product = require('../models/Product');

/**
 * @desc    Create a new purchase bill
 * @route   POST /api/purchasebills
 * @access  Private
 */
exports.createPurchaseBill = async (req, res) => {
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
      balancePayMode,
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
      dueDate,status
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
            unitPrice : product.compareAtPrice || productDetails.compareAtPrice,
            cgst: product.cgst || 0,
            sgst: product.sgst || 0,
            igst: product.igst || 0,
            gstPercent: product.gstPercent || 0
          };
        }));
    // Generate bill number if not provided
    const bill_number = req.body.bill_number || await generateBillNumber(org);

    const newPurchaseBill = new PurchaseBill({
      bill_number,
      bill_to,
      products: formattedProducts,
      billType,
      gstPercent,
      qty,
      paymentType,
      advance,
      balance,
      balancePayMode,
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
console.log("RRRRR",req.body);
console.log("****",newPurchaseBill);


    const savedPurchaseBill = await newPurchaseBill.save();
// for (const product of formattedProducts) {
//   const dbProduct = await Product.findById(product._id);
//   if (dbProduct) {
//     await dbProduct.updateInventory(product.qty, 'add');
//   }
// }
    res.status(201).json({
      success: true,
      data: savedPurchaseBill
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
 * @desc    Get all purchase bills
 * @route   GET /api/purchasebills
 * @access  Private
 */
// controllers/purchaseBill.controller.js
exports.getAllPurchaseBills = async (req, res) => {
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
      populate: ['bill_to', 'products', 'org', 'createdBy']
    };
    
    // Manual pagination implementation
    // const skip = (options.page - 1) * options.limit;
    const countPromise = PurchaseBill.countDocuments(query);
    const itemsPromise = PurchaseBill.find(query)
      // .skip(skip)
      // .limit(options.limit)
      .sort(options.sort)
      .populate(options.populate);
    
    const [total, purchaseBills] = await Promise.all([countPromise, itemsPromise]);
    
    const result = {
      docs: purchaseBills,
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
 * @desc    Get single purchase bill by ID
 * @route   GET /api/purchasebills/:id
 * @access  Private
 */
exports.getPurchaseBillById = async (req, res) => {
  try {
    const purchaseBill = await PurchaseBill.findById(req.params.id)
      .populate('bill_to')
      .populate('products')
      .populate('org')
      .populate('createdBy')
      .populate('advancePayments')
      .populate('balancePayments')
      .populate('fullPayment');
    
    if (!purchaseBill || !purchaseBill.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Purchase bill not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: purchaseBill
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
 * @desc    Update a purchase bill
 * @route   PUT /api/purchasebills/:id
 * @access  Private
 */
exports.updatePurchaseBill = async (req, res) => {
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

    const purchaseBill = await PurchaseBill.findById(req.params.id);
    
    if (!purchaseBill || !purchaseBill.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Purchase bill not found'
      });
    }
    
    // Check if bill is already issued/cancelled/refunded
    if (purchaseBill.status !== 'draft' && req.body.status !== purchaseBill.status) {
      return res.status(400).json({
        success: false,
        message: 'Only draft bills can be modified'
      });
    }
    console.log(req.body);
    
    // Update fields
    purchaseBill.bill_to = bill_to || purchaseBill.bill_to;
    purchaseBill.products = products || purchaseBill.products;
    purchaseBill.billType = billType || purchaseBill.billType;
    purchaseBill.gstPercent = gstPercent || purchaseBill.gstPercent;
    purchaseBill.qty = qty || purchaseBill.qty;
    purchaseBill.paymentType = req.body.paymentType;
    purchaseBill.advance = req.body.advance;
    purchaseBill.balance =req.body.balance;
    purchaseBill.advancePayments = advancePayments || purchaseBill.advancePayments;
    purchaseBill.balancePayments = balancePayments || purchaseBill.balancePayments;
    purchaseBill.fullPaid = req.body.fullPaid;
    purchaseBill.fullPayment = fullPayment || purchaseBill.fullPayment;
    purchaseBill.subtotal = subtotal || purchaseBill.subtotal;
    purchaseBill.discount = discount || purchaseBill.discount;
    purchaseBill.gstTotal = gstTotal || purchaseBill.gstTotal;
    purchaseBill.cgst = cgst || purchaseBill.cgst;
    purchaseBill.sgst = sgst || purchaseBill.sgst;
    purchaseBill.igst = igst || purchaseBill.igst;
    purchaseBill.roundOff = roundOff || purchaseBill.roundOff;
    purchaseBill.grandTotal = grandTotal || purchaseBill.grandTotal;
    purchaseBill.notes = notes || purchaseBill.notes;
    purchaseBill.dueDate = dueDate || purchaseBill.dueDate;
    purchaseBill.status = status || purchaseBill.status;
    
    console.log('***',purchaseBill);
    
    const updatedPurchaseBill = await purchaseBill.save();
    
    res.status(200).json({
      success: true,
      data: updatedPurchaseBill
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
 * @desc    Delete a purchase bill (soft delete)
 * @route   DELETE /api/purchasebills/:id
 * @access  Private
 */
exports.deletePurchaseBill = async (req, res) => {
  try {
    const purchaseBill = await PurchaseBill.findById(req.params.id);
    
    if (!purchaseBill || !purchaseBill.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Purchase bill not found'
      });
    }
    
    // Check if bill can be deleted (only drafts or cancelled bills)
    if (purchaseBill.status !== 'draft' && purchaseBill.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Only draft or cancelled bills can be deleted'
      });
    }
      for (const item of purchaseBill.products) {
          const dbProduct = await Product.findById(item._id);
          if (dbProduct) {
            await dbProduct.updateInventory(item.qty, 'subtract'); // add back stock
          }
        }
    purchaseBill.isActive = false;
    await purchaseBill.save();
    
    res.status(200).json({
      success: true,
      message: 'Purchase bill deleted successfully'
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
 * @desc    Cancel a purchase bill
 * @route   PUT /api/purchasebills/cancel/:id
 * @access  Private
 */
exports.cancelPurchaseBill = async (req, res) => {
  try {
    const purchaseBill = await PurchaseBill.findById(req.params.id);
    
    if (!purchaseBill || !purchaseBill.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Purchase bill not found'
      });
    }
    
    // Check if bill can be cancelled
    if (purchaseBill.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Bill is already cancelled'
      });
    }
    
    if (purchaseBill.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Refunded bills cannot be cancelled'
      });
    }
    
      for (const item of purchaseBill.products) {
        
          const dbProduct = await Product.findById(item._id);
          if (dbProduct) {
            await dbProduct.updateInventory(item.qty, 'subtract'); // add back stock
          }
        }
    
    purchaseBill.status = 'cancelled';
    await purchaseBill.save();
    
    res.status(200).json({
      success: true,
      data: purchaseBill,
      message: 'Purchase bill cancelled successfully'
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
 * @desc    Get purchase bills by organization (manual pagination)
 * @route   GET /api/purchasebills/organization/:orgId
 * @access  Private
 */
exports.getPurchaseBillsByOrganization = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
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
    const countPromise = PurchaseBill.countDocuments(query);
    const itemsPromise = PurchaseBill.find(query)
      // .skip(skip)
      // .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate(['bill_to', 'products', 'createdBy']);
    
    const [total, purchaseBills] = await Promise.all([countPromise, itemsPromise]);
    
    const result = {
      docs: purchaseBills,
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
 * @desc    Get purchase bills by vendor (manual pagination)
 * @route   GET /api/purchasebills/vendor/:vendorId
 * @access  Private
 */
exports.getPurchaseBillsByCustomer = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    const query = { 
      bill_to: req.params.vendorId,
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
    const countPromise = PurchaseBill.countDocuments(query);
    const itemsPromise = PurchaseBill.find(query)
      // .skip(skip)
      // .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate(['org', 'products', 'createdBy']);
    
    const [total, purchaseBills] = await Promise.all([countPromise, itemsPromise]);
    
    const result = {
      docs: purchaseBills,
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
 * @desc    Get purchase bills summary (for dashboard)
 * @route   GET /api/purchasebills/summary
 * @access  Private
 */
exports.getPurchaseBillsSummary = async (req, res) => {
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
    
    const summary = await PurchaseBill.aggregate([
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