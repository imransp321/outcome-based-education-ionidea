const fs = require('fs');
const path = require('path');
const db = require('./config/database');

async function runBookChaptersMigration() {
  try {
    console.log('🚀 Starting Book Chapters migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'create_book_chapters_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await db.query(migrationSQL);
    
    console.log('✅ Book Chapters migration completed successfully!');
    console.log('📋 Migration included:');
    console.log('   - Created book_chapters table');
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
runBookChaptersMigration();
