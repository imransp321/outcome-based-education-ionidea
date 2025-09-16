const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Validation rules
const programModeValidation = [
  body('mode_name')
    .notEmpty()
    .withMessage('Mode name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Mode name must be between 2 and 50 characters')
    .matches(/^[A-Za-z0-9\s\-\.]+$/)
    .withMessage('Mode name can only contain letters, numbers, spaces, hyphens, and dots'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
    .matches(/^[A-Za-z0-9\s\-\.\,\!\?\(\)\/]*$/)
    .withMessage('Description can only contain letters, numbers, spaces, and basic punctuation'),
  
  body('is_hybrid')
    .optional()
    .isBoolean()
    .withMessage('is_hybrid must be a boolean value'),
  
  body('is_online_sync')
    .optional()
    .isBoolean()
    .withMessage('is_online_sync must be a boolean value'),
  
  body('is_online_async')
    .optional()
    .isBoolean()
    .withMessage('is_online_async must be a boolean value')
];

// GET /api/config/program-modes - Get program modes with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM program_modes';
    let countQuery = 'SELECT COUNT(*) FROM program_modes';
    const params = [];

    if (search) {
      query += ' WHERE mode_name ILIKE $1 OR description ILIKE $1';
      countQuery += ' WHERE mode_name ILIKE $1 OR description ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY mode_name ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [programModes, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: programModes.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'Program modes retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching program modes', error: error.message });
  }
});

// GET /api/config/program-modes/:id - Get program mode by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM program_modes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Program mode not found' });
    }
    
    res.json({ data: result.rows[0], message: 'Program mode retrieved successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching program mode', error: error.message });
  }
});

// POST /api/config/program-modes - Create new program mode
router.post('/', programModeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mode_name, description, is_hybrid, is_online_sync, is_online_async } = req.body;

    const result = await db.query(
      `INSERT INTO program_modes (mode_name, description, is_hybrid, is_online_sync, is_online_async) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [mode_name, description, is_hybrid || false, is_online_sync || false, is_online_async || false]
    );

    res.status(201).json({ 
      data: result.rows[0], 
      message: 'Program mode created successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Program mode name already exists' });
    } else {
      res.status(500).json({ message: 'Error creating program mode', error: error.message });
    }
  }
});

// PUT /api/config/program-modes/:id - Update program mode
router.put('/:id', programModeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { mode_name, description, is_hybrid, is_online_sync, is_online_async } = req.body;

    const result = await db.query(
      `UPDATE program_modes 
       SET mode_name = $1, description = $2, is_hybrid = $3, is_online_sync = $4, 
           is_online_async = $5, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 RETURNING *`,
      [mode_name, description, is_hybrid || false, is_online_sync || false, is_online_async || false, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Program mode not found' });
    }

    res.json({ 
      data: result.rows[0], 
      message: 'Program mode updated successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Program mode name already exists' });
    } else {
      res.status(500).json({ message: 'Error updating program mode', error: error.message });
    }
  }
});

// DELETE /api/config/program-modes/:id - Delete program mode
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if program mode has associated programs
    const programsCheck = await db.query('SELECT COUNT(*) FROM programs WHERE program_mode_id = $1', [id]);
    if (parseInt(programsCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete program mode. It has associated programs.' 
      });
    }

    const result = await db.query('DELETE FROM program_modes WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Program mode not found' });
    }

    res.json({ message: 'Program mode deleted successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error deleting program mode', error: error.message });
  }
});

module.exports = router;

