const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Scheme name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Scheme name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    default: '',
  },
  workType_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkType',
    required: [true, 'WorkType ID is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update 'updatedAt' on save
SchemeSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Scheme', SchemeSchema);