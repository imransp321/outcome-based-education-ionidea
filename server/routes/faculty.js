const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    
    // Determine upload path based on the route
    if (req.path.includes('journal-editorial')) {
      uploadPath = path.join(__dirname, 'uploads', 'journal-editorial');
    } else if (req.path.includes('fellowship-scholarship')) {
      uploadPath = path.join(__dirname, 'uploads', 'fellowship-scholarship');
    } else {
      uploadPath = path.join(__dirname, 'uploads');
    }
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only specific file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG, GIF) and documents (PDF, DOC, DOCX) are allowed'));
    }
  }
});

// Get all faculty profiles
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        fpd.*,
        fpr.employee_no,
        fpr.faculty_type,
        fpr.current_designation,
        fpr.date_of_joining,
        fpr.total_experience
      FROM faculty_personal_details fpd
      LEFT JOIN faculty_professional_details fpr ON fpd.faculty_id = fpr.faculty_id
      ORDER BY fpd.first_name, fpd.last_name
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching faculty profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty profiles',
      error: error.message
    });
  }
});

// Awards and Honors endpoints
router.get('/awards-honors', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM faculty_awards_honors 
      ORDER BY awarded_year DESC, created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching awards and honors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching awards and honors',
      error: error.message
    });
  }
});

router.get('/awards-honors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM faculty_awards_honors WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching award:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching award',
      error: error.message
    });
  }
});

router.post('/awards-honors', [
  body('awardedName').notEmpty().withMessage('Awarded name is required'),
  body('awardedFor').notEmpty().withMessage('Awarded for is required'),
  body('awardedYear').notEmpty().withMessage('Awarded year is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      awardedName,
      awardedFor,
      awardedOrganization,
      awardedYear,
      venue,
      awardDetails,
      uploadFile
    } = req.body;

    const result = await db.query(`
      INSERT INTO faculty_awards_honors (
        awarded_name, awarded_for, awarded_organization, awarded_year,
        venue, award_details, upload_file, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      awardedName, awardedFor, awardedOrganization, awardedYear,
      venue, awardDetails, uploadFile
    ]);

    res.status(201).json({
      success: true,
      message: 'Award created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating award:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating award',
      error: error.message
    });
  }
});

router.put('/awards-honors/:id', [
  body('awardedName').notEmpty().withMessage('Awarded name is required'),
  body('awardedFor').notEmpty().withMessage('Awarded for is required'),
  body('awardedYear').notEmpty().withMessage('Awarded year is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const {
      awardedName,
      awardedFor,
      awardedOrganization,
      awardedYear,
      venue,
      awardDetails,
      uploadFile
    } = req.body;

    const result = await db.query(`
      UPDATE faculty_awards_honors SET
        awarded_name = $1,
        awarded_for = $2,
        awarded_organization = $3,
        awarded_year = $4,
        venue = $5,
        award_details = $6,
        upload_file = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [
      awardedName, awardedFor, awardedOrganization, awardedYear,
      venue, awardDetails, uploadFile, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }

    res.json({
      success: true,
      message: 'Award updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating award:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating award',
      error: error.message
    });
  }
});

router.delete('/awards-honors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM faculty_awards_honors WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }

    res.json({
      success: true,
      message: 'Award deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting award:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting award',
      error: error.message
    });
  }
});

