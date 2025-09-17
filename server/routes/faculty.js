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
      uploadPath = path.join(__dirname, '..', 'uploads', 'journal-editorial');
    } else if (req.path.includes('fellowship-scholarship')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'fellowship-scholarship');
    } else if (req.path.includes('academic-bodies')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'academic-bodies');
    } else if (req.path.includes('patent-innovation')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'patent-innovation');
    } else if (req.path.includes('professional-bodies')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'professional-bodies');
    } else if (req.path.includes('research-projects')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'research-projects');
    } else if (req.path.includes('research-publications')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'research-publications');
    } else if (req.path.includes('seminar-training')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'seminar-training');
    } else if (req.path.includes('sponsored-projects')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'sponsored-projects');
    } else if (req.path.includes('technical-talks')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'technical-talks');
    } else if (req.path.includes('internship-training')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'internship-training');
    } else if (req.path.includes('econtent-development')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'econtent-development');
    } else if (req.path.includes('courses-completed')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'courses-completed');
    } else if (req.path.includes('awards-honors')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'awards-honors');
    } else if (req.path.includes('book-chapters')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'book-chapters');
    } else if (req.path.includes('books-published')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'books-published');
    } else if (req.path.includes('conferences-organized')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'conferences-organized');
    } else if (req.path.includes('faculty-profiles')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'faculty-profiles');
    } else {
      uploadPath = path.join(__dirname, '..', 'uploads');
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
        path: `/uploads/academic-bodies/${req.file.filename}`
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
        path: `/uploads/patent-innovation/${req.file.filename}`
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
        path: `/uploads/professional-bodies/${req.file.filename}`
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
router.post('/research-projects', upload.single('uploadFile'), [
  body('projectTitle').notEmpty().withMessage('Project title is required'),
  body('role').notEmpty().withMessage('Role is required'),
  body('fundingAgency').notEmpty().withMessage('Funding agency is required'),
  body('sanctionedDate').notEmpty().withMessage('Sanctioned date is required')
], async (req, res) => {
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
router.put('/research-projects/:id', upload.single('uploadFile'), [
  body('projectTitle').notEmpty().withMessage('Project title is required'),
  body('role').notEmpty().withMessage('Role is required'),
  body('fundingAgency').notEmpty().withMessage('Funding agency is required'),
  body('sanctionedDate').notEmpty().withMessage('Sanctioned date is required')
], async (req, res) => {
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
        path: `/uploads/research-projects/${req.file.filename}`
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
router.post('/research-publications', upload.single('uploadFile'), [
  body('titleOfPaper').notEmpty().withMessage('Title of paper is required'),
  body('authors').notEmpty().withMessage('Authors is required'),
  body('publicationJournalTitle').notEmpty().withMessage('Publication journal title is required'),
  body('publicationYear').notEmpty().withMessage('Publication year is required')
], async (req, res) => {
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
router.put('/research-publications/:id', upload.single('uploadFile'), [
  body('titleOfPaper').notEmpty().withMessage('Title of paper is required'),
  body('authors').notEmpty().withMessage('Authors is required'),
  body('publicationJournalTitle').notEmpty().withMessage('Publication journal title is required'),
  body('publicationYear').notEmpty().withMessage('Publication year is required')
], async (req, res) => {
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
        path: `/uploads/research-publications/${req.file.filename}`
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

// Sponsored Projects endpoints
// GET /api/faculty/sponsored-projects - Get all sponsored projects with pagination
router.get('/sponsored-projects', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id, project_type, project_title, year_of_sanction, principal_investigator,
        co_investigator, amount, status, duration, sponsoring_organization,
        collaborating_organization, sanctioned_department, description, upload_file,
        created_at, updated_at
      FROM sponsored_projects
    `;
    let countQuery = 'SELECT COUNT(*) FROM sponsored_projects';
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      const searchCondition = `
        WHERE project_title ILIKE $${++paramCount} 
        OR principal_investigator ILIKE $${paramCount}
        OR sponsoring_organization ILIKE $${paramCount}
        OR status ILIKE $${paramCount}
      `;
      query += searchCondition;
      countQuery += searchCondition;
      queryParams.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    queryParams.push(limit, offset);

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
    console.error('Error fetching sponsored projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sponsored projects',
      error: error.message
    });
  }
});

// GET /api/faculty/sponsored-projects/:id - Get sponsored project by ID
router.get('/sponsored-projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM sponsored_projects WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sponsored project not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching sponsored project:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sponsored project',
      error: error.message
    });
  }
});

// POST /api/faculty/sponsored-projects - Create new sponsored project
router.post('/sponsored-projects', upload.single('uploadFile'), async (req, res) => {
  try {
    console.log('=== SPONSORED PROJECTS CREATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Manual validation after multer has parsed the FormData
    const validationErrors = [];
    
    if (!req.body.projectTitle || req.body.projectTitle.trim() === '') {
      validationErrors.push({ field: 'projectTitle', message: 'Project title is required' });
    }
    
    if (!req.body.principalInvestigator || req.body.principalInvestigator.trim() === '') {
      validationErrors.push({ field: 'principalInvestigator', message: 'Principal investigator is required' });
    }
    
    if (!req.body.sponsoringOrganization || req.body.sponsoringOrganization.trim() === '') {
      validationErrors.push({ field: 'sponsoringOrganization', message: 'Sponsoring organization is required' });
    }
    
    if (!req.body.yearOfSanction || req.body.yearOfSanction.trim() === '') {
      validationErrors.push({ field: 'yearOfSanction', message: 'Year of sanction is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const {
      projectType,
      projectTitle,
      yearOfSanction,
      principalInvestigator,
      coInvestigator,
      amount,
      status,
      duration,
      sponsoringOrganization,
      collaboratingOrganization,
      sanctionedDepartment,
      description
    } = req.body;

    console.log('Extracted data:', {
      projectType,
      projectTitle,
      yearOfSanction,
      principalInvestigator,
      coInvestigator,
      amount,
      status,
      duration,
      sponsoringOrganization,
      collaboratingOrganization,
      sanctionedDepartment,
      description
    });

    const result = await db.query(`
      INSERT INTO sponsored_projects (
        project_type, project_title, year_of_sanction, principal_investigator,
        co_investigator, amount, status, duration, sponsoring_organization,
        collaborating_organization, sanctioned_department, description, upload_file
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      projectType || 'Sponsored Project',
      projectTitle,
      yearOfSanction,
      principalInvestigator,
      coInvestigator || '',
      amount || 0,
      status || 'On Going',
      duration || 0,
      sponsoringOrganization,
      collaboratingOrganization || '',
      sanctionedDepartment || '',
      description || '',
      req.file ? req.file.filename : null
    ]);

    res.status(201).json({
      success: true,
      message: 'Sponsored project created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== SPONSORED PROJECTS CREATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating sponsored project',
      error: error.message
    });
  }
});

// PUT /api/faculty/sponsored-projects/:id - Update sponsored project
router.put('/sponsored-projects/:id', upload.single('uploadFile'), async (req, res) => {
  try {
    console.log('=== SPONSORED PROJECTS UPDATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Project ID:', req.params.id);

    // Manual validation after multer has parsed the FormData
    const validationErrors = [];
    
    if (!req.body.projectTitle || req.body.projectTitle.trim() === '') {
      validationErrors.push({ field: 'projectTitle', message: 'Project title is required' });
    }
    
    if (!req.body.principalInvestigator || req.body.principalInvestigator.trim() === '') {
      validationErrors.push({ field: 'principalInvestigator', message: 'Principal investigator is required' });
    }
    
    if (!req.body.sponsoringOrganization || req.body.sponsoringOrganization.trim() === '') {
      validationErrors.push({ field: 'sponsoringOrganization', message: 'Sponsoring organization is required' });
    }
    
    if (!req.body.yearOfSanction || req.body.yearOfSanction.trim() === '') {
      validationErrors.push({ field: 'yearOfSanction', message: 'Year of sanction is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const { id } = req.params;
    const {
      projectType,
      projectTitle,
      yearOfSanction,
      principalInvestigator,
      coInvestigator,
      amount,
      status,
      duration,
      sponsoringOrganization,
      collaboratingOrganization,
      sanctionedDepartment,
      description
    } = req.body;

    // Check if project exists
    const existingProject = await db.query(
      'SELECT * FROM sponsored_projects WHERE id = $1',
      [id]
    );

    if (existingProject.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sponsored project not found'
      });
    }

    const result = await db.query(`
      UPDATE sponsored_projects SET
        project_type = $1,
        project_title = $2,
        year_of_sanction = $3,
        principal_investigator = $4,
        co_investigator = $5,
        amount = $6,
        status = $7,
        duration = $8,
        sponsoring_organization = $9,
        collaborating_organization = $10,
        sanctioned_department = $11,
        description = $12,
        upload_file = COALESCE($13, upload_file),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `, [
      projectType || 'Sponsored Project',
      projectTitle,
      yearOfSanction,
      principalInvestigator,
      coInvestigator || '',
      amount || 0,
      status || 'On Going',
      duration || 0,
      sponsoringOrganization,
      collaboratingOrganization || '',
      sanctionedDepartment || '',
      description || '',
      req.file ? req.file.filename : null,
      id
    ]);

    res.json({
      success: true,
      message: 'Sponsored project updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating sponsored project:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating sponsored project',
      error: error.message
    });
  }
});

// DELETE /api/faculty/sponsored-projects/:id - Delete sponsored project
router.delete('/sponsored-projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM sponsored_projects WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sponsored project not found'
      });
    }

    res.json({
      success: true,
      message: 'Sponsored project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sponsored project:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting sponsored project',
      error: error.message
    });
  }
});

// File upload endpoint for sponsored projects
router.post('/sponsored-projects/upload', upload.single('file'), async (req, res) => {
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
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: `/uploads/sponsored-projects/${req.file.filename}`
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
router.post('/seminar-training', upload.single('uploadFile'), [
  body('programTitle').notEmpty().withMessage('Program title is required'),
  body('type').notEmpty().withMessage('Type is required'),
  body('eventOrganizer').notEmpty().withMessage('Event organizer is required'),
  body('startDate').notEmpty().withMessage('Start date is required')
], async (req, res) => {
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
router.put('/seminar-training/:id', upload.single('uploadFile'), [
  body('programTitle').notEmpty().withMessage('Program title is required'),
  body('type').notEmpty().withMessage('Type is required'),
  body('eventOrganizer').notEmpty().withMessage('Event organizer is required'),
  body('startDate').notEmpty().withMessage('Start date is required')
], async (req, res) => {
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
        path: `/uploads/seminar-training/${req.file.filename}`
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

// ==================== TECHNICAL TALKS ROUTES ====================

// GET /api/faculty/technical-talks - Get all technical talks
router.get('/technical-talks', async (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [];
    
    if (search) {
      whereClause = 'WHERE topic_of_lecture ILIKE $1 OR institution ILIKE $1 OR nationality ILIKE $1';
      queryParams = [`%${search}%`];
    }

    const countQuery = `SELECT COUNT(*) FROM technical_talks ${whereClause}`;
    const dataQuery = `
      SELECT * FROM technical_talks 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const [countResult, dataResult] = await Promise.all([
      db.query(countQuery, queryParams),
      db.query(dataQuery, [...queryParams, limit, offset])
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching technical talks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching technical talks',
      error: error.message
    });
  }
});

// GET /api/faculty/technical-talks/:id - Get technical talk by ID
router.get('/technical-talks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM technical_talks WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Technical talk not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching technical talk:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching technical talk',
      error: error.message
    });
  }
});

// POST /api/faculty/technical-talks - Create new technical talk
router.post('/technical-talks', upload.single('uploadFile'), async (req, res) => {
  try {
    console.log('=== TECHNICAL TALKS CREATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Manual validation
    const validationErrors = [];
    
    if (!req.body.topicOfLecture || req.body.topicOfLecture.trim() === '') {
      validationErrors.push({ field: 'topicOfLecture', message: 'Topic of lecture is required' });
    }
    
    if (!req.body.nationality || req.body.nationality.trim() === '') {
      validationErrors.push({ field: 'nationality', message: 'Nationality is required' });
    }
    
    if (!req.body.date || req.body.date.trim() === '') {
      validationErrors.push({ field: 'date', message: 'Date is required' });
    }
    
    if (!req.body.institution || req.body.institution.trim() === '') {
      validationErrors.push({ field: 'institution', message: 'Institution is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const {
      topicOfLecture,
      nationality,
      date,
      institution
    } = req.body;

    console.log('Extracted data:', {
      topicOfLecture,
      nationality,
      date,
      institution
    });

    const result = await db.query(`
      INSERT INTO technical_talks (
        topic_of_lecture, nationality, date, institution, upload_file
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      topicOfLecture,
      nationality,
      date,
      institution,
      req.file ? req.file.filename : null
    ]);

    res.status(201).json({
      success: true,
      message: 'Technical talk created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== TECHNICAL TALKS CREATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating technical talk',
      error: error.message
    });
  }
});

// PUT /api/faculty/technical-talks/:id - Update technical talk
router.put('/technical-talks/:id', upload.single('uploadFile'), async (req, res) => {
  try {
    console.log('=== TECHNICAL TALKS UPDATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Technical Talk ID:', req.params.id);

    // Manual validation
    const validationErrors = [];
    
    if (!req.body.topicOfLecture || req.body.topicOfLecture.trim() === '') {
      validationErrors.push({ field: 'topicOfLecture', message: 'Topic of lecture is required' });
    }
    
    if (!req.body.nationality || req.body.nationality.trim() === '') {
      validationErrors.push({ field: 'nationality', message: 'Nationality is required' });
    }
    
    if (!req.body.date || req.body.date.trim() === '') {
      validationErrors.push({ field: 'date', message: 'Date is required' });
    }
    
    if (!req.body.institution || req.body.institution.trim() === '') {
      validationErrors.push({ field: 'institution', message: 'Institution is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const { id } = req.params;
    const {
      topicOfLecture,
      nationality,
      date,
      institution
    } = req.body;

    // Check if record exists
    const existingRecord = await db.query('SELECT * FROM technical_talks WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Technical talk not found'
      });
    }

    const result = await db.query(`
      UPDATE technical_talks SET
        topic_of_lecture = $1,
        nationality = $2,
        date = $3,
        institution = $4,
        upload_file = COALESCE($5, upload_file),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [
      topicOfLecture,
      nationality,
      date,
      institution,
      req.file ? req.file.filename : null,
      id
    ]);

    res.json({
      success: true,
      message: 'Technical talk updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== TECHNICAL TALKS UPDATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error updating technical talk',
      error: error.message
    });
  }
});

// DELETE /api/faculty/technical-talks/:id - Delete technical talk
router.delete('/technical-talks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if record exists
    const existingRecord = await db.query('SELECT * FROM technical_talks WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Technical talk not found'
      });
    }

    await db.query('DELETE FROM technical_talks WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Technical talk deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting technical talk:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting technical talk',
      error: error.message
    });
  }
});

// POST /api/faculty/technical-talks/upload - Upload file for technical talks
router.post('/technical-talks/upload', upload.single('file'), async (req, res) => {
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
        path: `/uploads/technical-talks/${req.file.filename}`
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

// ==================== INTERNSHIP TRAINING ROUTES ====================

// GET /api/faculty/internship-training - Get all internship training records
router.get('/internship-training', async (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [];
    
    if (search) {
      whereClause = 'WHERE name_of_internship ILIKE $1 OR company_and_place ILIKE $1 OR outcome ILIKE $1';
      queryParams = [`%${search}%`];
    }

    const countQuery = `SELECT COUNT(*) FROM faculty_internship_training ${whereClause}`;
    const dataQuery = `
      SELECT * FROM faculty_internship_training 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const [countResult, dataResult] = await Promise.all([
      db.query(countQuery, queryParams),
      db.query(dataQuery, [...queryParams, limit, offset])
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching internship training records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching internship training records',
      error: error.message
    });
  }
});

// GET /api/faculty/internship-training/:id - Get internship training record by ID
router.get('/internship-training/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM faculty_internship_training WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Internship training record not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching internship training record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching internship training record',
      error: error.message
    });
  }
});

// POST /api/faculty/internship-training - Create new internship training record
router.post('/internship-training', upload.single('uploadFile'), async (req, res) => {
  try {
    console.log('=== INTERNSHIP TRAINING CREATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Manual validation
    const validationErrors = [];
    
    if (!req.body.nameOfInternship || req.body.nameOfInternship.trim() === '') {
      validationErrors.push({ field: 'nameOfInternship', message: 'Name of internship is required' });
    }
    
    if (!req.body.companyAndPlace || req.body.companyAndPlace.trim() === '') {
      validationErrors.push({ field: 'companyAndPlace', message: 'Company and place is required' });
    }
    
    if (!req.body.duration || req.body.duration.trim() === '') {
      validationErrors.push({ field: 'duration', message: 'Duration is required' });
    }
    
    if (!req.body.year || req.body.year.trim() === '') {
      validationErrors.push({ field: 'year', message: 'Year is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const {
      nameOfInternship,
      companyAndPlace,
      duration,
      year,
      outcome
    } = req.body;

    console.log('Extracted data:', {
      nameOfInternship,
      companyAndPlace,
      duration,
      year,
      outcome
    });

    const result = await db.query(`
      INSERT INTO faculty_internship_training (
        name_of_internship, company_and_place, duration, year, outcome, upload_file
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      nameOfInternship,
      companyAndPlace,
      duration,
      year,
      outcome || '',
      req.file ? req.file.filename : null
    ]);

    res.status(201).json({
      success: true,
      message: 'Internship training record created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== INTERNSHIP TRAINING CREATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating internship training record',
      error: error.message
    });
  }
});

// PUT /api/faculty/internship-training/:id - Update internship training record
router.put('/internship-training/:id', upload.single('uploadFile'), async (req, res) => {
  try {
    console.log('=== INTERNSHIP TRAINING UPDATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Internship Training ID:', req.params.id);

    // Manual validation
    const validationErrors = [];
    
    if (!req.body.nameOfInternship || req.body.nameOfInternship.trim() === '') {
      validationErrors.push({ field: 'nameOfInternship', message: 'Name of internship is required' });
    }
    
    if (!req.body.companyAndPlace || req.body.companyAndPlace.trim() === '') {
      validationErrors.push({ field: 'companyAndPlace', message: 'Company and place is required' });
    }
    
    if (!req.body.duration || req.body.duration.trim() === '') {
      validationErrors.push({ field: 'duration', message: 'Duration is required' });
    }
    
    if (!req.body.year || req.body.year.trim() === '') {
      validationErrors.push({ field: 'year', message: 'Year is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const { id } = req.params;
    const {
      nameOfInternship,
      companyAndPlace,
      duration,
      year,
      outcome
    } = req.body;

    // Check if record exists
    const existingRecord = await db.query('SELECT * FROM faculty_internship_training WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Internship training record not found'
      });
    }

    const result = await db.query(`
      UPDATE faculty_internship_training SET
        name_of_internship = $1,
        company_and_place = $2,
        duration = $3,
        year = $4,
        outcome = $5,
        upload_file = COALESCE($6, upload_file),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [
      nameOfInternship,
      companyAndPlace,
      duration,
      year,
      outcome || '',
      req.file ? req.file.filename : null,
      id
    ]);

    res.json({
      success: true,
      message: 'Internship training record updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== INTERNSHIP TRAINING UPDATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error updating internship training record',
      error: error.message
    });
  }
});

// DELETE /api/faculty/internship-training/:id - Delete internship training record
router.delete('/internship-training/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if record exists
    const existingRecord = await db.query('SELECT * FROM faculty_internship_training WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Internship training record not found'
      });
    }

    await db.query('DELETE FROM faculty_internship_training WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Internship training record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting internship training record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting internship training record',
      error: error.message
    });
  }
});

// POST /api/faculty/internship-training/upload - Upload file for internship training
router.post('/internship-training/upload', upload.single('file'), async (req, res) => {
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
        path: `/uploads/internship-training/${req.file.filename}`
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

// ==================== ECONTENT DEVELOPMENT ROUTES ====================

// GET /api/faculty/econtent-development - Get all econtent development records
router.get('/econtent-development', async (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [];
    
    if (search) {
      whereClause = 'WHERE e_content_types ILIKE $1 OR name_of_course ILIKE $1';
      queryParams = [`%${search}%`];
    }

    const countQuery = `SELECT COUNT(*) FROM econtent_development ${whereClause}`;
    const dataQuery = `
      SELECT * FROM econtent_development 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const [countResult, dataResult] = await Promise.all([
      db.query(countQuery, queryParams),
      db.query(dataQuery, [...queryParams, limit, offset])
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching econtent development records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching econtent development records',
      error: error.message
    });
  }
});

// GET /api/faculty/econtent-development/:id - Get econtent development record by ID
router.get('/econtent-development/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM econtent_development WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Econtent development record not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching econtent development record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching econtent development record',
      error: error.message
    });
  }
});

// POST /api/faculty/econtent-development - Create new econtent development record
router.post('/econtent-development', upload.single('uploadFile'), async (req, res) => {
  try {
    console.log('=== ECONTENT DEVELOPMENT CREATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Manual validation
    const validationErrors = [];
    
    if (!req.body.eContentTypes || req.body.eContentTypes.trim() === '') {
      validationErrors.push({ field: 'eContentTypes', message: 'E-content types is required' });
    }
    
    if (!req.body.nameOfCourse || req.body.nameOfCourse.trim() === '') {
      validationErrors.push({ field: 'nameOfCourse', message: 'Name of course is required' });
    }
    
    if (!req.body.year || req.body.year.trim() === '') {
      validationErrors.push({ field: 'year', message: 'Year is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const {
      eContentTypes,
      nameOfCourse,
      year
    } = req.body;

    console.log('Extracted data:', {
      eContentTypes,
      nameOfCourse,
      year
    });

    const result = await db.query(`
      INSERT INTO econtent_development (
        e_content_types, name_of_course, year, upload_file
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      eContentTypes,
      nameOfCourse,
      year,
      req.file ? req.file.filename : null
    ]);

    res.status(201).json({
      success: true,
      message: 'Econtent development record created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== ECONTENT DEVELOPMENT CREATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating econtent development record',
      error: error.message
    });
  }
});

// PUT /api/faculty/econtent-development/:id - Update econtent development record
router.put('/econtent-development/:id', upload.single('uploadFile'), async (req, res) => {
  try {
    console.log('=== ECONTENT DEVELOPMENT UPDATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Econtent Development ID:', req.params.id);

    // Manual validation
    const validationErrors = [];
    
    if (!req.body.eContentTypes || req.body.eContentTypes.trim() === '') {
      validationErrors.push({ field: 'eContentTypes', message: 'E-content types is required' });
    }
    
    if (!req.body.nameOfCourse || req.body.nameOfCourse.trim() === '') {
      validationErrors.push({ field: 'nameOfCourse', message: 'Name of course is required' });
    }
    
    if (!req.body.year || req.body.year.trim() === '') {
      validationErrors.push({ field: 'year', message: 'Year is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const { id } = req.params;
    const {
      eContentTypes,
      nameOfCourse,
      year
    } = req.body;

    // Check if record exists
    const existingRecord = await db.query('SELECT * FROM econtent_development WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Econtent development record not found'
      });
    }

    const result = await db.query(`
      UPDATE econtent_development SET
        e_content_types = $1,
        name_of_course = $2,
        year = $3,
        upload_file = COALESCE($4, upload_file),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [
      eContentTypes,
      nameOfCourse,
      year,
      req.file ? req.file.filename : null,
      id
    ]);

    res.json({
      success: true,
      message: 'Econtent development record updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== ECONTENT DEVELOPMENT UPDATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error updating econtent development record',
      error: error.message
    });
  }
});

// DELETE /api/faculty/econtent-development/:id - Delete econtent development record
router.delete('/econtent-development/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if record exists
    const existingRecord = await db.query('SELECT * FROM econtent_development WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Econtent development record not found'
      });
    }

    await db.query('DELETE FROM econtent_development WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Econtent development record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting econtent development record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting econtent development record',
      error: error.message
    });
  }
});

// POST /api/faculty/econtent-development/upload - Upload file for econtent development
router.post('/econtent-development/upload', upload.single('file'), async (req, res) => {
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
        path: `/uploads/econtent-development/${req.file.filename}`
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

// ==================== COURSES COMPLETED ROUTES ====================

// GET /api/faculty/courses-completed - Get all courses completed records
router.get('/courses-completed', async (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [];
    
    if (search) {
      whereClause = 'WHERE course_title ILIKE $1 OR platform ILIKE $1';
      queryParams = [`%${search}%`];
    }

    const countQuery = `SELECT COUNT(*) FROM courses_completed ${whereClause}`;
    const dataQuery = `
      SELECT * FROM courses_completed 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const [countResult, dataResult] = await Promise.all([
      db.query(countQuery, queryParams),
      db.query(dataQuery, [...queryParams, limit, offset])
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching courses completed records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses completed records',
      error: error.message
    });
  }
});

// GET /api/faculty/courses-completed/:id - Get courses completed record by ID
router.get('/courses-completed/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM courses_completed WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Courses completed record not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching courses completed record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses completed record',
      error: error.message
    });
  }
});

