const fs = require('fs');
const path = require('path');
const db = require('./config/database');

async function runFacultyProfileMigration() {
  try {
    console.log('🚀 Starting Faculty Profile migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'create_faculty_profile_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await db.query(migrationSQL);
    
    console.log('✅ Faculty Profile migration completed successfully!');
    console.log('📋 Migration included:');
    console.log('   - Created faculty_profiles table');
    console.log('   - Created faculty_professional_details table');
    console.log('   - Created faculty_qualification_details table');
    console.log('   - Created faculty_phd_details table');
    console.log('   - Added performance indexes');
    console.log('   - Inserted sample data');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the migration
runFacultyProfileMigration();
