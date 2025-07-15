const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  
  firm_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Organization', OrganizationSchema);