// POST /api/faculty/courses-completed - Create new courses completed record
router.post('/courses-completed', upload.single('uploadCertificate'), async (req, res) => {
  try {
    console.log('=== COURSES COMPLETED CREATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Manual validation
    const validationErrors = [];
    
    if (!req.body.courseTitle || req.body.courseTitle.trim() === '') {
      validationErrors.push({ field: 'courseTitle', message: 'Course title is required' });
    }
    
    if (!req.body.startDate || req.body.startDate.trim() === '') {
      validationErrors.push({ field: 'startDate', message: 'Start date is required' });
    }
    
    if (!req.body.endDate || req.body.endDate.trim() === '') {
      validationErrors.push({ field: 'endDate', message: 'End date is required' });
    }
    
    if (!req.body.duration || req.body.duration.trim() === '') {
      validationErrors.push({ field: 'duration', message: 'Duration is required' });
    }
    
    if (!req.body.platform || req.body.platform.trim() === '') {
      validationErrors.push({ field: 'platform', message: 'Platform is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const {
      courseTitle,
      startDate,
      endDate,
      duration,
      platform
    } = req.body;

    console.log('Extracted data:', {
      courseTitle,
      startDate,
      endDate,
      duration,
      platform
    });

    const result = await db.query(`
      INSERT INTO courses_completed (
        course_title, start_date, end_date, duration, platform, upload_certificate
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      courseTitle,
      startDate,
      endDate,
      duration,
      platform,
      req.file ? req.file.filename : null
    ]);

    res.status(201).json({
      success: true,
      message: 'Courses completed record created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== COURSES COMPLETED CREATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating courses completed record',
      error: error.message
    });
  }
});

// PUT /api/faculty/courses-completed/:id - Update courses completed record
router.put('/courses-completed/:id', upload.single('uploadCertificate'), async (req, res) => {
  try {
    console.log('=== COURSES COMPLETED UPDATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Courses Completed ID:', req.params.id);

    // Manual validation
    const validationErrors = [];
    
    if (!req.body.courseTitle || req.body.courseTitle.trim() === '') {
      validationErrors.push({ field: 'courseTitle', message: 'Course title is required' });
    }
    
    if (!req.body.startDate || req.body.startDate.trim() === '') {
      validationErrors.push({ field: 'startDate', message: 'Start date is required' });
    }
    
    if (!req.body.endDate || req.body.endDate.trim() === '') {
      validationErrors.push({ field: 'endDate', message: 'End date is required' });
    }
    
    if (!req.body.duration || req.body.duration.trim() === '') {
      validationErrors.push({ field: 'duration', message: 'Duration is required' });
    }
    
    if (!req.body.platform || req.body.platform.trim() === '') {
      validationErrors.push({ field: 'platform', message: 'Platform is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const { id } = req.params;
    const {
      courseTitle,
      startDate,
      endDate,
      duration,
      platform
    } = req.body;

    // Check if record exists
    const existingRecord = await db.query('SELECT * FROM courses_completed WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Courses completed record not found'
      });
    }

    const result = await db.query(`
      UPDATE courses_completed SET
        course_title = $1,
        start_date = $2,
        end_date = $3,
        duration = $4,
        platform = $5,
        upload_certificate = COALESCE($6, upload_certificate),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [
      courseTitle,
      startDate,
      endDate,
      duration,
      platform,
      req.file ? req.file.filename : null,
      id
    ]);

    res.json({
      success: true,
      message: 'Courses completed record updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== COURSES COMPLETED UPDATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error updating courses completed record',
      error: error.message
    });
  }
});

// DELETE /api/faculty/courses-completed/:id - Delete courses completed record
router.delete('/courses-completed/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if record exists
    const existingRecord = await db.query('SELECT * FROM courses_completed WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Courses completed record not found'
      });
    }

    await db.query('DELETE FROM courses_completed WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Courses completed record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting courses completed record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting courses completed record',
      error: error.message
    });
  }
});

