const db = require('../config/database');

const migrateCurriculumRegulations = async () => {
  try {
    console.log('🚀 Migrating curriculum_regulations table...\n');
    
    // Check if program_owner_id column exists
    const columnCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'curriculum_regulations' 
      AND column_name = 'program_owner_id'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('📝 Adding program_owner_id column...');
      
      // Add the new program_owner_id column
      await db.query(`
        ALTER TABLE curriculum_regulations 
        ADD COLUMN program_owner_id INTEGER REFERENCES users(id)
      `);
      
      console.log('✅ program_owner_id column added successfully!');
      
      // Migrate existing data - try to match program_owner names with user names
      console.log('🔄 Migrating existing program_owner data...');
      
      const existingData = await db.query(`
        SELECT id, program_owner 
        FROM curriculum_regulations 
        WHERE program_owner IS NOT NULL AND program_owner != ''
      `);
      
      for (const row of existingData.rows) {
        // Try to find a user that matches the program_owner name
        const userMatch = await db.query(`
          SELECT id 
          FROM users 
          WHERE CONCAT(first_name, ' ', last_name) ILIKE $1 
          OR first_name ILIKE $1 
          OR last_name ILIKE $1
          LIMIT 1
        `, [`%${row.program_owner}%`]);
        
        if (userMatch.rows.length > 0) {
          await db.query(`
            UPDATE curriculum_regulations 
            SET program_owner_id = $1 
            WHERE id = $2
          `, [userMatch.rows[0].id, row.id]);
          
          console.log(`✅ Migrated: ${row.program_owner} -> User ID ${userMatch.rows[0].id}`);
        } else {
          console.log(`⚠️  Could not find user match for: ${row.program_owner}`);
        }
      }
      
      console.log('✅ Data migration completed!');
      
      // Make program_owner_id NOT NULL (optional - you can comment this out if you want to keep it nullable)
      // await db.query(`
      //   ALTER TABLE curriculum_regulations 
      //   ALTER COLUMN program_owner_id SET NOT NULL
      // `);
      
      console.log('✅ Migration completed successfully!');
    } else {
      console.log('✅ program_owner_id column already exists!');
    }
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateCurriculumRegulations()
    .then(() => {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateCurriculumRegulations;
