const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'outcome_based_education',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  try {
    console.log('Starting research publications migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'migrations', 'create_research_publications_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('Research publications migration completed successfully!');
  } catch (error) {
    console.error('Error running research publications migration:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
