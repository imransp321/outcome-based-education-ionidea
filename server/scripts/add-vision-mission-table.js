const db = require('../config/database');
require('dotenv').config();

const addVisionMissionTable = async () => {
  try {
    console.log('🚀 Adding Department Vision Mission table...\n');
    
    // Create the department_vision_mission table
    await db.query(`
      CREATE TABLE IF NOT EXISTS department_vision_mission (
        id SERIAL PRIMARY KEY,
        department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
        vision_statement TEXT NOT NULL,
        mission_statement TEXT NOT NULL,
        core_values TEXT NOT NULL,
        graduate_attributes TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(department_id)
      )
    `);
    
    console.log('✅ Department Vision Mission table created successfully!');
    console.log('\n📊 Table Structure:');
    console.log('   • id (Primary Key)');
    console.log('   • department_id (Foreign Key to departments)');
    console.log('   • vision_statement (TEXT)');
    console.log('   • mission_statement (TEXT)');
    console.log('   • core_values (TEXT)');
    console.log('   • graduate_attributes (TEXT)');
    console.log('   • created_at (TIMESTAMP)');
    console.log('   • updated_at (TIMESTAMP)');
    console.log('   • UNIQUE constraint on department_id');
    
    console.log('\n🎉 Vision Mission table setup completed successfully!');
    console.log('\n🚀 Your Department Design functionality is now ready to use!');
    
  } catch (error) {
    console.error('❌ Error adding vision mission table:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  addVisionMissionTable()
    .then(() => {
      console.log('\n✨ Vision Mission table added successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed to add vision mission table:', error);
      process.exit(1);
    });
}

module.exports = { addVisionMissionTable };
