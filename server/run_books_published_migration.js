const fs = require('fs');
const path = require('path');
const db = require('./config/database');

async function runBooksPublishedMigration() {
  try {
    console.log('🚀 Starting Books Published migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'create_books_published_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await db.query(migrationSQL);
    
    console.log('✅ Books Published migration completed successfully!');
    console.log('📋 Migration included:');
    console.log('   - Created books_published table');
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
runBooksPublishedMigration();
