const Language = require('../models/Language');

// @desc    Get all languages
// @route   GET /api/v1/languages
exports.getLanguages = async (req, res) => {
  try {
    const languages = await Language.find().sort({ name: 1 }); // Alphabetical order
    res.status(200).json({
      success: true,
      count: languages.length,
      data: languages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create language
// @route   POST /api/v1/languages
exports.createLanguage = async (req, res) => {
  try {
    const language = await Language.create(req.body);
    res.status(201).json({
      success: true,
      data: language
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Language name already exists'
      });
    }
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
};

// @desc    Update language
// @route   PUT /api/v1/languages/:id
exports.updateLanguage = async (req, res) => {
  try {
    const language = await Language.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }

    res.status(200).json({
      success: true,
      data: language
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Language name already exists'
      });
    }
    res.status(400).json({
      success: false,
      message: error.name === 'ValidationError' ? 'Validation error' : 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete language
// @route   DELETE /api/v1/languages/:id
exports.deleteLanguage = async (req, res) => {
  try {
    const language = await Language.findByIdAndDelete(req.params.id);

    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};