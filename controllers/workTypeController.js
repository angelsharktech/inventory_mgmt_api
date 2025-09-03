const WorkType = require('../models/WorkType');

// @desc    Get all work types
// @route   GET /api/v1/worktypes
exports.getWorkTypes = async (req, res) => {
  try {
    const workTypes = await WorkType.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: workTypes.length,
      data: workTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single work type
// @route   GET /api/v1/worktypes/:id
exports.getWorkType = async (req, res) => {
  try {
    const workType = await WorkType.findById(req.params.id);

    if (!workType) {
      return res.status(404).json({
        success: false,
        message: 'Work type not found'
      });
    }

    res.status(200).json({
      success: true,
      data: workType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create work type
// @route   POST /api/v1/worktypes
exports.createWorkType = async (req, res) => {
  try {
    const workType = await WorkType.create(req.body);
    res.status(201).json({
      success: true,
      data: workType
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
};

// @desc    Update work type
// @route   PUT /api/v1/worktypes/:id
exports.updateWorkType = async (req, res) => {
  try {
    const workType = await WorkType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!workType) {
      return res.status(404).json({
        success: false,
        message: 'Work type not found'
      });
    }

    res.status(200).json({
      success: true,
      data: workType
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.name === 'ValidationError' ? 'Validation error' : 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete work type
// @route   DELETE /api/v1/worktypes/:id
exports.deleteWorkType = async (req, res) => {
  try {
    const workType = await WorkType.findByIdAndDelete(req.params.id);

    if (!workType) {
      return res.status(404).json({
        success: false,
        message: 'Work type not found'
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