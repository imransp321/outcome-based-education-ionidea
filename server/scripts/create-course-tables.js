const { Pool } = require('pg');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function createCourseTables() {
  try {
    console.log('Creating course-related tables...');

    // Create terms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS terms (
        id SERIAL PRIMARY KEY,
        term_name VARCHAR(100) NOT NULL,
        term_number INTEGER NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create courses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        course_code VARCHAR(20) NOT NULL UNIQUE,
        course_title VARCHAR(200) NOT NULL,
        course_type VARCHAR(50) NOT NULL, -- Core, Elective-1, Elective-2, etc.
        lecture_hours DECIMAL(4,1) DEFAULT 0,
        tutorial_hours DECIMAL(4,1) DEFAULT 0,
        practical_hours DECIMAL(4,1) DEFAULT 0,
        self_study_hours DECIMAL(4,1) DEFAULT 0,
        credits DECIMAL(4,1) NOT NULL,
        total_marks INTEGER DEFAULT 100,
        course_owner_id INTEGER REFERENCES users(id),
        course_reviewer_id INTEGER REFERENCES users(id),
        delivery_mode VARCHAR(50) DEFAULT 'Theory', -- Theory, Practical, etc.
        curriculum_regulation_id INTEGER REFERENCES curriculum_regulations(id),
        term_id INTEGER REFERENCES terms(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create course_assignments table for faculty assignments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS course_assignments (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        section_division VARCHAR(10) NOT NULL, -- A, B, C, etc.
        instructor_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(course_id, section_division)
      )
    `);

    // Create course_outcomes table for CO creation status
    await pool.query(`
      CREATE TABLE IF NOT EXISTS course_outcomes (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'Not Initiated', -- Not Initiated, Initiated, Completed
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Course tables created successfully!');
  } catch (error) {
    console.error('Error creating course tables:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

createCourseTables().catch(console.error);