// File upload endpoint
router.post('/awards-honors/upload', async (req, res) => {
  try {
    // This is a placeholder for file upload functionality
    // In a real implementation, you would use multer or similar middleware
    res.json({
      success: true,
      message: 'File upload endpoint - implementation needed',
      data: { filename: 'uploaded-file.pdf' }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// Journal Editorial endpoints
router.get('/journal-editorial', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT * FROM journal_editorial 
      WHERE 1=1
    `;
    let countQuery = `SELECT COUNT(*) FROM journal_editorial WHERE 1=1`;
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (position ILIKE $${paramCount} OR journal_name ILIKE $${paramCount})`;
      countQuery += ` AND (position ILIKE $${paramCount} OR journal_name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const [result, countResult] = await Promise.all([
      db.query(query, queryParams),
      db.query(countQuery, queryParams.slice(0, -2))
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching journal editorial data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching journal editorial data',
      error: error.message
    });
  }
});

router.get('/journal-editorial/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM journal_editorial WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Journal editorial entry not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching journal editorial entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching journal editorial entry',
      error: error.message
    });
  }
});

router.post('/journal-editorial', [
  body('position').notEmpty().withMessage('Position is required'),
  body('journalName').notEmpty().withMessage('Journal name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { position, journalName, description, uploadFile } = req.body;

    const result = await db.query(`
      INSERT INTO journal_editorial (position, journal_name, description, upload_file, created_at, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [position, journalName, description, uploadFile]);

    res.status(201).json({
      success: true,
      message: 'Journal editorial entry created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating journal editorial entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating journal editorial entry',
      error: error.message
    });
  }
});

router.put('/journal-editorial/:id', [
  body('position').notEmpty().withMessage('Position is required'),
  body('journalName').notEmpty().withMessage('Journal name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { position, journalName, description, uploadFile } = req.body;

    const result = await db.query(`
      UPDATE journal_editorial SET
        position = $1,
        journal_name = $2,
        description = $3,
        upload_file = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [position, journalName, description, uploadFile, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Journal editorial entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Journal editorial entry updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating journal editorial entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating journal editorial entry',
      error: error.message
    });
  }
});

router.delete('/journal-editorial/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM journal_editorial WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Journal editorial entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Journal editorial entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting journal editorial entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting journal editorial entry',
      error: error.message
    });
  }
});

// File upload endpoint for journal editorial
router.post('/journal-editorial/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return the file information
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: `/uploads/journal-editorial/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// Academic Bodies endpoints
// GET /api/faculty/academic-bodies - Get all academic bodies with pagination
router.get('/academic-bodies', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `SELECT * FROM academic_bodies WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) FROM academic_bodies WHERE 1=1`;
    const queryParams = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND (member_of ILIKE $${paramCount} OR institution ILIKE $${paramCount})`;
      countQuery += ` AND (member_of ILIKE $${paramCount} OR institution ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);
    
    const [result, countResult] = await Promise.all([
      db.query(query, queryParams),
      db.query(countQuery, queryParams.slice(0, -2))
    ]);
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching academic bodies data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching academic bodies data',
      error: error.message
    });
  }
});

// POST /api/faculty/academic-bodies - Create new academic body
router.post('/academic-bodies', upload.single('uploadFile'), [
  body('memberOf').notEmpty().withMessage('Member of is required'),
  body('institution').notEmpty().withMessage('Institution is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { memberOf, institution, description } = req.body;
    const uploadFile = req.file ? req.file.filename : null;
    
    const result = await db.query(`
      INSERT INTO academic_bodies (member_of, institution, description, upload_file, created_at, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [memberOf, institution, description, uploadFile]);
    
    res.status(201).json({
      success: true,
      message: 'Academic body created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating academic body:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating academic body',
      error: error.message
    });
  }
});

// PUT /api/faculty/academic-bodies/:id - Update academic body
router.put('/academic-bodies/:id', upload.single('uploadFile'), [
  body('memberOf').notEmpty().withMessage('Member of is required'),
  body('institution').notEmpty().withMessage('Institution is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { memberOf, institution, description } = req.body;
    const uploadFile = req.file ? req.file.filename : req.body.uploadFile;
    
    const result = await db.query(`
      UPDATE academic_bodies 
      SET member_of = $1, institution = $2, description = $3, upload_file = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [memberOf, institution, description, uploadFile, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Academic body not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Academic body updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating academic body:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating academic body',
      error: error.message
    });
  }
});

// DELETE /api/faculty/academic-bodies/:id - Delete academic body
router.delete('/academic-bodies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM academic_bodies WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Academic body not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Academic body deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting academic body:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting academic body',
      error: error.message
    });
  }
});

// File upload endpoint for academic bodies
router.post('/academic-bodies/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return the file information
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// Patent Innovation endpoints
// GET /api/faculty/patent-innovation - Get all patent innovations with pagination
router.get('/patent-innovation', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `SELECT * FROM patent_innovation WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) FROM patent_innovation WHERE 1=1`;
    const queryParams = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND (title ILIKE $${paramCount} OR patent_no ILIKE $${paramCount} OR status ILIKE $${paramCount})`;
      countQuery += ` AND (title ILIKE $${paramCount} OR patent_no ILIKE $${paramCount} OR status ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);
    
    const [result, countResult] = await Promise.all([
      db.query(query, queryParams),
      db.query(countQuery, queryParams.slice(0, -2))
    ]);
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching patent innovation data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patent innovation data',
      error: error.message
    });
  }
});

// GET /api/faculty/patent-innovation/:id - Get patent innovation by ID
router.get('/patent-innovation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM patent_innovation WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patent innovation not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching patent innovation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patent innovation',
      error: error.message
    });
  }
});

