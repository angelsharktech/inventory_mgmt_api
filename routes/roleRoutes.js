const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

// CRUD Routes for Roles
router.post('/', roleController.createRole); // Create
router.get('/', roleController.getRoles); // Read all
router.get('/:id', roleController.getRoleById); // Read one
router.patch('/:id', roleController.updateRole); // Update (partial)
router.put('/:id', roleController.updateRole); // Update (full replace)
router.delete('/:id', roleController.deleteRole); // Delete

module.exports = router;