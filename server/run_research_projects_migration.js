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
    console.log('🔄 Running research projects migration...');
    const migrationPath = path.join(__dirname, 'migrations', 'create_research_projects_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    await pool.query(migrationSQL);
    console.log('✅ Research Projects migration completed successfully!');
    
    const result = await pool.query('SELECT COUNT(*) FROM research_projects');
    console.log(`📊 Research Projects table has ${result.rows[0].count} records`);

    // Fetch and log sample records
    const sampleRecords = await pool.query('SELECT project_title, role, funding_agency, status FROM research_projects LIMIT 3');
    console.log('📋 Sample records:');
    sampleRecords.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.project_title} - ${row.role} (${row.funding_agency})`);
    });

  } catch (error) {
    console.error('❌ Error running research projects migration:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
