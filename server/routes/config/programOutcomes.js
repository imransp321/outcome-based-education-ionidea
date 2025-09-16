const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Get all program outcomes with pagination and search
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      curriculum_regulation_id,
      standard = 'NBA'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['po.is_active = true'];
    let queryParams = [];
    let paramCount = 0;

    // Filter by curriculum regulation
    if (curriculum_regulation_id) {
      paramCount++;
      whereConditions.push(`po.curriculum_regulation_id = $${paramCount}`);
      queryParams.push(curriculum_regulation_id);
    }

    // Filter by standard
    if (standard) {
      paramCount++;
      whereConditions.push(`po.standard = $${paramCount}`);
      queryParams.push(standard);
    }

    // Search functionality
    if (search) {
      paramCount++;
      whereConditions.push(`(
        po.po_reference ILIKE $${paramCount} OR 
        po.po_type ILIKE $${paramCount} OR 
        po.po_statement ILIKE $${paramCount} OR
        po.map_ga ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM program_outcomes po
      JOIN curriculum_regulations cr ON po.curriculum_regulation_id = cr.id
      JOIN programs p ON cr.program_id = p.id
      JOIN departments d ON cr.department_id = d.id
      ${whereClause}
    `;

    const countResult = await db.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].total);

    // Get program outcomes with pagination
    const dataQuery = `
      SELECT 
        po.id,
        po.curriculum_regulation_id,
        po.po_reference,
        po.pso_flag,
        po.po_type,
        po.map_ga,
        po.po_statement,
        po.standard,
        po.is_active,
        po.created_at,
        po.updated_at,
        cr.curriculum_batch,
        p.title as program_name,
        d.department_name
      FROM program_outcomes po
      JOIN curriculum_regulations cr ON po.curriculum_regulation_id = cr.id
      JOIN programs p ON cr.program_id = p.id
      JOIN departments d ON cr.department_id = d.id
      ${whereClause}
      ORDER BY po.curriculum_regulation_id, po.po_reference
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);
    const result = await db.query(dataQuery, queryParams);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext,
        hasPrev,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch program outcomes',
      error: error.message
    });
  }
});

// Get all curriculum regulations for dropdown
router.get('/curriculum-regulations', async (req, res) => {
  try {
    const query = `
      SELECT 
        cr.id,
        cr.curriculum_batch,
        p.title as program_name,
        d.department_name
      FROM curriculum_regulations cr
      JOIN programs p ON cr.program_id = p.id
      JOIN departments d ON cr.department_id = d.id
      WHERE cr.is_active = true
      ORDER BY cr.curriculum_batch, p.title
    `;

    const result = await db.query(query);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch curriculum regulations',
      error: error.message
    });
  }
});

// Get program outcomes statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_pos,
        COUNT(CASE WHEN pso_flag = true THEN 1 END) as total_psos,
        COUNT(CASE WHEN standard = 'NBA' THEN 1 END) as nba_pos,
        COUNT(CASE WHEN standard = 'ABET' THEN 1 END) as abet_pos,
        COUNT(CASE WHEN standard = 'CUSTOM' THEN 1 END) as custom_pos,
        COUNT(DISTINCT curriculum_regulation_id) as curriculum_count
      FROM program_outcomes 
      WHERE is_active = true
    `;

    const result = await db.query(query);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// Get program outcome by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        po.id,
        po.curriculum_regulation_id,
        po.po_reference,
        po.pso_flag,
        po.po_type,
        po.map_ga,
        po.po_statement,
        po.standard,
        po.is_active,
        po.created_at,
        po.updated_at,
        cr.curriculum_batch,
        p.title as program_name,
        d.department_name
      FROM program_outcomes po
      JOIN curriculum_regulations cr ON po.curriculum_regulation_id = cr.id
      JOIN programs p ON cr.program_id = p.id
      JOIN departments d ON cr.department_id = d.id
      WHERE po.id = $1 AND po.is_active = true
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program outcome not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch program outcome',
      error: error.message
    });
  }
});

