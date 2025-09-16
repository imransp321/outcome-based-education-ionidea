const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { body, validationResult } = require('express-validator');

// GET /api/config/co-po-mapping - Get all CO-PO mappings with filters
router.get('/', async (req, res) => {
  try {
    const { curriculum_id, term_id, course_id } = req.query;
    
    let query = `
      SELECT 
        copm.id,
        copm.co_id,
        copm.po_id,
        copm.mapping_strength,
        copm.contribution_pi,
        copm.justification,
        co.co_code,
        co.course_outcome,
        po.po_reference,
        po.po_statement,
        po.po_type,
        po.pso_flag
      FROM co_po_mapping copm
      JOIN course_outcomes co ON copm.co_id = co.id
      JOIN program_outcomes po ON copm.po_id = po.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (curriculum_id) {
      paramCount++;
      query += ` AND co.curriculum_id = $${paramCount}`;
      params.push(curriculum_id);
    }
    
    if (term_id) {
      paramCount++;
      query += ` AND co.term_id = $${paramCount}`;
      params.push(term_id);
    }
    
    if (course_id) {
      paramCount++;
      query += ` AND co.course_id = $${paramCount}`;
      params.push(course_id);
    }
    
    query += ` ORDER BY co.co_code, po.po_reference`;
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error fetching CO-PO mappings',
      error: error.message
    });
  }
});

// GET /api/config/co-po-mapping/:id - Get specific CO-PO mapping
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        copm.id,
        copm.co_id,
        copm.po_id,
        copm.mapping_strength,
        copm.contribution_pi,
        copm.justification,
        co.co_code,
        co.course_outcome,
        po.po_reference,
        po.po_statement,
        po.po_type,
        po.pso_flag
      FROM co_po_mapping copm
      JOIN course_outcomes co ON copm.co_id = co.id
      JOIN program_outcomes po ON copm.po_id = po.id
      WHERE copm.id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CO-PO mapping not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error fetching CO-PO mapping',
      error: error.message
    });
  }
});

// POST /api/config/co-po-mapping - Create new CO-PO mapping
router.post('/', [
  body('co_id').isInt().withMessage('CO ID must be an integer'),
  body('po_id').isInt().withMessage('PO ID must be an integer'),
  body('mapping_strength').isInt({ min: 1, max: 3 }).withMessage('Mapping strength must be between 1 and 3'),
  body('contribution_pi').optional().isString(),
  body('justification').optional().isString()
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
    
    const { co_id, po_id, mapping_strength, contribution_pi, justification } = req.body;
    
    // Check if mapping already exists
    const existingQuery = 'SELECT id FROM co_po_mapping WHERE co_id = $1 AND po_id = $2';
    const existingResult = await db.query(existingQuery, [co_id, po_id]);
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'CO-PO mapping already exists'
      });
    }
    
    const query = `
      INSERT INTO co_po_mapping (co_id, po_id, mapping_strength, contribution_pi, justification)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await db.query(query, [co_id, po_id, mapping_strength, contribution_pi, justification]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error creating CO-PO mapping',
      error: error.message
    });
  }
});

// PUT /api/config/co-po-mapping/:id - Update CO-PO mapping
router.put('/:id', [
  body('mapping_strength').optional().isInt({ min: 1, max: 3 }).withMessage('Mapping strength must be between 1 and 3'),
  body('contribution_pi').optional().isString(),
  body('justification').optional().isString()
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
    const { mapping_strength, contribution_pi, justification } = req.body;
    
    const query = `
      UPDATE co_po_mapping 
      SET mapping_strength = COALESCE($1, mapping_strength),
          contribution_pi = COALESCE($2, contribution_pi),
          justification = COALESCE($3, justification),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    
    const result = await db.query(query, [mapping_strength, contribution_pi, justification, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CO-PO mapping not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error updating CO-PO mapping',
      error: error.message
    });
  }
});

// DELETE /api/config/co-po-mapping/:id - Delete CO-PO mapping
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM co_po_mapping WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CO-PO mapping not found'
      });
    }
    
    res.json({
      success: true,
      message: 'CO-PO mapping deleted successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error deleting CO-PO mapping',
      error: error.message
    });
  }
});

module.exports = router;
