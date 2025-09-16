const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Validation rules
const labCategoryValidation = [
  body('category_name').notEmpty().withMessage('Category name is required')
];

// GET /api/config/lab-categories - Get lab categories with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM lab_categories';
    let countQuery = 'SELECT COUNT(*) FROM lab_categories';
    const params = [];

    if (search) {
      query += ' WHERE category_name ILIKE $1 OR description ILIKE $1';
      countQuery += ' WHERE category_name ILIKE $1 OR description ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY category_name ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [labCategories, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: labCategories.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'Lab categories retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching lab categories', error: error.message });
  }
});

// GET /api/config/lab-categories/:id - Get lab category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM lab_categories WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lab category not found' });
    }
    
    res.json({ data: result.rows[0], message: 'Lab category retrieved successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching lab category', error: error.message });
  }
});

// POST /api/config/lab-categories - Create new lab category
router.post('/', labCategoryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category_name, description } = req.body;

    const result = await db.query(
      'INSERT INTO lab_categories (category_name, description) VALUES ($1, $2) RETURNING *',
      [category_name, description]
    );

    res.status(201).json({ 
      data: result.rows[0], 
      message: 'Lab category created successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Category name already exists' });
    } else {
      res.status(500).json({ message: 'Error creating lab category', error: error.message });
    }
  }
});

// PUT /api/config/lab-categories/:id - Update lab category
router.put('/:id', labCategoryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { category_name, description } = req.body;

    const result = await db.query(
      `UPDATE lab_categories 
       SET category_name = $1, description = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 RETURNING *`,
      [category_name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lab category not found' });
    }

    res.json({ 
      data: result.rows[0], 
      message: 'Lab category updated successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Category name already exists' });
    } else {
      res.status(500).json({ message: 'Error updating lab category', error: error.message });
    }
  }
});

// DELETE /api/config/lab-categories/:id - Delete lab category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM lab_categories WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lab category not found' });
    }

    res.json({ message: 'Lab category deleted successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error deleting lab category', error: error.message });
  }
});

module.exports = router;

