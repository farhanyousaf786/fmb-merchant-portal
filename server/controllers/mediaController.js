import db from "../models/db.js";

// Upload file metadata to database
const uploadFile = async (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Insert file metadata into database
    const [result] = await db.query(
      'INSERT INTO media (user_id, file_name, file_url, file_type, file_size) VALUES (?, ?, ?, ?, ?)',
      [user_id, req.file.originalname, fileUrl, req.file.mimetype, req.file.size]
    );

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: result.insertId,
        fileName: req.file.originalname,
        fileUrl: fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file'
    });
  }
};

// Get all media files
const getAllMedia = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, u.name as user_name, u.email as user_email 
      FROM media m 
      JOIN users u ON m.user_id = u.id 
      ORDER BY m.created_at DESC
    `);
    
    res.json({
      success: true,
      media: rows
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch media files'
    });
  }
};

// Get media files by user
const getMediaByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [rows] = await db.query(
      'SELECT * FROM media WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    res.json({
      success: true,
      media: rows
    });
  } catch (error) {
    console.error('Get user media error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user media files'
    });
  }
};

// Delete media file
const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query(
      'DELETE FROM media WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Media file not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Media file deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete media file'
    });
  }
};

export {
  uploadFile,
  getAllMedia,
  getMediaByUser,
  deleteMedia
};
