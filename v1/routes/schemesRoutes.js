const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/schemeController');

router.route('/')
  .get(schemeController.getSchemes)
  .post(schemeController.createScheme);

router.route('/:id')
  .get(schemeController.getScheme)
  .put(schemeController.updateScheme)
  .patch(schemeController.patchScheme)
  .delete(schemeController.deleteScheme);
router.route('/worktype/:id').get(schemeController.getSchemesByWorkTypeId)
module.exports = router;