const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Validation rules
const courseTypeValidation = [
  body('curriculum_component').notEmpty().withMessage('Curriculum component is required'),
  body('course_type').notEmpty().withMessage('Course type is required')
];

// GET /api/config/course-types - Get course types with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM course_types';
    let countQuery = 'SELECT COUNT(*) FROM course_types';
    const params = [];

    if (search) {
      query += ' WHERE curriculum_component ILIKE $1 OR course_type ILIKE $1 OR description ILIKE $1';
      countQuery += ' WHERE curriculum_component ILIKE $1 OR course_type ILIKE $1 OR description ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY curriculum_component, course_type ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [courseTypes, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: courseTypes.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'Course types retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching course types', error: error.message });
  }
});

// GET /api/config/course-types/:id - Get course type by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM course_types WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course type not found' });
    }
    
    res.json({ data: result.rows[0], message: 'Course type retrieved successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching course type', error: error.message });
  }
});

// POST /api/config/course-types - Create new course type
router.post('/', courseTypeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      curriculum_component,
      course_type,
      is_open_elective,
      is_free_elective,
      description
    } = req.body;

    const result = await db.query(
      `INSERT INTO course_types 
       (curriculum_component, course_type, is_open_elective, is_free_elective, description) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [curriculum_component, course_type, is_open_elective || false, is_free_elective || false, description]
    );

    res.status(201).json({ 
      data: result.rows[0], 
      message: 'Course type created successfully' 
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error creating course type', error: error.message });
  }
});

// PUT /api/config/course-types/:id - Update course type
router.put('/:id', courseTypeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      curriculum_component,
      course_type,
      is_open_elective,
      is_free_elective,
      description
    } = req.body;

    const result = await db.query(
      `UPDATE course_types 
       SET curriculum_component = $1, course_type = $2, is_open_elective = $3, 
           is_free_elective = $4, description = $5, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 RETURNING *`,
      [curriculum_component, course_type, is_open_elective || false, is_free_elective || false, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course type not found' });
    }

    res.json({ 
      data: result.rows[0], 
      message: 'Course type updated successfully' 
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error updating course type', error: error.message });
  }
});

// DELETE /api/config/course-types/:id - Delete course type
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM course_types WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course type not found' });
    }

    res.json({ message: 'Course type deleted successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error deleting course type', error: error.message });
  }
});

module.exports = router;