// POST /api/faculty/courses-completed/upload - Upload file for courses completed
router.post('/courses-completed/upload', upload.single('file'), async (req, res) => {
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
        path: `/uploads/courses-completed/${req.file.filename}`
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

// ==================== AWARDS HONORS ROUTES ====================

// GET /api/faculty/awards-honors - Get all awards honors records
router.get('/awards-honors', async (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [];
    
    if (search) {
      whereClause = 'WHERE awarded_name ILIKE $1 OR awarded_for ILIKE $1 OR awarded_organization ILIKE $1';
      queryParams = [`%${search}%`];
    }

    const countQuery = `SELECT COUNT(*) FROM faculty_awards_honors ${whereClause}`;
    const dataQuery = `
      SELECT * FROM faculty_awards_honors 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const [countResult, dataResult] = await Promise.all([
      db.query(countQuery, queryParams),
      db.query(dataQuery, [...queryParams, limit, offset])
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching awards honors records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching awards honors records',
      error: error.message
    });
  }
});

// GET /api/faculty/awards-honors/:id - Get awards honors record by ID
router.get('/awards-honors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM faculty_awards_honors WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Awards honors record not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching awards honors record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching awards honors record',
      error: error.message
    });
  }
});

// POST /api/faculty/awards-honors - Create new awards honors record
router.post('/awards-honors', upload.single('upload_file'), async (req, res) => {
  try {
    console.log('=== AWARDS HONORS CREATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Manual validation
    const validationErrors = [];
    
    if (!req.body.awarded_name || req.body.awarded_name.trim() === '') {
      validationErrors.push({ field: 'awarded_name', message: 'Awarded name is required' });
    }
    
    if (!req.body.awarded_for || req.body.awarded_for.trim() === '') {
      validationErrors.push({ field: 'awarded_for', message: 'Awarded for is required' });
    }
    
    if (!req.body.awarded_year || req.body.awarded_year.trim() === '') {
      validationErrors.push({ field: 'awarded_year', message: 'Awarded year is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const {
      awarded_name,
      awarded_for,
      awarded_organization,
      awarded_year,
      venue,
      award_details
    } = req.body;

    console.log('Extracted data:', {
      awarded_name,
      awarded_for,
      awarded_organization,
      awarded_year,
      venue,
      award_details
    });

    const result = await db.query(`
      INSERT INTO faculty_awards_honors (
        awarded_name, awarded_for, awarded_organization, awarded_year, venue, award_details, upload_file
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      awarded_name,
      awarded_for,
      awarded_organization || null,
      awarded_year,
      venue || null,
      award_details || null,
      req.file ? req.file.filename : null
    ]);

    res.status(201).json({
      success: true,
      message: 'Awards honors record created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== AWARDS HONORS CREATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating awards honors record',
      error: error.message
    });
  }
});

