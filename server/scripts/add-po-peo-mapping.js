const db = require('../config/database');

const addPOPEOMapping = async () => {
  try {
    console.log('🚀 Adding PO to PEO Mapping table and sample data...\n');
    
    // Create the po_peo_mapping table
    await db.query(`
      CREATE TABLE IF NOT EXISTS po_peo_mapping (
        id SERIAL PRIMARY KEY,
        curriculum_regulation_id INTEGER REFERENCES curriculum_regulations(id) ON DELETE CASCADE,
        po_id INTEGER REFERENCES program_outcomes(id) ON DELETE CASCADE,
        peo_id INTEGER REFERENCES peos(id) ON DELETE CASCADE,
        mapping_strength VARCHAR(20) DEFAULT 'STRONG' CHECK (mapping_strength IN ('STRONG', 'MODERATE', 'WEAK')),
        mapping_justification TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(curriculum_regulation_id, po_id, peo_id)
      )
    `);
    
    console.log('✅ PO to PEO Mapping table created successfully!');
    
    // Get existing curriculum regulations with their POs and PEOs
    const curriculumData = await db.query(`
      SELECT 
        cr.id as curriculum_id,
        cr.curriculum_batch,
        p.title as program_name,
        d.department_name,
        po.id as po_id,
        po.po_reference,
        peo.id as peo_id,
        peo.peo_number
      FROM curriculum_regulations cr
      JOIN programs p ON cr.program_id = p.id
      JOIN departments d ON cr.department_id = d.id
      JOIN program_outcomes po ON cr.id = po.curriculum_regulation_id
      JOIN peos peo ON cr.id = peo.curriculum_regulation_id
      WHERE cr.is_active = true AND po.is_active = true AND peo.is_active = true
      ORDER BY cr.curriculum_batch, po.po_reference, peo.peo_number
    `);
    
    console.log('📋 Found curriculum data:', curriculumData.rows.length, 'PO-PEO combinations');
    
    if (curriculumData.rows.length === 0) {
      console.log('⚠️  No curriculum data found. Please add some curriculum regulations, POs, and PEOs first.');
      return;
    }
    
    // Group by curriculum
    const curriculumGroups = {};
    curriculumData.rows.forEach(row => {
      if (!curriculumGroups[row.curriculum_id]) {
        curriculumGroups[row.curriculum_id] = {
          curriculum_batch: row.curriculum_batch,
          program_name: row.program_name,
          department_name: row.department_name,
          pos: [],
          peos: []
        };
      }
      
      // Add PO if not already added
      if (!curriculumGroups[row.curriculum_id].pos.find(po => po.id === row.po_id)) {
        curriculumGroups[row.curriculum_id].pos.push({
          id: row.po_id,
          reference: row.po_reference
        });
      }
      
      // Add PEO if not already added
      if (!curriculumGroups[row.curriculum_id].peos.find(peo => peo.id === row.peo_id)) {
        curriculumGroups[row.curriculum_id].peos.push({
          id: row.peo_id,
          number: row.peo_number
        });
      }
    });
    
    // Create mapping data for each curriculum
    let totalMappings = 0;
    const mappingStrengths = ['STRONG', 'MODERATE', 'WEAK'];
    const justifications = [
      'Direct alignment with learning outcomes',
      'Indirect support through course content',
      'Partial coverage through assessment methods',
      'Strong correlation with program objectives',
      'Moderate connection through project work',
      'Weak link through general education'
    ];
    
    for (const [curriculumId, curriculum] of Object.entries(curriculumGroups)) {
      console.log(`\n📝 Creating mappings for ${curriculum.curriculum_batch} - ${curriculum.program_name}`);
      
      // Create strategic mappings (not all PO-PEO combinations)
      for (const po of curriculum.pos) {
        for (const peo of curriculum.peos) {
          // Create mappings for about 60% of combinations
          if (Math.random() < 0.6) {
            const mappingStrength = mappingStrengths[Math.floor(Math.random() * mappingStrengths.length)];
            const justification = justifications[Math.floor(Math.random() * justifications.length)];
            
            try {
              await db.query(`
                INSERT INTO po_peo_mapping (curriculum_regulation_id, po_id, peo_id, mapping_strength, mapping_justification)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (curriculum_regulation_id, po_id, peo_id) DO NOTHING
              `, [
                parseInt(curriculumId),
                po.id,
                peo.id,
                mappingStrength,
                justification
              ]);
              
              totalMappings++;
              console.log(`  ✅ Mapped ${po.reference} → PEO${peo.number} (${mappingStrength})`);
            } catch (error) {
              if (error.code !== '23505') { // Ignore unique constraint violations
                console.log(`  ⚠️  Error mapping ${po.reference} → PEO${peo.number}: ${error.message}`);
              }
            }
          }
        }
      }
    }
    
    console.log(`\n🎉 Successfully created ${totalMappings} PO to PEO mappings across ${Object.keys(curriculumGroups).length} curriculum regulations!`);
    
    // Show summary
    const summary = await db.query(`
      SELECT 
        cr.curriculum_batch,
        p.title as program_name,
        d.department_name,
        COUNT(DISTINCT po.id) as po_count,
        COUNT(DISTINCT peo.id) as peo_count,
        COUNT(m.id) as mapping_count
      FROM curriculum_regulations cr
      JOIN programs p ON cr.program_id = p.id
      JOIN departments d ON cr.department_id = d.id
      LEFT JOIN program_outcomes po ON cr.id = po.curriculum_regulation_id AND po.is_active = true
      LEFT JOIN peos peo ON cr.id = peo.curriculum_regulation_id AND peo.is_active = true
      LEFT JOIN po_peo_mapping m ON cr.id = m.curriculum_regulation_id AND m.is_active = true
      WHERE cr.is_active = true
      GROUP BY cr.id, cr.curriculum_batch, p.title, d.department_name
      ORDER BY cr.curriculum_batch, p.title
    `);
    
    console.log('\n📊 PO to PEO Mapping Summary:');
    console.log('============================');
    summary.rows.forEach(row => {
      console.log(`${row.curriculum_batch} - ${row.program_name} (${row.department_name}): ${row.po_count} POs, ${row.peo_count} PEOs, ${row.mapping_count} mappings`);
    });
    
    // Show mapping strength distribution
    const strengthStats = await db.query(`
      SELECT 
        mapping_strength,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
      FROM po_peo_mapping 
      WHERE is_active = true
      GROUP BY mapping_strength
      ORDER BY mapping_strength
    `);
    
    console.log('\n📈 Mapping Strength Distribution:');
    console.log('==================================');
    strengthStats.rows.forEach(row => {
      console.log(`${row.mapping_strength}: ${row.count} mappings (${row.percentage}%)`);
    });
    
  } catch (error) {
    console.error('❌ Error adding PO to PEO Mapping:', error);
    throw error;
  }
};

// Run the script if executed directly
if (require.main === module) {
  addPOPEOMapping()
    .then(() => {
      console.log('\n🎉 PO to PEO Mapping setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 PO to PEO Mapping setup failed:', error);
      process.exit(1);
    });
}

module.exports = addPOPEOMapping;




