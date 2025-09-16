const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Validation rules
const facultyWorkloadValidation = [
  body('department_id').isInt({ min: 1 }).withMessage('Department ID must be a valid positive integer'),
  body('curriculum_regulation_id').isInt({ min: 1 }).withMessage('Curriculum regulation ID must be a valid positive integer'),
  body('program_type_id').isInt({ min: 1 }).withMessage('Program type ID must be a valid positive integer'),
  body('program_id').isInt({ min: 1 }).withMessage('Program ID must be a valid positive integer'),
  body('program_category').notEmpty().withMessage('Program category is required'),
  body('work_type').notEmpty().withMessage('Work type is required'),
  body('workload_distribution').notEmpty().withMessage('Workload distribution is required'),
  body('workload_percentage').isFloat({ min: 0, max: 100 }).withMessage('Workload percentage must be between 0 and 100'),
  body('workload_hours').optional().isInt({ min: 0 }).withMessage('Workload hours must be a non-negative integer')
];

// GET /api/config/faculty-workload - Get faculty workload with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        fw.*,
        d.department_name,
        cr.curriculum_batch,
        cr.from_year,
        cr.to_year,
        pt.program_name as program_type_name,
        p.title as program_name
      FROM faculty_workload fw
      LEFT JOIN departments d ON fw.department_id = d.id
      LEFT JOIN curriculum_regulations cr ON fw.curriculum_regulation_id = cr.id
      LEFT JOIN program_types pt ON fw.program_type_id = pt.id
      LEFT JOIN programs p ON fw.program_id = p.id
    `;
    let countQuery = 'SELECT COUNT(*) FROM faculty_workload fw';
    const params = [];

    if (search) {
      query += ' WHERE d.department_name ILIKE $1 OR p.title ILIKE $1 OR fw.work_type ILIKE $1 OR fw.workload_distribution ILIKE $1';
      countQuery += ' WHERE d.department_name ILIKE $1 OR p.title ILIKE $1 OR fw.work_type ILIKE $1 OR fw.workload_distribution ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY fw.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), offset);

    const [result, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, search ? [params[0]] : [])
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'Faculty workload retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching faculty workload:', error);
    res.status(500).json({ message: 'Error fetching faculty workload', error: error.message });
  }
});

// GET /api/config/faculty-workload/:id - Get faculty workload by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT 
        fw.*,
        d.department_name,
        cr.curriculum_batch,
        cr.from_year,
        cr.to_year,
        pt.program_name as program_type_name,
        p.title as program_name
      FROM faculty_workload fw
      LEFT JOIN departments d ON fw.department_id = d.id
      LEFT JOIN curriculum_regulations cr ON fw.curriculum_regulation_id = cr.id
      LEFT JOIN program_types pt ON fw.program_type_id = pt.id
      LEFT JOIN programs p ON fw.program_id = p.id
      WHERE fw.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty workload not found' });
    }
    
    res.json({ data: result.rows[0], message: 'Faculty workload retrieved successfully' });
  } catch (error) {
    console.error('Error fetching faculty workload:', error);
    res.status(500).json({ message: 'Error fetching faculty workload', error: error.message });
  }
});

// POST /api/config/faculty-workload - Create new faculty workload
router.post('/', facultyWorkloadValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      department_id,
      curriculum_regulation_id,
      program_type_id,
      program_id,
      program_category,
      work_type,
      workload_distribution,
      workload_percentage,
      workload_hours = 0
    } = req.body;

    const result = await db.query(`
      INSERT INTO faculty_workload 
      (department_id, curriculum_regulation_id, program_type_id, program_id, 
       program_category, work_type, workload_distribution, workload_percentage, workload_hours)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      department_id,
      curriculum_regulation_id,
      program_type_id,
      program_id,
      program_category,
      work_type,
      workload_distribution,
      workload_percentage,
      workload_hours
    ]);

    res.status(201).json({
      data: result.rows[0],
      message: 'Faculty workload created successfully'
    });
  } catch (error) {
    console.error('Error creating faculty workload:', error);
    res.status(500).json({ message: 'Error creating faculty workload', error: error.message });
  }
});

// PUT /api/config/faculty-workload/:id - Update faculty workload
router.put('/:id', facultyWorkloadValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const {
      department_id,
      curriculum_regulation_id,
      program_type_id,
      program_id,
      program_category,
      work_type,
      workload_distribution,
      workload_percentage,
      workload_hours = 0
    } = req.body;

    const result = await db.query(`
      UPDATE faculty_workload 
      SET department_id = $1, curriculum_regulation_id = $2, program_type_id = $3, 
          program_id = $4, program_category = $5, work_type = $6, 
          workload_distribution = $7, workload_percentage = $8, workload_hours = $9,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `, [
      department_id,
      curriculum_regulation_id,
      program_type_id,
      program_id,
      program_category,
      work_type,
      workload_distribution,
      workload_percentage,
      workload_hours,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty workload not found' });
    }

    res.json({
      data: result.rows[0],
      message: 'Faculty workload updated successfully'
    });
  } catch (error) {
    console.error('Error updating faculty workload:', error);
    res.status(500).json({ message: 'Error updating faculty workload', error: error.message });
  }
});

// DELETE /api/config/faculty-workload/:id - Delete faculty workload
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM faculty_workload WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty workload not found' });
    }
    
    res.json({ message: 'Faculty workload deleted successfully' });
  } catch (error) {
    console.error('Error deleting faculty workload:', error);
    res.status(500).json({ message: 'Error deleting faculty workload', error: error.message });
  }
});

module.exports = router;
