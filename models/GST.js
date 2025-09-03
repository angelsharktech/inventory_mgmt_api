const mongoose = require('mongoose');

const GSTSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  gstNumber: { 
    type: String, 
    required: true,
    unique: true,
    validate: {
      validator: (v) => /^[0-9A-Z]{15}$/.test(v),
      message: "Invalid GST format (must be 15 alphanumeric characters)"
    }
  },
  legalName: { type: String, required: true },
  tradeName: { type: String },
  registrationType: { 
    type: String, 
    enum: ['Regular', 'Composition', 'SEZ', 'Unregistered'],
    default: 'Regular'
  },
  state: { type: String, required: true },
  stateCode: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  filingFrequency: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Annually']
  },
  documents: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
GSTSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('GST', GSTSchema);