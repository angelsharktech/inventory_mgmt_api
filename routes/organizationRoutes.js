const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

// CRUD Routes for Organizations
router.post('/', organizationController.createOrganization); // Create
router.get('/', organizationController.getOrganizations); // Read all
router.get('/:id', organizationController.getOrganizationById); // Read one
router.patch('/:id', organizationController.updateOrganization); // Update
router.put('/:id', organizationController.updateOrganization); // Alternative update
router.delete('/:id', organizationController.deleteOrganization); // Delete

module.exports = router;