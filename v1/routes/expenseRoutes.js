const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, expenseController.createExpense);
router.get('/', protect, expenseController.getExpenses);
router.get('/:id', protect, expenseController.getExpense);
router.put('/:id', protect, expenseController.updateExpense);
router.delete('/:id', protect, expenseController.deleteExpense);
router.get('/work/:workId', protect, expenseController.getExpensesByWork);
router.get('/client/:clientId', protect, expenseController.getExpensesByClient);

module.exports = router;