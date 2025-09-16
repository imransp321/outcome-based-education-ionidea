const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Validation rules for domains
const domainValidation = [
  body('domain_name').notEmpty().withMessage('Domain name is required'),
  body('domain_acronym').notEmpty().withMessage('Domain acronym is required'),
  body('description').optional()
];

// Validation rules for levels
const levelValidation = [
  body('domain_id').isInt().withMessage('Domain ID is required'),
  body('level_number').isInt({ min: 1 }).withMessage('Level number must be a positive integer'),
  body('level_name').notEmpty().withMessage('Level name is required'),
  body('learning_characteristics').optional(),
  body('action_words').optional().isArray().withMessage('Action words must be an array')
];

// GET /api/config/blooms/domains - Get domains with pagination
router.get('/domains', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM blooms_domains';
    let countQuery = 'SELECT COUNT(*) FROM blooms_domains';
    const params = [];

    if (search) {
      query += ' WHERE domain_name ILIKE $1 OR domain_acronym ILIKE $1 OR description ILIKE $1';
      countQuery += ' WHERE domain_name ILIKE $1 OR domain_acronym ILIKE $1 OR description ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY domain_name ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [domains, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: domains.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'Bloom\'s domains retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching Bloom\'s domains', error: error.message });
  }
});

// GET /api/config/blooms/levels - Get levels with pagination
router.get('/levels', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT bl.*, bd.domain_name, bd.domain_acronym
      FROM blooms_levels bl
      LEFT JOIN blooms_domains bd ON bl.domain_id = bd.id
    `;
    let countQuery = 'SELECT COUNT(*) FROM blooms_levels bl';
    const params = [];

    if (search) {
      query += ' WHERE bl.level_name ILIKE $1 OR bl.learning_characteristics ILIKE $1 OR bd.domain_name ILIKE $1';
      countQuery += ' WHERE bl.level_name ILIKE $1 OR bl.learning_characteristics ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY bd.domain_name, bl.level_number ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [levels, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: levels.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'Bloom\'s levels retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching Bloom\'s levels', error: error.message });
  }
});

// POST /api/config/blooms/domains - Create new domain
router.post('/domains', domainValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { domain_name, domain_acronym, description } = req.body;

    const result = await db.query(
      `INSERT INTO blooms_domains (domain_name, domain_acronym, description) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [domain_name, domain_acronym, description]
    );

    res.status(201).json({ 
      data: result.rows[0], 
      message: 'Bloom\'s domain created successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      if (error.detail && error.detail.includes('domain_name')) {
        res.status(400).json({ message: 'A domain with this name already exists. Please choose a different name.' });
      } else if (error.detail && error.detail.includes('domain_acronym')) {
        res.status(400).json({ message: 'A domain with this acronym already exists. Please choose a different acronym.' });
      } else {
        res.status(400).json({ message: 'Domain name or acronym already exists' });
      }
    } else {
      res.status(500).json({ message: 'Error creating Bloom\'s domain', error: error.message });
    }
  }
});

// PUT /api/config/blooms/domains/:id - Update domain
router.put('/domains/:id', domainValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { domain_name, domain_acronym, description } = req.body;

    const result = await db.query(
      `UPDATE blooms_domains 
       SET domain_name = $1, domain_acronym = $2, description = $3, created_at = CURRENT_TIMESTAMP 
       WHERE id = $4 RETURNING *`,
      [domain_name, domain_acronym, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Domain not found' });
    }

    res.json({ 
      data: result.rows[0], 
      message: 'Domain updated successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      if (error.detail && error.detail.includes('domain_name')) {
        res.status(400).json({ message: 'A domain with this name already exists. Please choose a different name.' });
      } else if (error.detail && error.detail.includes('domain_acronym')) {
        res.status(400).json({ message: 'A domain with this acronym already exists. Please choose a different acronym.' });
      } else {
        res.status(400).json({ message: 'Domain name or acronym already exists' });
      }
    } else {
      res.status(500).json({ message: 'Error updating domain', error: error.message });
    }
  }
});

// DELETE /api/config/blooms/domains/:id - Delete domain
router.delete('/domains/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM blooms_domains WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Domain not found' });
    }

    res.json({ message: 'Domain deleted successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error deleting domain', error: error.message });
  }
});

// GET /api/config/blooms/levels/:domainId - Get levels by domain
router.get('/levels/:domainId', async (req, res) => {
  try {
    const { domainId } = req.params;
    const result = await db.query(`
      SELECT bl.*, bd.domain_name, bd.domain_acronym
      FROM blooms_levels bl
      LEFT JOIN blooms_domains bd ON bl.domain_id = bd.id
      WHERE bl.domain_id = $1
      ORDER BY bl.level_number ASC
    `, [domainId]);
    res.json({ data: result.rows, message: 'Bloom\'s levels retrieved successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching Bloom\'s levels', error: error.message });
  }
});

// POST /api/config/blooms/levels - Create new level
router.post('/levels', levelValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { domain_id, level_number, level_name, learning_characteristics, action_words } = req.body;

    const result = await db.query(
      `INSERT INTO blooms_levels (domain_id, level_number, level_name, learning_characteristics, action_words) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [domain_id, level_number, level_name, learning_characteristics, action_words || []]
    );

    res.status(201).json({ 
      data: result.rows[0], 
      message: 'Bloom\'s level created successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'A level with this number already exists for this domain' });
    } else {
      res.status(500).json({ message: 'Error creating Bloom\'s level', error: error.message });
    }
  }
});

// PUT /api/config/blooms/levels/:id - Update level
router.put('/levels/:id', levelValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { domain_id, level_number, level_name, learning_characteristics, action_words } = req.body;

    const result = await db.query(
      `UPDATE blooms_levels 
       SET domain_id = $1, level_number = $2, level_name = $3, 
           learning_characteristics = $4, action_words = $5, created_at = CURRENT_TIMESTAMP 
       WHERE id = $6 RETURNING *`,
      [domain_id, level_number, level_name, learning_characteristics, action_words || [], id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Level not found' });
    }

    res.json({ 
      data: result.rows[0], 
      message: 'Level updated successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'A level with this number already exists for this domain' });
    } else {
      res.status(500).json({ message: 'Error updating level', error: error.message });
    }
  }
});

// DELETE /api/config/blooms/levels/:id - Delete level
router.delete('/levels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM blooms_levels WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Level not found' });
    }

    res.json({ message: 'Level deleted successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error deleting level', error: error.message });
  }
});

module.exports = router;

