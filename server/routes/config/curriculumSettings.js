const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

const router = express.Router();

// Get all curriculum regulations for dropdown
router.get('/curriculum-regulations', async (req, res) => {
  try {
    const query = `
      SELECT 
        cr.id,
        cr.curriculum_batch as batch_name,
        p.title as program_name,
        cr.from_year,
        cr.to_year,
        cr.is_active,
        p.title as program_title,
        d.department_name
      FROM curriculum_regulations cr
      LEFT JOIN programs p ON cr.program_id = p.id
      LEFT JOIN departments d ON cr.department_id = d.id
      WHERE cr.is_active = true
      ORDER BY cr.from_year DESC, cr.curriculum_batch
    `;
    
    const result = await db.query(query);
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

// Get curriculum settings for a specific curriculum
router.get('/settings/:curriculumId', async (req, res) => {
  try {
    const { curriculumId } = req.params;

    // Get domains
    const domainsQuery = `
      SELECT 
        id,
        domain_code,
        domain_name,
        domain_description,
        domain_type,
        credits,
        is_active
      FROM course_domains
      WHERE curriculum_regulation_id = $1 AND is_active = true
      ORDER BY domain_code
    `;

    // Get delivery methods
    const deliveryMethodsQuery = `
      SELECT 
        id,
        delivery_code,
        delivery_name,
        delivery_description,
        delivery_type,
        hours_per_week,
        is_active
      FROM curriculum_delivery_methods
      WHERE curriculum_regulation_id = $1 AND is_active = true
      ORDER BY delivery_code
    `;

    // Get assessment methods
    const assessmentMethodsQuery = `
      SELECT 
        id,
        assessment_code,
        assessment_name,
        assessment_description,
        assessment_type,
        weight_percentage,
        is_active
      FROM curriculum_assessment_methods
      WHERE curriculum_regulation_id = $1 AND is_active = true
      ORDER BY assessment_code
    `;

    const [domainsResult, deliveryResult, assessmentResult] = await Promise.all([
      db.query(domainsQuery, [curriculumId]),
      db.query(deliveryMethodsQuery, [curriculumId]),
      db.query(assessmentMethodsQuery, [curriculumId])
    ]);

    res.json({
      success: true,
      data: {
        domains: domainsResult.rows,
        deliveryMethods: deliveryResult.rows,
        assessmentMethods: assessmentResult.rows
      }
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch curriculum settings'
    });
  }
});

// Add new domain
router.post('/domains', [
  body('curriculum_regulation_id').isInt().withMessage('Curriculum regulation ID is required'),
  body('domain_code').notEmpty().withMessage('Domain code is required'),
  body('domain_name').notEmpty().withMessage('Domain name is required'),
  body('domain_type').optional().isIn(['Core', 'Elective', 'General', 'Professional']),
  body('credits').optional().isInt({ min: 0, max: 20 })
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
      domain_code,
      domain_name,
      domain_description,
      domain_type = 'Core',
      credits = 0
    } = req.body;

    const query = `
      INSERT INTO course_domains (curriculum_regulation_id, domain_code, domain_name, domain_description, domain_type, credits)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await db.query(query, [
      curriculum_regulation_id,
      domain_code,
      domain_name,
      domain_description,
      domain_type,
      credits
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Domain added successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to add domain'
    });
  }
});

// Add new delivery method
router.post('/delivery-methods', [
  body('curriculum_regulation_id').isInt().withMessage('Curriculum regulation ID is required'),
  body('delivery_code').notEmpty().withMessage('Delivery code is required'),
  body('delivery_name').notEmpty().withMessage('Delivery name is required'),
  body('delivery_type').optional().isIn(['Instructional', 'Practical', 'Interactive', 'Digital']),
  body('hours_per_week').optional().isInt({ min: 0, max: 40 })
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
      delivery_code,
      delivery_name,
      delivery_description,
      delivery_type = 'Instructional',
      hours_per_week = 0
    } = req.body;

    const query = `
      INSERT INTO curriculum_delivery_methods (curriculum_regulation_id, delivery_code, delivery_name, delivery_description, delivery_type, hours_per_week)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await db.query(query, [
      curriculum_regulation_id,
      delivery_code,
      delivery_name,
      delivery_description,
      delivery_type,
      hours_per_week
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Delivery method added successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to add delivery method'
    });
  }
});

// Add new assessment method
router.post('/assessment-methods', [
  body('curriculum_regulation_id').isInt().withMessage('Curriculum regulation ID is required'),
  body('assessment_code').notEmpty().withMessage('Assessment code is required'),
  body('assessment_name').notEmpty().withMessage('Assessment name is required'),
  body('assessment_type').optional().isIn(['Formative', 'Summative', 'Practical', 'Interactive']),
  body('weight_percentage').optional().isInt({ min: 0, max: 100 })
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
      assessment_code,
      assessment_name,
      assessment_description,
      assessment_type = 'Formative',
      weight_percentage = 0
    } = req.body;

    const query = `
      INSERT INTO curriculum_assessment_methods (curriculum_regulation_id, assessment_code, assessment_name, assessment_description, assessment_type, weight_percentage)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await db.query(query, [
      curriculum_regulation_id,
      assessment_code,
      assessment_name,
      assessment_description,
      assessment_type,
      weight_percentage
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Assessment method added successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to add assessment method'
    });
  }
});

// Update domain
router.put('/domains/:id', [
  body('domain_code').optional().notEmpty(),
  body('domain_name').optional().notEmpty(),
  body('domain_type').optional().isIn(['Core', 'Elective', 'General', 'Professional']),
  body('credits').optional().isInt({ min: 0, max: 20 })
], async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      domain_code,
      domain_name,
      domain_description,
      domain_type,
      credits
    } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (domain_code !== undefined) {
      updateFields.push(`domain_code = $${paramCount++}`);
      values.push(domain_code);
    }
    if (domain_name !== undefined) {
      updateFields.push(`domain_name = $${paramCount++}`);
      values.push(domain_name);
    }
    if (domain_description !== undefined) {
      updateFields.push(`domain_description = $${paramCount++}`);
      values.push(domain_description);
    }
    if (domain_type !== undefined) {
      updateFields.push(`domain_type = $${paramCount++}`);
      values.push(domain_type);
    }
    if (credits !== undefined) {
      updateFields.push(`credits = $${paramCount++}`);
      values.push(credits);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE course_domains 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Domain updated successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to update domain'
    });
  }
});

// Update delivery method
router.put('/delivery-methods/:id', [
  body('delivery_code').optional().notEmpty(),
  body('delivery_name').optional().notEmpty(),
  body('delivery_type').optional().isIn(['Instructional', 'Practical', 'Interactive', 'Digital']),
  body('hours_per_week').optional().isInt({ min: 0, max: 40 })
], async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      delivery_code,
      delivery_name,
      delivery_description,
      delivery_type,
      hours_per_week
    } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (delivery_code !== undefined) {
      updateFields.push(`delivery_code = $${paramCount++}`);
      values.push(delivery_code);
    }
    if (delivery_name !== undefined) {
      updateFields.push(`delivery_name = $${paramCount++}`);
      values.push(delivery_name);
    }
    if (delivery_description !== undefined) {
      updateFields.push(`delivery_description = $${paramCount++}`);
      values.push(delivery_description);
    }
    if (delivery_type !== undefined) {
      updateFields.push(`delivery_type = $${paramCount++}`);
      values.push(delivery_type);
    }
    if (hours_per_week !== undefined) {
      updateFields.push(`hours_per_week = $${paramCount++}`);
      values.push(hours_per_week);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE curriculum_delivery_methods 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Delivery method not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Delivery method updated successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery method'
    });
  }
});

// Update assessment method
router.put('/assessment-methods/:id', [
  body('assessment_code').optional().notEmpty(),
  body('assessment_name').optional().notEmpty(),
  body('assessment_type').optional().isIn(['Formative', 'Summative', 'Practical', 'Interactive']),
  body('weight_percentage').optional().isInt({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      assessment_code,
      assessment_name,
      assessment_description,
      assessment_type,
      weight_percentage
    } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (assessment_code !== undefined) {
      updateFields.push(`assessment_code = $${paramCount++}`);
      values.push(assessment_code);
    }
    if (assessment_name !== undefined) {
      updateFields.push(`assessment_name = $${paramCount++}`);
      values.push(assessment_name);
    }
    if (assessment_description !== undefined) {
      updateFields.push(`assessment_description = $${paramCount++}`);
      values.push(assessment_description);
    }
    if (assessment_type !== undefined) {
      updateFields.push(`assessment_type = $${paramCount++}`);
      values.push(assessment_type);
    }
    if (weight_percentage !== undefined) {
      updateFields.push(`weight_percentage = $${paramCount++}`);
      values.push(weight_percentage);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE curriculum_assessment_methods 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assessment method not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Assessment method updated successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to update assessment method'
    });
  }
});

// Delete domain
router.delete('/domains/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'UPDATE course_domains SET is_active = false WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    res.json({
      success: true,
      message: 'Domain deleted successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete domain'
    });
  }
});

// Delete delivery method
router.delete('/delivery-methods/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'UPDATE curriculum_delivery_methods SET is_active = false WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Delivery method not found'
      });
    }

    res.json({
      success: true,
      message: 'Delivery method deleted successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete delivery method'
    });
  }
});

// Delete assessment method
router.delete('/assessment-methods/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'UPDATE curriculum_assessment_methods SET is_active = false WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assessment method not found'
      });
    }

    res.json({
      success: true,
      message: 'Assessment method deleted successfully'
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete assessment method'
    });
  }
});

module.exports = router;
