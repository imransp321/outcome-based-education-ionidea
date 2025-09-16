const express = require('express');
const router = express.Router();
const { query, transaction } = require('../../config/database');

// Get all course outcomes with pagination and search
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', curriculum_id, term_id, course_id } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (curriculum_id) {
      paramCount++;
      whereClause += ` AND co.curriculum_id = $${paramCount}`;
      params.push(curriculum_id);
    }

    if (term_id) {
      paramCount++;
      whereClause += ` AND co.term_id = $${paramCount}`;
      params.push(term_id);
    }

    if (course_id) {
      paramCount++;
      whereClause += ` AND co.course_id = $${paramCount}`;
      params.push(course_id);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (co.co_code ILIKE $${paramCount} OR co.course_outcome ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM course_outcomes co
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].total);

    // Get course outcomes with related data
    const dataQuery = `
      SELECT 
        co.*,
        cr.curriculum_batch as batch_name,
        p.title as program_title,
        cr.from_year,
        cr.to_year,
        t.term_name,
        c.course_title as course_name,
        c.course_code,
        u.first_name,
        u.last_name,
        d.department_name,
        COALESCE(array_to_string(array_agg(DISTINCT bl.level_name) FILTER (WHERE bl.level_name IS NOT NULL), ', '), '') as blooms_levels,
        COALESCE(array_to_string(array_agg(DISTINCT dm.method_name) FILTER (WHERE dm.method_name IS NOT NULL), ', '), '') as delivery_methods
      FROM course_outcomes co
      LEFT JOIN curriculum_regulations cr ON co.curriculum_id = cr.id
      LEFT JOIN programs p ON cr.program_id = p.id
      LEFT JOIN terms t ON co.term_id = t.id
      LEFT JOIN courses c ON co.course_id = c.id
      LEFT JOIN users u ON co.faculty_id = u.id
      LEFT JOIN departments d ON cr.department_id = d.id
      LEFT JOIN course_outcome_blooms_mapping cobm ON co.id = cobm.course_outcome_id
      LEFT JOIN blooms_levels bl ON cobm.blooms_level_id = bl.id
      LEFT JOIN course_outcome_delivery_methods_mapping codm ON co.id = codm.course_outcome_id
      LEFT JOIN delivery_methods dm ON codm.delivery_method_id = dm.id
      ${whereClause}
      GROUP BY co.id, cr.curriculum_batch, p.title, cr.from_year, cr.to_year, 
               t.term_name, c.course_title, c.course_code, u.first_name, u.last_name, d.department_name
      ORDER BY co.co_code
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);
    const result = await query(dataQuery, params);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext,
        hasPrev,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    
    res.status(500).json({ success: false, message: 'Error fetching course outcomes' });
  }
});

// Get single course outcome by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const courseOutcomeQuery = `
      SELECT 
        co.*,
        cr.curriculum_batch as batch_name,
        p.title as program_title,
        cr.from_year,
        cr.to_year,
        t.term_name,
        c.course_title as course_name,
        u.first_name,
        u.last_name,
        d.department_name
      FROM course_outcomes co
      LEFT JOIN curriculum_regulations cr ON co.curriculum_id = cr.id
      LEFT JOIN programs p ON cr.program_id = p.id
      LEFT JOIN terms t ON co.term_id = t.id
      LEFT JOIN courses c ON co.course_id = c.id
      LEFT JOIN users u ON co.faculty_id = u.id
      LEFT JOIN departments d ON cr.department_id = d.id
      WHERE co.id = $1
    `;

    const courseOutcomeResult = await query(courseOutcomeQuery, [id]);
    
    if (courseOutcomeResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course outcome not found' });
    }

    const courseOutcome = courseOutcomeResult.rows[0];

    // Get Bloom's levels
    const bloomsQuery = `
      SELECT bl.id, bl.level_name, bl.action_words
      FROM course_outcome_blooms_mapping cobm
      JOIN blooms_levels bl ON cobm.blooms_level_id = bl.id
      WHERE cobm.course_outcome_id = $1
    `;
    const bloomsResult = await query(bloomsQuery, [id]);

    // Get delivery methods
    const deliveryMethodsQuery = `
      SELECT dm.id, dm.method_name
      FROM course_outcome_delivery_methods_mapping codm
      JOIN delivery_methods dm ON codm.delivery_method_id = dm.id
      WHERE codm.course_outcome_id = $1
    `;
    const deliveryMethodsResult = await query(deliveryMethodsQuery, [id]);

    res.json({
      success: true,
      data: {
        ...courseOutcome,
        blooms_level_ids: bloomsResult.rows.map(row => row.id),
        delivery_method_ids: deliveryMethodsResult.rows.map(row => row.id),
        blooms_levels: bloomsResult.rows,
        delivery_methods: deliveryMethodsResult.rows
      }
    });
  } catch (error) {
    
    res.status(500).json({ success: false, message: 'Error fetching course outcome' });
  }
});

// Create new course outcome
router.post('/', async (req, res) => {
  try {
    const { co_code, course_outcome, curriculum_id, term_id, course_id, faculty_id, blooms_level_ids = [], delivery_method_ids = [] } = req.body;

    if (!co_code || !course_outcome || !curriculum_id || !term_id || !course_id || !faculty_id) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const result = await transaction(async (client) => {
      // Insert course outcome
      const insertQuery = `
        INSERT INTO course_outcomes (co_code, course_outcome, curriculum_id, term_id, course_id, faculty_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const courseOutcomeResult = await client.query(insertQuery, [
        co_code, course_outcome, curriculum_id, term_id, course_id, faculty_id
      ]);

      const courseOutcomeId = courseOutcomeResult.rows[0].id;

      // Insert Bloom's level mappings
      if (blooms_level_ids.length > 0) {
        const bloomsValues = blooms_level_ids.map(levelId => `(${courseOutcomeId}, ${levelId})`).join(', ');
        const bloomsMappingQuery = `
          INSERT INTO course_outcome_blooms_mapping (course_outcome_id, blooms_level_id)
          VALUES ${bloomsValues}
        `;
        await client.query(bloomsMappingQuery);
      }

      // Insert delivery method mappings
      if (delivery_method_ids.length > 0) {
        const deliveryValues = delivery_method_ids.map(methodId => `(${courseOutcomeId}, ${methodId})`).join(', ');
        const deliveryMappingQuery = `
          INSERT INTO course_outcome_delivery_methods_mapping (course_outcome_id, delivery_method_id)
          VALUES ${deliveryValues}
        `;
        await client.query(deliveryMappingQuery);
      }

      return courseOutcomeResult.rows[0];
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ success: false, message: 'Course outcome with this code already exists for the selected curriculum, term, and course' });
    } else {
      res.status(500).json({ success: false, message: 'Error creating course outcome' });
    }
  }
});

