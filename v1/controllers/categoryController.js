const Category = require('../models/Category');

// @desc    Create a category
// @route   POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parent, image, displayOrder } = req.body;
    
    const category = await Category.create({
      name,
      description,
      parent,
      image,
      displayOrder,
      createdBy: req.user._id
    });

    // If this is a sub-category, update parent's children array
    if (parent) {
      await Category.findByIdAndUpdate(
        parent,
        { $push: { children: category._id } }
      );
    }

    res.status(201).json(category);
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
    const categories = await Category.find({})
      .populate('parent', 'name slug')
      .populate('children', 'name slug')
      .sort({ displayOrder: 1 });

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
      .populate('parent', 'name slug')
      .populate('children', 'name slug');

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
    const { name, description, parent, image, displayOrder, isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { 
        name,
        description,
        parent,
        image,
        displayOrder,
        isActive,
        updatedBy: req.user._id
      },
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
      data: {}
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Get category tree
// @route   GET /api/categories/tree
exports.getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find({ parent: null })
      .populate({
        path: 'children',
        populate: {
          path: 'children',
          model: 'Category'
        }
      });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};