// PUT /api/faculty/awards-honors/:id - Update awards honors record
router.put('/awards-honors/:id', upload.single('upload_file'), async (req, res) => {
  try {
    console.log('=== AWARDS HONORS UPDATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Awards Honors ID:', req.params.id);

    // Manual validation
    const validationErrors = [];
    
    if (!req.body.awarded_name || req.body.awarded_name.trim() === '') {
      validationErrors.push({ field: 'awarded_name', message: 'Awarded name is required' });
    }
    
    if (!req.body.awarded_for || req.body.awarded_for.trim() === '') {
      validationErrors.push({ field: 'awarded_for', message: 'Awarded for is required' });
    }
    
    if (!req.body.awarded_year || req.body.awarded_year.trim() === '') {
      validationErrors.push({ field: 'awarded_year', message: 'Awarded year is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const { id } = req.params;
    const {
      awarded_name,
      awarded_for,
      awarded_organization,
      awarded_year,
      venue,
      award_details
    } = req.body;

    // Check if record exists
    const existingRecord = await db.query('SELECT * FROM faculty_awards_honors WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Awards honors record not found'
      });
    }

    const result = await db.query(`
      UPDATE faculty_awards_honors SET
        awarded_name = $1,
        awarded_for = $2,
        awarded_organization = $3,
        awarded_year = $4,
        venue = $5,
        award_details = $6,
        upload_file = COALESCE($7, upload_file),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [
      awarded_name,
      awarded_for,
      awarded_organization || null,
      awarded_year,
      venue || null,
      award_details || null,
      req.file ? req.file.filename : null,
      id
    ]);

    res.json({
      success: true,
      message: 'Awards honors record updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== AWARDS HONORS UPDATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error updating awards honors record',
      error: error.message
    });
  }
});

// DELETE /api/faculty/awards-honors/:id - Delete awards honors record
router.delete('/awards-honors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if record exists
    const existingRecord = await db.query('SELECT * FROM faculty_awards_honors WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Awards honors record not found'
      });
    }

    await db.query('DELETE FROM faculty_awards_honors WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Awards honors record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting awards honors record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting awards honors record',
      error: error.message
    });
  }
});

// POST /api/faculty/awards-honors/upload - Upload file for awards honors
router.post('/awards-honors/upload', upload.single('file'), async (req, res) => {
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
        path: `/uploads/awards-honors/${req.file.filename}`
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

// ==================== BOOK CHAPTERS ROUTES ====================

// GET /api/faculty/book-chapters - Get all book chapters records
router.get('/book-chapters', async (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [];
    
    if (search) {
      whereClause = 'WHERE book_title ILIKE $1 OR chapter_title ILIKE $1 OR authors ILIKE $1';
      queryParams = [`%${search}%`];
    }

    const countQuery = `SELECT COUNT(*) FROM book_chapters ${whereClause}`;
    const dataQuery = `
      SELECT * FROM book_chapters 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const [countResult, dataResult] = await Promise.all([
      db.query(countQuery, queryParams),
      db.query(dataQuery, [...queryParams, limit, offset])
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching book chapters records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book chapters records',
      error: error.message
    });
  }
});

// GET /api/faculty/book-chapters/:id - Get book chapter record by ID
router.get('/book-chapters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM book_chapters WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book chapter record not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching book chapter record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book chapter record',
      error: error.message
    });
  }
});

