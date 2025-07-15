const mongoose = require('mongoose');

const WorkTypeSchema = new mongoose.Schema({
  work_type_name: {
    type: String,
    required: [true, 'Please add a work type name'],
    trim: true,
    maxlength: [50, 'Work type name cannot exceed 50 characters']
  },
  due_date: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WorkType', WorkTypeSchema);