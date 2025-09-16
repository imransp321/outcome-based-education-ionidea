const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Validation rules
const weightageValidation = [
  body('level_name').notEmpty().withMessage('Level name is required'),
  body('acronym').notEmpty().withMessage('Acronym is required'),
  body('percentage_weightage').isFloat({ min: 0, max: 100 }).withMessage('Percentage weightage must be between 0 and 100')
];

// GET /api/config/weightage - Get map level weightages with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM map_level_weightage';
    let countQuery = 'SELECT COUNT(*) FROM map_level_weightage';
    const params = [];

    if (search) {
      query += ' WHERE level_name ILIKE $1 OR acronym ILIKE $1 OR description ILIKE $1';
      countQuery += ' WHERE level_name ILIKE $1 OR acronym ILIKE $1 OR description ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY percentage_weightage DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [weightages, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: weightages.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'Map level weightages retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching map level weightages', error: error.message });
  }
});

// GET /api/config/weightage/:id - Get weightage by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM map_level_weightage WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Weightage not found' });
    }
    
    res.json({ data: result.rows[0], message: 'Weightage retrieved successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching weightage', error: error.message });
  }
});

// POST /api/config/weightage - Create new map level weightage
router.post('/', weightageValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { level_name, acronym, status, percentage_weightage, description } = req.body;

    const result = await db.query(
      `INSERT INTO map_level_weightage 
       (level_name, acronym, status, percentage_weightage, description) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [level_name, acronym, status || 'active', percentage_weightage, description]
    );

    res.status(201).json({ 
      data: result.rows[0], 
      message: 'Map level weightage created successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      if (error.detail && error.detail.includes('level_name')) {
        res.status(400).json({ message: 'A weightage level with this name already exists. Please choose a different name.' });
      } else if (error.detail && error.detail.includes('acronym')) {
        res.status(400).json({ message: 'A weightage level with this acronym already exists. Please choose a different acronym.' });
      } else {
        res.status(400).json({ message: 'Level name or acronym already exists' });
      }
    } else {
      res.status(500).json({ message: 'Error creating map level weightage', error: error.message });
    }
  }
});

// PUT /api/config/weightage/:id - Update weightage
router.put('/:id', weightageValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { level_name, acronym, status, percentage_weightage, description } = req.body;

    const result = await db.query(
      `UPDATE map_level_weightage 
       SET level_name = $1, acronym = $2, status = $3, 
           percentage_weightage = $4, description = $5, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 RETURNING *`,
      [level_name, acronym, status || 'active', percentage_weightage, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Weightage not found' });
    }

    res.json({ 
      data: result.rows[0], 
      message: 'Weightage updated successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      if (error.detail && error.detail.includes('level_name')) {
        res.status(400).json({ message: 'A weightage level with this name already exists. Please choose a different name.' });
      } else if (error.detail && error.detail.includes('acronym')) {
        res.status(400).json({ message: 'A weightage level with this acronym already exists. Please choose a different acronym.' });
      } else {
        res.status(400).json({ message: 'Level name or acronym already exists' });
      }
    } else {
      res.status(500).json({ message: 'Error updating weightage', error: error.message });
    }
  }
});

// DELETE /api/config/weightage/:id - Delete weightage
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM map_level_weightage WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Weightage not found' });
    }

    res.json({ message: 'Weightage deleted successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error deleting weightage', error: error.message });
  }
});

module.exports = router;

