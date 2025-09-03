const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    // enum: ['SuperAdmin','Admin', 'Partner', 'Associate', 'Staff','Manager', 'Customer'], // Your position types
    default: 'User'
  },
  description: String,
  permissions: [String], // You can add specific permissions if needed
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

PositionSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Position', PositionSchema);