// POST /api/faculty/book-chapters - Create new book chapter record
router.post('/book-chapters', upload.single('uploadFile'), async (req, res) => {
  try {
    console.log('=== BOOK CHAPTERS CREATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Manual validation
    const validationErrors = [];
    
    if (!req.body.bookTitle || req.body.bookTitle.trim() === '') {
      validationErrors.push({ field: 'bookTitle', message: 'Book title is required' });
    }
    
    if (!req.body.chapterTitle || req.body.chapterTitle.trim() === '') {
      validationErrors.push({ field: 'chapterTitle', message: 'Chapter title is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const {
      bookTitle,
      chapterTitle,
      authors,
      editor,
      isbn,
      year,
      publisherDetails,
      description
    } = req.body;

    console.log('Extracted data:', {
      bookTitle,
      chapterTitle,
      authors,
      editor,
      isbn,
      year,
      publisherDetails,
      description
    });

    const result = await db.query(`
      INSERT INTO book_chapters (
        book_title, chapter_title, authors, editor, isbn, year, publisher_details, description, upload_file
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      bookTitle,
      chapterTitle,
      authors || null,
      editor || null,
      isbn || null,
      year || null,
      publisherDetails || null,
      description || null,
      req.file ? req.file.filename : null
    ]);

    res.status(201).json({
      success: true,
      message: 'Book chapter record created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== BOOK CHAPTERS CREATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating book chapter record',
      error: error.message
    });
  }
});

// PUT /api/faculty/book-chapters/:id - Update book chapter record
router.put('/book-chapters/:id', upload.single('uploadFile'), async (req, res) => {
  try {
    console.log('=== BOOK CHAPTERS UPDATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Book Chapter ID:', req.params.id);

    // Manual validation
    const validationErrors = [];
    
    if (!req.body.bookTitle || req.body.bookTitle.trim() === '') {
      validationErrors.push({ field: 'bookTitle', message: 'Book title is required' });
    }
    
    if (!req.body.chapterTitle || req.body.chapterTitle.trim() === '') {
      validationErrors.push({ field: 'chapterTitle', message: 'Chapter title is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const { id } = req.params;
    const {
      bookTitle,
      chapterTitle,
      authors,
      editor,
      isbn,
      year,
      publisherDetails,
      description
    } = req.body;

    // Check if record exists
    const existingRecord = await db.query('SELECT * FROM book_chapters WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book chapter record not found'
      });
    }

    const result = await db.query(`
      UPDATE book_chapters SET
        book_title = $1,
        chapter_title = $2,
        authors = $3,
        editor = $4,
        isbn = $5,
        year = $6,
        publisher_details = $7,
        description = $8,
        upload_file = COALESCE($9, upload_file),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `, [
      bookTitle,
      chapterTitle,
      authors || null,
      editor || null,
      isbn || null,
      year || null,
      publisherDetails || null,
      description || null,
      req.file ? req.file.filename : null,
      id
    ]);

    res.json({
      success: true,
      message: 'Book chapter record updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== BOOK CHAPTERS UPDATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error updating book chapter record',
      error: error.message
    });
  }
});

// DELETE /api/faculty/book-chapters/:id - Delete book chapter record
router.delete('/book-chapters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if record exists
    const existingRecord = await db.query('SELECT * FROM book_chapters WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book chapter record not found'
      });
    }

    await db.query('DELETE FROM book_chapters WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Book chapter record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book chapter record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book chapter record',
      error: error.message
    });
  }
});

// POST /api/faculty/book-chapters/upload - Upload file for book chapters
router.post('/book-chapters/upload', upload.single('file'), async (req, res) => {
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
        path: `/uploads/book-chapters/${req.file.filename}`
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

// ==================== BOOKS PUBLISHED ROUTES ====================

// GET /api/faculty/books-published - Get all books published records
router.get('/books-published', async (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [];
    
    if (search) {
      whereClause = 'WHERE book_title ILIKE $1 OR author ILIKE $1 OR publisher ILIKE $1';
      queryParams = [`%${search}%`];
    }

    const countQuery = `SELECT COUNT(*) FROM books_published ${whereClause}`;
    const dataQuery = `
      SELECT * FROM books_published 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const [countResult, dataResult] = await Promise.all([
      db.query(countQuery, queryParams),
      db.query(dataQuery, [...queryParams, limit, offset])
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching books published records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books published records',
      error: error.message
    });
  }
});

// GET /api/faculty/books-published/:id - Get book published record by ID
router.get('/books-published/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM books_published WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book published record not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching book published record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book published record',
      error: error.message
    });
  }
});

