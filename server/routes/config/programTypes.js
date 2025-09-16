const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Validation rules
const programTypeValidation = [
  body('program_name')
    .notEmpty()
    .withMessage('Program name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Program name must be between 2 and 50 characters')
    .matches(/^[A-Za-z0-9\s\-\.\(\)]+$/)
    .withMessage('Program name can only contain letters, numbers, spaces, hyphens, dots, and parentheses'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
    .matches(/^[A-Za-z0-9\s\-\.\,\!\?\(\)\/]*$/)
    .withMessage('Description can only contain letters, numbers, spaces, and basic punctuation')
];

// GET /api/config/program-types - Get program types with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM program_types';
    let countQuery = 'SELECT COUNT(*) FROM program_types';
    const params = [];

    if (search) {
      query += ' WHERE program_name ILIKE $1 OR description ILIKE $1';
      countQuery += ' WHERE program_name ILIKE $1 OR description ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY program_name ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [programTypes, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: programTypes.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'Program types retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching program types', error: error.message });
  }
});

// GET /api/config/program-types/all - Get all program types without pagination
router.get('/all', async (req, res) => {
  try {
    const result = await db.query('SELECT id, program_name FROM program_types ORDER BY program_name ASC');
    
    res.json({
      data: result.rows,
      message: 'All program types retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching all program types:', error);
    res.status(500).json({ message: 'Error fetching all program types', error: error.message });
  }
});

// GET /api/config/program-types/:id - Get program type by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM program_types WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Program type not found' });
    }
    
    res.json({ data: result.rows[0], message: 'Program type retrieved successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching program type', error: error.message });
  }
});

// POST /api/config/program-types - Create new program type
router.post('/', programTypeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { program_name, description } = req.body;

    const result = await db.query(
      'INSERT INTO program_types (program_name, description) VALUES ($1, $2) RETURNING *',
      [program_name, description]
    );

    res.status(201).json({ 
      data: result.rows[0], 
      message: 'Program type created successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Program type name already exists' });
    } else {
      res.status(500).json({ message: 'Error creating program type', error: error.message });
    }
  }
});

// PUT /api/config/program-types/:id - Update program type
router.put('/:id', programTypeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { program_name, description } = req.body;

    const result = await db.query(
      'UPDATE program_types SET program_name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [program_name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Program type not found' });
    }

    res.json({ 
      data: result.rows[0], 
      message: 'Program type updated successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Program type name already exists' });
    } else {
      res.status(500).json({ message: 'Error updating program type', error: error.message });
    }
  }
});

// DELETE /api/config/program-types/:id - Delete program type
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if program type has associated programs
    const programsCheck = await db.query('SELECT COUNT(*) FROM programs WHERE program_type_id = $1', [id]);
    if (parseInt(programsCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete program type. It has associated programs.' 
      });
    }

    const result = await db.query('DELETE FROM program_types WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Program type not found' });
    }

    res.json({ message: 'Program type deleted successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error deleting program type', error: error.message });
  }
});

module.exports = router;

