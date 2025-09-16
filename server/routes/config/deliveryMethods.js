const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Validation rules
const deliveryMethodValidation = [
  body('method_name').notEmpty().withMessage('Method name is required')
];

// GET /api/config/delivery-methods - Get delivery methods with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM delivery_methods';
    let countQuery = 'SELECT COUNT(*) FROM delivery_methods';
    const params = [];

    if (search) {
      query += ' WHERE method_name ILIKE $1 OR guidelines ILIKE $1';
      countQuery += ' WHERE method_name ILIKE $1 OR guidelines ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY method_name ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [deliveryMethods, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: deliveryMethods.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'Delivery methods retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching delivery methods', error: error.message });
  }
});

// GET /api/config/delivery-methods/:id - Get delivery method by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM delivery_methods WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery method not found' });
    }
    
    res.json({ data: result.rows[0], message: 'Delivery method retrieved successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching delivery method', error: error.message });
  }
});

// POST /api/config/delivery-methods - Create new delivery method
router.post('/', deliveryMethodValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { method_name, guidelines, blooms_levels, is_active } = req.body;

    const result = await db.query(
      'INSERT INTO delivery_methods (method_name, guidelines, blooms_levels, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
      [method_name, guidelines, blooms_levels || [], is_active !== false]
    );

    res.status(201).json({ 
      data: result.rows[0], 
      message: 'Delivery method created successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Method name already exists' });
    } else {
      res.status(500).json({ message: 'Error creating delivery method', error: error.message });
    }
  }
});

// PUT /api/config/delivery-methods/:id - Update delivery method
router.put('/:id', deliveryMethodValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { method_name, guidelines, blooms_levels, is_active } = req.body;

    const result = await db.query(
      `UPDATE delivery_methods 
       SET method_name = $1, guidelines = $2, blooms_levels = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 RETURNING *`,
      [method_name, guidelines, blooms_levels || [], is_active !== false, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery method not found' });
    }

    res.json({ 
      data: result.rows[0], 
      message: 'Delivery method updated successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Method name already exists' });
    } else {
      res.status(500).json({ message: 'Error updating delivery method', error: error.message });
    }
  }
});

// DELETE /api/config/delivery-methods/:id - Delete delivery method
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM delivery_methods WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery method not found' });
    }

    res.json({ message: 'Delivery method deleted successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error deleting delivery method', error: error.message });
  }
});

module.exports = router;

