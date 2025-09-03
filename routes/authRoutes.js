const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);
// Bank details routes
router.patch('/:id/bank-details',  authController.updateBankDetails);


module.exports = router;