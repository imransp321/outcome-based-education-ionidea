const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { body, validationResult } = require('express-validator');

// GET /api/config/topics - Get all topics with filters
router.get('/', async (req, res) => {
  try {
    const { curriculum_id, course_id, term_id, unit_id, page = 1, limit = 20 } = req.query;
    
    let query = `
      SELECT 
        t.id,
        t.topic_title,
        t.topic_content,
        t.topic_hours,
        t.delivery_methods,
        t.textbooks,
        t.assessment_questions,
        t.unit_id,
        c.course_code,
        c.course_title,
        cr.curriculum_batch,
        p.title as program_title,
        tm.term_name
      FROM topics t
      JOIN courses c ON t.course_id = c.id
      JOIN curriculum_regulations cr ON t.curriculum_id = cr.id
      LEFT JOIN programs p ON cr.program_id = p.id
      LEFT JOIN terms tm ON t.term_id = tm.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (curriculum_id) {
      paramCount++;
      query += ` AND t.curriculum_id = $${paramCount}`;
      params.push(curriculum_id);
    }
    
    if (course_id) {
      paramCount++;
      query += ` AND t.course_id = $${paramCount}`;
      params.push(course_id);
    }
    
    if (term_id) {
      paramCount++;
      query += ` AND t.term_id = $${paramCount}`;
      params.push(term_id);
    }
    
    if (unit_id) {
      paramCount++;
      query += ` AND t.unit_id = $${paramCount}`;
      params.push(unit_id);
    }
    
    // Add pagination
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` ORDER BY t.unit_id, t.id LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);
    
    const result = await db.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM topics t
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamCount = 0;
    
    if (curriculum_id) {
      countParamCount++;
      countQuery += ` AND t.curriculum_id = $${countParamCount}`;
      countParams.push(curriculum_id);
    }
    
    if (course_id) {
      countParamCount++;
      countQuery += ` AND t.course_id = $${countParamCount}`;
      countParams.push(course_id);
    }
    
    if (term_id) {
      countParamCount++;
      countQuery += ` AND t.term_id = $${countParamCount}`;
      countParams.push(term_id);
    }
    
    if (unit_id) {
      countParamCount++;
      countQuery += ` AND t.unit_id = $${countParamCount}`;
      countParams.push(unit_id);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error fetching topics',
      error: error.message
    });
  }
});

// GET /api/config/topics/:id - Get specific topic
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        t.*,
        c.course_code,
        c.course_title,
        cr.curriculum_batch,
        cr.program_title
      FROM topics t
      JOIN courses c ON t.course_id = c.id
      JOIN curriculum_regulations cr ON t.curriculum_id = cr.id
      WHERE t.id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error fetching topic',
      error: error.message
    });
  }
});

// POST /api/config/topics - Create new topic
router.post('/', [
  body('course_id').isInt().withMessage('Course ID must be an integer'),
  body('curriculum_id').isInt().withMessage('Curriculum ID must be an integer'),
  body('term_id').isInt().withMessage('Term ID must be an integer'),
  body('topic_title').notEmpty().withMessage('Topic title is required'),
  body('topic_hours').isInt({ min: 0 }).withMessage('Topic hours must be a non-negative integer'),
  body('unit_id').optional().isInt()
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
      course_id, 
      curriculum_id, 
      term_id, 
      unit_id, 
      topic_title, 
      topic_content, 
      topic_hours, 
      delivery_methods, 
      textbooks, 
      assessment_questions 
    } = req.body;
    
    const query = `
      INSERT INTO topics (
        course_id, curriculum_id, term_id, unit_id, topic_title, 
        topic_content, topic_hours, delivery_methods, textbooks, assessment_questions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const result = await db.query(query, [
      course_id, curriculum_id, term_id, unit_id, topic_title,
      topic_content, topic_hours, delivery_methods, textbooks, assessment_questions
    ]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error creating topic',
      error: error.message
    });
  }
});

// PUT /api/config/topics/:id - Update topic
router.put('/:id', [
  body('topic_title').optional().notEmpty().withMessage('Topic title cannot be empty'),
  body('topic_hours').optional().isInt({ min: 0 }).withMessage('Topic hours must be a non-negative integer'),
  body('unit_id').optional().isInt()
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
      unit_id, 
      topic_title, 
      topic_content, 
      topic_hours, 
      delivery_methods, 
      textbooks, 
      assessment_questions 
    } = req.body;
    
    const query = `
      UPDATE topics 
      SET unit_id = COALESCE($1, unit_id),
          topic_title = COALESCE($2, topic_title),
          topic_content = COALESCE($3, topic_content),
          topic_hours = COALESCE($4, topic_hours),
          delivery_methods = COALESCE($5, delivery_methods),
          textbooks = COALESCE($6, textbooks),
          assessment_questions = COALESCE($7, assessment_questions),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;
    
    const result = await db.query(query, [
      unit_id, topic_title, topic_content, topic_hours,
      delivery_methods, textbooks, assessment_questions, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error updating topic',
      error: error.message
    });
  }
});

// DELETE /api/config/topics/:id - Delete topic
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM topics WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error deleting topic',
      error: error.message
    });
  }
});

// GET /api/config/topics/:id/tlos - Get TLOs for a topic
router.get('/:id/tlos', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        tlo.id,
        tlo.tlo_code,
        tlo.tlo_description,
        tlo.assessment_criteria
      FROM topic_learning_outcomes tlo
      WHERE tlo.topic_id = $1
      ORDER BY tlo.tlo_code
    `;
    
    const result = await db.query(query, [id]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Error fetching TLOs',
      error: error.message
    });
  }
});

module.exports = router;
