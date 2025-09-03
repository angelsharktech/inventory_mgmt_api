// routes/saleBill.routes.js
const express = require('express');
const router = express.Router();
const saleBillController = require('../controllers/salebillController')
const { protect, authorize } = require('../middleware/authMiddleware');
// Protected routes (require authentication)
router.use(protect);


// Sale Bill Routes
router.post('/', saleBillController.createSaleBill);
router.get('/', saleBillController.getAllSaleBills);
router.get('/:id', saleBillController.getSaleBillById);
router.put('/:id', saleBillController.updateSaleBill);
router.delete('/:id', saleBillController.deleteSaleBill);
router.put('/cancel/:id', saleBillController.cancelSaleBill);
router.get('/organization/:orgId', saleBillController.getSaleBillsByOrganization);
router.get('/customer/:customerId', saleBillController.getSaleBillsByCustomer);

module.exports = router;