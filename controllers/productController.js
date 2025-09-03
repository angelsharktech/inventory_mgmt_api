const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  // Advanced filtering, sorting, pagination, etc.
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = Product.find(JSON.parse(queryStr))
    .populate('category', 'categoryName slug')
    .populate('subCategory', 'name slug')
    .populate('collections', 'name slug')
    .populate('createdBy', 'name email');

  // Search functionality
  if (req.query.search) {
    query = query.find({
      $text: { $search: req.query.search }
    }, {
      score: { $meta: 'textScore' }
    }).sort({
      score: { $meta: 'textScore' }
    });
  }

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Product.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const products = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: products.length,
    pagination,
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  
  
  const product = await Product.findById(req.params.id)
    .populate('category', 'categoryName slug')
    .populate('subCategory', 'name slug')
    .populate('collections', 'name slug')
    .populate('relatedProducts', 'name slug price images')
    .populate('crossSellProducts', 'name slug price images')
    .populate('upSellProducts', 'name slug price images')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Get product by slug
// @route   GET /api/v1/products/slug/:slug
// @access  Public
exports.getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'categoryName slug')
    .populate('subCategory', 'name slug')
    .populate('collections', 'name slug')
    .populate('relatedProducts', 'name slug price images')
    .populate('crossSellProducts', 'name slug price images')
    .populate('upSellProducts', 'name slug price images')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with slug of ${req.params.slug}`, 404)
    );
  }

  // Increment view count
  product.viewCount += 1;
  await product.save();

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private
exports.createProduct = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Handle variant creation
  if (req.body.variantOptions && req.body.variantOptions.length > 0) {
    req.body.hasVariants = true;
  }
  
  console.log(req.body)
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is product owner or admin
  if (product.createdBy.toString() !== req.user.id ) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update this product`, 401)
    );
  }

  // Handle variant updates
  if (req.body.variantOptions && req.body.variantOptions.length > 0) {
    req.body.hasVariants = true;
  }

  // Set updatedBy
  req.body.updatedBy = req.user.id;

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: product
  });
});
// @desc    get product by hsn code 
// @route   get /api/v1/products/hsn/:code
// @access  Private
exports.getProductsByHsnCode = asyncHandler(async (req, res, next) => {
  

  const products = await Product.findOne({ hsnCode: req.params.code });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});
// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is product owner or admin
  if (product.createdBy.toString() !== req.user.id ) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to delete this product`, 401)
    );
  }

  // Soft delete (change status to archived)
  product.status = 'archived';
  await product.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update product inventory
// @route   PUT /api/v1/products/:id/inventory
// @access  Private
exports.updateInventory = asyncHandler(async (req, res, next) => {
  const { quantity, action } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user has permission
  if (product.createdBy.toString() !== req.user.id ) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update this product's inventory`, 401)
    );
  }

  if (!['add', 'subtract', 'set'].includes(action)) {
    return next(
      new ErrorResponse(`Invalid action. Must be 'add', 'subtract', or 'set'`, 400)
    );
  }

  if (action === 'set') {
    product.quantity = quantity;
  } else {
    await product.updateInventory(quantity, action);
  }

  // Update status if needed
  if (product.quantity <= 0 && product.status !== 'archived') {
    product.status = 'out_of_stock';
  } else if (product.quantity > 0 && product.status === 'out_of_stock') {
    product.status = 'active';
  }

  await product.save();

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Add variant to product
// @route   POST /api/v1/products/:id/variants
// @access  Private
exports.addVariant = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user has permission
  if (product.createdBy.toString() !== req.user.id ) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to add variants to this product`, 401)
    );
  }

  await product.addVariant(req.body);

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Get products by category
// @route   GET /api/v1/products/category/:categoryId
// @access  Public
exports.getProductsByCategory = asyncHandler(async (req, res, next) => {
  const { includeSubcategories } = req.query;
  const include = includeSubcategories === 'false' ? false : true;

  const products = await Product.findByCategory(req.params.categoryId, include);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get featured products
// @route   GET /api/v1/products/featured
// @access  Public
exports.getFeaturedProducts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  
  const products = await Product.find({ 
    isFeatured: true,
    status: 'active'
  })
  .sort('featuredOrder')
  .limit(limit)
  .populate('category', 'categoryName slug');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get related products
// @route   GET /api/v1/products/:id/related
// @access  Public
exports.getRelatedProducts = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Get related products and filter out any that might be archived
  let relatedProducts = await Product.find({
    _id: { $in: product.relatedProducts },
    status: 'active'
  })
  .select('name slug price images discountPercentage availability')
  .limit(8);

  // If not enough related products, get some from the same category
  if (relatedProducts.length < 4) {
    const additionalProducts = await Product.find({
      category: product.category,
      status: 'active',
      _id: { $ne: product._id }
    })
    .select('name slug price images discountPercentage availability')
    .limit(8 - relatedProducts.length);

    relatedProducts = [...relatedProducts, ...additionalProducts];
  }

  res.status(200).json({
    success: true,
    count: relatedProducts.length,
    data: relatedProducts
  });
});

// @desc    Get products with discount
// @route   GET /api/v1/products/on-sale
// @access  Public
exports.getDiscountedProducts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  
  const products = await Product.find({ 
    compareAtPrice: { $gt: 0, $gt: '$price' },
    status: 'active'
  })
  .sort('-discountPercentage')
  .limit(limit)
  .populate('category', 'categoryName slug');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get low stock products
// @route   GET /api/v1/products/low-stock
exports.getLowStockProducts = asyncHandler(async (req, res, next) => {

  const products = await Product.find({
    trackQuantity: true,
    quantity: { $lte: '$lowStockThreshold' },
    status: { $in: ['active', 'out_of_stock'] }
  })
  .sort('quantity')
  .populate('category', 'categoryName');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Bulk update products
// @route   PUT /api/v1/products/bulk-update
// @access  Private (Admin only)
exports.bulkUpdateProducts = asyncHandler(async (req, res, next) => {
  // if (req.user.role !== 'admin') {
  //   return next(
  //     new ErrorResponse(`User ${req.user.id} is not authorized to perform this action`, 401)
  //   );
  // }

  const { ids, updateData } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0 || !updateData) {
    return next(
      new ErrorResponse('Please provide product IDs and update data', 400)
    );
  }

  // Add updatedBy to the update data
  updateData.updatedBy = req.user.id;

  const result = await Product.updateMany(
    { _id: { $in: ids } },
    updateData,
    { runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: {
      matchedCount: result.n,
      modifiedCount: result.nModified
    }
  });
});