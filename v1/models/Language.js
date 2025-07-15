const mongoose = require('mongoose');

const LanguageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a language name'],
    trim: true,
    unique: true,
    maxlength: [50, 'Language name cannot exceed 50 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Language', LanguageSchema);