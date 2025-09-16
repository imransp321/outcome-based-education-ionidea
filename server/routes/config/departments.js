const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');
const { cache, cacheMiddleware } = require('../../config/redis');

const router = express.Router();

// Validation rules
const departmentValidation = [
  body('department_name').notEmpty().withMessage('Department name is required'),
  body('short_name').notEmpty().withMessage('Short name is required'),
  body('chairman_name').optional().isLength({ max: 255 }).withMessage('Chairman name too long'),
  body('chairman_email').optional().isEmail().withMessage('Invalid email format'),
  body('chairman_phone').optional().isLength({ max: 20 }).withMessage('Phone number too long'),
  body('journal_publications').optional().isInt({ min: 0 }).withMessage('Journal publications must be a positive integer'),
  body('magazine_publications').optional().isInt({ min: 0 }).withMessage('Magazine publications must be a positive integer')
];

// GET /api/config/departments/all - Get all departments without pagination (with caching)
router.get('/all', async (req, res) => {
  try {
    const result = await db.query('SELECT id, department_name FROM departments ORDER BY department_name ASC');
    
    res.json({
      data: result.rows,
      message: 'All departments retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching all departments', error: error.message });
  }
});

// GET /api/config/departments - Get all departments
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM departments';
    let countQuery = 'SELECT COUNT(*) FROM departments';
    const params = [];
    
    if (search) {
      query += ' WHERE department_name ILIKE $1 OR short_name ILIKE $1';
      countQuery += ' WHERE department_name ILIKE $1 OR short_name ILIKE $1';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY department_name ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);
    
    const [departments, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    res.json({
      data: departments.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'Departments retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
});

// GET /api/config/departments/:id - Get department by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM departments WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.json({ data: result.rows[0], message: 'Department retrieved successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching department', error: error.message });
  }
});

// POST /api/config/departments - Create new department
router.post('/', departmentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      department_name,
      short_name,
      chairman_name,
      chairman_email,
      chairman_phone,
      journal_publications,
      magazine_publications,
      professional_body_collaborations,
      is_first_year_department
    } = req.body;

    const result = await db.query(
      `INSERT INTO departments 
       (department_name, short_name, chairman_name, chairman_email, chairman_phone, 
        journal_publications, magazine_publications, professional_body_collaborations, 
        is_first_year_department) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        department_name,
        short_name,
        chairman_name,
        chairman_email,
        chairman_phone,
        journal_publications || 0,
        magazine_publications || 0,
        professional_body_collaborations || [],
        is_first_year_department || false
      ]
    );

    res.status(201).json({ 
      data: result.rows[0], 
      message: 'Department created successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Department name or short name already exists' });
    } else {
      res.status(500).json({ message: 'Error creating department', error: error.message });
    }
  }
});

// PUT /api/config/departments/:id - Update department
router.put('/:id', departmentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      department_name,
      short_name,
      chairman_name,
      chairman_email,
      chairman_phone,
      journal_publications,
      magazine_publications,
      professional_body_collaborations,
      is_first_year_department
    } = req.body;

    const result = await db.query(
      `UPDATE departments 
       SET department_name = $1, short_name = $2, chairman_name = $3, 
           chairman_email = $4, chairman_phone = $5, journal_publications = $6, 
           magazine_publications = $7, professional_body_collaborations = $8, 
           is_first_year_department = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 
       RETURNING *`,
      [
        department_name,
        short_name,
        chairman_name,
        chairman_email,
        chairman_phone,
        journal_publications || 0,
        magazine_publications || 0,
        professional_body_collaborations || [],
        is_first_year_department || false,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ 
      data: result.rows[0], 
      message: 'Department updated successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Department name or short name already exists' });
    } else {
      res.status(500).json({ message: 'Error updating department', error: error.message });
    }
  }
});

// DELETE /api/config/departments/:id - Delete department
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if department has users
    const usersCheck = await db.query('SELECT COUNT(*) FROM users WHERE department_id = $1', [id]);
    if (parseInt(usersCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete department. It has associated users. Please reassign users first.' 
      });
    }

    const result = await db.query('DELETE FROM departments WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error deleting department', error: error.message });
  }
});

// GET /api/config/departments/stats - Get department statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_departments,
        COUNT(CASE WHEN is_first_year_department = true THEN 1 END) as first_year_departments,
        SUM(journal_publications) as total_journal_publications,
        SUM(magazine_publications) as total_magazine_publications
      FROM departments
    `);
    
    res.json({ 
      data: stats.rows[0], 
      message: 'Department statistics retrieved successfully' 
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching department statistics', error: error.message });
  }
});

