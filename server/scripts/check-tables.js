const { query } = require('../config/database');

async function checkTables() {
  try {
    console.log('Checking existing tables...');
    
    // Check if course_outcomes table exists
    const tableCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'course_outcomes'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('course_outcomes table exists');
      
      // Check table structure
      const columns = await query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'course_outcomes'
        ORDER BY ordinal_position
      `);
      
      console.log('Table columns:');
      columns.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('course_outcomes table does not exist');
    }
    
    // Check other related tables
    const relatedTables = ['curriculum_regulations', 'terms', 'courses', 'users', 'blooms_levels', 'delivery_methods'];
    
    for (const tableName of relatedTables) {
      const check = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      `, [tableName]);
      
      console.log(`${tableName}: ${check.rows.length > 0 ? 'EXISTS' : 'NOT FOUND'}`);
    }
    
  } catch (error) {
    console.error('Error checking tables:', error);
    throw error;
  }
}

// Run the check
if (require.main === module) {
  checkTables()
    .then(() => {
      console.log('Table check completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Table check failed:', error);
      process.exit(1);
    });
}

module.exports = checkTables;
