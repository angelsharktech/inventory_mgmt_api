const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.route('/')
  .get(clientController.getClients)
  .post(clientController.createClient);
router.route('/organization/:organizationId')
  .get(clientController.getClientsByOrganization)

router.route('/:id')
  .get(clientController.getClient)
  .put(clientController.updateClient)
  .patch(clientController.patchClient)
  .delete(clientController.deleteClient);

module.exports = router;