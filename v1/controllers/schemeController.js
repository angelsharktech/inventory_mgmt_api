const Scheme = require('../models/Scheme');
const WorkType = require('../models/WorkType');
const mongoose = require('mongoose')

// @desc    Get all schemes
// @route   GET /api/v1/schemes
exports.getSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find().populate('workType_id').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: schemes.length,
      data: schemes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get schemes by worktype ID
// @route   GET /api/v1/schemes/worktype/:workTypeId
exports.getSchemesByWorkTypeId = async (req, res) => {
  try {
    const workTypeId = req.params.workTypeId;

    // Check if worktype exists
    const workType = await WorkType.findById(workTypeId);
    if (!workType) {
      return res.status(404).json({
        success: false,
        message: 'WorkType not found',
      });
    }

    const schemes = await Scheme.find({
      workType_id: workTypeId,
      isActive: true
    }).populate('workType_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: schemes.length,
      data: schemes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get single scheme by ID
// @route   GET /api/v1/schemes/:id
exports.getScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id).populate('workType_id');

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found',
      });
    }

    res.status(200).json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Create a new scheme
// @route   POST /api/v1/schemes
exports.createScheme = async (req, res) => {
  try {
    // Check if workType exists
    const workType = await WorkType.findById(req.body.workType_id);
    if (!workType) {
      return res.status(400).json({
        success: false,
        message: 'WorkType not found',
      });
    }

    const scheme = await Scheme.create(req.body);
    res.status(201).json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Scheme name already exists',
      });
    }
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message,
    });
  }
};

// @desc    Update scheme (PUT - Full Update)
// @route   PUT /api/v1/schemes/:id
exports.updateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('workType_id');

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found',
      });
    }

    res.status(200).json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Scheme name already exists',
      });
    }
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message,
    });
  }
};

// @desc    Update scheme (PATCH - Partial Update)
// @route   PATCH /api/v1/schemes/:id
exports.patchScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('workType_id');

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found',
      });
    }

    res.status(200).json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Scheme name already exists',
      });
    }
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message,
    });
  }
};

// @desc    Delete a scheme
// @route   DELETE /api/v1/schemes/:id
exports.deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};