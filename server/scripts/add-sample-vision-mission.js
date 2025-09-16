const db = require('../config/database');

const addSampleVisionMission = async () => {
  try {
    console.log('🚀 Adding sample vision/mission data for Computer Science and AI departments...\n');
    
    // First, let's check what departments exist
    const departments = await db.query('SELECT id, department_name FROM departments WHERE department_name ILIKE $1 OR department_name ILIKE $2', 
      ['%computer%', '%artificial%']);
    
    console.log('📋 Found departments:');
    departments.rows.forEach(dept => {
      console.log(`   • ID: ${dept.id}, Name: ${dept.department_name}`);
    });
    
    if (departments.rows.length === 0) {
      console.log('❌ No Computer Science or AI departments found. Please check department names.');
      return;
    }
    
    // Sample data for Computer Science
    const computerScienceDept = departments.rows.find(d => 
      d.department_name.toLowerCase().includes('computer') || 
      d.department_name.toLowerCase().includes('cs')
    );
    
    if (computerScienceDept) {
      const csData = {
        department_id: computerScienceDept.id,
        vision_statement: "To be a globally recognized leader in computer science education and research, fostering innovation and excellence in computing technologies that transform society and drive economic growth.",
        mission_statement: "Our mission is to provide world-class education in computer science, conduct cutting-edge research, and prepare students to become innovative leaders in technology. We strive to create an inclusive learning environment that promotes critical thinking, creativity, and ethical responsibility in computing.",
        core_values: "• Excellence in Education and Research\n• Innovation and Creativity\n• Integrity and Ethical Responsibility\n• Collaboration and Teamwork\n• Diversity and Inclusion\n• Lifelong Learning\n• Social Impact and Service",
        graduate_attributes: "• Technical Proficiency: Mastery of computer science fundamentals and advanced technologies\n• Problem-Solving Skills: Ability to analyze complex problems and design effective solutions\n• Communication Skills: Clear written and verbal communication for diverse audiences\n• Leadership Qualities: Initiative, responsibility, and ability to lead technical teams\n• Ethical Awareness: Understanding of ethical implications in technology and responsible computing\n• Adaptability: Continuous learning and adaptation to evolving technologies\n• Innovation: Creative thinking and ability to develop novel solutions"
      };
      
      await db.query(`
        INSERT INTO department_vision_mission 
        (department_id, vision_statement, mission_statement, core_values, graduate_attributes)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (department_id) DO UPDATE SET
        vision_statement = EXCLUDED.vision_statement,
        mission_statement = EXCLUDED.mission_statement,
        core_values = EXCLUDED.core_values,
        graduate_attributes = EXCLUDED.graduate_attributes,
        updated_at = CURRENT_TIMESTAMP
      `, [csData.department_id, csData.vision_statement, csData.mission_statement, csData.core_values, csData.graduate_attributes]);
      
      console.log(`✅ Added vision/mission for: ${computerScienceDept.department_name}`);
    }
    
    // Sample data for AI (or closest match)
    const aiDept = departments.rows.find(d => 
      d.department_name.toLowerCase().includes('artificial') || 
      d.department_name.toLowerCase().includes('ai') ||
      d.department_name.toLowerCase().includes('intelligence')
    );
    
    if (aiDept) {
      const aiData = {
        department_id: aiDept.id,
        vision_statement: "To be at the forefront of artificial intelligence education and research, shaping the future of intelligent systems that benefit humanity while ensuring ethical and responsible AI development.",
        mission_statement: "Our mission is to educate the next generation of AI professionals through rigorous academic programs, cutting-edge research, and practical applications. We are committed to advancing AI knowledge while promoting ethical considerations, diversity, and the responsible use of artificial intelligence technologies.",
        core_values: "• Ethical AI Development\n• Innovation and Research Excellence\n• Interdisciplinary Collaboration\n• Diversity and Inclusion\n• Responsible Technology Use\n• Continuous Learning and Adaptation\n• Human-Centered Design\n• Transparency and Accountability",
        graduate_attributes: "• AI Technical Expertise: Deep understanding of machine learning, deep learning, and AI algorithms\n• Ethical Reasoning: Ability to identify and address ethical implications in AI systems\n• Research Skills: Capability to conduct independent research and contribute to AI knowledge\n• Interdisciplinary Thinking: Understanding of AI applications across various domains\n• Critical Analysis: Ability to evaluate AI systems and their societal impact\n• Communication: Clear explanation of complex AI concepts to diverse audiences\n• Innovation: Creative problem-solving using AI technologies\n• Leadership: Ability to lead AI projects and teams responsibly"
      };
      
      await db.query(`
        INSERT INTO department_vision_mission 
        (department_id, vision_statement, mission_statement, core_values, graduate_attributes)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (department_id) DO UPDATE SET
        vision_statement = EXCLUDED.vision_statement,
        mission_statement = EXCLUDED.mission_statement,
        core_values = EXCLUDED.core_values,
        graduate_attributes = EXCLUDED.graduate_attributes,
        updated_at = CURRENT_TIMESTAMP
      `, [aiData.department_id, aiData.vision_statement, aiData.mission_statement, aiData.core_values, aiData.graduate_attributes]);
      
      console.log(`✅ Added vision/mission for: ${aiDept.department_name}`);
    }
    
    // If no AI department found, let's add to Information Technology as a fallback
    if (!aiDept) {
      const itDept = departments.rows.find(d => 
        d.department_name.toLowerCase().includes('information') || 
        d.department_name.toLowerCase().includes('it')
      );
      
      if (itDept) {
        const itData = {
          department_id: itDept.id,
          vision_statement: "To be a leading department in information technology education and research, preparing students to excel in the digital age and contribute to technological advancement.",
          mission_statement: "Our mission is to provide comprehensive IT education, foster innovation in technology solutions, and prepare students for successful careers in information technology. We emphasize practical skills, theoretical knowledge, and ethical practices in technology development and implementation.",
          core_values: "• Technical Excellence\n• Innovation and Creativity\n• Ethical Technology Use\n• Collaboration and Teamwork\n• Continuous Learning\n• Problem-Solving Orientation\n• User-Centered Design\n• Professional Integrity",
          graduate_attributes: "• Technical Competency: Strong foundation in IT fundamentals and emerging technologies\n• Problem-Solving: Ability to analyze and solve complex IT challenges\n• Communication Skills: Effective communication with technical and non-technical stakeholders\n• Project Management: Skills to lead and manage IT projects successfully\n• Security Awareness: Understanding of cybersecurity principles and best practices\n• Adaptability: Ability to learn and adapt to rapidly changing technologies\n• Innovation: Creative thinking in developing technology solutions\n• Professional Ethics: Understanding of ethical responsibilities in IT"
        };
        
        await db.query(`
          INSERT INTO department_vision_mission 
          (department_id, vision_statement, mission_statement, core_values, graduate_attributes)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (department_id) DO UPDATE SET
          vision_statement = EXCLUDED.vision_statement,
          mission_statement = EXCLUDED.mission_statement,
          core_values = EXCLUDED.core_values,
          graduate_attributes = EXCLUDED.graduate_attributes,
          updated_at = CURRENT_TIMESTAMP
        `, [itData.department_id, itData.vision_statement, itData.mission_statement, itData.core_values, itData.graduate_attributes]);
        
        console.log(`✅ Added vision/mission for: ${itDept.department_name} (as AI alternative)`);
      }
    }
    
    // Verify the data was inserted
    const result = await db.query(`
      SELECT dvm.*, d.department_name 
      FROM department_vision_mission dvm 
      JOIN departments d ON dvm.department_id = d.id
      ORDER BY d.department_name
    `);
    
    console.log('\n📊 Sample data added successfully!');
    console.log('\n📋 Vision/Mission data in database:');
    result.rows.forEach(row => {
      console.log(`\n🏛️ ${row.department_name}:`);
      console.log(`   Vision: ${row.vision_statement.substring(0, 100)}...`);
      console.log(`   Mission: ${row.mission_statement.substring(0, 100)}...`);
    });
    
    console.log('\n🎉 Sample vision/mission data setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error adding sample vision/mission data:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  addSampleVisionMission()
    .then(() => {
      console.log('\n✨ Sample data added successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed to add sample data:', error);
      process.exit(1);
    });
}

module.exports = { addSampleVisionMission };
