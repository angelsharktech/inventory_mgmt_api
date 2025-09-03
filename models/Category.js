const mongoose = require('mongoose');
const categorySchema = mongoose.Schema({
    // mainCategory: { type: String, required: true },
  // subCategories: [{ type: String }],
   categoryName : String,
    organization_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Organization',
    },
  slug: {
    type: String,
    lowercase: true
  },
  createdBy: { type: String, required: true },
})
module.exports = mongoose.model('Category', categorySchema);