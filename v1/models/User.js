const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String },
  phone_number: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  country: { type: String },
  address: { type: String },
  city: { type: String },
  company_name: { type: String },
  organization_id: { required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  password: { type: String, required: true },
  role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  position_id: { required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Position' },
  profile_picture: { type: String },
  bio: { type: String },
  status: { required: true, type: String, enum: ['active', 'non_active', 'suspended'], default: 'active' },
  
  // Banking Information
  bankDetails: {
    bankName: { type: String },
    accountName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    upiId: { type: String },
    paymentQR: { type: String } // This could store a URL or path to the QR code image
  },
  
  // ======================
  // Client-Specific Fields (embedded)
  // ======================
  isClient: { type: Boolean, default: false }, // Flag to identify clients
  hidefee: { type: Boolean, default: false }, // Flag to hide fee
  clientProfile: {
    // Basic Info (from ClientSchema)
    
    // Financial Info
    openingBalance: { type: Number, default: 0 },
    
    // Identity Info
    panCardNumber: {
      type: String,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format']
    },
    aadharCardNumber: {
      type: String,
      match: [/^[0-9]{12}$/, 'Aadhar must be 12 digits']
    },
    
    // Relationships
    language_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Language'
    },
    associate_id: {  // Renamed from associate_ID for consistency
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Additional Info
    organizationType: {
      type: String,
      enum: ['Individual', 'Company', 'Trust', 'Government']
    },
    history: { type: String, default: '' },
    referredBy: { type: String, default: '' },
    
    // Documents
    documents: [{
      name: String,
      path: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    
    // WorkType-Scheme Mapping
    workTypeSchemes: [{
      workType_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkType' },
      scheme_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme' },
      username: String,
      password: String
    }],
    
    // Client-specific timestamps
    clientSince: { type: Date, default: Date.now }
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// ======================
// Middleware & Methods
// ======================
UserSchema.pre('save', async function (next) {
  // Password hashing
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // Update timestamps
  this.updated_at = new Date();
  if (this.isClient && !this.clientProfile.clientSince) {
    this.clientProfile.clientSince = new Date();
  }
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);