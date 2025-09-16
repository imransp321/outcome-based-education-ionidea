const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Get PO to PEO mapping matrix for a curriculum
router.get('/matrix/:curriculumId', async (req, res) => {
  try {
    const { curriculumId } = req.params;

    // Get all POs for the curriculum
    const posQuery = `
      SELECT 
        po.id,
        po.po_reference,
        po.po_type,
        po.pso_flag
      FROM program_outcomes po
      WHERE po.curriculum_regulation_id = $1 AND po.is_active = true
      ORDER BY po.po_reference
    `;

    const posResult = await db.query(posQuery, [curriculumId]);

    // Get all PEOs for the curriculum
    const peosQuery = `
      SELECT 
        peo.id,
        peo.peo_number,
        peo.peo_title,
        peo.peo_statement,
        peo.peo_description
      FROM peos peo
      WHERE peo.curriculum_regulation_id = $1 AND peo.is_active = true
      ORDER BY peo.peo_number
    `;

    const peosResult = await db.query(peosQuery, [curriculumId]);

    // Get all mappings for the curriculum
    const mappingsQuery = `
      SELECT 
        m.po_id,
        m.peo_id,
        m.mapping_strength,
        m.mapping_justification
      FROM po_peo_mapping m
      WHERE m.curriculum_regulation_id = $1 AND m.is_active = true
    `;

    const mappingsResult = await db.query(mappingsQuery, [curriculumId]);

    // Create mapping matrix
    const mappingMatrix = posResult.rows.map(po => {
      const row = {
        po: po,
        mappings: peosResult.rows.map(peo => {
          const mapping = mappingsResult.rows.find(m => m.po_id === po.id && m.peo_id === peo.id);
          return {
            peo: peo,
            mapping: mapping || null
          };
        })
      };
      return row;
    });

    res.json({
      success: true,
      data: {
        pos: posResult.rows,
        peos: peosResult.rows,
        matrix: mappingMatrix
      }
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PO to PEO mapping matrix',
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

// Create or update PO to PEO mapping
router.post('/mapping', [
  body('curriculum_regulation_id').isInt({ min: 1 }).withMessage('Curriculum regulation ID must be a positive integer'),
  body('po_id').isInt({ min: 1 }).withMessage('PO ID must be a positive integer'),
  body('peo_id').isInt({ min: 1 }).withMessage('PEO ID must be a positive integer'),
  body('mapping_strength').isIn(['STRONG', 'MODERATE', 'WEAK']).withMessage('Mapping strength must be STRONG, MODERATE, or WEAK'),
  body('mapping_justification').optional().isString().withMessage('Mapping justification must be a string')
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
      po_id,
      peo_id,
      mapping_strength,
      mapping_justification
    } = req.body;

    // Check if mapping already exists
    const existingQuery = `
      SELECT id FROM po_peo_mapping 
      WHERE curriculum_regulation_id = $1 AND po_id = $2 AND peo_id = $3 AND is_active = true
    `;
    const existingResult = await db.query(existingQuery, [curriculum_regulation_id, po_id, peo_id]);

    if (existingResult.rows.length > 0) {
      // Update existing mapping
      const updateQuery = `
        UPDATE po_peo_mapping 
        SET 
          mapping_strength = $4,
          mapping_justification = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE curriculum_regulation_id = $1 AND po_id = $2 AND peo_id = $3 AND is_active = true
        RETURNING *
      `;

      const result = await db.query(updateQuery, [
        curriculum_regulation_id,
        po_id,
        peo_id,
        mapping_strength,
        mapping_justification || null
      ]);

      res.json({
        success: true,
        message: 'PO to PEO mapping updated successfully',
        data: result.rows[0]
      });
    } else {
      // Create new mapping
      const insertQuery = `
        INSERT INTO po_peo_mapping (
          curriculum_regulation_id, po_id, peo_id, mapping_strength, mapping_justification
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const result = await db.query(insertQuery, [
        curriculum_regulation_id,
        po_id,
        peo_id,
        mapping_strength,
        mapping_justification || null
      ]);

      res.status(201).json({
        success: true,
        message: 'PO to PEO mapping created successfully',
        data: result.rows[0]
      });
    }
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to save PO to PEO mapping',
      error: error.message
    });
  }
});

// Delete PO to PEO mapping
router.delete('/mapping/:curriculumId/:poId/:peoId', async (req, res) => {
  try {
    const { curriculumId, poId, peoId } = req.params;

    const query = `
      UPDATE po_peo_mapping 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP 
      WHERE curriculum_regulation_id = $1 AND po_id = $2 AND peo_id = $3 AND is_active = true
      RETURNING id
    `;

    const result = await db.query(query, [curriculumId, poId, peoId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'PO to PEO mapping not found'
      });
    }

    res.json({
      success: true,
      message: 'PO to PEO mapping deleted successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete PO to PEO mapping',
      error: error.message
    });
  }
});

// Get mapping statistics for a curriculum
router.get('/stats/:curriculumId', async (req, res) => {
  try {
    const { curriculumId } = req.params;

    const statsQuery = `
      SELECT 
        COUNT(*) as total_mappings,
        COUNT(CASE WHEN mapping_strength = 'STRONG' THEN 1 END) as strong_mappings,
        COUNT(CASE WHEN mapping_strength = 'MODERATE' THEN 1 END) as moderate_mappings,
        COUNT(CASE WHEN mapping_strength = 'WEAK' THEN 1 END) as weak_mappings,
        COUNT(DISTINCT po_id) as mapped_pos,
        COUNT(DISTINCT peo_id) as mapped_peos
      FROM po_peo_mapping 
      WHERE curriculum_regulation_id = $1 AND is_active = true
    `;

    const result = await db.query(statsQuery, [curriculumId]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mapping statistics',
      error: error.message
    });
  }
});

module.exports = router;
