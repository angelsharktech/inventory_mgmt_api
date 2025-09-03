// models/Counter.js
const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  org: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

module.exports = mongoose.model('Counter', CounterSchema);