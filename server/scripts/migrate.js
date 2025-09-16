const db = require('../config/database');
require('dotenv').config();

const createTables = async () => {
  try {
    console.log('Starting database migration...');

    // 1. Organisation Details
    await db.query(`
      CREATE TABLE IF NOT EXISTS organisation_details (
        id SERIAL PRIMARY KEY,
        society_name VARCHAR(255) NOT NULL,
        organisation_name VARCHAR(255) NOT NULL,
        description TEXT,
        vision TEXT,
        mandate TEXT,
        mission TEXT,
        logo_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Departments
    await db.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        department_name VARCHAR(255) NOT NULL UNIQUE,
        short_name VARCHAR(50) NOT NULL UNIQUE,
        chairman_name VARCHAR(255),
        chairman_email VARCHAR(255),
        chairman_phone VARCHAR(20),
        journal_publications INTEGER DEFAULT 0,
        magazine_publications INTEGER DEFAULT 0,
        professional_body_collaborations TEXT[],
        is_first_year_department BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Program Types
    await db.query(`
      CREATE TABLE IF NOT EXISTS program_types (
        id SERIAL PRIMARY KEY,
        program_name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Program Modes
    await db.query(`
      CREATE TABLE IF NOT EXISTS program_modes (
        id SERIAL PRIMARY KEY,
        mode_name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        is_hybrid BOOLEAN DEFAULT FALSE,
        is_online_sync BOOLEAN DEFAULT FALSE,
        is_online_async BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Programs
    await db.query(`
      CREATE TABLE IF NOT EXISTS programs (
        id SERIAL PRIMARY KEY,
        program_type_id INTEGER REFERENCES program_types(id) ON DELETE CASCADE,
        program_mode_id INTEGER REFERENCES program_modes(id) ON DELETE CASCADE,
        specializations TEXT[],
        acronym VARCHAR(50) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        program_min_duration INTEGER NOT NULL,
        program_max_duration INTEGER NOT NULL,
        duration_unit VARCHAR(20) NOT NULL DEFAULT 'years',
        term_min_duration INTEGER,
        term_max_duration INTEGER,
        total_semesters INTEGER NOT NULL,
        total_credits INTEGER NOT NULL,
        term_min_credits INTEGER,
        term_max_credits INTEGER,
        nba_sar_type VARCHAR(100) NOT NULL,
        course_types TEXT[],
        number_of_topics INTEGER,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Faculty Types
    await db.query(`
      CREATE TABLE IF NOT EXISTS faculty_types (
        id SERIAL PRIMARY KEY,
        type_name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Users (Faculty)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        faculty_type_id INTEGER REFERENCES faculty_types(id),
        department_id INTEGER REFERENCES departments(id),
        employee_id VARCHAR(50) UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        qualification TEXT[],
        experience_years INTEGER DEFAULT 0,
        designation VARCHAR(100),
        user_groups TEXT[],
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. BOS Members
    await db.query(`
      CREATE TABLE IF NOT EXISTS bos_members (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        department_id INTEGER REFERENCES departments(id),
        qualifications TEXT[],
        experience_years INTEGER DEFAULT 0,
        designation VARCHAR(100),
        is_chairman BOOLEAN DEFAULT FALSE,
        is_secretary BOOLEAN DEFAULT FALSE,
        term_start_date DATE,
        term_end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 9. Program Outcomes
    await db.query(`
      CREATE TABLE IF NOT EXISTS program_outcomes (
        id SERIAL PRIMARY KEY,
        po_type VARCHAR(50) NOT NULL,
        accreditation_type VARCHAR(100),
        po_code VARCHAR(20) NOT NULL UNIQUE,
        po_reference VARCHAR(50),
        category VARCHAR(50), -- Professional, Technical, Critical Thinking
        description TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 10. Course Types
    await db.query(`
      CREATE TABLE IF NOT EXISTS course_types (
        id SERIAL PRIMARY KEY,
        curriculum_component VARCHAR(100) NOT NULL,
        course_type VARCHAR(100) NOT NULL,
        is_open_elective BOOLEAN DEFAULT FALSE,
        is_free_elective BOOLEAN DEFAULT FALSE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 11. Delivery Methods
    await db.query(`
      CREATE TABLE IF NOT EXISTS delivery_methods (
        id SERIAL PRIMARY KEY,
        method_name VARCHAR(100) NOT NULL UNIQUE,
        guidelines TEXT,
        blooms_levels INTEGER[],
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 12. Lab Categories
    await db.query(`
      CREATE TABLE IF NOT EXISTS lab_categories (
        id SERIAL PRIMARY KEY,
        category_name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 13. Bloom's Domains
    await db.query(`
      CREATE TABLE IF NOT EXISTS blooms_domains (
        id SERIAL PRIMARY KEY,
        domain_name VARCHAR(100) NOT NULL UNIQUE,
        domain_acronym VARCHAR(10) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 14. Bloom's Levels
    await db.query(`
      CREATE TABLE IF NOT EXISTS blooms_levels (
        id SERIAL PRIMARY KEY,
        domain_id INTEGER REFERENCES blooms_domains(id) ON DELETE CASCADE,
        level_number INTEGER[] NOT NULL,
        level_name VARCHAR(100)[] NOT NULL,
        learning_characteristics TEXT,
        action_words TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 15. Map Level Weightage
    await db.query(`
      CREATE TABLE IF NOT EXISTS map_level_weightage (
        id SERIAL PRIMARY KEY,
        level_name VARCHAR(50) NOT NULL UNIQUE,
        acronym VARCHAR(10) NOT NULL UNIQUE,
        status VARCHAR(20) DEFAULT 'active',
        percentage_weightage DECIMAL(5,2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 16. Department Vision Mission
    await db.query(`
      CREATE TABLE IF NOT EXISTS department_vision_mission (
        id SERIAL PRIMARY KEY,
        department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
        vision_statement TEXT NOT NULL,
        mission_statement TEXT NOT NULL,
        core_values TEXT NOT NULL,
        graduate_attributes TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(department_id)
      )
    `);

    // 17. Curriculum Regulations
    await db.query(`
      CREATE TABLE IF NOT EXISTS curriculum_regulations (
        id SERIAL PRIMARY KEY,
        curriculum_batch VARCHAR(100) NOT NULL,
        program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
        department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
        from_year INTEGER NOT NULL,
        to_year INTEGER NOT NULL,
        program_owner VARCHAR(255) NOT NULL,
        peo_creation_status VARCHAR(20) DEFAULT 'Pending' CHECK (peo_creation_status IN ('Pending', 'Created')),
        curriculum_head_id INTEGER REFERENCES users(id),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(curriculum_batch, program_id, department_id)
      )
    `);

    // Insert default data
    await insertDefaultData();

    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

const insertDefaultData = async () => {
  try {
    // Insert default program types
    await db.query(`
      INSERT INTO program_types (program_name, description) VALUES
      ('Undergraduate (UG)', 'Bachelor degree programs'),
      ('Postgraduate (PG)', 'Master degree programs'),
      ('MBA', 'Master of Business Administration'),
      ('Engineering', 'Engineering degree programs')
      ON CONFLICT (program_name) DO NOTHING
    `);

    // Insert default program modes
    await db.query(`
      INSERT INTO program_modes (mode_name, description) VALUES
      ('Full-Time', 'Regular full-time programs'),
      ('Part-Time', 'Part-time evening/weekend programs'),
      ('Distance Learning', 'Distance education programs'),
      ('Hybrid', 'Combination of online and offline learning'),
      ('Online Synchronous', 'Real-time online learning'),
      ('Online Asynchronous', 'Self-paced online learning')
      ON CONFLICT (mode_name) DO NOTHING
    `);

    // Insert default faculty types
    await db.query(`
      INSERT INTO faculty_types (type_name, description) VALUES
      ('Professor', 'Full Professor'),
      ('Associate Professor', 'Associate Professor'),
      ('Assistant Professor', 'Assistant Professor'),
      ('Lecturer', 'Lecturer'),
      ('Visiting Faculty', 'Visiting Faculty'),
      ('Adjunct Faculty', 'Adjunct Faculty')
      ON CONFLICT (type_name) DO NOTHING
    `);

    // Insert default course types
    await db.query(`
      INSERT INTO course_types (curriculum_component, course_type, is_open_elective, is_free_elective) VALUES
      ('Core', 'Core Course', false, false),
      ('Elective', 'Elective Course', false, false),
      ('Open Elective', 'Open Elective', true, false),
      ('Free Elective', 'Free Elective', false, true),
      ('Lab', 'Laboratory Course', false, false),
      ('Project', 'Project Course', false, false),
      ('Internship', 'Internship', false, false)
      ON CONFLICT DO NOTHING
    `);

    // Insert default delivery methods
    await db.query(`
      INSERT INTO delivery_methods (method_name, guidelines, blooms_levels) VALUES
      ('Lecture', 'Traditional classroom lectures', ARRAY[1,2,3]),
      ('Tutorial', 'Small group problem-solving sessions', ARRAY[2,3,4]),
      ('Laboratory', 'Hands-on practical sessions', ARRAY[3,4,5,6]),
      ('Seminar', 'Student-led presentations and discussions', ARRAY[4,5,6]),
      ('Project Work', 'Individual or group projects', ARRAY[4,5,6]),
      ('Field Work', 'Real-world application and research', ARRAY[4,5,6])
      ON CONFLICT (method_name) DO NOTHING
    `);

    // Insert default lab categories
    await db.query(`
      INSERT INTO lab_categories (category_name, description) VALUES
      ('Computer Lab', 'Computer programming and software labs'),
      ('Physics Lab', 'Physics experiments and measurements'),
      ('Chemistry Lab', 'Chemistry experiments and analysis'),
      ('Electronics Lab', 'Electronics and circuit labs'),
      ('Mechanical Lab', 'Mechanical engineering labs'),
      ('Civil Lab', 'Civil engineering labs'),
      ('Language Lab', 'Language learning and communication labs')
      ON CONFLICT (category_name) DO NOTHING
    `);

    // Insert Bloom's domains
    await db.query(`
      INSERT INTO blooms_domains (domain_name, domain_acronym, description) VALUES
      ('Cognitive', 'COG', 'Mental skills and knowledge'),
      ('Affective', 'AFF', 'Growth in feelings or emotional areas'),
      ('Psychomotor', 'PSY', 'Manual or physical skills')
      ON CONFLICT (domain_acronym) DO NOTHING
    `);

    // Insert Bloom's levels for Cognitive domain
    const cogDomain = await db.query('SELECT id FROM blooms_domains WHERE domain_acronym = $1', ['COG']);
    if (cogDomain.rows.length > 0) {
      const domainId = cogDomain.rows[0].id;
      await db.query(`
        INSERT INTO blooms_levels (domain_id, level_number, level_name, learning_characteristics, action_words) VALUES
        ($1, ARRAY[1], ARRAY['Remember'], 'Recall or recognize information', ARRAY['define', 'identify', 'list', 'name', 'recall', 'recognize']),
        ($1, ARRAY[2], ARRAY['Understand'], 'Comprehend the meaning of information', ARRAY['explain', 'describe', 'summarize', 'interpret', 'classify', 'compare']),
        ($1, ARRAY[3], ARRAY['Apply'], 'Use information in new situations', ARRAY['apply', 'demonstrate', 'calculate', 'solve', 'use', 'implement']),
        ($1, ARRAY[4], ARRAY['Analyze'], 'Break down information into parts', ARRAY['analyze', 'compare', 'contrast', 'examine', 'investigate', 'categorize']),
        ($1, ARRAY[5], ARRAY['Evaluate'], 'Make judgments about information', ARRAY['evaluate', 'judge', 'critique', 'assess', 'justify', 'recommend']),
        ($1, ARRAY[6], ARRAY['Create'], 'Produce new or original work', ARRAY['create', 'design', 'develop', 'construct', 'formulate', 'propose']),
        ($1, ARRAY[4,5,6], ARRAY['Analyze', 'Evaluate', 'Create'], 'Higher-order thinking skills combining analysis, evaluation, and creation', ARRAY['analyze', 'evaluate', 'create', 'design', 'develop', 'construct', 'formulate', 'propose', 'assess', 'justify']),
        ($1, ARRAY[1,2,3], ARRAY['Remember', 'Understand', 'Apply'], 'Lower-order thinking skills for foundational learning', ARRAY['define', 'identify', 'list', 'name', 'recall', 'recognize', 'explain', 'describe', 'summarize', 'interpret', 'apply', 'demonstrate', 'calculate', 'solve']),
        ($1, ARRAY[2,3,4], ARRAY['Understand', 'Apply', 'Analyze'], 'Middle-order thinking skills for practical application', ARRAY['explain', 'describe', 'summarize', 'interpret', 'classify', 'compare', 'apply', 'demonstrate', 'calculate', 'solve', 'analyze', 'compare', 'contrast', 'examine'])
        ON CONFLICT DO NOTHING
      `, [domainId]);
    }

    // Insert default map level weightage
    await db.query(`
      INSERT INTO map_level_weightage (level_name, acronym, percentage_weightage, description) VALUES
      ('High', 'H', 40.00, 'High importance and weightage'),
      ('Medium', 'M', 35.00, 'Medium importance and weightage'),
      ('Low', 'L', 25.00, 'Low importance and weightage')
      ON CONFLICT (level_name) DO NOTHING
    `);

    console.log('Default data inserted successfully!');
  } catch (error) {
    console.error('Error inserting default data:', error);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createTables, insertDefaultData };

