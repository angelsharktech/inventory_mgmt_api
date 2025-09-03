const Expense = require('../models/Expense');
const Work = require('../models/Work');
const User = require('../models/User');

// @desc    Create new expense
// @route   POST /api/v1/expenses
exports.createExpense = async (req, res) => {
  try {
    const { work_id, client_id, amount, category, description } = req.body;

    // Validate work exists
    const workExists = await Work.findById(work_id);
    if (!workExists) {
      return res.status(400).json({
        success: false,
        message: 'Work not found'
      });
    }

    const expense = await Expense.create({
      work_id,
      client_id,
      amount,
      category,
      description,
      createdBy: req.user._id
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('work_id', 'title')
      .populate('client_id', 'first_name last_name')
      .populate('createdBy', 'first_name last_name');

    res.status(201).json({
      success: true,
      data: populatedExpense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all expenses
// @route   GET /api/v1/expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('work_id', 'title')
      .populate('client_id', 'first_name last_name')
      .populate('createdBy', 'first_name last_name')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single expense
// @route   GET /api/v1/expenses/:id
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('work_id', 'title')
      .populate('client_id', 'first_name last_name')
      .populate('createdBy', 'first_name last_name');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update expense
// @route   PUT /api/v1/expenses/:id
exports.updateExpense = async (req, res) => {
  try {
    const { work_id, client_id } = req.body;

    // Validate work exists if being updated
    if (work_id) {
      const workExists = await Work.findById(work_id);
      if (!workExists) {
        return res.status(400).json({
          success: false,
          message: 'Work not found'
        });
      }
    }

    // Validate client exists if being updated
    if (client_id) {
      const clientExists = await User.findOne({ _id: client_id, isClient: true });
      if (!clientExists) {
        return res.status(400).json({
          success: false,
          message: 'Client not found or user is not a client'
        });
      }
    }

    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('work_id', 'title')
      .populate('client_id', 'first_name last_name')
      .populate('createdBy', 'first_name last_name');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/v1/expenses/:id
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get expenses by work ID
// @route   GET /api/v1/expenses/work/:workId
exports.getExpensesByWork = async (req, res) => {
  try {
    const expenses = await Expense.find({ work_id: req.params.workId })
      .populate('work_id', 'title')
      .populate('client_id', 'first_name last_name')
      .populate('createdBy', 'first_name last_name')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get expenses by client ID
// @route   GET /api/v1/expenses/client/:clientId
exports.getExpensesByClient = async (req, res) => {
  try {
    const expenses = await Expense.find({ client_id: req.params.clientId })
      .populate('work_id', 'title')
      .populate('client_id', 'first_name last_name')
      .populate('createdBy', 'first_name last_name')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};