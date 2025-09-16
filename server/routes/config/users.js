const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Validation rules
const userValidation = [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('faculty_type_id').isInt().withMessage('Faculty type ID must be a valid integer'),
  body('department_id').isInt().withMessage('Department ID must be a valid integer'),
  body('aadhar_number').optional().custom((value) => {
    if (value && value.length !== 12) {
      throw new Error('Aadhar number must be exactly 12 digits');
    }
    return true;
  }),
  body('contact_number').optional().custom((value) => {
    if (value && value.length !== 10) {
      throw new Error('Contact number must be exactly 10 digits');
    }
    return true;
  })
];

// GET /api/config/users/all - Get all users without pagination
router.get('/all', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.employee_id, u.designation,
             ft.type_name as faculty_type_name, d.department_name, d.short_name as department_acronym
      FROM users u
      LEFT JOIN faculty_types ft ON u.faculty_type_id = ft.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.is_active = true
      ORDER BY u.first_name, u.last_name ASC
    `);
    
    res.json({
      data: result.rows,
      message: 'All users retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching all users', error: error.message });
  }
});

// GET /api/config/users - Get all users
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', department_id } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT u.*, ft.type_name as faculty_type_name, d.department_name
      FROM users u
      LEFT JOIN faculty_types ft ON u.faculty_type_id = ft.id
      LEFT JOIN departments d ON u.department_id = d.id
    `;
    let countQuery = 'SELECT COUNT(*) FROM users u';
    const params = [];
    let whereConditions = [];
    
    if (search) {
      whereConditions.push('(u.first_name ILIKE $' + (params.length + 1) + ' OR u.last_name ILIKE $' + (params.length + 1) + ' OR u.email ILIKE $' + (params.length + 1) + ')');
      params.push(`%${search}%`);
    }
    
    if (department_id) {
      whereConditions.push('u.department_id = $' + (params.length + 1));
      params.push(department_id);
    }
    
    if (whereConditions.length > 0) {
      const whereClause = ' WHERE ' + whereConditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }
    
    query += ' ORDER BY u.first_name ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);
    
    const [users, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    res.json({
      data: users.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// POST /api/config/users - Create new user
router.post('/', userValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      faculty_type_id,
      department_id,
      aadhar_number,
      title,
      first_name,
      last_name,
      email,
      contact_number,
      department_designation,
      user_group,
      highest_qualification,
      experience_years,
      is_active = true
    } = req.body;

    const result = await db.query(
      `INSERT INTO users 
       (faculty_type_id, department_id, aadhar_number, title, first_name, last_name, 
        email, contact_number, department_designation, user_group, highest_qualification, experience_years, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`,
      [
        faculty_type_id,
        department_id,
        aadhar_number || null,
        title || null,
        first_name,
        last_name,
        email,
        contact_number || null,
        department_designation || null,
        user_group || null,
        highest_qualification || null,
        experience_years || 0,
        is_active
      ]
    );

    res.status(201).json({ 
      data: result.rows[0], 
      message: 'User created successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Email or employee ID already exists' });
    } else {
      res.status(500).json({ message: 'Error creating user', error: error.message });
    }
  }
});

