const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Validation rules
const curriculumValidation = [
  body('curriculum_batch').notEmpty().withMessage('Curriculum batch is required'),
  body('program_id').isInt({ min: 1 }).withMessage('Program ID is required and must be a positive integer'),
  body('department_id').isInt({ min: 1 }).withMessage('Department ID is required and must be a positive integer'),
  body('from_year').isInt({ min: 1900, max: 2100 }).withMessage('From year must be a valid year'),
  body('to_year').isInt({ min: 1900, max: 2100 }).withMessage('To year must be a valid year'),
  body('program_owner_id').optional().isInt({ min: 1 }).withMessage('Program owner ID must be a positive integer if provided'),
  body('peo_creation_status').optional().isIn(['Pending', 'Created']).withMessage('PEO creation status must be either Pending or Created')
];

// GET /api/config/curriculum-regulations - Get all curriculum regulations
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        cr.*,
        p.title as program_name,
        p.acronym as program_acronym,
        d.department_name,
        d.short_name as department_acronym,
        u.first_name || ' ' || u.last_name as curriculum_head_name,
        po.first_name || ' ' || po.last_name as program_owner_name
      FROM curriculum_regulations cr
      JOIN programs p ON cr.program_id = p.id
      JOIN departments d ON cr.department_id = d.id
      LEFT JOIN users u ON cr.curriculum_head_id = u.id
      LEFT JOIN users po ON cr.program_owner_id = po.id
    `;
    
    let countQuery = 'SELECT COUNT(*) FROM curriculum_regulations cr';
    const params = [];
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(`(cr.curriculum_batch ILIKE $${params.length + 1} OR p.title ILIKE $${params.length + 1} OR d.department_name ILIKE $${params.length + 1} OR po.first_name ILIKE $${params.length + 1} OR po.last_name ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    
    if (status) {
      whereConditions.push(`cr.peo_creation_status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (whereConditions.length > 0) {
      const whereClause = ' WHERE ' + whereConditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }
    
    query += ` ORDER BY cr.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const [curriculum, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    res.json({
      data: curriculum.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'Curriculum regulations retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching curriculum regulations', error: error.message });
  }
});

// GET /api/config/curriculum-regulations/all - Get all curriculum regulations without pagination
router.get('/all', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        cr.*,
        p.title as program_name,
        p.acronym as program_acronym,
        d.department_name,
        d.short_name as department_acronym,
        u.first_name || ' ' || u.last_name as curriculum_head_name,
        po.first_name || ' ' || po.last_name as program_owner_name
      FROM curriculum_regulations cr
      JOIN programs p ON cr.program_id = p.id
      JOIN departments d ON cr.department_id = d.id
      LEFT JOIN users u ON cr.curriculum_head_id = u.id
      LEFT JOIN users po ON cr.program_owner_id = po.id
      ORDER BY cr.curriculum_batch, cr.from_year DESC
    `);
    
    res.json({
      data: result.rows,
      message: 'All curriculum regulations retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching all curriculum regulations', error: error.message });
  }
});

// GET /api/config/curriculum-regulations/:id - Get curriculum regulation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT 
        cr.*,
        p.title as program_name,
        p.acronym as program_acronym,
        d.department_name,
        d.short_name as department_acronym,
        u.first_name || ' ' || u.last_name as curriculum_head_name,
        po.first_name || ' ' || po.last_name as program_owner_name
      FROM curriculum_regulations cr
      JOIN programs p ON cr.program_id = p.id
      JOIN departments d ON cr.department_id = d.id
      LEFT JOIN users u ON cr.curriculum_head_id = u.id
      LEFT JOIN users po ON cr.program_owner_id = po.id
      WHERE cr.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Curriculum regulation not found' });
    }
    
    res.json({ data: result.rows[0], message: 'Curriculum regulation retrieved successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching curriculum regulation', error: error.message });
  }
});

// POST /api/config/curriculum-regulations - Create new curriculum regulation
router.post('/', curriculumValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      curriculum_batch,
      program_id,
      department_id,
      from_year,
      to_year,
      program_owner_id,
      peo_creation_status = 'Pending',
      curriculum_head_id
    } = req.body;

    // Validate year range
    if (from_year >= to_year) {
      return res.status(400).json({ message: 'From year must be less than to year' });
    }

    const result = await db.query(`
      INSERT INTO curriculum_regulations 
      (curriculum_batch, program_id, department_id, from_year, to_year, 
       program_owner_id, peo_creation_status, curriculum_head_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `, [
      curriculum_batch,
      program_id,
      department_id,
      from_year,
      to_year,
      program_owner_id || null,
      peo_creation_status,
      curriculum_head_id || null
    ]);

    res.status(201).json({ 
      data: result.rows[0], 
      message: 'Curriculum regulation created successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Curriculum regulation already exists for this batch, program, and department' });
    } else {
      res.status(500).json({ message: 'Error creating curriculum regulation', error: error.message });
    }
  }
});

// PUT /api/config/curriculum-regulations/:id - Update curriculum regulation
router.put('/:id', curriculumValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      curriculum_batch,
      program_id,
      department_id,
      from_year,
      to_year,
      program_owner_id,
      peo_creation_status,
      curriculum_head_id
    } = req.body;

    // Validate year range
    if (from_year >= to_year) {
      return res.status(400).json({ message: 'From year must be less than to year' });
    }

    const result = await db.query(`
      UPDATE curriculum_regulations 
      SET curriculum_batch = $1, program_id = $2, department_id = $3, 
          from_year = $4, to_year = $5, program_owner_id = $6, 
          peo_creation_status = $7, curriculum_head_id = $8, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 
      RETURNING *
    `, [
      curriculum_batch,
      program_id,
      department_id,
      from_year,
      to_year,
      program_owner_id || null,
      peo_creation_status,
      curriculum_head_id || null,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Curriculum regulation not found' });
    }

    res.json({ 
      data: result.rows[0], 
      message: 'Curriculum regulation updated successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Curriculum regulation already exists for this batch, program, and department' });
    } else {
      res.status(500).json({ message: 'Error updating curriculum regulation', error: error.message });
    }
  }
});

// DELETE /api/config/curriculum-regulations/:id - Delete curriculum regulation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM curriculum_regulations WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Curriculum regulation not found' });
    }

    res.json({ message: 'Curriculum regulation deleted successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error deleting curriculum regulation', error: error.message });
  }
});

// GET /api/config/curriculum-regulations/:id/peo-status - Check PEO status for curriculum
router.get('/:id/peo-status', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if PEOs exist for this curriculum regulation
    const peosResult = await db.query(`
      SELECT COUNT(*) as peo_count
      FROM peos 
      WHERE curriculum_regulation_id = $1 AND is_active = true
    `, [id]);

    const peoCount = parseInt(peosResult.rows[0].peo_count);
    const hasPEOs = peoCount > 0;

    // Get current status from curriculum regulations
    const curriculumResult = await db.query(`
      SELECT peo_creation_status
      FROM curriculum_regulations 
      WHERE id = $1
    `, [id]);

    if (curriculumResult.rows.length === 0) {
      return res.status(404).json({ message: 'Curriculum regulation not found' });
    }

    const currentStatus = curriculumResult.rows[0].peo_creation_status;
    const actualStatus = hasPEOs ? 'Created' : 'Pending';

    res.json({ 
      data: {
        curriculum_id: id,
        current_status: currentStatus,
        actual_status: actualStatus,
        has_peos: hasPEOs,
        peo_count: peoCount,
        status_matches: currentStatus === actualStatus
      },
      message: 'PEO status checked successfully' 
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error checking PEO status', error: error.message });
  }
});

// PUT /api/config/curriculum-regulations/:id/peo-status - Update PEO creation status
router.put('/:id/peo-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { peo_creation_status } = req.body;

    if (!['Pending', 'Created'].includes(peo_creation_status)) {
      return res.status(400).json({ message: 'PEO creation status must be either Pending or Created' });
    }

    const result = await db.query(`
      UPDATE curriculum_regulations 
      SET peo_creation_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 
      RETURNING *
    `, [peo_creation_status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Curriculum regulation not found' });
    }

    res.json({ 
      data: result.rows[0], 
      message: 'PEO creation status updated successfully' 
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error updating PEO creation status', error: error.message });
  }
});

// GET /api/config/curriculum-regulations/stats/overview - Get curriculum regulations statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_curriculum,
        COUNT(CASE WHEN peo_creation_status = 'Created' THEN 1 END) as peo_created,
        COUNT(CASE WHEN peo_creation_status = 'Pending' THEN 1 END) as peo_pending,
        COUNT(DISTINCT department_id) as departments_count,
        COUNT(DISTINCT program_id) as programs_count
      FROM curriculum_regulations
      WHERE is_active = true
    `);
    
    res.json({ 
      data: stats.rows[0], 
      message: 'Curriculum regulations statistics retrieved successfully' 
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching curriculum regulations statistics', error: error.message });
  }
});

module.exports = router;
