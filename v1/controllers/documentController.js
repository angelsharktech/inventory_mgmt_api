const Document = require('../models/Document');
const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

// Helper function to construct absolute file path
const getAbsolutePath = (relativePath) => {
  return path.join(__dirname, '../..', relativePath);
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct relative path for storage in DB
    const relativePath = path.relative(
      path.join(__dirname, '../..'), 
      req.file.path
    ).replace(/\\/g, '/');

    const document = new Document({
      userId: req.user._id,
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      filePath: relativePath,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => console.error('Error deleting file:', err));
    }
    res.status(500).json({ message: error.message });
  }
};

exports.changeDocumentName = async (req, res) => {
  try {
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name: req.body.name },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file from server
    const absolutePath = getAbsolutePath(document.filePath);
    await fs.unlink(absolutePath).catch(err => console.error('Error deleting file:', err));

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.viewDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const absolutePath = getAbsolutePath(document.filePath);
    
    // Verify file exists
    if (!await fs.pathExists(absolutePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(absolutePath, document.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all documents by user ID
exports.getDocumentsByUserId = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.params.userId });
    
    if (!documents || documents.length === 0) {
      return res.status(404).json({ message: 'No documents found for this user' });
    }

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download all documents by user ID as zip
exports.downloadDocumentsByUserId = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.params.userId });
    
    if (!documents || documents.length === 0) {
      return res.status(404).json({ message: 'No documents found for this user' });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipFileName = `user_${req.params.userId}_documents.zip`;
    
    res.attachment(zipFileName);
    archive.pipe(res);

    // Add each document to the zip archive
    for (const doc of documents) {
      const absolutePath = getAbsolutePath(doc.filePath);
      if (await fs.pathExists(absolutePath)) {
        archive.file(absolutePath, { name: doc.originalName });
      }
    }

    archive.finalize();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Download single document by document ID and user ID
exports.downloadUserDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.documentId,
      userId: req.params.userId
    });

    if (!document) {
      return res.status(404).json({ 
        message: 'Document not found or does not belong to this user' 
      });
    }

    const absolutePath = getAbsolutePath(document.filePath);
    
    if (!await fs.pathExists(absolutePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(absolutePath, document.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};