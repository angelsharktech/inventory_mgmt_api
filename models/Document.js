const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const documentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  originalName: { type: String, required: true },
  filePath: { 
    type: String, 
    required: true,
    get: path => path.replace(/\\/g, '/') // Normalize path for cross-platform
  },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { getters: true } // Ensure getters are applied when converting to JSON
});

module.exports = mongoose.model('Document', documentSchema);