const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Validation rules
const bosMemberValidation = [
  body('faculty_type').notEmpty().withMessage('Faculty type is required'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('designation').notEmpty().withMessage('Designation is required'),
  body('bos_department_id').isInt().withMessage('BOS Department ID must be a valid integer'),
  body('experience_years').isInt({ min: 0 }).withMessage('Experience years must be a non-negative integer')
];

// GET /api/config/bos-members - Get BOS members with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        bm.id,
        bm.user_id,
        bm.department_id as bos_department_id,
        bm.designation,
        bm.is_chairman,
        bm.is_secretary,
        bm.term_start_date,
        bm.term_end_date,
        bm.created_at,
        bm.updated_at,
        u.faculty_type_id,
        u.title,
        u.first_name,
        u.last_name,
        u.email,
        u.contact_number as phone,
        u.aadhar_number,
        u.highest_qualification,
        u.experience_years,
        u.is_active,
        d.department_name,
        ft.type_name as faculty_type
      FROM bos_members bm
      LEFT JOIN users u ON bm.user_id = u.id
      LEFT JOIN departments d ON bm.department_id = d.id
      LEFT JOIN faculty_types ft ON u.faculty_type_id = ft.id
    `;
    let countQuery = `
      SELECT COUNT(*) 
      FROM bos_members bm
      LEFT JOIN users u ON bm.user_id = u.id
      LEFT JOIN departments d ON bm.department_id = d.id
    `;
    const params = [];

    if (search) {
      query += ' WHERE u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR u.email ILIKE $1 OR d.department_name ILIKE $1 OR u.department_designation ILIKE $1';
      countQuery += ' WHERE u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR u.email ILIKE $1 OR d.department_name ILIKE $1 OR u.department_designation ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY bm.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
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
      }
    });
  } catch (error) {
    console.error('Error fetching BOS members:', error);
    res.status(500).json({ message: 'Error fetching BOS members', error: error.message });
  }
});

// GET /api/config/bos-members/:id - Get BOS member by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        bm.id,
        bm.user_id,
        bm.department_id as bos_department_id,
        bm.designation,
        bm.is_chairman,
        bm.is_secretary,
        bm.term_start_date,
        bm.term_end_date,
        bm.created_at,
        bm.updated_at,
        u.faculty_type_id,
        u.title,
        u.first_name,
        u.last_name,
        u.email,
        u.contact_number as phone,
        u.aadhar_number,
        u.highest_qualification,
        u.experience_years,
        u.is_active,
        d.department_name,
        ft.type_name as faculty_type
      FROM bos_members bm
      LEFT JOIN users u ON bm.user_id = u.id
      LEFT JOIN departments d ON bm.department_id = d.id
      LEFT JOIN faculty_types ft ON u.faculty_type_id = ft.id
      WHERE bm.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'BOS member not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching BOS member:', error);
    res.status(500).json({ message: 'Error fetching BOS member', error: error.message });
  }
});

// POST /api/config/bos-members - Create new BOS member
router.post('/', bosMemberValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      faculty_type,
      title,
      first_name,
      last_name,
      email,
      contact_number,
      aadhar_number,
      highest_qualification,
      experience_years,
      power,
      designation,
      bos_department_id,
      is_active
    } = req.body;

    // Check if email already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Get faculty_type_id from faculty_type name
    const facultyTypeResult = await db.query('SELECT id FROM faculty_types WHERE type_name = $1', [faculty_type]);
    if (facultyTypeResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid faculty type' });
    }
    const facultyTypeId = facultyTypeResult.rows[0].id;

    // First create a user record for the BOS member
    const userResult = await db.query(
      `INSERT INTO users 
       (faculty_type_id, department_id, aadhar_number, title, first_name, last_name, 
        email, contact_number, department_designation, user_group, highest_qualification, 
        experience_years, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING id`,
      [
        facultyTypeId,
        bos_department_id,
        aadhar_number || null,
        title || null,
        first_name,
        last_name,
        email,
        contact_number || null,
        designation,
        faculty_type,
        highest_qualification || null,
        experience_years || 0,
        is_active !== undefined ? is_active : true
      ]
    );

    const userId = userResult.rows[0].id;

    // Then create the BOS member record
    const result = await db.query(
      `INSERT INTO bos_members 
       (user_id, department_id, designation, 
        is_chairman, is_secretary, term_start_date, term_end_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        userId,
        bos_department_id,
        designation,
        false, // is_chairman
        false, // is_secretary
        null, // term_start_date
        null  // term_end_date
      ]
    );

    res.status(201).json({ 
      data: result.rows[0], 
      message: 'BOS member created successfully' 
    });
  } catch (error) {
    console.error('Error creating BOS member:', error);
    res.status(500).json({ message: 'Error creating BOS member', error: error.message });
  }
});

// PUT /api/config/bos-members/:id - Update BOS member
router.put('/:id', bosMemberValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      faculty_type,
      title,
      first_name,
      last_name,
      email,
      contact_number,
      aadhar_number,
      highest_qualification,
      experience_years,
      power,
      designation,
      bos_department_id,
      is_active
    } = req.body;

    // First get the user_id from the BOS member record
    const bosMember = await db.query('SELECT user_id FROM bos_members WHERE id = $1', [id]);
    if (bosMember.rows.length === 0) {
      return res.status(404).json({ message: 'BOS member not found' });
    }
    const userId = bosMember.rows[0].user_id;

    // Check if email already exists for a different user
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Get faculty_type_id from faculty_type name
    const facultyTypeResult = await db.query('SELECT id FROM faculty_types WHERE type_name = $1', [faculty_type]);
    if (facultyTypeResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid faculty type' });
    }
    const facultyTypeId = facultyTypeResult.rows[0].id;

    // Update the user record
    await db.query(
      `UPDATE users 
       SET faculty_type_id = $1, department_id = $2, aadhar_number = $3, title = $4, 
           first_name = $5, last_name = $6, email = $7, 
           contact_number = $8, department_designation = $9, user_group = $10, 
           highest_qualification = $11, experience_years = $12, is_active = $13, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $14`,
      [
        facultyTypeId,
        bos_department_id,
        aadhar_number || null,
        title || null,
        first_name,
        last_name,
        email,
        contact_number || null,
        designation,
        faculty_type,
        highest_qualification || null,
        experience_years || 0,
        is_active !== undefined ? is_active : true,
        userId
      ]
    );

    // Update the BOS member record
    const result = await db.query(
      `UPDATE bos_members 
       SET department_id = $1, designation = $2, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING *`,
      [
        bos_department_id,
        designation,
        id
      ]
    );

    res.json({ 
      data: result.rows[0], 
      message: 'BOS member updated successfully' 
    });
  } catch (error) {
    console.error('Error updating BOS member:', error);
    res.status(500).json({ message: 'Error updating BOS member', error: error.message });
  }
});

// DELETE /api/config/bos-members/:id - Delete BOS member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the user_id from the BOS member record
    const bosMember = await db.query('SELECT user_id FROM bos_members WHERE id = $1', [id]);
    if (bosMember.rows.length === 0) {
      return res.status(404).json({ message: 'BOS member not found' });
    }
    const userId = bosMember.rows[0].user_id;

    // Delete the BOS member record first (due to foreign key constraints)
    await db.query('DELETE FROM bos_members WHERE id = $1', [id]);
    
    // Then delete the associated user record
    await db.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ message: 'BOS member deleted successfully' });
  } catch (error) {
    console.error('Error deleting BOS member:', error);
    res.status(500).json({ message: 'Error deleting BOS member', error: error.message });
  }
});

module.exports = router;