// Update course outcome
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { co_code, course_outcome, blooms_level_ids = [], delivery_method_ids = [] } = req.body;

    if (!co_code || !course_outcome) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const result = await transaction(async (client) => {
      // Update course outcome
      const updateQuery = `
        UPDATE course_outcomes 
        SET co_code = $1, course_outcome = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;
      const courseOutcomeResult = await client.query(updateQuery, [co_code, course_outcome, id]);

      if (courseOutcomeResult.rows.length === 0) {
        throw new Error('Course outcome not found');
      }

      // Delete existing mappings
      await client.query('DELETE FROM course_outcome_blooms_mapping WHERE course_outcome_id = $1', [id]);
      await client.query('DELETE FROM course_outcome_delivery_methods_mapping WHERE course_outcome_id = $1', [id]);

      // Insert new Bloom's level mappings
      if (blooms_level_ids.length > 0) {
        const bloomsValues = blooms_level_ids.map(levelId => `(${id}, ${levelId})`).join(', ');
        const bloomsMappingQuery = `
          INSERT INTO course_outcome_blooms_mapping (course_outcome_id, blooms_level_id)
          VALUES ${bloomsValues}
        `;
        await client.query(bloomsMappingQuery);
      }

      // Insert new delivery method mappings
      if (delivery_method_ids.length > 0) {
        const deliveryValues = delivery_method_ids.map(methodId => `(${id}, ${methodId})`).join(', ');
        const deliveryMappingQuery = `
          INSERT INTO course_outcome_delivery_methods_mapping (course_outcome_id, delivery_method_id)
          VALUES ${deliveryValues}
        `;
        await client.query(deliveryMappingQuery);
      }

      return courseOutcomeResult.rows[0];
    });

    res.json({ success: true, data: result });
  } catch (error) {
    
    if (error.message === 'Course outcome not found') {
      res.status(404).json({ success: false, message: 'Course outcome not found' });
    } else if (error.code === '23505') {
      res.status(400).json({ success: false, message: 'Course outcome with this code already exists for the selected curriculum, term, and course' });
    } else {
      res.status(500).json({ success: false, message: 'Error updating course outcome' });
    }
  }
});

// Delete course outcome
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleteQuery = 'DELETE FROM course_outcomes WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course outcome not found' });
    }

    res.json({ success: true, message: 'Course outcome deleted successfully' });
  } catch (error) {
    
    res.status(500).json({ success: false, message: 'Error deleting course outcome' });
  }
});

// Get lookup data for dropdowns
router.get('/lookup/data', async (req, res) => {
  try {
    const { curriculum_id, term_id } = req.query;

    let coursesQuery = `
      SELECT c.id, c.course_title as course_name, d.department_name
      FROM courses c
      LEFT JOIN curriculum_regulations cr ON c.curriculum_regulation_id = cr.id
      LEFT JOIN departments d ON cr.department_id = d.id
    `;
    const coursesParams = [];

    if (curriculum_id && term_id) {
      coursesQuery += ` WHERE c.curriculum_regulation_id = $1 AND c.term_id = $2`;
      coursesParams.push(curriculum_id, term_id);
    }

    const [coursesResult, bloomsResult, deliveryMethodsResult] = await Promise.all([
      query(coursesQuery, coursesParams),
      query('SELECT id, level_name, action_words FROM blooms_levels ORDER BY level_name'),
      query('SELECT id, method_name FROM delivery_methods ORDER BY method_name')
    ]);

    res.json({
      success: true,
      data: {
        courses: coursesResult.rows,
        blooms_levels: bloomsResult.rows,
        delivery_methods: deliveryMethodsResult.rows
      }
    });
  } catch (error) {
    
    res.status(500).json({ success: false, message: 'Error fetching lookup data' });
  }
});

module.exports = router;
