const { getFirestore, getAuth } = require('../config/firebase');

// Example: Get all documents from a collection
const getAllDocuments = async (req, res) => {
  try {
    const { collection } = req.params;
    const db = getFirestore();
    
    const snapshot = await db.collection(collection).get();
    const documents = [];
    
    snapshot.forEach(doc => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Example: Get a single document by ID
const getDocumentById = async (req, res) => {
  try {
    const { collection, id } = req.params;
    const db = getFirestore();
    
    const doc = await db.collection(collection).doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Example: Create a new document
const createDocument = async (req, res) => {
  try {
    const { collection } = req.params;
    const data = req.body;
    const db = getFirestore();
    
    const docRef = await db.collection(collection).add({
      ...data,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...data
      }
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Example: Update a document
const updateDocument = async (req, res) => {
  try {
    const { collection, id } = req.params;
    const data = req.body;
    const db = getFirestore();
    
    await db.collection(collection).doc(id).update({
      ...data,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      data: {
        id,
        ...data
      }
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Example: Delete a document
const deleteDocument = async (req, res) => {
  try {
    const { collection, id } = req.params;
    const db = getFirestore();
    
    await db.collection(collection).doc(id).delete();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Example: Verify Firebase Auth token
const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    const auth = getAuth();
    
    const decodedToken = await auth.verifyIdToken(token);
    
    res.status(200).json({
      success: true,
      data: decodedToken
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

module.exports = {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  verifyToken
};
