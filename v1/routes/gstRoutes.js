const express = require('express');
const router = express.Router();
const gstController = require('../controllers/gstController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

// Register GST for a user
router.post('/:userId/register', gstController.registerGST);

// Get GST details by user ID
router.get('/user/:userId', gstController.getGSTByUser);

// Update GST details
router.patch('/:gstId', gstController.updateGST);

// Upload document
router.post('/:gstId/documents', gstController.uploadDocument);

// Delete GST record
router.delete('/:gstId/user/:userId', gstController.deleteGST);

module.exports = router;