// POST /api/faculty/books-published - Create new book published record
router.post('/books-published', upload.single('uploadFile'), async (req, res) => {
  try {
    console.log('=== BOOKS PUBLISHED CREATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Manual validation
    const validationErrors = [];
    
    if (!req.body.bookTitle || req.body.bookTitle.trim() === '') {
      validationErrors.push({ field: 'bookTitle', message: 'Book title is required' });
    }
    
    if (!req.body.publishedYear || req.body.publishedYear.trim() === '') {
      validationErrors.push({ field: 'publishedYear', message: 'Published year is required' });
    }
    
    if (!req.body.type || req.body.type.trim() === '') {
      validationErrors.push({ field: 'type', message: 'Type is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const {
      bookTitle,
      author,
      coAuthors,
      isbn,
      languages,
      publisher,
      publishedYear,
      bookNo,
      copyrightYear,
      noOfChapters,
      type,
      publishedIn,
      aboutBook
    } = req.body;

    console.log('Extracted data:', {
      bookTitle,
      author,
      coAuthors,
      isbn,
      languages,
      publisher,
      publishedYear,
      bookNo,
      copyrightYear,
      noOfChapters,
      type,
      publishedIn,
      aboutBook
    });

    const result = await db.query(`
      INSERT INTO books_published (
        book_title, author, co_authors, isbn, languages, publisher, published_year, 
        book_no, copyright_year, no_of_chapters, type, published_in, about_book, upload_file
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      bookTitle,
      author || null,
      coAuthors || null,
      isbn || null,
      languages || null,
      publisher || null,
      publishedYear,
      bookNo || null,
      copyrightYear || null,
      noOfChapters || null,
      type,
      publishedIn || null,
      aboutBook || null,
      req.file ? req.file.filename : null
    ]);

    res.status(201).json({
      success: true,
      message: 'Book published record created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== BOOKS PUBLISHED CREATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating book published record',
      error: error.message
    });
  }
});

// PUT /api/faculty/books-published/:id - Update book published record
router.put('/books-published/:id', upload.single('uploadFile'), async (req, res) => {
  try {
    console.log('=== BOOKS PUBLISHED UPDATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Book Published ID:', req.params.id);

    // Manual validation
    const validationErrors = [];
    
    if (!req.body.bookTitle || req.body.bookTitle.trim() === '') {
      validationErrors.push({ field: 'bookTitle', message: 'Book title is required' });
    }
    
    if (!req.body.publishedYear || req.body.publishedYear.trim() === '') {
      validationErrors.push({ field: 'publishedYear', message: 'Published year is required' });
    }
    
    if (!req.body.type || req.body.type.trim() === '') {
      validationErrors.push({ field: 'type', message: 'Type is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const { id } = req.params;
    const {
      bookTitle,
      author,
      coAuthors,
      isbn,
      languages,
      publisher,
      publishedYear,
      bookNo,
      copyrightYear,
      noOfChapters,
      type,
      publishedIn,
      aboutBook
    } = req.body;

    // Check if record exists
    const existingRecord = await db.query('SELECT * FROM books_published WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book published record not found'
      });
    }

    const result = await db.query(`
      UPDATE books_published SET
        book_title = $1,
        author = $2,
        co_authors = $3,
        isbn = $4,
        languages = $5,
        publisher = $6,
        published_year = $7,
        book_no = $8,
        copyright_year = $9,
        no_of_chapters = $10,
        type = $11,
        published_in = $12,
        about_book = $13,
        upload_file = COALESCE($14, upload_file),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *
    `, [
      bookTitle,
      author || null,
      coAuthors || null,
      isbn || null,
      languages || null,
      publisher || null,
      publishedYear,
      bookNo || null,
      copyrightYear || null,
      noOfChapters || null,
      type,
      publishedIn || null,
      aboutBook || null,
      req.file ? req.file.filename : null,
      id
    ]);

    res.json({
      success: true,
      message: 'Book published record updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== BOOKS PUBLISHED UPDATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error updating book published record',
      error: error.message
    });
  }
});

// DELETE /api/faculty/books-published/:id - Delete book published record
router.delete('/books-published/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if record exists
    const existingRecord = await db.query('SELECT * FROM books_published WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book published record not found'
      });
    }

    await db.query('DELETE FROM books_published WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Book published record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book published record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book published record',
      error: error.message
    });
  }
});

// POST /api/faculty/books-published/upload - Upload file for books published
router.post('/books-published/upload', upload.single('file'), async (req, res) => {
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
        path: `/uploads/books-published/${req.file.filename}`
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

// ==================== CONFERENCES ORGANIZED ROUTES ====================

// GET /api/faculty/conferences-organized - Get all conferences organized records
router.get('/conferences-organized', async (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [];
    
    if (search) {
      whereClause = 'WHERE program_title ILIKE $1 OR event_organizer ILIKE $1 OR type ILIKE $1';
      queryParams = [`%${search}%`];
    }

    const countQuery = `SELECT COUNT(*) FROM conferences_organized ${whereClause}`;
    const dataQuery = `
      SELECT * FROM conferences_organized 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const [countResult, dataResult] = await Promise.all([
      db.query(countQuery, queryParams),
      db.query(dataQuery, [...queryParams, limit, offset])
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching conferences organized records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conferences organized records',
      error: error.message
    });
  }
});

// GET /api/faculty/conferences-organized/:id - Get conference organized record by ID
router.get('/conferences-organized/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM conferences_organized WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conference organized record not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching conference organized record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conference organized record',
      error: error.message
    });
  }
});

