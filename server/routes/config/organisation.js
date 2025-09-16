const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../../config/database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/logos';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter - originalname:', file.originalname);
    console.log('File filter - mimetype:', file.mimetype);
    console.log('File filter - fieldname:', file.fieldname);
    
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    console.log('File filter - extname check:', extname);
    console.log('File filter - mimetype check:', mimetype);
    
    if (mimetype && extname) {
      console.log('File filter - ACCEPTED');
      return cb(null, true);
    } else {
      console.log('File filter - REJECTED');
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Validation rules
const organisationValidation = [
  body('society_name').notEmpty().withMessage('Society name is required'),
  body('organisation_name').notEmpty().withMessage('Organisation name is required'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description too long'),
  body('vision').notEmpty().withMessage('Vision is required').isLength({ max: 1000 }).withMessage('Vision too long'),
  body('mandate').optional().isLength({ max: 1000 }).withMessage('Mandate too long'),
  body('mission').notEmpty().withMessage('Mission is required').isLength({ max: 1000 }).withMessage('Mission too long')
];

// GET /api/config/organisation - Get organisation details with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM organisation_details';
    let countQuery = 'SELECT COUNT(*) FROM organisation_details';
    const params = [];
    
    if (search) {
      query += ' WHERE society_name ILIKE $1 OR organisation_name ILIKE $1';
      countQuery += ' WHERE society_name ILIKE $1 OR organisation_name ILIKE $1';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY id DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);
    
    const [organisations, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    res.json({
      data: organisations.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'Organisation details retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching organisation details', error: error.message });
  }
});

// POST /api/config/organisation - Create organisation details
router.post('/', upload.single('logo'), organisationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { society_name, organisation_name, description, vision, mandate, mission } = req.body;
    const logo_url = req.file ? `/uploads/logos/${req.file.filename}` : null;

    // Allow multiple organisation details to be created

    const result = await db.query(
      `INSERT INTO organisation_details 
       (society_name, organisation_name, description, vision, mandate, mission, logo_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [society_name, organisation_name, description, vision, mandate, mission, logo_url]
    );

    res.status(201).json({ 
      data: result.rows[0], 
      message: 'Organisation details created successfully' 
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error creating organisation details', error: error.message });
  }
});

// PUT /api/config/organisation - Update organisation details
router.put('/:id', upload.single('logo'), organisationValidation, async (req, res) => {
  try {
    console.log('=== ORGANISATION UPDATE DEBUG ===');
    console.log('Request file:', req.file);
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { society_name, organisation_name, description, vision, mandate, mission, delete_logo } = req.body;
    
    // Get existing logo URL
    const existingOrg = await db.query('SELECT logo_url FROM organisation_details WHERE id = $1', [id]);
    if (existingOrg.rows.length === 0) {
      return res.status(404).json({ message: 'Organisation details not found' });
    }

    let logo_url = existingOrg.rows[0].logo_url;
    console.log('Existing logo_url:', logo_url);
    console.log('Delete logo flag:', delete_logo);
    console.log('New file uploaded:', !!req.file);
    
    // If user wants to delete logo
    if (delete_logo === 'true') {
      console.log('Deleting logo');
      // Delete old logo file if it exists
      if (logo_url) {
        const oldFilePath = path.join(process.cwd(), logo_url);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      logo_url = null;
    }
    // If new logo uploaded, update logo URL and delete old file
    else if (req.file) {
      console.log('Processing new logo file:', req.file.filename);
      // Delete old logo file if it exists
      if (logo_url) {
        const oldFilePath = path.join(process.cwd(), logo_url);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      logo_url = `/uploads/logos/${req.file.filename}`;
      console.log('New logo_url set to:', logo_url);
    } else {
      console.log('No file uploaded, keeping existing logo');
    }

    console.log('Final logo_url being saved:', logo_url);
    
    const result = await db.query(
      `UPDATE organisation_details 
       SET society_name = $1, organisation_name = $2, description = $3, 
           vision = $4, mandate = $5, mission = $6, logo_url = $7, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 
       RETURNING *`,
      [society_name, organisation_name, description, vision, mandate, mission, logo_url, id]
    );

    console.log('Database update result:', result.rows[0]);
    console.log('=== END ORGANISATION UPDATE DEBUG ===');

    res.json({ 
      data: result.rows[0], 
      message: 'Organisation details updated successfully' 
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error updating organisation details', error: error.message });
  }
});

// DELETE /api/config/organisation/:id - Delete organisation details
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get logo URL before deleting
    const existingOrg = await db.query('SELECT logo_url FROM organisation_details WHERE id = $1', [id]);
    
    const result = await db.query('DELETE FROM organisation_details WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Organisation details not found' });
    }

    // Delete logo file if it exists
    if (existingOrg.rows.length > 0 && existingOrg.rows[0].logo_url) {
      const logoPath = path.join(process.cwd(), existingOrg.rows[0].logo_url);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    res.json({ message: 'Organisation details deleted successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error deleting organisation details', error: error.message });
  }
});

module.exports = router;

