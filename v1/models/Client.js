const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  contact: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, 'Enter a valid 10-digit contact number']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Enter a valid email']
  },
  organization_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization',
    required: true 
  },
  address: {
    type: String,
    required: true
  },

  // Financial Info
  openingBalance: {
    type: Number,
    default: 0
  },

  // Identity Info
  panCardNumber: {
    type: String,
    required: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format']
  },
  aadharCardNumber: {
    type: String,
    required: true,
    match: [/^[0-9]{12}$/, 'Aadhar must be 12 digits']
  },

  // Relationships
  language_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: true
  },
  associate_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Additional Info
  organizationType: {
    type: String,
    enum: ['Individual', 'Company', 'Trust', 'Government'],
    required: true
  },
  history: {
    type: String,
    default: ''
  },
  referredBy: {
    type: String,
    default: ''
  },

  // Documents
  documents: [{
    name: String,
    path: String,
    uploadedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],

  // WorkType-Scheme Mapping
  workTypeSchemes: [{
    workType_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'WorkType' 
    },
    scheme_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Scheme' 
    },
    username: String,
    password: String
  }],

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
ClientSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Client', ClientSchema);