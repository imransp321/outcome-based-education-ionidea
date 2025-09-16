const { createTables } = require('./migrate');
const { seedSampleData } = require('./seed-sample-data');

const setupDatabase = async () => {
  try {
    console.log('🚀 Starting complete database setup...\n');
    
    // Step 1: Create tables and insert default data
    console.log('📋 Step 1: Creating database tables and default data...');
    await createTables();
    console.log('✅ Database tables created successfully!\n');
    
    // Step 2: Insert sample data
    console.log('🌱 Step 2: Seeding sample data...');
    await seedSampleData();
    console.log('✅ Sample data seeded successfully!\n');
    
    console.log('🎉 Database setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   • Database tables created');
    console.log('   • Default reference data inserted');
    console.log('   • Sample organisation details added');
    console.log('   • 7 departments created');
    console.log('   • 6 academic programs added');
    console.log('   • 12 faculty members created');
    console.log('   • 8 BOS members assigned');
    console.log('   • 15 program outcomes defined');
    console.log('\n🚀 Your OBE system is ready to use!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
};

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('\n✨ Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