// POST /api/faculty/patent-innovation - Create new patent innovation
router.post('/patent-innovation', upload.single('uploadFile'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('patentNo').notEmpty().withMessage('Patent number is required'),
  body('year').notEmpty().withMessage('Year is required'),
  body('status').notEmpty().withMessage('Status is required'),
  body('activityType').notEmpty().withMessage('Activity type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, patentNo, year, status, activityType, abstract } = req.body;
    const uploadFile = req.file ? req.file.filename : null;

    const result = await db.query(`
      INSERT INTO patent_innovation (title, patent_no, year, status, activity_type, abstract, upload_file, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [title, patentNo, year, status, activityType, abstract, uploadFile]);

    res.status(201).json({
      success: true,
      message: 'Patent innovation created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating patent innovation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating patent innovation',
      error: error.message
    });
  }
});

// PUT /api/faculty/patent-innovation/:id - Update patent innovation
router.put('/patent-innovation/:id', upload.single('uploadFile'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('patentNo').notEmpty().withMessage('Patent number is required'),
  body('year').notEmpty().withMessage('Year is required'),
  body('status').notEmpty().withMessage('Status is required'),
  body('activityType').notEmpty().withMessage('Activity type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { title, patentNo, year, status, activityType, abstract } = req.body;
    const uploadFile = req.file ? req.file.filename : req.body.uploadFile;

    const result = await db.query(`
      UPDATE patent_innovation
      SET title = $1, patent_no = $2, year = $3, status = $4, activity_type = $5, abstract = $6, upload_file = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [title, patentNo, year, status, activityType, abstract, uploadFile, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patent innovation not found'
      });
    }

    res.json({
      success: true,
      message: 'Patent innovation updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating patent innovation:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating patent innovation',
      error: error.message
    });
  }
});

// DELETE /api/faculty/patent-innovation/:id - Delete patent innovation
router.delete('/patent-innovation/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM patent_innovation WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patent innovation not found'
      });
    }

    res.json({
      success: true,
      message: 'Patent innovation deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting patent innovation:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting patent innovation',
      error: error.message
    });
  }
});

// File upload endpoint for patent innovation
router.post('/patent-innovation/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return the file information
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// Professional Bodies endpoints
// GET /api/faculty/professional-bodies - Get all professional bodies with pagination
router.get('/professional-bodies', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `SELECT * FROM professional_bodies WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) FROM professional_bodies WHERE 1=1`;
    const queryParams = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND (organization_name ILIKE $${paramCount} OR membership_no ILIKE $${paramCount} OR membership_type ILIKE $${paramCount})`;
      countQuery += ` AND (organization_name ILIKE $${paramCount} OR membership_no ILIKE $${paramCount} OR membership_type ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);
    
    const [result, countResult] = await Promise.all([
      db.query(query, queryParams),
      db.query(countQuery, queryParams.slice(0, -2))
    ]);
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching professional bodies data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching professional bodies data',
      error: error.message
    });
  }
});

// GET /api/faculty/professional-bodies/:id - Get professional body by ID
router.get('/professional-bodies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM professional_bodies WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Professional body not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching professional body:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching professional body',
      error: error.message
    });
  }
});

// POST /api/faculty/professional-bodies - Create new professional body
router.post('/professional-bodies', upload.single('uploadFile'), [
  body('organizationName').notEmpty().withMessage('Organization name is required'),
  body('membershipType').notEmpty().withMessage('Membership type is required'),
  body('membershipNo').notEmpty().withMessage('Membership number is required'),
  body('date').notEmpty().withMessage('Date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { organizationName, membershipType, membershipNo, date, description } = req.body;
    const uploadFile = req.file ? req.file.filename : null;
    
    const result = await db.query(`
      INSERT INTO professional_bodies (organization_name, membership_type, membership_no, date, description, upload_file, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [organizationName, membershipType, membershipNo, date, description, uploadFile]);
    
    res.status(201).json({
      success: true,
      message: 'Professional body created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating professional body:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating professional body',
      error: error.message
    });
  }
});

// PUT /api/faculty/professional-bodies/:id - Update professional body
router.put('/professional-bodies/:id', upload.single('uploadFile'), [
  body('organizationName').notEmpty().withMessage('Organization name is required'),
  body('membershipType').notEmpty().withMessage('Membership type is required'),
  body('membershipNo').notEmpty().withMessage('Membership number is required'),
  body('date').notEmpty().withMessage('Date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { organizationName, membershipType, membershipNo, date, description } = req.body;
    const uploadFile = req.file ? req.file.filename : req.body.uploadFile;
    
    const result = await db.query(`
      UPDATE professional_bodies 
      SET organization_name = $1, membership_type = $2, membership_no = $3, date = $4, description = $5, upload_file = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [organizationName, membershipType, membershipNo, date, description, uploadFile, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Professional body not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Professional body updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating professional body:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating professional body',
      error: error.message
    });
  }
});

