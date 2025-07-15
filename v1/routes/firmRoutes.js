const express = require('express');
const router = express.Router();
const firmController = require('../controllers/firmController');

// CRUD Routes for Firms
router.post('/', firmController.createFirm); // Create
router.get('/', firmController.getFirms); // Read all
router.get('/:id', firmController.getFirmById); // Read one
router.patch('/:id', firmController.updateFirm); // Update
router.put('/:id', firmController.updateFirm); // Alternative update
router.delete('/:id', firmController.deleteFirm); // Delete

module.exports = router;