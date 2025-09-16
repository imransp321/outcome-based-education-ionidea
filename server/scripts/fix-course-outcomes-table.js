const { query } = require('../config/database');

async function fixCourseOutcomesTable() {
  try {
    console.log('Fixing course_outcomes table structure...');
    
    // First, let's drop all related tables and recreate them with the correct structure
    console.log('Dropping existing course outcomes related tables...');
    await query('DROP TABLE IF EXISTS course_outcome_delivery_methods_mapping CASCADE');
    await query('DROP TABLE IF EXISTS course_outcome_blooms_mapping CASCADE');
    await query('DROP TABLE IF EXISTS course_outcomes CASCADE');
    
    // Create the new course_outcomes table
    console.log('Creating new course_outcomes table...');
    await query(`
      CREATE TABLE course_outcomes (
        id SERIAL PRIMARY KEY,
        co_code VARCHAR(10) NOT NULL,
        course_outcome TEXT NOT NULL,
        curriculum_id INTEGER NOT NULL REFERENCES curriculum_regulations(id) ON DELETE CASCADE,
        term_id INTEGER NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        faculty_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(co_code, curriculum_id, term_id, course_id)
      )
    `);
    
    // Create course_outcome_blooms_mapping table
    console.log('Creating course_outcome_blooms_mapping table...');
    await query(`
      CREATE TABLE course_outcome_blooms_mapping (
        id SERIAL PRIMARY KEY,
        course_outcome_id INTEGER NOT NULL REFERENCES course_outcomes(id) ON DELETE CASCADE,
        blooms_level_id INTEGER NOT NULL REFERENCES blooms_levels(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(course_outcome_id, blooms_level_id)
      )
    `);
    
    // Create course_outcome_delivery_methods_mapping table
    console.log('Creating course_outcome_delivery_methods_mapping table...');
    await query(`
      CREATE TABLE course_outcome_delivery_methods_mapping (
        id SERIAL PRIMARY KEY,
        course_outcome_id INTEGER NOT NULL REFERENCES course_outcomes(id) ON DELETE CASCADE,
        delivery_method_id INTEGER NOT NULL REFERENCES delivery_methods(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(course_outcome_id, delivery_method_id)
      )
    `);
    
    // Create indexes for better performance
    console.log('Creating indexes...');
    await query('CREATE INDEX IF NOT EXISTS idx_course_outcomes_curriculum ON course_outcomes(curriculum_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_course_outcomes_term ON course_outcomes(term_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_course_outcomes_course ON course_outcomes(course_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_course_outcomes_faculty ON course_outcomes(faculty_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_course_outcome_blooms_mapping_co ON course_outcome_blooms_mapping(course_outcome_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_course_outcome_delivery_mapping_co ON course_outcome_delivery_methods_mapping(course_outcome_id)');
    
    console.log('Course outcomes table structure fixed successfully!');
    
  } catch (error) {
    console.error('Error fixing course outcomes table:', error);
    throw error;
  }
}

// Run the fix
if (require.main === module) {
  fixCourseOutcomesTable()
    .then(() => {
      console.log('Table fix completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Table fix failed:', error);
      process.exit(1);
    });
}

module.exports = fixCourseOutcomesTable;