// Create new program outcome
router.post('/', [
  body('curriculum_regulation_id').isInt({ min: 1 }).withMessage('Curriculum regulation ID must be a positive integer'),
  body('po_reference').notEmpty().withMessage('PO Reference is required'),
  body('po_type').notEmpty().withMessage('PO Type is required'),
  body('po_statement').notEmpty().withMessage('PO Statement is required'),
  body('standard').optional().isIn(['ABET', 'NBA', 'CUSTOM']).withMessage('Standard must be ABET, NBA, or CUSTOM'),
  body('pso_flag').optional().isBoolean().withMessage('PSO Flag must be a boolean'),
  body('map_ga').optional().isString().withMessage('Map GA must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      curriculum_regulation_id,
      po_reference,
      pso_flag = false,
      po_type,
      map_ga,
      po_statement,
      standard = 'NBA'
    } = req.body;

    // Check if PO reference already exists for this curriculum
    const existingQuery = `
      SELECT id FROM program_outcomes 
      WHERE curriculum_regulation_id = $1 AND po_reference = $2 AND is_active = true
    `;
    const existingResult = await db.query(existingQuery, [curriculum_regulation_id, po_reference]);

    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'PO Reference already exists for this curriculum'
      });
    }

    const insertQuery = `
      INSERT INTO program_outcomes (
        curriculum_regulation_id, po_reference, pso_flag, po_type, 
        map_ga, po_statement, standard
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      curriculum_regulation_id,
      po_reference,
      pso_flag,
      po_type,
      map_ga || null,
      po_statement,
      standard
    ]);

    res.status(201).json({
      success: true,
      message: 'Program outcome created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to create program outcome',
      error: error.message
    });
  }
});

// Update program outcome
router.put('/:id', [
  body('po_reference').optional().notEmpty().withMessage('PO Reference cannot be empty'),
  body('po_type').optional().notEmpty().withMessage('PO Type cannot be empty'),
  body('po_statement').optional().notEmpty().withMessage('PO Statement cannot be empty'),
  body('standard').optional().isIn(['ABET', 'NBA', 'CUSTOM']).withMessage('Standard must be ABET, NBA, or CUSTOM'),
  body('pso_flag').optional().isBoolean().withMessage('PSO Flag must be a boolean'),
  body('map_ga').optional().isString().withMessage('Map GA must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const {
      po_reference,
      pso_flag,
      po_type,
      map_ga,
      po_statement,
      standard
    } = req.body;

    // Check if program outcome exists
    const existingQuery = 'SELECT * FROM program_outcomes WHERE id = $1 AND is_active = true';
    const existingResult = await db.query(existingQuery, [id]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program outcome not found'
      });
    }

    // Check if PO reference already exists for this curriculum (excluding current record)
    if (po_reference) {
      const duplicateQuery = `
        SELECT id FROM program_outcomes 
        WHERE curriculum_regulation_id = $1 AND po_reference = $2 AND id != $3 AND is_active = true
      `;
      const duplicateResult = await db.query(duplicateQuery, [
        existingResult.rows[0].curriculum_regulation_id,
        po_reference,
        id
      ]);

      if (duplicateResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'PO Reference already exists for this curriculum'
        });
      }
    }

    const updateQuery = `
      UPDATE program_outcomes 
      SET 
        po_reference = COALESCE($2, po_reference),
        pso_flag = COALESCE($3, pso_flag),
        po_type = COALESCE($4, po_type),
        map_ga = COALESCE($5, map_ga),
        po_statement = COALESCE($6, po_statement),
        standard = COALESCE($7, standard),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(updateQuery, [
      id,
      po_reference,
      pso_flag,
      po_type,
      map_ga,
      po_statement,
      standard
    ]);

    res.json({
      success: true,
      message: 'Program outcome updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to update program outcome',
      error: error.message
    });
  }
});

// Delete program outcome (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE program_outcomes 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 AND is_active = true
      RETURNING id
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program outcome not found'
      });
    }

    res.json({
      success: true,
      message: 'Program outcome deleted successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete program outcome',
      error: error.message
    });
  }
});

module.exports = router;

