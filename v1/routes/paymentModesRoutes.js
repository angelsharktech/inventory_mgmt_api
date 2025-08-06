const express = require('express');
const router = express.Router();
const paymentModeController = require('../controllers/paymentModeController');

// Basic CRUD routes
router.route('/')
  .get(paymentModeController.getPaymentModes)
  .post(paymentModeController.createPaymentMode);

router.route('/:id')
  .get(paymentModeController.getPaymentMode)
  .put(paymentModeController.updatePaymentMode)
  .patch(paymentModeController.patchPaymentMode)
  .delete(paymentModeController.deletePaymentMode);

// Filtered payment mode routes
router.route('/salebill/:salebillId')
  .get(paymentModeController.getPaymentsBySaleBill);

router.route('/purchasebill/:purchasebillId')
  .get(paymentModeController.getPaymentsByPurchaseBill);

router.route('/client/:clientId')
  .get(paymentModeController.getPaymentsByClient);

router.route('/organization/:orgId')
  .get(paymentModeController.getPaymentsByOrganization);

router.route('/associate/:associateId')
  .get(paymentModeController.getPaymentsByAssociate);

router.route('/created-by/:userId')
  .get(paymentModeController.getPaymentsByCreatedBy);

module.exports = router;