// Vision/Mission endpoints

// Validation rules for vision/mission
const visionMissionValidation = [
  body('vision_statement').notEmpty().withMessage('Vision statement is required'),
  body('mission_statement').notEmpty().withMessage('Mission statement is required'),
  body('core_values').notEmpty().withMessage('Core values are required'),
  body('graduate_attributes').notEmpty().withMessage('Graduate attributes are required')
];

// GET /api/config/departments/:id/vision-mission - Get vision/mission for a department
router.get('/:id/vision-mission', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT 
        dvm.*,
        d.department_name
      FROM department_vision_mission dvm
      JOIN departments d ON dvm.department_id = d.id
      WHERE dvm.department_id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vision/Mission not found for this department' });
    }
    
    res.json({ 
      data: result.rows[0], 
      message: 'Vision/Mission retrieved successfully' 
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching vision/mission', error: error.message });
  }
});

// POST /api/config/departments/vision-mission - Create vision/mission
router.post('/vision-mission', visionMissionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { department_id, vision_statement, mission_statement, core_values, graduate_attributes } = req.body;

    // Check if department exists
    const deptCheck = await db.query('SELECT id FROM departments WHERE id = $1', [department_id]);
    if (deptCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if vision/mission already exists for this department
    const existingCheck = await db.query('SELECT id FROM department_vision_mission WHERE department_id = $1', [department_id]);
    if (existingCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Vision/Mission already exists for this department. Use PUT to update.' });
    }

    const result = await db.query(`
      INSERT INTO department_vision_mission 
      (department_id, vision_statement, mission_statement, core_values, graduate_attributes) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `, [department_id, vision_statement, mission_statement, core_values, graduate_attributes]);

    // Get department name
    const deptResult = await db.query('SELECT department_name FROM departments WHERE id = $1', [department_id]);
    const department_name = deptResult.rows[0]?.department_name || 'Unknown Department';

    res.status(201).json({ 
      data: {
        ...result.rows[0],
        department_name
      }, 
      message: 'Vision/Mission created successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Vision/Mission already exists for this department' });
    } else {
      res.status(500).json({ message: 'Error creating vision/mission', error: error.message });
    }
  }
});

// PUT /api/config/departments/vision-mission/:id - Update vision/mission
router.put('/vision-mission/:id', visionMissionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { vision_statement, mission_statement, core_values, graduate_attributes } = req.body;

    const result = await db.query(`
      UPDATE department_vision_mission 
      SET vision_statement = $1, mission_statement = $2, core_values = $3, 
          graduate_attributes = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 
      RETURNING *
    `, [vision_statement, mission_statement, core_values, graduate_attributes, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vision/Mission not found' });
    }

    // Get department name
    const deptResult = await db.query(`
      SELECT d.department_name 
      FROM departments d 
      JOIN department_vision_mission dvm ON d.id = dvm.department_id 
      WHERE dvm.id = $1
    `, [id]);
    const department_name = deptResult.rows[0]?.department_name || 'Unknown Department';

    res.json({ 
      data: {
        ...result.rows[0],
        department_name
      }, 
      message: 'Vision/Mission updated successfully' 
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error updating vision/mission', error: error.message });
  }
});

// DELETE /api/config/departments/vision-mission/:id - Delete vision/mission
router.delete('/vision-mission/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM department_vision_mission WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vision/Mission not found' });
    }

    res.json({ message: 'Vision/Mission deleted successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error deleting vision/mission', error: error.message });
  }
});

module.exports = router;

