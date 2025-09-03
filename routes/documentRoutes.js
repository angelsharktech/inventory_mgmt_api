const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

// Upload Document
router.post(
  '/upload',
  protect,
  
  (req, res, next) => {
    uploadMiddleware.single('document')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  documentController.uploadDocument
);

// Change Document Name
router.patch('/:id/rename', protect, documentController.changeDocumentName);

// Delete Document
router.delete('/:id', protect, documentController.deleteDocument);

// View Document Info
router.get('/:id',  protect,documentController.viewDocument);

// Download Document
router.get('/:id/download',protect,  documentController.downloadDocument);

// List All Documents
router.get('/', protect, documentController.listDocuments);

// Get documents by user ID
router.get('/user/:userId', protect, documentController.getDocumentsByUserId);

// Download all documents by user ID as zip
router.get('/user/:userId/download', protect, documentController.downloadDocumentsByUserId);
// Download single document by user ID and document ID
router.get(
  '/user/:userId/download/:documentId', 
  protect, 
  documentController.downloadUserDocument
);

module.exports = router;