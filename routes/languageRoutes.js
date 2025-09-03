const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');

router.route('/')
  .get(languageController.getLanguages)
  .post(languageController.createLanguage);

router.route('/:id')
  .put(languageController.updateLanguage)
  .delete(languageController.deleteLanguage);

module.exports = router;