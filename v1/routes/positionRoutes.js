const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');

// CRUD Routes for Positions
router.post('/', positionController.createPosition); // Create
router.get('/', positionController.getPositions); // Read all
router.get('/:id', positionController.getPositionById); // Read one
router.patch('/:id', positionController.updatePosition); // Partial update
router.put('/:id', positionController.updatePosition); // Full update
router.delete('/:id', positionController.deletePosition); // Delete

module.exports = router;