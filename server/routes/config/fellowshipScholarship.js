const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/fellowship-scholarship');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `fellowship-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

// Validation rules for fellowship/scholarship
const fellowshipScholarshipValidation = [
  body('fellowshipFor').notEmpty().withMessage('Fellowship/Scholarship For is required'),
  body('awardedBy').notEmpty().withMessage('Awarded By is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a non-negative number'),
  body('type').isIn(['Fellowship', 'Scholarship', 'Grant', 'Award']).withMessage('Type must be one of: Fellowship, Scholarship, Grant, Award'),
  body('abstract').notEmpty().withMessage('Abstract is required')
];

// GET /api/config/fellowship-scholarship - Get all fellowship/scholarship entries with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id,
        fellowship_for,
        awarded_by,
        start_date,
        end_date,
        amount,
        type,
        abstract,
        upload_file,
        created_at,
        updated_at
      FROM fellowship_scholarship
    `;
    let countQuery = 'SELECT COUNT(*) FROM fellowship_scholarship';
    const params = [];

    if (search) {
      query += ' WHERE fellowship_for ILIKE $1 OR awarded_by ILIKE $1 OR type ILIKE $1 OR abstract ILIKE $1';
      countQuery += ' WHERE fellowship_for ILIKE $1 OR awarded_by ILIKE $1 OR type ILIKE $1 OR abstract ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), offset);

    const [result, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, search ? [params[0]] : [])
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'Fellowship/Scholarship entries retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching fellowship/scholarship entries:', error);
    res.status(500).json({ message: 'Error fetching fellowship/scholarship entries', error: error.message });
  }
});

// GET /api/config/fellowship-scholarship/:id - Get fellowship/scholarship by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT 
        id,
        fellowship_for,
        awarded_by,
        start_date,
        end_date,
        amount,
        type,
        abstract,
        upload_file,
        created_at,
        updated_at
      FROM fellowship_scholarship
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Fellowship/Scholarship entry not found' });
    }
    
    res.json({ data: result.rows[0], message: 'Fellowship/Scholarship entry retrieved successfully' });
  } catch (error) {
    console.error('Error fetching fellowship/scholarship entry:', error);
    res.status(500).json({ message: 'Error fetching fellowship/scholarship entry', error: error.message });
  }
});

// POST /api/config/fellowship-scholarship - Create new fellowship/scholarship entry
router.post('/', upload.single('uploadFile'), fellowshipScholarshipValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    fellowshipFor,
    awardedBy,
    startDate,
    endDate,
    amount,
    type,
    abstract
  } = req.body;

  // Debug file upload
  console.log('File upload debug:', {
    hasFile: !!req.file,
    fileInfo: req.file ? {
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : null,
    body: req.body
  });

  try {
    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({ message: 'End date must be after or equal to start date' });
    }

    const result = await db.query(
      `INSERT INTO fellowship_scholarship
       (fellowship_for, awarded_by, start_date, end_date, amount, type, abstract, upload_file)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        fellowshipFor,
        awardedBy,
        startDate,
        endDate,
        parseFloat(amount),
        type,
        abstract,
        req.file ? req.file.filename : null
      ]
    );

    res.status(201).json({ data: result.rows[0], message: 'Fellowship/Scholarship entry created successfully' });
  } catch (error) {
    console.error('Error creating fellowship/scholarship entry:', error);
    res.status(500).json({ message: 'Error creating fellowship/scholarship entry', error: error.message });
  }
});

// PUT /api/config/fellowship-scholarship/:id - Update fellowship/scholarship entry
router.put('/:id', upload.single('uploadFile'), fellowshipScholarshipValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const {
    fellowshipFor,
    awardedBy,
    startDate,
    endDate,
    amount,
    type,
    abstract,
    delete_file
  } = req.body;

  // Debug file upload
  console.log('File update debug:', {
    id,
    hasFile: !!req.file,
    fileInfo: req.file ? {
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : null,
    deleteFile: delete_file,
    body: req.body
  });

  try {
    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({ message: 'End date must be after or equal to start date' });
    }

    // Get current entry to check for existing file
    const currentEntry = await db.query('SELECT upload_file FROM fellowship_scholarship WHERE id = $1', [id]);
    if (currentEntry.rows.length === 0) {
      return res.status(404).json({ message: 'Fellowship/Scholarship entry not found' });
    }

    let uploadFile = currentEntry.rows[0].upload_file;

    // Handle file operations
    if (req.file) {
      // New file uploaded - delete old file if exists
      if (uploadFile) {
        const oldFilePath = path.join(__dirname, '../../uploads/fellowship', uploadFile);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      uploadFile = req.file.filename;
    } else if (delete_file === 'true') {
      // Delete existing file
      if (uploadFile) {
        const oldFilePath = path.join(__dirname, '../../uploads/fellowship', uploadFile);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      uploadFile = null;
    }

    const result = await db.query(
      `UPDATE fellowship_scholarship
       SET fellowship_for = $1,
           awarded_by = $2,
           start_date = $3,
           end_date = $4,
           amount = $5,
           type = $6,
           abstract = $7,
           upload_file = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        fellowshipFor,
        awardedBy,
        startDate,
        endDate,
        parseFloat(amount),
        type,
        abstract,
        uploadFile,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Fellowship/Scholarship entry not found' });
    }

    res.json({ data: result.rows[0], message: 'Fellowship/Scholarship entry updated successfully' });
  } catch (error) {
    console.error('Error updating fellowship/scholarship entry:', error);
    res.status(500).json({ message: 'Error updating fellowship/scholarship entry', error: error.message });
  }
});

// DELETE /api/config/fellowship-scholarship/:id - Delete fellowship/scholarship entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the entry to check for file
    const entry = await db.query('SELECT upload_file FROM fellowship_scholarship WHERE id = $1', [id]);
    if (entry.rows.length === 0) {
      return res.status(404).json({ message: 'Fellowship/Scholarship entry not found' });
    }

    // Delete associated file if exists
    if (entry.rows[0].upload_file) {
      const filePath = path.join(__dirname, '../../uploads/fellowship', entry.rows[0].upload_file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const result = await db.query('DELETE FROM fellowship_scholarship WHERE id = $1 RETURNING *', [id]);

    res.json({ message: 'Fellowship/Scholarship entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting fellowship/scholarship entry:', error);
    res.status(500).json({ message: 'Error deleting fellowship/scholarship entry', error: error.message });
  }
});

module.exports = router;
