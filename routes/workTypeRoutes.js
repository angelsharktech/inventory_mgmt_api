const express = require('express');
const router = express.Router();
const workTypeController = require('../controllers/workTypeController');

// WorkType routes
router.route('/')
  .get(workTypeController.getWorkTypes)
  .post(workTypeController.createWorkType);

router.route('/:id')
  .get(workTypeController.getWorkType)
  .put(workTypeController.updateWorkType)
  .delete(workTypeController.deleteWorkType);

module.exports = router;