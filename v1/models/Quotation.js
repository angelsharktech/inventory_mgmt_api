// models/Quotation.js
const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema(
  {
    quotationNo: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String },
      phone: { type: String },
      address: { type: String },
    },
    status: {
      type: String,
      enum: ["Draft", "Sent", "Accepted", "Rejected"],
      default: "Draft",
    },
   products: [
      {
        productName: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
        unitPrice: { type: Number, required: true, min: 0, default: 0 },
        tax: { type: Number, required: true, min: 0, max: 100, default: 18 },
        total: { type: Number, default: 0 }
      },
    ],
    organization_id: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Organization',
        },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    taxTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    createdBy: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true
     },
  },
  { timestamps: true }
);

// Pre-save hook to calculate totals automatically
quotationSchema.pre("save", function (next) {
  if (this.products && this.products.length > 0) {
    this.subtotal = this.products.reduce(
      (acc, p) => acc + p.quantity * p.unitPrice,
      0
    );

    this.taxTotal = this.products.reduce(
      (acc, p) => acc + (p.quantity * p.unitPrice * p.tax) / 100,
      0
    );

    this.grandTotal = this.subtotal + this.taxTotal;

    // update each product total
    this.products.forEach((p) => {
      p.total = p.quantity * p.unitPrice * (1 + p.tax / 100);
    });
  }
  next();
});



module.exports = mongoose.model('Quotation', quotationSchema);