// PUT /api/config/users/:id - Update user
router.put('/:id', userValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      faculty_type_id,
      department_id,
      aadhar_number,
      title,
      first_name,
      last_name,
      email,
      contact_number,
      department_designation,
      user_group,
      highest_qualification,
      experience_years,
      is_active
    } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET faculty_type_id = $1, department_id = $2, aadhar_number = $3, title = $4,
           first_name = $5, last_name = $6, email = $7, contact_number = $8, 
           department_designation = $9, user_group = $10, highest_qualification = $11, 
           experience_years = $12, is_active = $13, updated_at = CURRENT_TIMESTAMP
       WHERE id = $14 
       RETURNING *`,
      [
        faculty_type_id,
        department_id,
        aadhar_number || null,
        title || null,
        first_name,
        last_name,
        email,
        contact_number || null,
        department_designation || null,
        user_group || null,
        highest_qualification || null,
        experience_years || 0,
        is_active !== undefined ? is_active : true,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      data: result.rows[0], 
      message: 'User updated successfully' 
    });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Email or employee ID already exists' });
    } else {
      res.status(500).json({ message: 'Error updating user', error: error.message });
    }
  }
});

// DELETE /api/config/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First check if user exists and get their status
    const userCheck = await db.query('SELECT id, is_active FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userCheck.rows[0];
    const isUserActive = user.is_active;

    console.log(`User ${id} status: is_active = ${isUserActive}`);

    // Only check for references if user is active
    if (isUserActive) {
      // Check for foreign key references before deletion (with error handling for missing tables)
      let hasReferences = false;
      let referenceDetails = [];
      
      try {
        // Check curriculum_regulations table if it exists
        try {
          const curriculumRefs = await db.query(`
            SELECT 'curriculum_regulations' as table_name, 'created_by' as column_name, COUNT(*) as count
            FROM curriculum_regulations WHERE created_by = $1
            UNION ALL
            SELECT 'curriculum_regulations' as table_name, 'approved_by' as column_name, COUNT(*) as count
            FROM curriculum_regulations WHERE approved_by = $1
          `, [id]);
          
          const curriculumCount = curriculumRefs.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
          if (curriculumCount > 0) {
            hasReferences = true;
            referenceDetails.push(...curriculumRefs.rows.filter(row => parseInt(row.count) > 0));
          }
        } catch (tableError) {
          // Table doesn't exist, skip this check
          console.log('curriculum_regulations table not found, skipping reference check');
        }

        // Check curriculum_approvals table if it exists
        try {
          const approvalRefs = await db.query(`
            SELECT 'curriculum_approvals' as table_name, 'submitted_by' as column_name, COUNT(*) as count
            FROM curriculum_approvals WHERE submitted_by = $1
            UNION ALL
            SELECT 'curriculum_approvals' as table_name, 'approved_by' as column_name, COUNT(*) as count
            FROM curriculum_approvals WHERE approved_by = $1
          `, [id]);
          
          const approvalCount = approvalRefs.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
          if (approvalCount > 0) {
            hasReferences = true;
            referenceDetails.push(...approvalRefs.rows.filter(row => parseInt(row.count) > 0));
          }
        } catch (tableError) {
          // Table doesn't exist, skip this check
          console.log('curriculum_approvals table not found, skipping reference check');
        }

        // Check course_outcomes table if it exists
        try {
          const courseRefs = await db.query(`
            SELECT 'course_outcomes' as table_name, 'faculty_id' as column_name, COUNT(*) as count
            FROM course_outcomes WHERE faculty_id = $1
          `, [id]);
          
          const courseCount = courseRefs.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
          if (courseCount > 0) {
            hasReferences = true;
            referenceDetails.push(...courseRefs.rows.filter(row => parseInt(row.count) > 0));
          }
        } catch (tableError) {
          // Table doesn't exist, skip this check
          console.log('course_outcomes table not found, skipping reference check');
        }
      } catch (error) {
        console.log('Error checking references:', error.message);
        // Continue with deletion attempt if reference checking fails
      }
      
      if (hasReferences) {
        return res.status(400).json({ 
          message: 'Cannot delete user. User is referenced in other records. Please remove references first or deactivate the user instead.',
          references: referenceDetails
        });
      }
    }

    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({ 
      data: result.rows[0], 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      detail: error.detail,
      constraint: error.constraint
    });
    
    if (error.code === '23503') { // Foreign key constraint violation
      res.status(400).json({ 
        message: 'Cannot delete user. User is referenced in other records. Please remove references first or deactivate the user instead.' 
      });
    } else {
      res.status(500).json({ 
        message: 'Error deleting user', 
        error: error.message,
        code: error.code,
        detail: error.detail
      });
    }
  }
});

// PATCH /api/config/users/:id/deactivate - Deactivate user instead of deleting
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Deactivating user ${id}`);

    const result = await db.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    console.log(`Deactivate result:`, result.rows[0]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      data: result.rows[0], 
      message: 'User deactivated successfully' 
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ message: 'Error deactivating user', error: error.message });
  }
});

module.exports = router;

