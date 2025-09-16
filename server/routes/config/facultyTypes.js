const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Validation rules
const facultyTypeValidation = [
  body('type_name').notEmpty().withMessage('Faculty type name is required'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long')
];

// GET /api/config/faculty-types - Get all faculty types
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM faculty_types ORDER BY type_name ASC');
    
    res.json({
      data: result.rows,
      message: 'Faculty types retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching faculty types', error: error.message });
  }
});

// GET /api/config/faculty-types/:id - Get faculty type by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM faculty_types WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty type not found' });
    }
    
    res.json({ data: result.rows[0], message: 'Faculty type retrieved successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching faculty type', error: error.message });
  }
});

// POST /api/config/faculty-types - Create new faculty type
router.post('/', facultyTypeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type_name, description } = req.body;

    const result = await db.query(
      `INSERT INTO faculty_types (type_name, description) 
       VALUES ($1, $2) 
       RETURNING *`,
      [type_name, description || null]
    );

    res.status(201).json({ 
      data: result.rows[0], 
      message: 'Faculty type created successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Faculty type name already exists' });
    } else {
      res.status(500).json({ message: 'Error creating faculty type', error: error.message });
    }
  }
});

// PUT /api/config/faculty-types/:id - Update faculty type
router.put('/:id', facultyTypeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { type_name, description } = req.body;

    const result = await db.query(
      `UPDATE faculty_types 
       SET type_name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING *`,
      [type_name, description || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty type not found' });
    }

    res.json({ 
      data: result.rows[0], 
      message: 'Faculty type updated successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Faculty type name already exists' });
    } else {
      res.status(500).json({ message: 'Error updating faculty type', error: error.message });
    }
  }
});

// DELETE /api/config/faculty-types/:id - Delete faculty type
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if faculty type has users
    const usersCheck = await db.query('SELECT COUNT(*) FROM users WHERE faculty_type_id = $1', [id]);
    if (parseInt(usersCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete faculty type. It has associated users. Please reassign users first.' 
      });
    }

    const result = await db.query('DELETE FROM faculty_types WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty type not found' });
    }

    res.json({ message: 'Faculty type deleted successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error deleting faculty type', error: error.message });
  }
});

module.exports = router;
