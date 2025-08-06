// routes/purchaseBill.routes.js
const express = require('express');
const router = express.Router();
const purchaseBillController = require('../controllers/purchasebillController')
const { protect, authorize } = require('../middleware/authMiddleware');
// Protected routes (require authentication)
router.use(protect);


// Sale Bill Routes
router.post('/', purchaseBillController.createPurchaseBill);
router.get('/', purchaseBillController.getAllPurchaseBills);
router.get('/:id', purchaseBillController.getPurchaseBillById);
router.put('/:id', purchaseBillController.updatePurchaseBill);
router.delete('/:id', purchaseBillController.deletePurchaseBill);
router.put('/:id/cancel', purchaseBillController.cancelPurchaseBill);
router.get('/organization/:orgId', purchaseBillController.getPurchaseBillsByOrganization);
router.get('/vendor/:vendorId', purchaseBillController.getPurchaseBillsByCustomer);

module.exports = router;