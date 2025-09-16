const db = require('../config/database');

const addProgramOutcomes = async () => {
  try {
    console.log('🚀 Adding Program Outcomes table and sample data...\n');
    
    // Create the program_outcomes table
    await db.query(`
      CREATE TABLE IF NOT EXISTS program_outcomes (
        id SERIAL PRIMARY KEY,
        curriculum_regulation_id INTEGER REFERENCES curriculum_regulations(id) ON DELETE CASCADE,
        po_reference VARCHAR(20) NOT NULL,
        pso_flag BOOLEAN DEFAULT FALSE,
        po_type VARCHAR(50) NOT NULL,
        map_ga VARCHAR(50),
        po_statement TEXT NOT NULL,
        standard VARCHAR(20) DEFAULT 'NBA' CHECK (standard IN ('ABET', 'NBA', 'CUSTOM')),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(curriculum_regulation_id, po_reference)
      )
    `);
    
    console.log('✅ Program Outcomes table created successfully!');
    
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
    
    // NBA Standard Program Outcomes (most commonly used)
    const nbaPOs = [
      {
        po_reference: 'PO1',
        pso_flag: false,
        po_type: 'Engineering Knowledge',
        map_ga: 'GA1',
        po_statement: 'Engineering Knowledge: Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization to the solution of complex engineering problems.',
        standard: 'NBA'
      },
      {
        po_reference: 'PO2',
        pso_flag: false,
        po_type: 'Problem Analysis',
        map_ga: 'GA2',
        po_statement: 'Problem Analysis: Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences, and engineering sciences.',
        standard: 'NBA'
      },
      {
        po_reference: 'PO3',
        pso_flag: false,
        po_type: 'Design/Development of Solutions',
        map_ga: 'GA3',
        po_statement: 'Design/Development of Solutions: Design solutions for complex engineering problems and design system components or processes that meet the specified needs with appropriate consideration for the public health and safety, and the cultural, societal, and environmental considerations.',
        standard: 'NBA'
      },
      {
        po_reference: 'PO4',
        pso_flag: false,
        po_type: 'Conduct Investigations',
        map_ga: 'GA4',
        po_statement: 'Conduct Investigations of Complex Problems: Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of the information to provide valid conclusions.',
        standard: 'NBA'
      },
      {
        po_reference: 'PO5',
        pso_flag: false,
        po_type: 'Modern Tool Usage',
        map_ga: 'GA5',
        po_statement: 'Modern Tool Usage: Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling to complex engineering activities with an understanding of the limitations.',
        standard: 'NBA'
      },
      {
        po_reference: 'PO6',
        pso_flag: false,
        po_type: 'Engineer and Society',
        map_ga: 'GA6',
        po_statement: 'The Engineer and Society: Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal and cultural issues and the consequent responsibilities relevant to the professional engineering practice.',
        standard: 'NBA'
      },
      {
        po_reference: 'PO7',
        pso_flag: false,
        po_type: 'Environment and Sustainability',
        map_ga: 'GA7',
        po_statement: 'Environment and Sustainability: Understand the impact of the professional engineering solutions in societal and environmental contexts, and demonstrate the knowledge of, and need for sustainable development.',
        standard: 'NBA'
      },
      {
        po_reference: 'PO8',
        pso_flag: false,
        po_type: 'Ethics',
        map_ga: 'GA8',
        po_statement: 'Ethics: Apply ethical principles and commit to professional ethics and responsibilities and norms of the engineering practice.',
        standard: 'NBA'
      },
      {
        po_reference: 'PO9',
        pso_flag: false,
        po_type: 'Individual and Team Work',
        map_ga: 'GA9',
        po_statement: 'Individual and Team Work: Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings.',
        standard: 'NBA'
      },
      {
        po_reference: 'PO10',
        pso_flag: false,
        po_type: 'Communication',
        map_ga: 'GA10',
        po_statement: 'Communication: Communicate effectively on complex engineering activities with the engineering community and with society at large, such as, being able to comprehend and write effective reports and design documentation, make effective presentations, and give and receive clear instructions.',
        standard: 'NBA'
      },
      {
        po_reference: 'PO11',
        pso_flag: false,
        po_type: 'Project Management',
        map_ga: 'GA11',
        po_statement: 'Project Management and Finance: Demonstrate knowledge and understanding of the engineering and management principles and apply these to one\'s own work, as a member and leader in a team, to manage projects and in multidisciplinary environments.',
        standard: 'NBA'
      },
      {
        po_reference: 'PO12',
        pso_flag: false,
        po_type: 'Life-long Learning',
        map_ga: 'GA12',
        po_statement: 'Life-long Learning: Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change.',
        standard: 'NBA'
      }
    ];

    // Add some Program Specific Outcomes (PSOs)
    const psos = [
      {
        po_reference: 'PSO1',
        pso_flag: true,
        po_type: 'Software Development',
        map_ga: 'GA1',
        po_statement: 'Professional Skills: An ability to design, develop, test, and maintain software systems using modern programming languages, frameworks, and tools.',
        standard: 'NBA'
      },
      {
        po_reference: 'PSO2',
        pso_flag: true,
        po_type: 'System Design',
        map_ga: 'GA2',
        po_statement: 'System Design: An ability to analyze, design, and implement computer-based systems, processes, components, or programs to meet desired needs within realistic constraints.',
        standard: 'NBA'
      }
    ];
    
    // Combine all POs
    const allPOs = [...nbaPOs, ...psos];
    
    // Add POs for each curriculum regulation
    let totalPOs = 0;
    for (const curriculum of curriculumRegulations.rows) {
      console.log(`\n📝 Adding Program Outcomes for ${curriculum.curriculum_batch} - ${curriculum.program_name} (${curriculum.department_name})`);
      
      for (const po of allPOs) {
        try {
          await db.query(`
            INSERT INTO program_outcomes (curriculum_regulation_id, po_reference, pso_flag, po_type, map_ga, po_statement, standard)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (curriculum_regulation_id, po_reference) DO NOTHING
          `, [
            curriculum.id,
            po.po_reference,
            po.pso_flag,
            po.po_type,
            po.map_ga,
            po.po_statement,
            po.standard
          ]);
          
          totalPOs++;
          console.log(`  ✅ Added ${po.po_reference}: ${po.po_type}`);
        } catch (error) {
          if (error.code !== '23505') { // Ignore unique constraint violations
            console.log(`  ⚠️  Error adding ${po.po_reference}: ${error.message}`);
          }
        }
      }
    }
    
    console.log(`\n🎉 Successfully added ${totalPOs} Program Outcomes across ${curriculumRegulations.rows.length} curriculum regulations!`);
    
    // Show summary
    const summary = await db.query(`
      SELECT 
        cr.curriculum_batch,
        p.title as program_name,
        d.department_name,
        COUNT(po.id) as po_count,
        COUNT(CASE WHEN po.pso_flag = true THEN 1 END) as pso_count
      FROM curriculum_regulations cr
      JOIN programs p ON cr.program_id = p.id
      JOIN departments d ON cr.department_id = d.id
      LEFT JOIN program_outcomes po ON cr.id = po.curriculum_regulation_id
      WHERE cr.is_active = true
      GROUP BY cr.id, cr.curriculum_batch, p.title, d.department_name
      ORDER BY cr.curriculum_batch, p.title
    `);
    
    console.log('\n📊 Program Outcomes Summary:');
    console.log('============================');
    summary.rows.forEach(row => {
      console.log(`${row.curriculum_batch} - ${row.program_name} (${row.department_name}): ${row.po_count} POs (${row.pso_count} PSOs)`);
    });
    
  } catch (error) {
    console.error('❌ Error adding Program Outcomes:', error);
    throw error;
  }
};

// Run the script if executed directly
if (require.main === module) {
  addProgramOutcomes()
    .then(() => {
      console.log('\n🎉 Program Outcomes setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Program Outcomes setup failed:', error);
      process.exit(1);
    });
}

module.exports = addProgramOutcomes;