// DELETE /api/faculty/professional-bodies/:id - Delete professional body
router.delete('/professional-bodies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM professional_bodies WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Professional body not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Professional body deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting professional body:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting professional body',
      error: error.message
    });
  }
});

// File upload endpoint for professional bodies
router.post('/professional-bodies/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return the file information
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// Research Projects endpoints
// GET /api/faculty/research-projects - Get all research projects with pagination
router.get('/research-projects', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id, project_title, role, team_members, status, collaboration,
        sanctioned_date, amount_sanctioned, duration, funding_agency,
        amount_utilized, outcome, upload_file, created_at, updated_at
      FROM research_projects
    `;
    
    const queryParams = [];
    
    if (search) {
      query += ` WHERE 
        project_title ILIKE $1 OR 
        role ILIKE $1 OR 
        funding_agency ILIKE $1 OR
        team_members ILIKE $1
      `;
      queryParams.push(`%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(parseInt(limit), offset);

    const result = await db.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM research_projects';
    const countParams = [];
    
    if (search) {
      countQuery += ` WHERE 
        project_title ILIKE $1 OR 
        role ILIKE $1 OR 
        funding_agency ILIKE $1 OR
        team_members ILIKE $1
      `;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching research projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching research projects',
      error: error.message
    });
  }
});

// GET /api/faculty/research-projects/:id - Get research project by ID
router.get('/research-projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM research_projects WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Research project not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching research project:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching research project',
      error: error.message
    });
  }
});

