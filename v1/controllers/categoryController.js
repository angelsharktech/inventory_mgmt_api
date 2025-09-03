const Category = require('../models/Category');

// @desc    Create a category
// @route   POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    console.log(req.body);
    
    const { categoryName, organization_id } = req.body;
    
    // Generate slug from categoryName
    const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const category = await Category.create({
      categoryName,
      organization_id,
      slug,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    // Filter by organization if provided in query
    let filter = {};
    if (req.query.organization_id) {
      filter.organization_id = req.query.organization_id;
    }

    const categories = await Category.find(filter)
      .populate('organization_id', 'name') // Populate organization details if needed
      .sort({ categoryName: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('organization_id', 'name'); // Populate organization details

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const { categoryName, organization_id } = req.body;
    
    // Generate new slug if categoryName is being updated
    let updateData = { categoryName, organization_id };
    if (categoryName) {
      const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      updateData.slug = slug;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Get categories by organization
// @route   GET /api/categories/organization/:organizationId
exports.getCategoriesByOrganization = async (req, res) => {
  try {
    const categories = await Category.find({ 
      organization_id: req.params.organizationId 
    }).sort({ categoryName: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug 
    }).populate('organization_id', 'name');

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};