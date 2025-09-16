const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Validation rules
const programValidation = [
  body('program_type_id')
    .isInt({ min: 1 })
    .withMessage('Program type ID must be a valid positive integer'),
  
  body('program_mode_id')
    .isInt({ min: 1 })
    .withMessage('Program mode ID must be a valid positive integer'),
  
  body('acronym')
    .notEmpty()
    .withMessage('Acronym is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('Acronym must be between 2 and 10 characters')
    .matches(/^[A-Za-z0-9\s\-\.]+$/)
    .withMessage('Acronym can only contain letters, numbers, spaces, hyphens, and dots'),
  
  body('title')
    .notEmpty()
    .withMessage('Program title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Program title must be between 3 and 100 characters')
    .matches(/^[A-Za-z0-9\s\-\.\(\)]+$/)
    .withMessage('Program title can only contain letters, numbers, spaces, hyphens, dots, and parentheses'),
  
  body('program_min_duration')
    .isInt({ min: 1, max: 20 })
    .withMessage('Program minimum duration must be between 1 and 20'),
  
  body('program_max_duration')
    .isInt({ min: 1, max: 20 })
    .withMessage('Program maximum duration must be between 1 and 20')
    .custom((value, { req }) => {
      if (parseInt(value) < parseInt(req.body.program_min_duration)) {
        throw new Error('Maximum duration must be greater than or equal to minimum duration');
      }
      return true;
    }),
  
  body('duration_unit')
    .isIn(['years', 'months', 'weeks'])
    .withMessage('Duration unit must be years, months, or weeks'),
  
  body('total_semesters')
    .isInt({ min: 1, max: 20 })
    .withMessage('Total semesters must be between 1 and 20'),
  
  body('total_credits')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Total credits must be between 1 and 1000'),
  
  body('term_min_duration')
    .notEmpty()
    .withMessage('Term minimum duration is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('Term minimum duration must be between 1 and 12'),
  
  body('term_max_duration')
    .notEmpty()
    .withMessage('Term maximum duration is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('Term maximum duration must be between 1 and 12')
    .custom((value, { req }) => {
      if (value && req.body.term_min_duration && parseInt(value) < parseInt(req.body.term_min_duration)) {
        throw new Error('Term maximum duration must be greater than or equal to minimum duration');
      }
      return true;
    }),
  
  body('term_min_credits')
    .notEmpty()
    .withMessage('Term minimum credits is required')
    .isInt({ min: 1, max: 50 })
    .withMessage('Term minimum credits must be between 1 and 50'),
  
  body('term_max_credits')
    .notEmpty()
    .withMessage('Term maximum credits is required')
    .isInt({ min: 1, max: 50 })
    .withMessage('Term maximum credits must be between 1 and 50')
    .custom((value, { req }) => {
      if (value && req.body.term_min_credits && parseInt(value) < parseInt(req.body.term_min_credits)) {
        throw new Error('Term maximum credits must be greater than or equal to minimum credits');
      }
      return true;
    }),
  
  body('nba_sar_type')
    .notEmpty()
    .withMessage('NBA SAR Type is required')
    .isIn(['SAR', 'NBA', 'Both', 'None'])
    .withMessage('NBA SAR Type must be SAR, NBA, Both, or None'),
  
  body('number_of_topics')
    .notEmpty()
    .withMessage('Number of topics is required')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Number of topics must be between 1 and 1000'),
  
  body('specializations')
    .notEmpty()
    .withMessage('Specializations are required')
    .isArray()
    .withMessage('Specializations must be an array'),
  
  body('course_types')
    .notEmpty()
    .withMessage('Course types are required')
    .isArray()
    .withMessage('Course types must be an array'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
];


// GET /api/config/programs/all - Get all programs without pagination
router.get('/all', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT ON (p.title) p.*, pt.program_name as program_type_name, pm.mode_name as program_mode_name
      FROM programs p
      JOIN program_types pt ON p.program_type_id = pt.id
      JOIN program_modes pm ON p.program_mode_id = pm.id
      WHERE p.is_active = true
      ORDER BY p.title ASC, p.id ASC
    `);
    
    res.json({
      data: result.rows,
      message: 'All programs retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching all programs', error: error.message });
  }
});

// GET /api/config/programs - Get all programs
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT p.*, pt.program_name as program_type_name, pm.mode_name as program_mode_name
      FROM programs p
      LEFT JOIN program_types pt ON p.program_type_id = pt.id
      LEFT JOIN program_modes pm ON p.program_mode_id = pm.id
    `;
    let countQuery = 'SELECT COUNT(*) FROM programs p';
    const params = [];
    
    if (search) {
      query += ' WHERE p.title ILIKE $1 OR p.acronym ILIKE $1';
      countQuery += ' WHERE p.title ILIKE $1 OR p.acronym ILIKE $1';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY p.title ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);
    
    const [programs, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    res.json({
      data: programs.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'Programs retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching programs', error: error.message });
  }
});

// POST /api/config/programs - Create new program
router.post('/', programValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      program_type_id,
      program_mode_id,
      specializations,
      acronym,
      title,
      program_min_duration,
      program_max_duration,
      duration_unit = 'years',
      term_min_duration,
      term_max_duration,
      total_semesters,
      total_credits,
      term_min_credits,
      term_max_credits,
      nba_sar_type,
      course_types,
      number_of_topics,
      is_active = true
    } = req.body;

    const result = await db.query(
      `INSERT INTO programs 
       (program_type_id, program_mode_id, specializations, acronym, title, 
        program_min_duration, program_max_duration, duration_unit, term_min_duration, term_max_duration,
        total_semesters, total_credits, term_min_credits, term_max_credits, nba_sar_type, course_types, number_of_topics, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
       RETURNING *`,
      [
        program_type_id,
        program_mode_id,
        specializations || [],
        acronym,
        title,
        program_min_duration,
        program_max_duration,
        duration_unit,
        term_min_duration,
        term_max_duration,
        total_semesters,
        total_credits,
        term_min_credits,
        term_max_credits,
        nba_sar_type,
        course_types || [],
        number_of_topics,
        is_active
      ]
    );

    res.status(201).json({ 
      data: result.rows[0], 
      message: 'Program created successfully' 
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error creating program', error: error.message });
  }
});

// PUT /api/config/programs/:id - Update program
router.put('/:id', programValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      program_type_id,
      program_mode_id,
      specializations,
      acronym,
      title,
      program_min_duration,
      program_max_duration,
      duration_unit = 'years',
      term_min_duration,
      term_max_duration,
      total_semesters,
      total_credits,
      term_min_credits,
      term_max_credits,
      nba_sar_type,
      course_types,
      number_of_topics,
      is_active = true
    } = req.body;

    const result = await db.query(
      `UPDATE programs 
       SET program_type_id = $1, program_mode_id = $2, specializations = $3, 
           acronym = $4, title = $5, program_min_duration = $6, program_max_duration = $7, 
           duration_unit = $8, term_min_duration = $9, term_max_duration = $10,
           total_semesters = $11, total_credits = $12, term_min_credits = $13, term_max_credits = $14,
           nba_sar_type = $15, course_types = $16, number_of_topics = $17, is_active = $18,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $19 
       RETURNING *`,
      [
        program_type_id,
        program_mode_id,
        specializations || [],
        acronym,
        title,
        program_min_duration,
        program_max_duration,
        duration_unit,
        term_min_duration,
        term_max_duration,
        total_semesters,
        total_credits,
        term_min_credits,
        term_max_credits,
        nba_sar_type,
        course_types || [],
        number_of_topics,
        is_active,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Program not found' });
    }

    res.json({ 
      data: result.rows[0], 
      message: 'Program updated successfully' 
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error updating program', error: error.message });
  }
});

// DELETE /api/config/programs/:id - Delete program
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM programs WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Program not found' });
    }

    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error deleting program', error: error.message });
  }
});

module.exports = router;

