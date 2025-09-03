const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  work_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Work',
    required: [true, 'Work reference is required']
  },
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client reference is required'],
    validate: {
      validator: async function(clientId) {
        const client = await mongoose.model('User').findOne({ _id: clientId, isClient: true });
        return !!client;
      },
      message: 'Client not found or user is not a client'
    }
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);