// POST /api/faculty/research-projects - Create new research project
router.post('/research-projects', upload.single('uploadFile'), async (req, res) => {
  try {
    const {
      projectTitle,
      role,
      teamMembers,
      status,
      collaboration,
      sanctionedDate,
      amountSanctioned,
      duration,
      fundingAgency,
      amountUtilized,
      outcome
    } = req.body;

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Handle file upload
    const uploadFile = req.file ? req.file.filename : null;

    const result = await db.query(
      `INSERT INTO research_projects (
        project_title, role, team_members, status, collaboration,
        sanctioned_date, amount_sanctioned, duration, funding_agency,
        amount_utilized, outcome, upload_file
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        projectTitle,
        role,
        teamMembers || null,
        status || 'On Going',
        collaboration || null,
        sanctionedDate,
        parseFloat(amountSanctioned) || 0,
        parseInt(duration) || 0,
        fundingAgency,
        parseFloat(amountUtilized) || 0,
        outcome || null,
        uploadFile
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Research project created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating research project:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating research project',
      error: error.message
    });
  }
});

// PUT /api/faculty/research-projects/:id - Update research project
router.put('/research-projects/:id', upload.single('uploadFile'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      projectTitle,
      role,
      teamMembers,
      status,
      collaboration,
      sanctionedDate,
      amountSanctioned,
      duration,
      fundingAgency,
      amountUtilized,
      outcome,
      existingFile
    } = req.body;

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Handle file upload - use new file if uploaded, otherwise keep existing
    const uploadFile = req.file ? req.file.filename : (existingFile || null);

    const result = await db.query(
      `UPDATE research_projects SET
        project_title = $1,
        role = $2,
        team_members = $3,
        status = $4,
        collaboration = $5,
        sanctioned_date = $6,
        amount_sanctioned = $7,
        duration = $8,
        funding_agency = $9,
        amount_utilized = $10,
        outcome = $11,
        upload_file = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *`,
      [
        projectTitle,
        role,
        teamMembers || null,
        status || 'On Going',
        collaboration || null,
        sanctionedDate,
        parseFloat(amountSanctioned) || 0,
        parseInt(duration) || 0,
        fundingAgency,
        parseFloat(amountUtilized) || 0,
        outcome || null,
        uploadFile,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Research project not found'
      });
    }

    res.json({
      success: true,
      message: 'Research project updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating research project:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating research project',
      error: error.message
    });
  }
});

// DELETE /api/faculty/research-projects/:id - Delete research project
router.delete('/research-projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM research_projects WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Research project not found'
      });
    }

    res.json({
      success: true,
      message: 'Research project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting research project:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting research project',
      error: error.message
    });
  }
});

// File upload endpoint for research projects
router.post('/research-projects/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return the file information
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// Research Publications endpoints
// GET /api/faculty/research-publications - Get all research publications with pagination
router.get('/research-publications', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id, title_of_paper, authors, page_no, publication_journal_title, publication_year,
        publisher, volume_no, issn_isbn, scopus_sci_peer_reviewed, doi, impact_factor,
        type, level_status, status, h_index, i10_index, snip, sjr_index, published_url,
        index_terms, issue_no, conference_name, event_organizer, any_awards,
        institutional_affiliation, abstract, upload_file, created_at, updated_at
      FROM research_publications
    `;
    
    const queryParams = [];
    
    if (search) {
      query += ` WHERE 
        title_of_paper ILIKE $1 OR 
        authors ILIKE $1 OR 
        publication_journal_title ILIKE $1 OR
        conference_name ILIKE $1
      `;
      queryParams.push(`%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(parseInt(limit), offset);

    const result = await db.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM research_publications';
    const countParams = [];
    
    if (search) {
      countQuery += ` WHERE 
        title_of_paper ILIKE $1 OR 
        authors ILIKE $1 OR 
        publication_journal_title ILIKE $1 OR
        conference_name ILIKE $1
      `;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching research publications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching research publications',
      error: error.message
    });
  }
});

// GET /api/faculty/research-publications/:id - Get research publication by ID
router.get('/research-publications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM research_publications WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Research publication not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching research publication:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching research publication',
      error: error.message
    });
  }
});

// POST /api/faculty/research-publications - Create new research publication
router.post('/research-publications', upload.single('uploadFile'), async (req, res) => {
  try {
    const {
      titleOfPaper,
      authors,
      pageNo,
      publicationJournalTitle,
      publicationYear,
      publisher,
      volumeNo,
      issnIsbn,
      scopusSciPeerReviewed,
      doi,
      impactFactor,
      type,
      levelStatus,
      status,
      hIndex,
      i10Index,
      snip,
      sjrIndex,
      publishedUrl,
      indexTerms,
      issueNo,
      conferenceName,
      eventOrganizer,
      anyAwards,
      institutionalAffiliation,
      abstract
    } = req.body;

    // Handle file upload
    const uploadFile = req.file ? req.file.filename : null;

    const result = await db.query(
      `INSERT INTO research_publications (
        title_of_paper, authors, page_no, publication_journal_title, publication_year,
        publisher, volume_no, issn_isbn, scopus_sci_peer_reviewed, doi, impact_factor,
        type, level_status, status, h_index, i10_index, snip, sjr_index, published_url,
        index_terms, issue_no, conference_name, event_organizer, any_awards,
        institutional_affiliation, abstract, upload_file
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      RETURNING *`,
      [
        titleOfPaper,
        authors,
        pageNo || null,
        publicationJournalTitle,
        publicationYear,
        publisher || null,
        volumeNo || null,
        issnIsbn || null,
        scopusSciPeerReviewed || 'SCI',
        doi || null,
        impactFactor || null,
        type || 'Journal',
        levelStatus || 'International',
        status || 'Published',
        hIndex || null,
        i10Index || null,
        snip || null,
        sjrIndex || null,
        publishedUrl || null,
        indexTerms || null,
        issueNo || null,
        conferenceName || null,
        eventOrganizer || null,
        anyAwards === 'true' || anyAwards === true,
        institutionalAffiliation === 'true' || institutionalAffiliation === true,
        abstract || null,
        uploadFile
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Research publication created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating research publication:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating research publication',
      error: error.message
    });
  }
});

// PUT /api/faculty/research-publications/:id - Update research publication
router.put('/research-publications/:id', upload.single('uploadFile'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titleOfPaper,
      authors,
      pageNo,
      publicationJournalTitle,
      publicationYear,
      publisher,
      volumeNo,
      issnIsbn,
      scopusSciPeerReviewed,
      doi,
      impactFactor,
      type,
      levelStatus,
      status,
      hIndex,
      i10Index,
      snip,
      sjrIndex,
      publishedUrl,
      indexTerms,
      issueNo,
      conferenceName,
      eventOrganizer,
      anyAwards,
      institutionalAffiliation,
      abstract,
      delete_file
    } = req.body;

    // Handle file upload
    let uploadFile = null;
    if (req.file) {
      uploadFile = req.file.filename;
    } else if (delete_file === 'true') {
      uploadFile = null;
    }

    const result = await db.query(
      `UPDATE research_publications SET
        title_of_paper = $1, authors = $2, page_no = $3, publication_journal_title = $4,
        publication_year = $5, publisher = $6, volume_no = $7, issn_isbn = $8,
        scopus_sci_peer_reviewed = $9, doi = $10, impact_factor = $11, type = $12,
        level_status = $13, status = $14, h_index = $15, i10_index = $16, snip = $17,
        sjr_index = $18, published_url = $19, index_terms = $20, issue_no = $21,
        conference_name = $22, event_organizer = $23, any_awards = $24,
        institutional_affiliation = $25, abstract = $26, upload_file = $27,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $28
      RETURNING *`,
      [
        titleOfPaper,
        authors,
        pageNo || null,
        publicationJournalTitle,
        publicationYear,
        publisher || null,
        volumeNo || null,
        issnIsbn || null,
        scopusSciPeerReviewed || 'SCI',
        doi || null,
        impactFactor || null,
        type || 'Journal',
        levelStatus || 'International',
        status || 'Published',
        hIndex || null,
        i10Index || null,
        snip || null,
        sjrIndex || null,
        publishedUrl || null,
        indexTerms || null,
        issueNo || null,
        conferenceName || null,
        eventOrganizer || null,
        anyAwards === 'true' || anyAwards === true,
        institutionalAffiliation === 'true' || institutionalAffiliation === true,
        abstract || null,
        uploadFile,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Research publication not found'
      });
    }

    res.json({
      success: true,
      message: 'Research publication updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating research publication:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating research publication',
      error: error.message
    });
  }
});

// DELETE /api/faculty/research-publications/:id - Delete research publication
router.delete('/research-publications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM research_publications WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Research publication not found'
      });
    }

    res.json({
      success: true,
      message: 'Research publication deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting research publication:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting research publication',
      error: error.message
    });
  }
});

// File upload endpoint for research publications
router.post('/research-publications/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return the file information
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// Seminar Training endpoints
// GET /api/faculty/seminar-training - Get all seminar training with pagination
router.get('/seminar-training', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id, program_title, type, event_organizer, venue, level, role,
        invited_deputed, start_date, end_date, highlights, upload_file,
        created_at, updated_at
      FROM seminar_training
    `;
    
    const queryParams = [];
    
    if (search) {
      query += ` WHERE 
        program_title ILIKE $1 OR 
        event_organizer ILIKE $1 OR 
        venue ILIKE $1 OR
        type ILIKE $1
      `;
      queryParams.push(`%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(parseInt(limit), offset);

    const result = await db.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM seminar_training';
    const countParams = [];
    
    if (search) {
      countQuery += ` WHERE 
        program_title ILIKE $1 OR 
        event_organizer ILIKE $1 OR 
        venue ILIKE $1 OR
        type ILIKE $1
      `;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching seminar training:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seminar training',
      error: error.message
    });
  }
});

// GET /api/faculty/seminar-training/:id - Get seminar training by ID
router.get('/seminar-training/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'SELECT * FROM seminar_training WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Seminar training not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching seminar training:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seminar training',
      error: error.message
    });
  }
});

// POST /api/faculty/seminar-training - Create new seminar training
router.post('/seminar-training', upload.single('uploadFile'), async (req, res) => {
  try {
    const {
      programTitle,
      type,
      eventOrganizer,
      venue,
      level,
      role,
      invitedDeputed,
      startDate,
      endDate,
      highlights
    } = req.body;

    // Handle file upload
    const uploadFile = req.file ? req.file.filename : null;

    const result = await db.query(
      `INSERT INTO seminar_training (
        program_title, type, event_organizer, venue, level, role,
        invited_deputed, start_date, end_date, highlights, upload_file
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        programTitle,
        type,
        eventOrganizer,
        venue,
        level,
        role,
        invitedDeputed,
        startDate,
        endDate,
        highlights || null,
        uploadFile
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Seminar training created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating seminar training:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating seminar training',
      error: error.message
    });
  }
});

// PUT /api/faculty/seminar-training/:id - Update seminar training
router.put('/seminar-training/:id', upload.single('uploadFile'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      programTitle,
      type,
      eventOrganizer,
      venue,
      level,
      role,
      invitedDeputed,
      startDate,
      endDate,
      highlights
    } = req.body;

    // Handle file upload
    const uploadFile = req.file ? req.file.filename : null;

    // Check if record exists
    const existingRecord = await db.query(
      'SELECT * FROM seminar_training WHERE id = $1',
      [id]
    );

    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Seminar training not found'
      });
    }

    const result = await db.query(
      `UPDATE seminar_training SET
        program_title = $1, type = $2, event_organizer = $3, venue = $4,
        level = $5, role = $6, invited_deputed = $7, start_date = $8,
        end_date = $9, highlights = $10, upload_file = $11, updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *`,
      [
        programTitle,
        type,
        eventOrganizer,
        venue,
        level,
        role,
        invitedDeputed,
        startDate,
        endDate,
        highlights || null,
        uploadFile || existingRecord.rows[0].upload_file,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Seminar training updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating seminar training:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating seminar training',
      error: error.message
    });
  }
});

