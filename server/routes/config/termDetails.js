const express = require('express');
const { query, transaction } = require('../../config/database');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Get term details for a specific curriculum
router.get('/:curriculumId', async (req, res) => {
  try {
    const { curriculumId } = req.params;
    
    // First, get the curriculum info and program owner details
    const curriculumInfo = await query(`
      SELECT 
        cr.id as curriculum_regulation_id,
        cr.curriculum_batch,
        p.title as program_name,
        d.department_name,
        u.first_name as program_owner_first_name,
        u.last_name as program_owner_last_name,
        u.email as program_owner_email,
        ta.status as approval_status,
        ta.submitted_at,
        ta.approved_at
      FROM curriculum_regulations cr
      JOIN programs p ON cr.program_id = p.id
      JOIN departments d ON cr.department_id = d.id
      LEFT JOIN users u ON cr.program_owner_id = u.id
      LEFT JOIN term_details_approval ta ON cr.id = ta.curriculum_regulation_id AND ta.is_active = true
      WHERE cr.id = $1
    `, [curriculumId]);

    if (curriculumInfo.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Curriculum not found'
      });
    }

    const curriculum = curriculumInfo.rows[0];

    // Then get the term details
    const termDetails = await query(`
      SELECT 
        td.*
      FROM curriculum_term_details td
      WHERE td.curriculum_regulation_id = $1 AND td.is_active = true
      ORDER BY td.si_no
    `, [curriculumId]);

    // If no term details exist, return empty array with curriculum info
    if (termDetails.rows.length === 0) {
      return res.json({
        success: true,
        data: [],
        curriculum_info: curriculum
      });
    }

    // If term details exist, merge the curriculum info with each term detail
    const result = termDetails.rows.map(term => ({
      ...term,
      ...curriculum
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error fetching term details',
      error: error.message
    });
  }
});

// Create a single term detail
router.post('/', [
  body('curriculum_regulation_id').isInt().withMessage('Curriculum regulation ID is required'),
  body('si_no').isInt().withMessage('SI number is required'),
  body('term_name').notEmpty().withMessage('Term name is required'),
  body('duration_weeks').isInt().withMessage('Duration in weeks is required')
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
      curriculum_regulation_id, si_no, term_name, duration_weeks, 
      credits, total_theory_courses, total_practical_others,
      academic_start_year, academic_end_year, academic_year, created_by 
    } = req.body;

    const result = await query(`
      INSERT INTO curriculum_term_details 
      (curriculum_regulation_id, si_no, term_name, duration_weeks, credits, 
       total_theory_courses, total_practical_others, academic_start_year, 
       academic_end_year, academic_year, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      curriculum_regulation_id, si_no, term_name, duration_weeks, 
      credits || 0, total_theory_courses || 0, total_practical_others || 0,
      academic_start_year || new Date().getFullYear(), 
      academic_end_year || new Date().getFullYear() + 1, 
      academic_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, 
      created_by || 1
    ]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Term detail created successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error creating term detail',
      error: error.message
    });
  }
});

// Create/update multiple term details for a curriculum
router.post('/bulk', [
  body('curriculum_regulation_id').isInt().withMessage('Curriculum regulation ID is required'),
  body('term_details').isArray().withMessage('Term details array is required')
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

    const { curriculum_regulation_id, term_details, created_by } = req.body;

    await transaction(async (client) => {
      // Delete existing term details for this curriculum
      await client.query(`
        DELETE FROM curriculum_term_details 
        WHERE curriculum_regulation_id = $1
      `, [curriculum_regulation_id]);

      // Insert new term details
      for (const term of term_details) {
        await client.query(`
          INSERT INTO curriculum_term_details 
          (curriculum_regulation_id, si_no, term_name, duration_weeks, credits, 
           total_theory_courses, total_practical_others, academic_start_year, 
           academic_end_year, academic_year, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          curriculum_regulation_id,
          term.si_no,
          term.term_name,
          term.duration_weeks,
          term.credits || 0,
          term.total_theory_courses || 0,
          term.total_practical_others || 0,
          term.academic_start_year || new Date().getFullYear(),
          term.academic_end_year || new Date().getFullYear() + 1,
          term.academic_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          created_by || 1
        ]);
      }
    });

    res.json({
      success: true,
      message: 'Term details saved successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error saving term details',
      error: error.message
    });
  }
});

// Submit term details for approval
router.post('/submit-approval', [
  body('curriculum_regulation_id').isInt().withMessage('Curriculum regulation ID is required'),
  body('submitted_by').isInt().withMessage('Submitted by is required')
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

    const { curriculum_regulation_id, submitted_by, comments } = req.body;

    // Check if already submitted for approval
    const existingApproval = await query(`
      SELECT id, status, submitted_at 
      FROM term_details_approval 
      WHERE curriculum_regulation_id = $1 AND is_active = true
      ORDER BY submitted_at DESC
      LIMIT 1
    `, [curriculum_regulation_id]);

    if (existingApproval.rows.length > 0) {
      const approval = existingApproval.rows[0];
      return res.status(400).json({
        success: false,
        message: `Term details have already been submitted for approval on ${new Date(approval.submitted_at).toLocaleDateString()}`,
        data: {
          status: approval.status,
          submitted_at: approval.submitted_at
        }
      });
    }

    const result = await query(`
      INSERT INTO term_details_approval 
      (curriculum_regulation_id, status, submitted_by, comments)
      VALUES ($1, 'Pending', $2, $3)
      RETURNING *
    `, [curriculum_regulation_id, submitted_by, comments || 'Term details submitted for approval']);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Term details submitted for approval successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error submitting for approval',
      error: error.message
    });
  }
});

// Get approval history for a curriculum
router.get('/approvals/:curriculumId', async (req, res) => {
  try {
    const { curriculumId } = req.params;
    
    const result = await query(`
      SELECT 
        ta.*,
        u1.first_name as submitted_by_name,
        u2.first_name as approved_by_name
      FROM term_details_approval ta
      LEFT JOIN users u1 ON ta.submitted_by = u1.id
      LEFT JOIN users u2 ON ta.approved_by = u2.id
      WHERE ta.curriculum_regulation_id = $1 AND ta.is_active = true
      ORDER BY ta.submitted_at DESC
    `, [curriculumId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error fetching approval history',
      error: error.message
    });
  }
});

// Approve term details
router.put('/approve/:approvalId', [
  body('approved_by').isInt().withMessage('Approved by is required')
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

    const { approvalId } = req.params;
    const { approved_by, comments } = req.body;

    const result = await query(`
      UPDATE term_details_approval 
      SET status = 'Approved', approved_by = $1, approved_at = NOW(), comments = $2
      WHERE id = $3
      RETURNING *
    `, [approved_by, comments, approvalId]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Term details approved successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error approving term details',
      error: error.message
    });
  }
});

// Reject term details
router.put('/reject/:approvalId', [
  body('approved_by').isInt().withMessage('Approved by is required')
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

    const { approvalId } = req.params;
    const { approved_by, comments } = req.body;

    const result = await query(`
      UPDATE term_details_approval 
      SET status = 'Rejected', approved_by = $1, approved_at = NOW(), comments = $2
      WHERE id = $3
      RETURNING *
    `, [approved_by, comments, approvalId]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Term details rejected successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error rejecting term details',
      error: error.message
    });
  }
});

module.exports = router;
