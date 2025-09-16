const db = require('../config/database');

// Database optimization script for Phase 1
const optimizeDatabase = async () => {
  console.log('Starting database optimization...');
  
  try {
    // Create critical indexes for performance
    const indexes = [
      // User-related indexes
      {
        name: 'idx_users_email',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)'
      },
      {
        name: 'idx_users_department_id',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_department_id ON users(department_id)'
      },
      {
        name: 'idx_users_is_active',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_is_active ON users(is_active) WHERE is_active = true'
      },
      
      // Course-related indexes
      {
        name: 'idx_courses_curriculum_term',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_curriculum_term ON courses(curriculum_id, term_id)'
      },
      {
        name: 'idx_courses_program_id',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_program_id ON courses(program_id)'
      },
      {
        name: 'idx_courses_is_active',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_is_active ON courses(is_active) WHERE is_active = true'
      },
      
      // Course outcomes indexes
      {
        name: 'idx_course_outcomes_course',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_course_outcomes_course ON course_outcomes(course_id)'
      },
      {
        name: 'idx_course_outcomes_curriculum_term',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_course_outcomes_curriculum_term ON course_outcomes(curriculum_id, term_id)'
      },
      
      // Program outcomes indexes
      {
        name: 'idx_program_outcomes_program',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_program_outcomes_program ON program_outcomes(program_id)'
      },
      {
        name: 'idx_program_outcomes_is_active',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_program_outcomes_is_active ON program_outcomes(is_active) WHERE is_active = true'
      },
      
      // Department indexes
      {
        name: 'idx_departments_is_active',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_departments_is_active ON departments(is_active) WHERE is_active = true'
      },
      
      // BOS Members indexes
      {
        name: 'idx_bos_members_department',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bos_members_department ON bos_members(department_id)'
      },
      {
        name: 'idx_bos_members_user_id',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bos_members_user_id ON bos_members(user_id)'
      },
      
      // CO-PO Mapping indexes
      {
        name: 'idx_co_po_mapping_co_po',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_co_po_mapping_co_po ON co_po_mapping(co_id, po_id)'
      },
      {
        name: 'idx_co_po_mapping_course',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_co_po_mapping_course ON co_po_mapping(course_id)'
      },
      
      // Topics and TLOs indexes
      {
        name: 'idx_topics_course',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_topics_course ON topics(course_id)'
      },
      {
        name: 'idx_tlos_topic',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tlos_topic ON tlos(topic_id)'
      },
      
      // Timestamp indexes for audit trails
      {
        name: 'idx_users_created_at',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at)'
      },
      {
        name: 'idx_courses_created_at',
        query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_created_at ON courses(created_at)'
      }
    ];

    console.log(`Creating ${indexes.length} indexes...`);
    
    for (const index of indexes) {
      try {
        console.log(`Creating index: ${index.name}`);
        await db.query(index.query);
        console.log(`✅ Created index: ${index.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Index already exists: ${index.name}`);
        } else {
          console.error(`❌ Failed to create index ${index.name}:`, error.message);
        }
      }
    }

    // Analyze tables for better query planning
    console.log('Analyzing tables for query optimization...');
    const tables = [
      'users', 'departments', 'programs', 'courses', 'course_outcomes',
      'program_outcomes', 'bos_members', 'co_po_mapping', 'topics', 'tlos'
    ];

    for (const table of tables) {
      try {
        await db.query(`ANALYZE ${table}`);
        console.log(`✅ Analyzed table: ${table}`);
      } catch (error) {
        console.error(`❌ Failed to analyze table ${table}:`, error.message);
      }
    }

    // Update table statistics
    console.log('Updating table statistics...');
    await db.query('UPDATE pg_stat_user_tables SET n_tup_ins = 0, n_tup_upd = 0, n_tup_del = 0');
    
    console.log('✅ Database optimization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    throw error;
  }
};

// Run optimization if called directly
if (require.main === module) {
  optimizeDatabase()
    .then(() => {
      console.log('Database optimization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database optimization script failed:', error);
      process.exit(1);
    });
}

module.exports = { optimizeDatabase };