// DELETE /api/faculty/seminar-training/:id - Delete seminar training
router.delete('/seminar-training/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM seminar_training WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Seminar training not found'
      });
    }

    res.json({
      success: true,
      message: 'Seminar training deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting seminar training:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting seminar training',
      error: error.message
    });
  }
});

// POST /api/faculty/seminar-training/upload - Upload file for seminar training
router.post('/seminar-training/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// Get faculty profile by ID
router.get('/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;

    // Get personal details
    const personalResult = await db.query(
      'SELECT * FROM faculty_personal_details WHERE faculty_id = $1',
      [facultyId]
    );

    if (personalResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found'
      });
    }

    // Get professional details
    const professionalResult = await db.query(
      'SELECT * FROM faculty_professional_details WHERE faculty_id = $1',
      [facultyId]
    );

    // Get qualification details
    const qualificationResult = await db.query(
      'SELECT * FROM faculty_qualification_details WHERE faculty_id = $1',
      [facultyId]
    );

    // Get PhD details
    const phdResult = await db.query(
      'SELECT * FROM faculty_phd_details WHERE faculty_id = $1',
      [facultyId]
    );

    // Get PhD guidance details
    const phdGuidanceResult = await db.query(
      'SELECT * FROM faculty_phd_guidance WHERE faculty_id = $1',
      [facultyId]
    );

    res.json({
      success: true,
      data: {
        personal: personalResult.rows[0] || {},
        professional: professionalResult.rows[0] || {},
        qualification: qualificationResult.rows[0] || {},
        phd: phdResult.rows[0] || {},
        phdGuidance: phdGuidanceResult.rows[0] || {}
      }
    });
  } catch (error) {
    console.error('Error fetching faculty profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty profile',
      error: error.message
    });
  }
});

