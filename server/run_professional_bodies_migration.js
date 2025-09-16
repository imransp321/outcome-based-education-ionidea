const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'obe_system',
  user: process.env.DB_USER || 'obe_user',
  password: process.env.DB_PASSWORD || 'obe_password123',
});

async function runMigration() {
  try {
    console.log('🔄 Running professional bodies migration...');
    const migrationPath = path.join(__dirname, 'migrations', 'create_professional_bodies_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    await pool.query(migrationSQL);
    console.log('✅ Professional Bodies migration completed successfully!');
    
    // Verify the table was created and show record count
    const result = await pool.query('SELECT COUNT(*) FROM professional_bodies');
    console.log(`📊 Professional Bodies table has ${result.rows[0].count} records`);
    
    // Show sample data
    const sampleResult = await pool.query('SELECT organization_name, membership_type, membership_no FROM professional_bodies LIMIT 3');
    console.log('📋 Sample records:');
    sampleResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.organization_name} - ${row.membership_type} (${row.membership_no})`);
    });
    
  } catch (error) {
    console.error('❌ Error running professional bodies migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
