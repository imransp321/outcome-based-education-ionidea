const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Validation rules
const peoValidation = [
  body('curriculum_regulation_id').isInt({ min: 1 }).withMessage('Curriculum regulation ID is required and must be a positive integer'),
  body('peo_number').notEmpty().withMessage('PEO number is required'),
  body('peo_title').notEmpty().withMessage('PEO title is required'),
  body('peo_description').notEmpty().withMessage('PEO description is required'),
  body('peo_statement').notEmpty().withMessage('PEO statement is required')
];

// GET /api/config/peos - Get all PEOs with optional curriculum filter
router.get('/', async (req, res) => {
  try {
    const { curriculum_regulation_id, page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        p.*,
        cr.curriculum_batch,
        pr.title as program_name,
        pr.acronym as program_acronym,
        d.department_name,
        d.short_name as department_acronym
      FROM peos p
      JOIN curriculum_regulations cr ON p.curriculum_regulation_id = cr.id
      JOIN programs pr ON cr.program_id = pr.id
      JOIN departments d ON cr.department_id = d.id
    `;
    
    let countQuery = 'SELECT COUNT(*) FROM peos p';
    const params = [];
    let whereConditions = [];
    
    if (curriculum_regulation_id) {
      whereConditions.push(`p.curriculum_regulation_id = $${params.length + 1}`);
      params.push(curriculum_regulation_id);
    }
    
    if (search) {
      whereConditions.push(`(
        p.peo_number ILIKE $${params.length + 1} OR 
        p.peo_title ILIKE $${params.length + 1} OR 
        p.peo_description ILIKE $${params.length + 1} OR 
        p.peo_statement ILIKE $${params.length + 1} OR
        cr.curriculum_batch ILIKE $${params.length + 1} OR
        pr.title ILIKE $${params.length + 1} OR
        d.department_name ILIKE $${params.length + 1}
      )`);
      params.push(`%${search}%`);
    }
    
    if (whereConditions.length > 0) {
      const whereClause = ' WHERE ' + whereConditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }
    
    query += ` ORDER BY p.curriculum_regulation_id, p.peo_number LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const [peos, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    res.json({
      data: peos.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'PEOs retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching PEOs', error: error.message });
  }
});

// GET /api/config/peos/curriculum-regulations - Get all curriculum regulations for dropdown
router.get('/curriculum-regulations', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        cr.id,
        cr.curriculum_batch,
        pr.title as program_name,
        pr.acronym as program_acronym,
        d.department_name,
        d.short_name as department_acronym,
        cr.from_year,
        cr.to_year
      FROM curriculum_regulations cr
      JOIN programs pr ON cr.program_id = pr.id
      JOIN departments d ON cr.department_id = d.id
      WHERE cr.is_active = true
      ORDER BY cr.curriculum_batch, pr.title, d.department_name
    `);
    
    res.json({
      data: result.rows,
      message: 'Curriculum regulations retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching curriculum regulations', error: error.message });
  }
});

// GET /api/config/peos/:id - Get PEO by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT 
        p.*,
        cr.curriculum_batch,
        pr.title as program_name,
        pr.acronym as program_acronym,
        d.department_name,
        d.short_name as department_acronym
      FROM peos p
      JOIN curriculum_regulations cr ON p.curriculum_regulation_id = cr.id
      JOIN programs pr ON cr.program_id = pr.id
      JOIN departments d ON cr.department_id = d.id
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'PEO not found' });
    }
    
    res.json({ data: result.rows[0], message: 'PEO retrieved successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching PEO', error: error.message });
  }
});

// POST /api/config/peos - Create new PEO
router.post('/', peoValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      curriculum_regulation_id,
      peo_number,
      peo_title,
      peo_description,
      peo_statement
    } = req.body;

    const result = await db.query(`
      INSERT INTO peos (curriculum_regulation_id, peo_number, peo_title, peo_description, peo_statement)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      curriculum_regulation_id,
      peo_number,
      peo_title,
      peo_description,
      peo_statement
    ]);

    res.status(201).json({ 
      data: result.rows[0], 
      message: 'PEO created successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'PEO number already exists for this curriculum regulation' });
    } else {
      res.status(500).json({ message: 'Error creating PEO', error: error.message });
    }
  }
});

// PUT /api/config/peos/:id - Update PEO
router.put('/:id', peoValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      curriculum_regulation_id,
      peo_number,
      peo_title,
      peo_description,
      peo_statement
    } = req.body;

    const result = await db.query(`
      UPDATE peos 
      SET curriculum_regulation_id = $1, peo_number = $2, peo_title = $3, 
          peo_description = $4, peo_statement = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 
      RETURNING *
    `, [
      curriculum_regulation_id,
      peo_number,
      peo_title,
      peo_description,
      peo_statement,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'PEO not found' });
    }

    res.json({ 
      data: result.rows[0], 
      message: 'PEO updated successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'PEO number already exists for this curriculum regulation' });
    } else {
      res.status(500).json({ message: 'Error updating PEO', error: error.message });
    }
  }
});

// DELETE /api/config/peos/:id - Delete PEO
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM peos WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'PEO not found' });
    }

    res.json({ message: 'PEO deleted successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error deleting PEO', error: error.message });
  }
});

// GET /api/config/peos/stats/overview - Get PEOs statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_peos,
        COUNT(DISTINCT curriculum_regulation_id) as curriculum_count,
        COUNT(DISTINCT peo_number) as unique_peo_numbers
      FROM peos
      WHERE is_active = true
    `);
    
    res.json({ 
      data: stats.rows[0], 
      message: 'PEOs statistics retrieved successfully' 
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching PEOs statistics', error: error.message });
  }
});

module.exports = router;

