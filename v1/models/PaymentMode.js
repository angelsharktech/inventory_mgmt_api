const mongoose = require('mongoose');

const PaymentModeSchema = new mongoose.Schema({
  paymentType: {
    type: String,
    required: true,
    enum: ['cash', 'cheque', 'online transfer', 'card', 'upi', 'finance','other'],
    default: 'Cash'
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Amount cannot be negative']
  },
    salebill: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'SaleBill',
    },
    purchasebill: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'PurchaseBill',
    },
      client_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      associate_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
      },
      created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },

  // Conditional Fields
  // For Online Transfers
  utrId: {
    type: String,
    required: function() { return this.paymentType === 'Online Transfer'; }
  },
  bankName: {
    type: String,
    required: function() { 
      return this.paymentType === 'Cheque'; 
    }
  },

  // For Cheques
  chequeNumber: {
    type: String,
    required: function() { return this.paymentType === 'Cheque'; }
  },
  chequeDate: {
    type: Date,
    required: function() { return this.paymentType === 'Cheque'; }
  },
  financeName: {
    type: String,
    required: function() { return this.paymentType === 'Finance'; }
  },

  // For Cards
  cardLastFour: {
    type: String,
    // required: function() { return this.paymentType === 'Card'; },
    // match: [/^[0-9]{4}$/, 'Last 4 digits must be numbers']
  },
  cardType: {
    type: String,
    enum: ['Debit', 'Credit'],
    required: function() { return this.paymentType === 'Card'; }
  },

  // For UPI
  upiId: {
    type: String,
    required: function() { return this.paymentType === 'UPI'; },
    // match: [/\S+@\S+/, 'Invalid UPI ID format']
  },

  // Common Reference
  referenceId: {
    type: String,
    unique: true,
    sparse: true
  },
  //bill type sale or purchase 
 billType:{
    type: String,
    trim:true
 },
  // Status
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Cancelled'],
    default: 'Completed'
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
});

// Update 'updatedAt' on save
PaymentModeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('PaymentMode', PaymentModeSchema);