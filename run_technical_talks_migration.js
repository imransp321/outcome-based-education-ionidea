const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  user: 'obe_user',
  host: 'localhost',
  database: 'obe_system',
  password: 'obe_password123',
  port: 5432,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting technical talks table migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'server', 'migrations', 'create_technical_talks_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Technical talks table migration completed successfully!');
    console.log('📊 Table created with sample data');
    
    // Verify the table was created
    const result = await client.query('SELECT COUNT(*) FROM technical_talks');
    console.log(`📈 Total records in technical_talks table: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
