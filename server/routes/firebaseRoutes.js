const express = require('express');
const router = express.Router();
const {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  verifyToken
} = require('../controllers/firebaseController');

// Auth routes
router.post('/auth/verify', verifyToken);

// Firestore CRUD routes
router.get('/:collection', getAllDocuments);
router.get('/:collection/:id', getDocumentById);
router.post('/:collection', createDocument);
router.put('/:collection/:id', updateDocument);
router.delete('/:collection/:id', deleteDocument);

module.exports = router;
