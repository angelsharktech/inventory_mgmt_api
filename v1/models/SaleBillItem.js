// models/SaleBillItem.js
const mongoose = require('mongoose');

const SaleBillItemSchema = new mongoose.Schema({
  // Reference to the parent sale bill
  saleBill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaleBill',
    required: true
  },

  // Product details
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productCode: {
    type: String // SKU or other product identifier
  },

  // Pricing information
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'fixed'
  },

  // Tax information
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative']
  },
  taxType: {
    type: String,
    enum: ['gst', 'igst', 'none'],
    default: 'gst'
  },
  cgst: {
    type: Number,
    default: 0
  },
  sgst: {
    type: Number,
    default: 0
  },
  igst: {
    type: Number,
    default: 0
  },

  // Calculated fields
  subtotal: {
    type: Number,
    required: true
  },
  totalTax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },

  // Additional information
  unit: {
    type: String,
    default: 'pcs'
  },
  hsnCode: {
    type: String
  },
  description: {
    type: String
  },

  // Status tracking
  returnedQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Returned quantity cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
SaleBillItemSchema.index({ saleBill: 1 });
SaleBillItemSchema.index({ product: 1 });
SaleBillItemSchema.index({ isActive: 1 });

// Middleware to calculate totals before saving
SaleBillItemSchema.pre('save', function(next) {
  // Calculate discount amount
  const discountAmount = this.discountType === 'percentage' 
    ? (this.unitPrice * this.quantity * this.discount / 100)
    : this.discount;

  // Calculate subtotal
  this.subtotal = (this.unitPrice * this.quantity) - discountAmount;

  // Calculate taxes
  if (this.taxType === 'gst') {
    const gstAmount = this.subtotal * this.taxRate / 100;
    this.cgst = gstAmount / 2;
    this.sgst = gstAmount / 2;
    this.igst = 0;
    this.totalTax = gstAmount;
  } else if (this.taxType === 'igst') {
    this.igst = this.subtotal * this.taxRate / 100;
    this.cgst = 0;
    this.sgst = 0;
    this.totalTax = this.igst;
  } else {
    this.totalTax = 0;
  }

  // Calculate final total
  this.total = this.subtotal + this.totalTax;

  next();
});

// Virtual for available quantity (quantity - returned)
SaleBillItemSchema.virtual('availableQuantity').get(function() {
  return this.quantity - this.returnedQuantity;
});

// Static method to get items for a sale bill
SaleBillItemSchema.statics.getItemsForSaleBill = function(saleBillId) {
  return this.find({ saleBill: saleBillId, isActive: true })
    .populate('product', 'name price sku barcode images');
};

// Instance method to mark items as returned
SaleBillItemSchema.methods.markAsReturned = function(quantity) {
  if (quantity <= 0) {
    throw new Error('Return quantity must be positive');
  }
  if (this.returnedQuantity + quantity > this.quantity) {
    throw new Error('Cannot return more than original quantity');
  }
  
  this.returnedQuantity += quantity;
  return this.save();
};

module.exports = mongoose.model('SaleBillItem', SaleBillItemSchema);