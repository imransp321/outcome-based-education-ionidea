const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Use the same database configuration as the server
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'obe_system',
  user: process.env.DB_USER || 'obe_user',
  password: process.env.DB_PASSWORD || 'obe_password123',
});

async function runPatentMigration() {
  try {
    console.log('🔄 Running patent innovation migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'create_patent_innovation_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Patent Innovation migration completed successfully!');
    
    // Test the table by querying it
    const result = await pool.query('SELECT COUNT(*) FROM patent_innovation');
    console.log(`📊 Patent Innovation table has ${result.rows[0].count} records`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runPatentMigration();