// Create or update faculty profile
router.post('/', [
  body('personal.title').notEmpty().withMessage('Title is required'),
  body('personal.first_name').notEmpty().withMessage('First name is required'),
  body('personal.last_name').notEmpty().withMessage('Last name is required'),
  body('personal.email_id').isEmail().withMessage('Valid email is required'),
  body('personal.date_of_birth').isISO8601().withMessage('Valid date of birth is required'),
  body('professional.faculty_type').notEmpty().withMessage('Faculty type is required'),
  body('professional.date_of_joining').isISO8601().withMessage('Valid date of joining is required'),
  body('professional.faculty_serving').notEmpty().withMessage('Faculty serving status is required'),
  body('professional.current_designation').notEmpty().withMessage('Current designation is required'),
  body('professional.total_experience').isNumeric().withMessage('Total experience must be numeric'),
  body('qualification.highest_qualification').notEmpty().withMessage('Highest qualification is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { personal, professional, qualification, phd, phdGuidance } = req.body;
    const facultyId = personal.faculty_id || `FAC${Date.now()}`;

    // Start transaction
    await db.query('BEGIN');

    try {
      // Insert or update personal details
      const personalQuery = `
        INSERT INTO faculty_personal_details (
          faculty_id, title, first_name, last_name, email_id, contact_number,
          aadhaar_number, present_address, permanent_address, website,
          date_of_birth, blood_group, profile_photo_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (faculty_id) DO UPDATE SET
          title = EXCLUDED.title,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          email_id = EXCLUDED.email_id,
          contact_number = EXCLUDED.contact_number,
          aadhaar_number = EXCLUDED.aadhaar_number,
          present_address = EXCLUDED.present_address,
          permanent_address = EXCLUDED.permanent_address,
          website = EXCLUDED.website,
          date_of_birth = EXCLUDED.date_of_birth,
          blood_group = EXCLUDED.blood_group,
          profile_photo_url = EXCLUDED.profile_photo_url,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const personalValues = [
        facultyId, personal.title, personal.first_name, personal.last_name,
        personal.email_id, personal.contact_number, personal.aadhaar_number,
        personal.present_address, personal.permanent_address, personal.website,
        personal.date_of_birth, personal.blood_group, personal.profile_photo_url
      ];

      await db.query(personalQuery, personalValues);

      // Insert or update professional details
      if (professional) {
        const professionalQuery = `
          INSERT INTO faculty_professional_details (
            faculty_id, employee_no, faculty_type, date_of_joining, relieving_date,
            teaching_experience_years, industrial_experience_years, faculty_serving,
            last_promotion, current_designation, total_experience, salary_pay,
            responsibilities, remarks, retirement_date
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (faculty_id) DO UPDATE SET
            employee_no = EXCLUDED.employee_no,
            faculty_type = EXCLUDED.faculty_type,
            date_of_joining = EXCLUDED.date_of_joining,
            relieving_date = EXCLUDED.relieving_date,
            teaching_experience_years = EXCLUDED.teaching_experience_years,
            industrial_experience_years = EXCLUDED.industrial_experience_years,
            faculty_serving = EXCLUDED.faculty_serving,
            last_promotion = EXCLUDED.last_promotion,
            current_designation = EXCLUDED.current_designation,
            total_experience = EXCLUDED.total_experience,
            salary_pay = EXCLUDED.salary_pay,
            responsibilities = EXCLUDED.responsibilities,
            remarks = EXCLUDED.remarks,
            retirement_date = EXCLUDED.retirement_date,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `;

        const professionalValues = [
          facultyId, professional.employee_no, professional.faculty_type,
          professional.date_of_joining, professional.relieving_date,
          professional.teaching_experience_years, professional.industrial_experience_years,
          professional.faculty_serving, professional.last_promotion,
          professional.current_designation, professional.total_experience,
          professional.salary_pay, professional.responsibilities,
          professional.remarks, professional.retirement_date
        ];

        await db.query(professionalQuery, professionalValues);
      }

      // Insert or update qualification details
      if (qualification) {
        const qualificationQuery = `
          INSERT INTO faculty_qualification_details (
            faculty_id, highest_qualification, specialization, research_interest, skills
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (faculty_id) DO UPDATE SET
            highest_qualification = EXCLUDED.highest_qualification,
            specialization = EXCLUDED.specialization,
            research_interest = EXCLUDED.research_interest,
            skills = EXCLUDED.skills,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `;

        const qualificationValues = [
          facultyId, qualification.highest_qualification, qualification.specialization,
          qualification.research_interest, qualification.skills
        ];

        await db.query(qualificationQuery, qualificationValues);
      }

      // Insert or update PhD details
      if (phd) {
        const phdQuery = `
          INSERT INTO faculty_phd_details (
            faculty_id, university_name, supervisor, phd_url, phd_status,
            year_of_registration, phd_topic, phd_during_assessment_year
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (faculty_id) DO UPDATE SET
            university_name = EXCLUDED.university_name,
            supervisor = EXCLUDED.supervisor,
            phd_url = EXCLUDED.phd_url,
            phd_status = EXCLUDED.phd_status,
            year_of_registration = EXCLUDED.year_of_registration,
            phd_topic = EXCLUDED.phd_topic,
            phd_during_assessment_year = EXCLUDED.phd_during_assessment_year,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `;

        const phdValues = [
          facultyId, phd.university_name, phd.supervisor, phd.phd_url,
          phd.phd_status, phd.year_of_registration, phd.phd_topic,
          phd.phd_during_assessment_year
        ];

        await db.query(phdQuery, phdValues);
      }

      // Insert or update PhD guidance details
      if (phdGuidance) {
        const phdGuidanceQuery = `
          INSERT INTO faculty_phd_guidance (
            faculty_id, candidates_within_organization, candidates_outside_organization
          ) VALUES ($1, $2, $3)
          ON CONFLICT (faculty_id) DO UPDATE SET
            candidates_within_organization = EXCLUDED.candidates_within_organization,
            candidates_outside_organization = EXCLUDED.candidates_outside_organization,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `;

        const phdGuidanceValues = [
          facultyId, phdGuidance.candidates_within_organization || 0,
          phdGuidance.candidates_outside_organization || 0
        ];

        await db.query(phdGuidanceQuery, phdGuidanceValues);
      }

      await db.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Faculty profile saved successfully',
        data: { faculty_id: facultyId }
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error saving faculty profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving faculty profile',
      error: error.message
    });
  }
});

// Get lookup data
router.get('/lookup/data', async (req, res) => {
  try {
    const [designations, facultyTypes, bloodGroups, qualifications, phdStatus] = await Promise.all([
      db.query('SELECT * FROM faculty_designations ORDER BY designation_name'),
      db.query('SELECT * FROM faculty_types ORDER BY type_name'),
      db.query('SELECT * FROM blood_groups ORDER BY group_name'),
      db.query('SELECT * FROM qualifications ORDER BY qualification_name'),
      db.query('SELECT * FROM phd_status ORDER BY status_name')
    ]);

    res.json({
      success: true,
      data: {
        designations: designations.rows,
        facultyTypes: facultyTypes.rows,
        bloodGroups: bloodGroups.rows,
        qualifications: qualifications.rows,
        phdStatus: phdStatus.rows
      }
    });
  } catch (error) {
    console.error('Error fetching lookup data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lookup data',
      error: error.message
    });
  }
});

// Delete faculty profile
router.delete('/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;

    const result = await db.query(
      'DELETE FROM faculty_personal_details WHERE faculty_id = $1 RETURNING *',
      [facultyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Faculty profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting faculty profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting faculty profile',
      error: error.message
    });
  }
});

module.exports = router;
