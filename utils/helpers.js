// utils/helpers.js
const Counter = require('../models/Counter');

const generateBillNumber = async (orgId) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { org: orgId, type: 'bill_number' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    
    return `BILL-${counter.seq.toString().padStart(5, '0')}`;
  } catch (error) {
    console.error('Error generating bill number:', error);
    throw new Error('Failed to generate bill number');
  }
};

module.exports = {
  generateBillNumber
};