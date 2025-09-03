const mongoose = require('mongoose');

const WorkSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
  },
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  set: v => v === '' ? undefined : v
  },
  projectManager_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    
  set: v => v === '' ? undefined : v
  },
  organization_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization',
    required: true 
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  startDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  staffAssignments: [ {
    staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    workDescription: {
      type: String,
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  } ],
  scheme_id: [ {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scheme',
    required: true
  } ],
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalFee: {
    type: Number,
    min: [0, 'Fee cannot be negative'],
    default: 0
  },
  feeReceived: {
    type: Number,
    default: 0,
    min: [0, 'Fee cannot be negative'],
    default: 0
  },
  pendingFee: {
    type: Number,
    default: function() { return this.totalFee - this.feeReceived; }
  },
  payment_mode_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMode'
  },
  chat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  },
  status: {
    type: String,
    enum: ['Pending','Approved', 'In Progress','Submission', 'Completed', 'On Hold', 'Rejected', 'Notice'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update pendingFee when feeReceived changes
WorkSchema.pre('save', function(next) {
  this.pendingFee = this.totalFee - this.feeReceived;
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Work', WorkSchema);