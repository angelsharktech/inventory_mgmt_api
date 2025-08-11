const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema({
  // ============= CORE PRODUCT DETAILS =============
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
  },
  unit: {
    type: String,
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },

  // ============= PRICING & INVENTORY =============
  price: {
    type: Number,
    required: [true, 'Price name is required'],
    min: [0, 'Price cannot be negative']
  },
  compareAtPrice: {
    type: Number,
  },
  costPerItem: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  sku: {
    type: String,
    // unique: true,
    // uppercase: true,
    // sparse: true,
    set: v => v === '' ? undefined : v
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  quantity: {
    type: Number,
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
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0
  },
  hsnCode: {
    type: String,
    match: [/^[0-9]{6,8}$/, 'HSN code must be 6-8 digits']
  },
  taxClass: {
    type: String,
    enum: ['standard', 'reduced', 'zero', 'exempt'],
    default: 'standard'
  },

  // ============= MEDIA =============
  images: [{
    url: {
      type: String,
    },
    altText: String,
    isPrimary: Boolean,
    order: Number
  }],
  videos: [{
    url: String,
    thumbnail: String
  }],

  // ============= ORGANIZATION =============
  
  organization_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    
  set: v => v === '' ? undefined : v
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  tags: [{
    type: String,
    lowercase: true
  }],
  collections: [{
      type: String,
  }],

  // ============= VARIANTS =============
  hasVariants: {
    type: Boolean,
    default: false
  },
  variantOptions: [{
    name: {
      type: String,
      required: true,
      // enum: ['Color', 'Size', 'Material', 'Style']
    },
    values: [String]
  }],
  variantCombinations: [{
    sku: String,
    options: [{
      name: String,
      value: String
    }],
    price: Number,
    quantity: Number,
    imageIndex: Number
  }],

  // ============= SHIPPING =============
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
  shippingClass: {
    type: String,
    enum: ['standard', 'fragile', 'oversized', 'digital'],
    default: 'standard'
  },
  customsInfo: {
    countryOfOrigin: String,
    harmonizedSystemCode: String,
    customsDescription: String
  },

  // ============= SEO & MARKETING =============
  metaTitle: String,
  metaDescription: String,
  searchKeywords: [String],
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredOrder: Number,

  // ============= STATUS & VISIBILITY =============
  status: {
    type: String,
    enum: ['draft', 'active', 'archived', 'out_of_stock'],
    default: 'active'
  },
  availableOn: {
    website: { type: Boolean, default: true },
    mobileApp: { type: Boolean, default: true },
    marketplace: { type: Boolean, default: false }
  },
  publishedAt: Date,

  // ============= RELATIONSHIPS =============
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  crossSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  upSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],

  // ============= WARRANTY & RETURNS =============
  warranty: {
    duration: Number,
    unit: {
      type: String,
      enum: ['days', 'months', 'years']
    },
    description: String
  },
  returnPolicy: {
    windowDays: Number,
    conditions: String
  },

  // ============= ANALYTICS =============
  viewCount: {
    type: Number,
    default: 0
  },
  conversionRate: Number,

  // ============= OWNERSHIP =============
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

// ============= MIDDLEWARE =============
ProductSchema.pre('save', function(next) {
  // Auto-generate SKU if not provided
  // if (!this.sku) {
  //   this.sku = `SKU-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  // }
  
  // Generate slug if name changed or new product
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }

  // Set publishedAt if status changes to active
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// ============= INDEXES =============
ProductSchema.index({ name: 'text', description: 'text', tags: 'text', searchKeywords: 'text' });
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ sku: 1 });  //, { unique: true, sparse: true }
ProductSchema.index({ barcode: 1 }, { unique: true, sparse: true });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ price: 1, createdAt: -1 });
ProductSchema.index({ isFeatured: 1, featuredOrder: 1 });

// ============= VIRTUAL PROPERTIES =============
ProductSchema.virtual('availability').get(function() {
  if (this.status === 'archived') return 'discontinued';
  if (this.quantity <= 0) return this.allowBackorder ? 'backorder' : 'out_of_stock';
  if (this.quantity < this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

ProductSchema.virtual('mainImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || (this.images.length > 0 ? this.images[0] : null);
});

ProductSchema.virtual('discountPercentage').get(function() {
  if (!this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
  return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});

// ============= STATIC METHODS =============
ProductSchema.statics.findByCategory = function(categoryId, includeSubcategories = true) {
  const query = {
    status: 'active'
  };

  if (includeSubcategories) {
    query.$or = [
      { category: categoryId },
      { subCategory: categoryId }
    ];
  } else {
    query.category = categoryId;
  }

  return this.find(query);
};

ProductSchema.statics.search = function(text) {
  return this.find(
    { $text: { $search: text } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

// ============= INSTANCE METHODS =============
ProductSchema.methods.updateInventory = function(quantityChange, action = 'add') {
  if (action === 'add') {
    this.quantity += quantityChange;
  } else if (action === 'subtract') {
    const newQuantity = this.quantity - quantityChange;
    this.quantity = Math.max(0, newQuantity);
    
    // Auto-update status if out of stock
    if (newQuantity <= 0 && this.status !== 'archived') {
      this.status = 'out_of_stock';
    }
  }
  return this.save();
};

ProductSchema.methods.addVariant = function(options) {
  if (!this.hasVariants) {
    this.hasVariants = true;
  }

  const variantSku = options.sku || `${this.sku}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  
  this.variantCombinations.push({
    sku: options.sku,
    options: options.values,
    price: options.price || this.price,
    quantity: options.quantity || 0,
    imageIndex: options.imageIndex
  });

  return this.save();
};

module.exports = mongoose.model('Product', ProductSchema);