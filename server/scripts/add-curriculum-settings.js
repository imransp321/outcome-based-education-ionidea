const db = require('../config/database');

async function createCurriculumSettingsTables() {
  try {
    console.log('Creating curriculum settings tables...');

    // Create course_domains table
    await db.query(`
      CREATE TABLE IF NOT EXISTS course_domains (
        id SERIAL PRIMARY KEY,
        curriculum_regulation_id INTEGER NOT NULL REFERENCES curriculum_regulations(id) ON DELETE CASCADE,
        domain_code VARCHAR(20) NOT NULL,
        domain_name VARCHAR(200) NOT NULL,
        domain_description TEXT,
        domain_type VARCHAR(50) DEFAULT 'Core',
        credits INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(curriculum_regulation_id, domain_code)
      )
    `);

    // Create curriculum_delivery_methods table
    await db.query(`
      CREATE TABLE IF NOT EXISTS curriculum_delivery_methods (
        id SERIAL PRIMARY KEY,
        curriculum_regulation_id INTEGER NOT NULL REFERENCES curriculum_regulations(id) ON DELETE CASCADE,
        delivery_code VARCHAR(20) NOT NULL,
        delivery_name VARCHAR(200) NOT NULL,
        delivery_description TEXT,
        delivery_type VARCHAR(50) DEFAULT 'Instructional',
        hours_per_week INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(curriculum_regulation_id, delivery_code)
      )
    `);

    // Create curriculum_assessment_methods table
    await db.query(`
      CREATE TABLE IF NOT EXISTS curriculum_assessment_methods (
        id SERIAL PRIMARY KEY,
        curriculum_regulation_id INTEGER NOT NULL REFERENCES curriculum_regulations(id) ON DELETE CASCADE,
        assessment_code VARCHAR(20) NOT NULL,
        assessment_name VARCHAR(200) NOT NULL,
        assessment_description TEXT,
        assessment_type VARCHAR(50) DEFAULT 'Formative',
        weight_percentage INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(curriculum_regulation_id, assessment_code)
      )
    `);

    // Create curriculum_settings_matrix table for mapping
    await db.query(`
      CREATE TABLE IF NOT EXISTS curriculum_settings_matrix (
        id SERIAL PRIMARY KEY,
        curriculum_regulation_id INTEGER NOT NULL REFERENCES curriculum_regulations(id) ON DELETE CASCADE,
        domain_id INTEGER NOT NULL REFERENCES course_domains(id) ON DELETE CASCADE,
        delivery_method_id INTEGER NOT NULL REFERENCES curriculum_delivery_methods(id) ON DELETE CASCADE,
        assessment_method_id INTEGER NOT NULL REFERENCES curriculum_assessment_methods(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(curriculum_regulation_id, domain_id, delivery_method_id, assessment_method_id)
      )
    `);

    console.log('Curriculum settings tables created successfully!');
  } catch (error) {
    console.error('Error creating curriculum settings tables:', error);
    throw error;
  }
}

