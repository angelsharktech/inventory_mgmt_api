// routes/quotationRoutes.js
const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');

// Create a new quotation
router.post('/', quotationController.createQuotation);

// Get all quotations
router.get('/', quotationController.getAllQuotations);

// Get single quotation by ID
router.get('/:id', quotationController.getQuotationById);

// Update a quotation
router.put('/:id', quotationController.updateQuotation);

// Delete a quotation
router.delete('/:id', quotationController.deleteQuotation);

// Get quotations by client ID
router.get('/client/:clientId', quotationController.getQuotationsByClient);

module.exports = router;