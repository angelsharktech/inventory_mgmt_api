const express = require('express');
const router = express.Router();
const paymentModeController = require('../controllers/paymentModeController');

router.route('/')
  .get(paymentModeController.getPaymentModes)
  .post(paymentModeController.createPaymentMode);

router.route('/:id')
  .get(paymentModeController.getPaymentMode)
  .put(paymentModeController.updatePaymentMode)
  .patch(paymentModeController.patchPaymentMode)
  .delete(paymentModeController.deletePaymentMode);

module.exports = router;