// POST /api/faculty/conferences-organized - Create new conference organized record
router.post('/conferences-organized', upload.single('uploadFile'), async (req, res) => {
  try {
    console.log('=== CONFERENCES ORGANIZED CREATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Manual validation
    const validationErrors = [];
    
    if (!req.body.programTitle || req.body.programTitle.trim() === '') {
      validationErrors.push({ field: 'programTitle', message: 'Program title is required' });
    }
    
    if (!req.body.type || req.body.type.trim() === '') {
      validationErrors.push({ field: 'type', message: 'Type is required' });
    }
    
    if (!req.body.eventOrganizer || req.body.eventOrganizer.trim() === '') {
      validationErrors.push({ field: 'eventOrganizer', message: 'Event organizer is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const {
      programTitle,
      type,
      eventOrganizer,
      collaboration,
      startDate,
      endDate,
      sponsoredBy,
      role,
      level,
      noOfParticipants,
      venue,
      durationHours,
      durationMinutes,
      highlights
    } = req.body;

    console.log('Extracted data:', {
      programTitle,
      type,
      eventOrganizer,
      collaboration,
      startDate,
      endDate,
      sponsoredBy,
      role,
      level,
      noOfParticipants,
      venue,
      durationHours,
      durationMinutes,
      highlights
    });

    const result = await db.query(`
      INSERT INTO conferences_organized (
        program_title, type, event_organizer, collaboration, start_date, end_date, 
        sponsored_by, role, level, no_of_participants, venue, duration_hours, 
        duration_minutes, highlights, upload_file
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      programTitle,
      type,
      eventOrganizer,
      collaboration || null,
      startDate || null,
      endDate || null,
      sponsoredBy || null,
      role || null,
      level || null,
      noOfParticipants || null,
      venue || null,
      durationHours || null,
      durationMinutes || null,
      highlights || null,
      req.file ? req.file.filename : null
    ]);

    res.status(201).json({
      success: true,
      message: 'Conference organized record created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== CONFERENCES ORGANIZED CREATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating conference organized record',
      error: error.message
    });
  }
});

// PUT /api/faculty/conferences-organized/:id - Update conference organized record
router.put('/conferences-organized/:id', upload.single('uploadFile'), async (req, res) => {
  try {
    console.log('=== CONFERENCES ORGANIZED UPDATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Conference Organized ID:', req.params.id);

    // Manual validation
    const validationErrors = [];
    
    if (!req.body.programTitle || req.body.programTitle.trim() === '') {
      validationErrors.push({ field: 'programTitle', message: 'Program title is required' });
    }
    
    if (!req.body.type || req.body.type.trim() === '') {
      validationErrors.push({ field: 'type', message: 'Type is required' });
    }
    
    if (!req.body.eventOrganizer || req.body.eventOrganizer.trim() === '') {
      validationErrors.push({ field: 'eventOrganizer', message: 'Event organizer is required' });
    }

    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const { id } = req.params;
    const {
      programTitle,
      type,
      eventOrganizer,
      collaboration,
      startDate,
      endDate,
      sponsoredBy,
      role,
      level,
      noOfParticipants,
      venue,
      durationHours,
      durationMinutes,
      highlights
    } = req.body;

    // Check if record exists
    const existingRecord = await db.query('SELECT * FROM conferences_organized WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conference organized record not found'
      });
    }

    const result = await db.query(`
      UPDATE conferences_organized SET
        program_title = $1,
        type = $2,
        event_organizer = $3,
        collaboration = $4,
        start_date = $5,
        end_date = $6,
        sponsored_by = $7,
        role = $8,
        level = $9,
        no_of_participants = $10,
        venue = $11,
        duration_hours = $12,
        duration_minutes = $13,
        highlights = $14,
        upload_file = COALESCE($15, upload_file),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *
    `, [
      programTitle,
      type,
      eventOrganizer,
      collaboration || null,
      startDate || null,
      endDate || null,
      sponsoredBy || null,
      role || null,
      level || null,
      noOfParticipants || null,
      venue || null,
      durationHours || null,
      durationMinutes || null,
      highlights || null,
      req.file ? req.file.filename : null,
      id
    ]);

    res.json({
      success: true,
      message: 'Conference organized record updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('=== CONFERENCES ORGANIZED UPDATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error updating conference organized record',
      error: error.message
    });
  }
});

// DELETE /api/faculty/conferences-organized/:id - Delete conference organized record
router.delete('/conferences-organized/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if record exists
    const existingRecord = await db.query('SELECT * FROM conferences_organized WHERE id = $1', [id]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conference organized record not found'
      });
    }

    await db.query('DELETE FROM conferences_organized WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Conference organized record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conference organized record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting conference organized record',
      error: error.message
    });
  }
});

// POST /api/faculty/conferences-organized/upload - Upload file for conferences organized
router.post('/conferences-organized/upload', upload.single('file'), async (req, res) => {
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
        path: `/uploads/conferences-organized/${req.file.filename}`
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

// ==================== FACULTY PROFILE ROUTES ====================

// GET /api/faculty/profiles - Get all faculty profiles with complete details
router.get('/profiles', async (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [];
    
    if (search) {
      whereClause = 'WHERE fp.first_name ILIKE $1 OR fp.last_name ILIKE $1 OR fp.email ILIKE $1';
      queryParams = [`%${search}%`];
    }

    const countQuery = `
      SELECT COUNT(*) FROM faculty_profiles fp 
      ${whereClause}
    `;
    
    const dataQuery = `
      SELECT 
        fp.*,
        fpd.employee_no,
        fpd.current_designation,
        fpd.faculty_type,
        fpd.total_experience,
        fqd.highest_qualification,
        fqd.specialization,
        fphd.university_name,
        fphd.phd_status
      FROM faculty_profiles fp
      LEFT JOIN faculty_professional_details fpd ON fp.id = fpd.faculty_id
      LEFT JOIN faculty_qualification_details fqd ON fp.id = fqd.faculty_id
      LEFT JOIN faculty_phd_details fphd ON fp.id = fphd.faculty_id
      ${whereClause}
      ORDER BY fp.created_at DESC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const [countResult, dataResult] = await Promise.all([
      db.query(countQuery, queryParams),
      db.query(dataQuery, [...queryParams, limit, offset])
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
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

// GET /api/faculty/profiles/:id - Get complete faculty profile by ID
router.get('/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get personal details
    const personalResult = await db.query('SELECT * FROM faculty_profiles WHERE id = $1', [id]);
    if (personalResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found'
      });
    }

    // Get professional details
    const professionalResult = await db.query('SELECT * FROM faculty_professional_details WHERE faculty_id = $1', [id]);
    
    // Get qualification details
    const qualificationResult = await db.query('SELECT * FROM faculty_qualification_details WHERE faculty_id = $1', [id]);
    
    // Get PhD details
    const phdResult = await db.query('SELECT * FROM faculty_phd_details WHERE faculty_id = $1', [id]);

    const profile = {
      personal: personalResult.rows[0],
      professional: professionalResult.rows[0] || null,
      qualification: qualificationResult.rows[0] || null,
      phd: phdResult.rows[0] || null
    };

    res.json({
      success: true,
      data: profile
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

// POST /api/faculty/profiles - Create new faculty profile
router.post('/profiles', upload.single('profilePhoto'), async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    console.log('=== FACULTY PROFILE CREATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Validate required fields
    const validationErrors = [];
    
    if (!req.body.firstName || req.body.firstName.trim() === '') {
      validationErrors.push({ field: 'firstName', message: 'First name is required' });
    }
    
    if (!req.body.lastName || req.body.lastName.trim() === '') {
      validationErrors.push({ field: 'lastName', message: 'Last name is required' });
    }
    
    if (!req.body.email || req.body.email.trim() === '') {
      validationErrors.push({ field: 'email', message: 'Email is required' });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Create personal profile
    const personalResult = await client.query(`
      INSERT INTO faculty_profiles (
        title, first_name, last_name, email, contact_number, aadhaar_number,
        present_address, permanent_address, website, date_of_birth, blood_group, profile_photo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      req.body.title || null,
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      req.body.contactNumber || null,
      req.body.aadhaarNumber || null,
      req.body.presentAddress || null,
      req.body.permanentAddress || null,
      req.body.website || null,
      req.body.dateOfBirth || null,
      req.body.bloodGroup || null,
      req.file ? req.file.filename : null
    ]);

    const facultyId = personalResult.rows[0].id;

    // Create professional details if provided
    if (req.body.employeeNo || req.body.dateOfJoining || req.body.currentDesignation) {
      await client.query(`
        INSERT INTO faculty_professional_details (
          faculty_id, employee_no, date_of_joining, teaching_experience_years,
          faculty_serving, faculty_type, relieving_date, industrial_experience_years,
          last_promotion_year, remarks, current_designation, retirement_date,
          responsibilities, total_experience, salary_pay
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        facultyId,
        req.body.employeeNo || null,
        req.body.dateOfJoining || null,
        parseFloat(req.body.teachingExperienceYears) || 0,
        req.body.facultyServing || null,
        req.body.facultyType || null,
        req.body.relievingDate || null,
        parseFloat(req.body.industrialExperienceYears) || 0,
        req.body.lastPromotionYear ? parseInt(req.body.lastPromotionYear) : null,
        req.body.remarks || null,
        req.body.currentDesignation || null,
        req.body.retirementDate || null,
        req.body.responsibilities || null,
        parseFloat(req.body.totalExperience) || 0,
        parseFloat(req.body.salaryPay) || 0
      ]);
    }

    // Create qualification details if provided
    if (req.body.highestQualification || req.body.specialization || req.body.researchInterest) {
      await client.query(`
        INSERT INTO faculty_qualification_details (
          faculty_id, highest_qualification, specialization, research_interest, skills
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        facultyId,
        req.body.highestQualification || null,
        req.body.specialization || null,
        req.body.researchInterest || null,
        req.body.skills || null
      ]);
    }

    // Create PhD details if provided
    if (req.body.universityName || req.body.yearOfRegistration || req.body.supervisor) {
      await client.query(`
        INSERT INTO faculty_phd_details (
          faculty_id, university_name, year_of_registration, supervisor, topic,
          url, phd_during_assessment_year, phd_status, candidates_within_organization,
          candidates_outside_organization
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        facultyId,
        req.body.universityName || null,
        req.body.yearOfRegistration ? parseInt(req.body.yearOfRegistration) : null,
        req.body.supervisor || null,
        req.body.topic || null,
        req.body.url || null,
        req.body.phdDuringAssessmentYear ? parseInt(req.body.phdDuringAssessmentYear) : null,
        req.body.phdStatus || null,
        req.body.candidatesWithinOrganization ? parseInt(req.body.candidatesWithinOrganization) : 0,
        req.body.candidatesOutsideOrganization ? parseInt(req.body.candidatesOutsideOrganization) : 0
      ]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Faculty profile created successfully',
      data: { id: facultyId }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('=== FACULTY PROFILE CREATE ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating faculty profile',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// PUT /api/faculty/profiles/:id - Update faculty profile
router.put('/profiles/:id', upload.single('profilePhoto'), async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Check if profile exists
    const existingProfile = await client.query('SELECT * FROM faculty_profiles WHERE id = $1', [id]);
    if (existingProfile.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found'
      });
    }

    // Update personal details
    await client.query(`
      UPDATE faculty_profiles SET
        title = $1, first_name = $2, last_name = $3, email = $4,
        contact_number = $5, aadhaar_number = $6, present_address = $7,
        permanent_address = $8, website = $9, date_of_birth = $10,
        blood_group = $11, profile_photo = COALESCE($12, profile_photo),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
    `, [
      req.body.title || null,
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      req.body.contactNumber || null,
      req.body.aadhaarNumber || null,
      req.body.presentAddress || null,
      req.body.permanentAddress || null,
      req.body.website || null,
      req.body.dateOfBirth || null,
      req.body.bloodGroup || null,
      req.file ? req.file.filename : null,
      id
    ]);

    // Update or create professional details
    const professionalExists = await client.query('SELECT id FROM faculty_professional_details WHERE faculty_id = $1', [id]);
    
    if (professionalExists.rows.length > 0) {
      await client.query(`
        UPDATE faculty_professional_details SET
          employee_no = $1, date_of_joining = $2, teaching_experience_years = $3,
          faculty_serving = $4, faculty_type = $5, relieving_date = $6,
          industrial_experience_years = $7, last_promotion_year = $8, remarks = $9,
          current_designation = $10, retirement_date = $11, responsibilities = $12,
          total_experience = $13, salary_pay = $14, updated_at = CURRENT_TIMESTAMP
        WHERE faculty_id = $15
      `, [
        req.body.employeeNo || null,
        req.body.dateOfJoining || null,
        parseFloat(req.body.teachingExperienceYears) || 0,
        req.body.facultyServing || null,
        req.body.facultyType || null,
        req.body.relievingDate || null,
        parseFloat(req.body.industrialExperienceYears) || 0,
        req.body.lastPromotionYear ? parseInt(req.body.lastPromotionYear) : null,
        req.body.remarks || null,
        req.body.currentDesignation || null,
        req.body.retirementDate || null,
        req.body.responsibilities || null,
        parseFloat(req.body.totalExperience) || 0,
        parseFloat(req.body.salaryPay) || 0,
        id
      ]);
    } else if (req.body.employeeNo || req.body.dateOfJoining || req.body.currentDesignation) {
      await client.query(`
        INSERT INTO faculty_professional_details (
          faculty_id, employee_no, date_of_joining, teaching_experience_years,
          faculty_serving, faculty_type, relieving_date, industrial_experience_years,
          last_promotion_year, remarks, current_designation, retirement_date,
          responsibilities, total_experience, salary_pay
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        id,
        req.body.employeeNo || null,
        req.body.dateOfJoining || null,
        parseFloat(req.body.teachingExperienceYears) || 0,
        req.body.facultyServing || null,
        req.body.facultyType || null,
        req.body.relievingDate || null,
        parseFloat(req.body.industrialExperienceYears) || 0,
        req.body.lastPromotionYear ? parseInt(req.body.lastPromotionYear) : null,
        req.body.remarks || null,
        req.body.currentDesignation || null,
        req.body.retirementDate || null,
        req.body.responsibilities || null,
        parseFloat(req.body.totalExperience) || 0,
        parseFloat(req.body.salaryPay) || 0
      ]);
    }

    // Update or create qualification details
    const qualificationExists = await client.query('SELECT id FROM faculty_qualification_details WHERE faculty_id = $1', [id]);
    
    if (qualificationExists.rows.length > 0) {
      await client.query(`
        UPDATE faculty_qualification_details SET
          highest_qualification = $1, specialization = $2, research_interest = $3,
          skills = $4, updated_at = CURRENT_TIMESTAMP
        WHERE faculty_id = $5
      `, [
        req.body.highestQualification || null,
        req.body.specialization || null,
        req.body.researchInterest || null,
        req.body.skills || null,
        id
      ]);
    } else if (req.body.highestQualification || req.body.specialization || req.body.researchInterest) {
      await client.query(`
        INSERT INTO faculty_qualification_details (
          faculty_id, highest_qualification, specialization, research_interest, skills
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        id,
        req.body.highestQualification || null,
        req.body.specialization || null,
        req.body.researchInterest || null,
        req.body.skills || null
      ]);
    }

    // Update or create PhD details
    const phdExists = await client.query('SELECT id FROM faculty_phd_details WHERE faculty_id = $1', [id]);
    
    if (phdExists.rows.length > 0) {
      await client.query(`
        UPDATE faculty_phd_details SET
          university_name = $1, year_of_registration = $2, supervisor = $3, topic = $4,
          url = $5, phd_during_assessment_year = $6, phd_status = $7,
          candidates_within_organization = $8, candidates_outside_organization = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE faculty_id = $10
      `, [
        req.body.universityName || null,
        req.body.yearOfRegistration ? parseInt(req.body.yearOfRegistration) : null,
        req.body.supervisor || null,
        req.body.topic || null,
        req.body.url || null,
        req.body.phdDuringAssessmentYear ? parseInt(req.body.phdDuringAssessmentYear) : null,
        req.body.phdStatus || null,
        req.body.candidatesWithinOrganization ? parseInt(req.body.candidatesWithinOrganization) : 0,
        req.body.candidatesOutsideOrganization ? parseInt(req.body.candidatesOutsideOrganization) : 0,
        id
      ]);
    } else if (req.body.universityName || req.body.yearOfRegistration || req.body.supervisor) {
      await client.query(`
        INSERT INTO faculty_phd_details (
          faculty_id, university_name, year_of_registration, supervisor, topic,
          url, phd_during_assessment_year, phd_status, candidates_within_organization,
          candidates_outside_organization
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        id,
        req.body.universityName || null,
        req.body.yearOfRegistration ? parseInt(req.body.yearOfRegistration) : null,
        req.body.supervisor || null,
        req.body.topic || null,
        req.body.url || null,
        req.body.phdDuringAssessmentYear ? parseInt(req.body.phdDuringAssessmentYear) : null,
        req.body.phdStatus || null,
        req.body.candidatesWithinOrganization ? parseInt(req.body.candidatesWithinOrganization) : 0,
        req.body.candidatesOutsideOrganization ? parseInt(req.body.candidatesOutsideOrganization) : 0
      ]);
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Faculty profile updated successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating faculty profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating faculty profile',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// DELETE /api/faculty/profiles/:id - Delete faculty profile
router.delete('/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if profile exists
    const existingProfile = await db.query('SELECT * FROM faculty_profiles WHERE id = $1', [id]);
    if (existingProfile.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found'
      });
    }

    // Delete profile (cascade will handle related records)
    await db.query('DELETE FROM faculty_profiles WHERE id = $1', [id]);

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

// POST /api/faculty/profiles/upload - Upload profile photo
router.post('/profiles/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: `/uploads/faculty-profiles/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile photo',
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
