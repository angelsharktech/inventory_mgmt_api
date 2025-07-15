const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [120, 'Product name cannot exceed 120 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },

  // Pricing
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  compareAtPrice: {
    type: Number,
    validate: {
      validator: function(v) {
        return v > this.price;
      },
      message: 'Compare price must be greater than selling price'
    }
  },
  costPerItem: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },

  // Inventory
  sku: {
    type: String,
    unique: true,
    uppercase: true
  },
  barcode: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  trackQuantity: {
    type: Boolean,
    default: true
  },
  allowBackorder: {
    type: Boolean,
    default: false
  },

  // Media
  images: [{
    url: String,
    altText: String,
    isPrimary: Boolean
  }],
  videos: [{
    url: String,
    thumbnail: String
  }],

  // Organization
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product must belong to a category']
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  tags: [{
    type: String,
    lowercase: true
  }],

  // Shipping
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  isPhysical: {
    type: Boolean,
    default: true
  },

  // Variants
  hasVariants: {
    type: Boolean,
    default: false
  },
  variants: [{
    name: String,
    options: [String],
    priceAdjustment: Number
  }],

  // SEO
  metaTitle: String,
  metaDescription: String,

  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'archived', 'out_of_stock'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Ownership
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware
ProductSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

// Indexes for faster queries
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ price: 1 });

// Virtuals
ProductSchema.virtual('inStock').get(function() {
  return this.quantity > 0 || this.allowBackorder;
});

ProductSchema.virtual('discountPercentage').get(function() {
  if (!this.compareAtPrice) return 0;
  return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});

module.exports = mongoose.model('Product', ProductSchema);

// Core Product Details:

// Name, description, SKU, barcode

// Auto-generated slugs for SEO-friendly URLs

// Pricing & Inventory:

// Multiple price fields (regular, compare-at price)

// Stock tracking with backorder support

// Media Management:

// Support for multiple images/videos

// Primary image designation

// Category Relationships:

// Connection to your existing Category model

// Support for sub-categories

// Product Variants:

// Color/size options with price adjustments

// Flexible variant system

// Shipping & Physical Goods:

// Weight and dimensions tracking

// Digital product flag

// SEO Optimization:

// Custom meta fields

// Full-text search indexes

// Status Control:

// Draft/active/archived states

// Featured product flag

// Audit Trail:

// CreatedBy/UpdatedBy references to User model

// Automatic timestamps