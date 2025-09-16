const db = require('../config/database');

const addCurriculumRegulations = async () => {
  try {
    console.log('🚀 Adding curriculum regulations table and sample data...\n');
    
    // Create the curriculum_regulations table
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
    
    console.log('✅ Curriculum regulations table created successfully!');
    
    // Get existing programs and departments
    const programs = await db.query('SELECT id, title, acronym FROM programs LIMIT 5');
    const departments = await db.query('SELECT id, department_name, short_name FROM departments LIMIT 5');
    const users = await db.query('SELECT id, first_name, last_name FROM users LIMIT 3');
    
    console.log('📋 Found programs:', programs.rows.length);
    console.log('📋 Found departments:', departments.rows.length);
    console.log('📋 Found users:', users.rows.length);
    
    // Sample curriculum regulations data
    const sampleData = [
      {
        curriculum_batch: 'B.E in CSE 2018-2022',
        program_id: programs.rows[0]?.id || 1,
        department_id: departments.rows[0]?.id || 1,
        from_year: 2018,
        to_year: 2022,
        program_owner: 'Prof. G.H. Joshi',
        peo_creation_status: 'Created',
        curriculum_head_id: users.rows[0]?.id || null
      },
      {
        curriculum_batch: 'B.E in CSE 2019-2023',
        program_id: programs.rows[0]?.id || 1,
        department_id: departments.rows[0]?.id || 1,
        from_year: 2019,
        to_year: 2023,
        program_owner: 'Prof. K.R. Bradar',
        peo_creation_status: 'Pending',
        curriculum_head_id: users.rows[1]?.id || null
      },
      {
        curriculum_batch: 'B.E in CSE 2020-2024',
        program_id: programs.rows[0]?.id || 1,
        department_id: departments.rows[0]?.id || 1,
        from_year: 2020,
        to_year: 2024,
        program_owner: 'Prof. S.M. Patel',
        peo_creation_status: 'Created',
        curriculum_head_id: users.rows[2]?.id || null
      },
      {
        curriculum_batch: 'B.E in IT 2018-2022',
        program_id: programs.rows[1]?.id || 2,
        department_id: departments.rows[1]?.id || 2,
        from_year: 2018,
        to_year: 2022,
        program_owner: 'Prof. A.K. Sharma',
        peo_creation_status: 'Pending',
        curriculum_head_id: users.rows[0]?.id || null
      },
      {
        curriculum_batch: 'B.E in ECE 2019-2023',
        program_id: programs.rows[2]?.id || 3,
        department_id: departments.rows[2]?.id || 3,
        from_year: 2019,
        to_year: 2023,
        program_owner: 'Prof. R.K. Verma',
        peo_creation_status: 'Created',
        curriculum_head_id: users.rows[1]?.id || null
      },
      {
        curriculum_batch: 'B.E in ME 2020-2024',
        program_id: programs.rows[3]?.id || 4,
        department_id: departments.rows[3]?.id || 4,
        from_year: 2020,
        to_year: 2024,
        program_owner: 'Prof. M.L. Gupta',
        peo_creation_status: 'Pending',
        curriculum_head_id: users.rows[2]?.id || null
      },
      {
        curriculum_batch: 'B.E in CSE 2021-2025',
        program_id: programs.rows[0]?.id || 1,
        department_id: departments.rows[0]?.id || 1,
        from_year: 2021,
        to_year: 2025,
        program_owner: 'Prof. N.P. Singh',
        peo_creation_status: 'Created',
        curriculum_head_id: users.rows[0]?.id || null
      },
      {
        curriculum_batch: 'B.E in AI 2022-2026',
        program_id: programs.rows[4]?.id || 5,
        department_id: departments.rows[4]?.id || 5,
        from_year: 2022,
        to_year: 2026,
        program_owner: 'Prof. D.S. Kumar',
        peo_creation_status: 'Pending',
        curriculum_head_id: users.rows[1]?.id || null
      }
    ];
    
    // Insert sample data
    for (const data of sampleData) {
      try {
        await db.query(`
          INSERT INTO curriculum_regulations 
          (curriculum_batch, program_id, department_id, from_year, to_year, 
           program_owner, peo_creation_status, curriculum_head_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (curriculum_batch, program_id, department_id) DO UPDATE SET
          program_owner = EXCLUDED.program_owner,
          peo_creation_status = EXCLUDED.peo_creation_status,
          curriculum_head_id = EXCLUDED.curriculum_head_id,
          updated_at = CURRENT_TIMESTAMP
        `, [
          data.curriculum_batch,
          data.program_id,
          data.department_id,
          data.from_year,
          data.to_year,
          data.program_owner,
          data.peo_creation_status,
          data.curriculum_head_id
        ]);
        
        console.log(`✅ Added: ${data.curriculum_batch}`);
      } catch (error) {
        console.log(`⚠️  Skipped: ${data.curriculum_batch} (${error.message})`);
      }
    }
    
    // Verify the data was inserted
    const result = await db.query(`
      SELECT 
        cr.*,
        p.title as program_name,
        p.acronym as program_acronym,
        d.department_name,
        d.short_name as department_acronym,
        u.first_name || ' ' || u.last_name as curriculum_head_name
      FROM curriculum_regulations cr
      JOIN programs p ON cr.program_id = p.id
      JOIN departments d ON cr.department_id = d.id
      LEFT JOIN users u ON cr.curriculum_head_id = u.id
      ORDER BY cr.curriculum_batch
    `);
    
    console.log('\n📊 Sample data added successfully!');
    console.log('\n📋 Curriculum Regulations in database:');
    result.rows.forEach(row => {
      console.log(`\n🏛️ ${row.curriculum_batch}:`);
      console.log(`   Program: ${row.program_acronym} - ${row.program_name}`);
      console.log(`   Department: ${row.department_acronym}`);
      console.log(`   Years: ${row.from_year}-${row.to_year}`);
      console.log(`   Owner: ${row.program_owner}`);
      console.log(`   PEO Status: ${row.peo_creation_status}`);
      console.log(`   Head: ${row.curriculum_head_name || 'Not Assigned'}`);
    });
    
    console.log('\n🎉 Curriculum regulations setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error adding curriculum regulations:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  addCurriculumRegulations()
    .then(() => {
      console.log('\n✨ Curriculum regulations added successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed to add curriculum regulations:', error);
      process.exit(1);
    });
}

module.exports = { addCurriculumRegulations };