async function addSampleData() {
  try {
    console.log('Adding sample curriculum settings data...');

    // Get curriculum regulation IDs
    const curriculumResult = await db.query('SELECT id FROM curriculum_regulations ORDER BY id LIMIT 8');
    const curriculumIds = curriculumResult.rows.map(row => row.id);

    // Sample course domains data
    const domainsData = [
      { code: 'MATH', name: 'Mathematics', description: 'Core mathematical concepts and applications', type: 'Core', credits: 12 },
      { code: 'PHYS', name: 'Physics', description: 'Fundamental physics principles and laboratory work', type: 'Core', credits: 8 },
      { code: 'CHEM', name: 'Chemistry', description: 'Chemical principles and laboratory techniques', type: 'Core', credits: 6 },
      { code: 'CS', name: 'Computer Science', description: 'Programming, algorithms, and software engineering', type: 'Core', credits: 20 },
      { code: 'EE', name: 'Electrical Engineering', description: 'Circuit theory, electronics, and power systems', type: 'Core', credits: 16 },
      { code: 'ME', name: 'Mechanical Engineering', description: 'Mechanics, thermodynamics, and design', type: 'Core', credits: 14 },
      { code: 'HUM', name: 'Humanities', description: 'Communication, ethics, and social sciences', type: 'General', credits: 6 },
      { code: 'MGMT', name: 'Management', description: 'Project management and business principles', type: 'General', credits: 4 }
    ];

    // Sample delivery methods data
    const deliveryMethodsData = [
      { code: 'LEC', name: 'Lecture', description: 'Traditional classroom lectures', type: 'Instructional', hours: 3 },
      { code: 'LAB', name: 'Laboratory', description: 'Hands-on practical sessions', type: 'Practical', hours: 2 },
      { code: 'TUT', name: 'Tutorial', description: 'Small group problem-solving sessions', type: 'Instructional', hours: 1 },
      { code: 'PROJ', name: 'Project Work', description: 'Individual or group projects', type: 'Practical', hours: 4 },
      { code: 'SEM', name: 'Seminar', description: 'Student presentations and discussions', type: 'Interactive', hours: 1 },
      { code: 'ONL', name: 'Online Learning', description: 'Digital learning platforms and resources', type: 'Digital', hours: 2 },
      { code: 'FLD', name: 'Field Work', description: 'Industrial visits and field studies', type: 'Practical', hours: 3 },
      { code: 'INT', name: 'Internship', description: 'Industry training and experience', type: 'Practical', hours: 8 }
    ];

    // Sample assessment methods data
    const assessmentMethodsData = [
      { code: 'MSE', name: 'Mid-Semester Exam', description: 'Comprehensive mid-term examination', type: 'Summative', weight: 30 },
      { code: 'ESE', name: 'End-Semester Exam', description: 'Final comprehensive examination', type: 'Summative', weight: 40 },
      { code: 'QUIZ', name: 'Quizzes', description: 'Regular short assessments', type: 'Formative', weight: 10 },
      { code: 'ASS', name: 'Assignments', description: 'Written assignments and reports', type: 'Formative', weight: 15 },
      { code: 'LAB', name: 'Laboratory Work', description: 'Practical laboratory assessments', type: 'Practical', weight: 20 },
      { code: 'PROJ', name: 'Project Evaluation', description: 'Project presentation and evaluation', type: 'Practical', weight: 25 },
      { code: 'PRES', name: 'Presentation', description: 'Oral presentations and viva', type: 'Interactive', weight: 10 },
      { code: 'PART', name: 'Participation', description: 'Class participation and attendance', type: 'Formative', weight: 5 }
    ];

    // Insert domains for each curriculum
    for (const curriculumId of curriculumIds) {
      for (const domain of domainsData) {
        await db.query(`
          INSERT INTO course_domains (curriculum_regulation_id, domain_code, domain_name, domain_description, domain_type, credits)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (curriculum_regulation_id, domain_code) DO NOTHING
        `, [curriculumId, domain.code, domain.name, domain.description, domain.type, domain.credits]);
      }
    }

    // Insert delivery methods for each curriculum
    for (const curriculumId of curriculumIds) {
      for (const method of deliveryMethodsData) {
        await db.query(`
          INSERT INTO curriculum_delivery_methods (curriculum_regulation_id, delivery_code, delivery_name, delivery_description, delivery_type, hours_per_week)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (curriculum_regulation_id, delivery_code) DO NOTHING
        `, [curriculumId, method.code, method.name, method.description, method.type, method.hours]);
      }
    }

    // Insert assessment methods for each curriculum
    for (const curriculumId of curriculumIds) {
      for (const method of assessmentMethodsData) {
        await db.query(`
          INSERT INTO curriculum_assessment_methods (curriculum_regulation_id, assessment_code, assessment_name, assessment_description, assessment_type, weight_percentage)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (curriculum_regulation_id, assessment_code) DO NOTHING
        `, [curriculumId, method.code, method.name, method.description, method.type, method.weight]);
      }
    }

    // Create sample matrix mappings (random combinations)
    for (const curriculumId of curriculumIds) {
      const domainsResult = await db.query('SELECT id FROM course_domains WHERE curriculum_regulation_id = $1', [curriculumId]);
      const deliveryResult = await db.query('SELECT id FROM curriculum_delivery_methods WHERE curriculum_regulation_id = $1', [curriculumId]);
      const assessmentResult = await db.query('SELECT id FROM curriculum_assessment_methods WHERE curriculum_regulation_id = $1', [curriculumId]);

      const domainIds = domainsResult.rows.map(row => row.id);
      const deliveryIds = deliveryResult.rows.map(row => row.id);
      const assessmentIds = assessmentResult.rows.map(row => row.id);

      // Create random mappings (about 30% of possible combinations)
      const totalCombinations = domainIds.length * deliveryIds.length * assessmentIds.length;
      const numMappings = Math.floor(totalCombinations * 0.3);

      for (let i = 0; i < numMappings; i++) {
        const randomDomain = domainIds[Math.floor(Math.random() * domainIds.length)];
        const randomDelivery = deliveryIds[Math.floor(Math.random() * deliveryIds.length)];
        const randomAssessment = assessmentIds[Math.floor(Math.random() * assessmentIds.length)];

        await db.query(`
          INSERT INTO curriculum_settings_matrix (curriculum_regulation_id, domain_id, delivery_method_id, assessment_method_id)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (curriculum_regulation_id, domain_id, delivery_method_id, assessment_method_id) DO NOTHING
        `, [curriculumId, randomDomain, randomDelivery, randomAssessment]);
      }
    }

    console.log('Sample curriculum settings data added successfully!');
  } catch (error) {
    console.error('Error adding sample data:', error);
    throw error;
  }
}

async function main() {
  try {
    await createCurriculumSettingsTables();
    await addSampleData();
    console.log('Curriculum settings setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createCurriculumSettingsTables, addSampleData };




