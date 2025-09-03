const express = require('express');
const router = express.Router();
const workController = require('../controllers/workController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, workController.getWorks)
  .post(protect,  workController.createWork);

router.route('/:id')
  .get(protect, workController.getWork)
  .put(protect, workController.updateWork)
  .patch(protect, workController.patchWork)
  .delete(protect,  workController.deleteWork);
  
// Get works by organization ID
router.get('/organization/:organizationId', workController.getWorksByOrganization);

router.get('/staff/:staffId', workController.getWorksByStaff);
router.get('/pm/:pmId', workController.getWorksByProjectManager);
router.get('/client/:clientId', workController.getWorksByClient);
router.get('/associate/:associateId', workController.getWorksByAssociate);
router.get('/admin/:adminId', workController.getWorksByAdmin);

module.exports = router;