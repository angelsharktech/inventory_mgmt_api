// models/saleBill.model.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const saleBillSchema = new mongoose.Schema(
  {
    bill_number: { 
      type: String, 
      required: true,
      unique: true,
      trim: true
    },
    bill_to: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
// products: [{
//   type: mongoose.Schema.Types.ObjectId, 
//   ref: "Product", 
//   required: true
// }],
products: [{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      },
      hsnCode: {
        type: String,
        trim: true
      },
      qty: {
        type: Number,
        required: true,
        min: 1
      },
      discount: {
        type: Number,
        default: 0,
        min: 0
      },
      // You might also want to include price per unit
      price: {
        type: Number,
        required: true,
        min: 0
      },
       unitPrice: {
        type: Number,
        required: true,
        min: 0
      }
    }],
    billType: { 
      type: String, 
      enum: ["gst", "non-gst"], 
      default: "non-gst",
      required: true
    },
    gstPercent: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 100,
      validate: {
        validator: function(v) {
          return this.billType === 'gst' ? v > 0 : true;
        },
        message: "GST percentage is required for GST bills"
      }
    },
    qty: {
      type: Number,
      default: 1,
      min: 1
    },
    paymentType: { 
      type: String, 
      enum: ["full", "advance"], 
      default: "full",
      required: true
    },
    advance: { 
      type: Number, 
      default: 0,
      min: 0,
      validate: {
        validator: function(v) {
          return this.paymentType === 'advance' ? v > 0 : true;
        },
        message: "Advance amount is required for advance payments"
      }
    },
    balance: { 
      type: Number, 
      default: 0,
      min: 0
    },
    balancePayMode:{
      type: String
    },
    advancePayments: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "PaymentMode",
      validate: {
        validator: function(v) {
          return this.paymentType === 'advance' ? v != null : true;
        },
        message: "Advance payment mode is required for advance payments"
      }
    },
    balancePayments: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "PaymentMode",
      validate: {
        validator: function(v) {
          return this.paymentType === 'advance' && this.balance > 0 ? v != null : true;
        },
        message: "Balance payment mode is required when balance exists"
      }
    },
    fullPaid: { 
      type: Number, 
      default: 0,
      min: 0
    },
    fullPayment: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "PaymentMode",
    },
    subtotal: { 
      type: Number, 
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    gstTotal: { 
      type: Number, 
      default: 0,
      min: 0
    },
    cgst: { 
      type: Number, 
      default: 0,
      min: 0
    },
    sgst: { 
      type: Number, 
      default: 0,
      min: 0
    },
    igst: { 
      type: Number, 
      default: 0,
      min: 0
    },
    roundOff: {
      type: Number,
      default: 0
    },
    grandTotal: { 
      type: Number, 
      required: true,
      min: 0
    },
    org: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Organization",
      required: true
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["draft", "issued", "cancelled", "refunded"],
      default: "issued"
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function(v) {
          return this.paymentType === 'advance' ? v != null : true;
        },
        message: "Due date is required for advance payments"
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add virtual for calculating balance if payment is advance
saleBillSchema.virtual('calculatedBalance').get(function() {
  return this.paymentType === 'advance' ? this.grandTotal - this.advance : 0;
});


// Indexes for better query performance
saleBillSchema.index({ bill_number: 1, org: 1 }, { unique: true });
saleBillSchema.index({ bill_to: 1 });
saleBillSchema.index({ org: 1 });
saleBillSchema.index({ createdAt: -1 });
saleBillSchema.index({ status: 1 });

const SaleBill = mongoose.model('SaleBill', saleBillSchema);

module.exports = SaleBill;