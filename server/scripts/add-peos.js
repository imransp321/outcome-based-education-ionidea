const db = require('../config/database');

const addPEOs = async () => {
  try {
    console.log('🚀 Adding PEOs table and sample data...\n');
    
    // Create the peos table
    await db.query(`
      CREATE TABLE IF NOT EXISTS peos (
        id SERIAL PRIMARY KEY,
        curriculum_regulation_id INTEGER REFERENCES curriculum_regulations(id) ON DELETE CASCADE,
        peo_number VARCHAR(10) NOT NULL,
        peo_title VARCHAR(255) NOT NULL,
        peo_description TEXT NOT NULL,
        peo_statement TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(curriculum_regulation_id, peo_number)
      )
    `);
    
    console.log('✅ PEOs table created successfully!');
    
    // Get existing curriculum regulations
    const curriculumRegulations = await db.query(`
      SELECT cr.id, cr.curriculum_batch, p.title as program_name, d.department_name
      FROM curriculum_regulations cr
      JOIN programs p ON cr.program_id = p.id
      JOIN departments d ON cr.department_id = d.id
      WHERE cr.is_active = true
      ORDER BY cr.curriculum_batch, p.title
    `);
    
    console.log('📋 Found curriculum regulations:', curriculumRegulations.rows.length);
    
    if (curriculumRegulations.rows.length === 0) {
      console.log('⚠️  No curriculum regulations found. Please add some curriculum regulations first.');
      return;
    }
    
    // Sample PEOs data for different curriculum regulations
    const samplePEOs = [
      {
        peo_number: 'PEO1',
        peo_title: 'Technical Competence',
        peo_description: 'Graduates will demonstrate technical competence in their chosen field',
        peo_statement: 'Graduates will apply engineering principles and technical knowledge to solve complex problems in their professional practice.'
      },
      {
        peo_number: 'PEO2',
        peo_title: 'Professional Development',
        peo_description: 'Graduates will engage in continuous professional development',
        peo_statement: 'Graduates will pursue lifelong learning and professional development to advance their careers and contribute to society.'
      },
      {
        peo_number: 'PEO3',
        peo_title: 'Leadership and Teamwork',
        peo_description: 'Graduates will demonstrate leadership and teamwork skills',
        peo_statement: 'Graduates will lead and work effectively in multidisciplinary teams to achieve common goals.'
      },
      {
        peo_number: 'PEO4',
        peo_title: 'Ethical Practice',
        peo_description: 'Graduates will practice engineering ethically and responsibly',
        peo_statement: 'Graduates will demonstrate ethical behavior and social responsibility in their professional practice.'
      },
      {
        peo_number: 'PEO5',
        peo_title: 'Innovation and Entrepreneurship',
        peo_description: 'Graduates will contribute to innovation and entrepreneurship',
        peo_statement: 'Graduates will apply innovative thinking and entrepreneurial skills to create value in their organizations.'
      }
    ];
    
    // Add PEOs for each curriculum regulation
    let totalPEOs = 0;
    for (const curriculum of curriculumRegulations.rows) {
      console.log(`\n📝 Adding PEOs for ${curriculum.curriculum_batch} - ${curriculum.program_name} (${curriculum.department_name})`);
      
      for (const peo of samplePEOs) {
        try {
          await db.query(`
            INSERT INTO peos (curriculum_regulation_id, peo_number, peo_title, peo_description, peo_statement)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (curriculum_regulation_id, peo_number) DO NOTHING
          `, [
            curriculum.id,
            peo.peo_number,
            peo.peo_title,
            peo.peo_description,
            peo.peo_statement
          ]);
          
          totalPEOs++;
          console.log(`  ✅ Added ${peo.peo_number}: ${peo.peo_title}`);
        } catch (error) {
          if (error.code !== '23505') { // Ignore unique constraint violations
            console.log(`  ⚠️  Error adding ${peo.peo_number}: ${error.message}`);
          }
        }
      }
    }
    
    console.log(`\n🎉 Successfully added ${totalPEOs} PEOs across ${curriculumRegulations.rows.length} curriculum regulations!`);
    
    // Show summary
    const summary = await db.query(`
      SELECT 
        cr.curriculum_batch,
        p.title as program_name,
        d.department_name,
        COUNT(pe.id) as peo_count
      FROM curriculum_regulations cr
      JOIN programs p ON cr.program_id = p.id
      JOIN departments d ON cr.department_id = d.id
      LEFT JOIN peos pe ON cr.id = pe.curriculum_regulation_id
      WHERE cr.is_active = true
      GROUP BY cr.id, cr.curriculum_batch, p.title, d.department_name
      ORDER BY cr.curriculum_batch, p.title
    `);
    
    console.log('\n📊 PEOs Summary:');
    console.log('================');
    summary.rows.forEach(row => {
      console.log(`${row.curriculum_batch} - ${row.program_name} (${row.department_name}): ${row.peo_count} PEOs`);
    });
    
  } catch (error) {
    console.error('❌ Error adding PEOs:', error);
    throw error;
  }
};

// Run the script if executed directly
if (require.main === module) {
  addPEOs()
    .then(() => {
      console.log('\n🎉 PEOs setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 PEOs setup failed:', error);
      process.exit(1);
    });
}

module.exports = addPEOs;

