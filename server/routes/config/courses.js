const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Get all curriculum regulations for dropdown
router.get('/curriculum-regulations', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        cr.id,
        cr.curriculum_batch as batch_name,
        p.title as program_name,
        d.department_name,
        cr.from_year,
        cr.to_year
      FROM curriculum_regulations cr
      LEFT JOIN programs p ON cr.program_id = p.id
      LEFT JOIN departments d ON cr.department_id = d.id
      ORDER BY cr.curriculum_batch DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch curriculum regulations'
    });
  }
});

// Get all terms for dropdown
router.get('/terms', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, term_name, term_number, description
      FROM terms
      WHERE is_active = true
      ORDER BY term_number
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch terms'
    });
  }
});

// Get all users for dropdown
router.get('/users', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, first_name, last_name, email, designation
      FROM users
      WHERE is_active = true
      ORDER BY first_name, last_name
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});


// Get courses with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      curriculum_id, 
      term_id, 
      search = '', 
      page = 1, 
      limit = 20 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE c.is_active = true';
    const queryParams = [];
    let paramCount = 0;
    
    if (curriculum_id) {
      paramCount++;
      whereClause += ` AND c.curriculum_regulation_id = $${paramCount}`;
      queryParams.push(curriculum_id);
    }
    
    if (term_id) {
      paramCount++;
      whereClause += ` AND c.term_id = $${paramCount}`;
      queryParams.push(term_id);
    }
    
    if (search) {
      paramCount++;
      whereClause += ` AND (c.course_code ILIKE $${paramCount} OR c.course_title ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }
    
    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM courses c
      ${whereClause}
    `, queryParams);
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get courses with user details
    const result = await db.query(`
      SELECT 
        c.id,
        c.course_code,
        c.course_title,
        c.course_type,
        c.lecture_hours,
        c.tutorial_hours,
        c.practical_hours,
        c.self_study_hours,
        c.credits,
        c.total_marks,
        c.delivery_mode,
        c.curriculum_regulation_id,
        c.term_id,
        CONCAT(u1.first_name, ' ', u1.last_name) as course_owner_name,
        CONCAT(u2.first_name, ' ', u2.last_name) as course_reviewer_name,
        'Pending' as co_status
      FROM courses c
      LEFT JOIN users u1 ON c.course_owner_id = u1.id
      LEFT JOIN users u2 ON c.course_reviewer_id = u2.id
      ${whereClause}
      ORDER BY c.course_code
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...queryParams, limit, offset]);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses'
    });
  }
});

// Get course assignments for a specific course
router.get('/:id/assignments', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT 
        ca.id,
        ca.section_division,
        ca.instructor_id,
        CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
        u.email as instructor_email
      FROM course_assignments ca
      LEFT JOIN users u ON ca.instructor_id = u.id
      WHERE ca.course_id = $1
      ORDER BY ca.section_division
    `, [id]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course assignments'
    });
  }
});

// Create course assignment
router.post('/:id/assignments', [
  body('section_division').notEmpty().withMessage('Section division is required'),
  body('instructor_id').isInt().withMessage('Instructor ID must be a valid integer')
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
    const { section_division, instructor_id } = req.body;
    
    const result = await db.query(`
      INSERT INTO course_assignments (course_id, section_division, instructor_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id, section_division, instructor_id]);
    
    res.json({
      success: true,
      message: 'Course assignment created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        message: 'Assignment for this section already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create course assignment'
      });
    }
  }
});

// Update course assignment
router.put('/assignments/:assignmentId', [
  body('section_division').notEmpty().withMessage('Section division is required'),
  body('instructor_id').isInt().withMessage('Instructor ID must be a valid integer')
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
    
    const { assignmentId } = req.params;
    const { section_division, instructor_id } = req.body;
    
    const result = await db.query(`
      UPDATE course_assignments 
      SET section_division = $1, instructor_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [section_division, instructor_id, assignmentId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course assignment not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Course assignment updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to update course assignment'
    });
  }
});

// Delete course assignment
router.delete('/assignments/:assignmentId', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const result = await db.query(`
      DELETE FROM course_assignments 
      WHERE id = $1
      RETURNING *
    `, [assignmentId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course assignment not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Course assignment deleted successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete course assignment'
    });
  }
});

// Create new course
router.post('/', [
  body('course_code').notEmpty().withMessage('Course code is required'),
  body('course_title').notEmpty().withMessage('Course title is required'),
  body('course_type').notEmpty().withMessage('Course type is required'),
  body('credits').isNumeric().withMessage('Credits must be a number'),
  body('curriculum_regulation_id').isInt().withMessage('Curriculum regulation ID must be a valid integer'),
  body('term_id').isInt().withMessage('Term ID must be a valid integer')
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
      course_code,
      course_title,
      course_type,
      lecture_hours = 0,
      tutorial_hours = 0,
      practical_hours = 0,
      self_study_hours = 0,
      credits,
      total_marks = 100,
      course_owner_id,
      course_reviewer_id,
      delivery_mode = 'Theory',
      curriculum_regulation_id,
      term_id
    } = req.body;
    
    const result = await db.query(`
      INSERT INTO courses (
        course_code, course_title, course_type, lecture_hours, tutorial_hours,
        practical_hours, self_study_hours, credits, total_marks, course_owner_id,
        course_reviewer_id, delivery_mode, curriculum_regulation_id, term_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      course_code, course_title, course_type, lecture_hours, tutorial_hours,
      practical_hours, self_study_hours, credits, total_marks, course_owner_id,
      course_reviewer_id, delivery_mode, curriculum_regulation_id, term_id
    ]);
    
    // Create course outcome entry
    await db.query(`
      INSERT INTO course_outcomes (course_id, status) VALUES ($1, 'Not Initiated')
    `, [result.rows[0].id]);
    
    res.json({
      success: true,
      message: 'Course created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        message: 'Course code already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create course'
      });
    }
  }
});

// Update course
router.put('/:id', [
  body('course_code').notEmpty().withMessage('Course code is required'),
  body('course_title').notEmpty().withMessage('Course title is required'),
  body('course_type').notEmpty().withMessage('Course type is required'),
  body('credits').isNumeric().withMessage('Credits must be a number')
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
      course_code,
      course_title,
      course_type,
      lecture_hours = 0,
      tutorial_hours = 0,
      practical_hours = 0,
      self_study_hours = 0,
      credits,
      total_marks = 100,
      course_owner_id,
      course_reviewer_id,
      delivery_mode = 'Theory'
    } = req.body;
    
    const result = await db.query(`
      UPDATE courses SET
        course_code = $1, course_title = $2, course_type = $3, lecture_hours = $4,
        tutorial_hours = $5, practical_hours = $6, self_study_hours = $7, credits = $8,
        total_marks = $9, course_owner_id = $10, course_reviewer_id = $11,
        delivery_mode = $12, updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `, [
      course_code, course_title, course_type, lecture_hours, tutorial_hours,
      practical_hours, self_study_hours, credits, total_marks, course_owner_id,
      course_reviewer_id, delivery_mode, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Course updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to update course'
    });
  }
});

// Delete course
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      UPDATE courses SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete course'
    });
  }
});

module.exports = router;
