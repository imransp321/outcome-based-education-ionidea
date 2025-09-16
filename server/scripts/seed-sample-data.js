const db = require('../config/database');
require('dotenv').config();

const seedSampleData = async () => {
  try {
    console.log('Starting sample data seeding...');

    // 1. Organisation Details
    await seedOrganisationDetails();
    
    // 2. Departments
    await seedDepartments();
    
    // 3. Programs
    await seedPrograms();
    
    // 4. Users
    await seedUsers();
    
    // 5. BOS Members
    await seedBOSMembers();
    
    // 6. Program Outcomes
    await seedProgramOutcomes();

    console.log('Sample data seeding completed successfully!');
  } catch (error) {
    console.error('Sample data seeding failed:', error);
    throw error;
  }
};

const seedOrganisationDetails = async () => {
  try {
    console.log('Seeding organisation details...');
    
    // Check if organisation details already exist
    const existing = await db.query('SELECT id FROM organisation_details LIMIT 1');
    if (existing.rows.length > 0) {
      console.log('Organisation details already exist, skipping...');
      return;
    }

    await db.query(`
      INSERT INTO organisation_details 
      (society_name, organisation_name, description, vision, mandate, mission) 
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      'Nexus Education Society',
      'Nexus Institute of Technology',
      'A premier technical institute committed to excellence in engineering education and research, fostering innovation and producing industry-ready professionals.',
      'To be a globally recognized center of excellence in technical education, research, and innovation, producing leaders who contribute to technological advancement and societal development.',
      'To provide quality technical education through innovative teaching methods, cutting-edge research, and industry collaboration, preparing students for successful careers in engineering and technology.',
      'To impart world-class technical education, conduct cutting-edge research, and develop innovative solutions that address real-world challenges while nurturing ethical leadership and social responsibility.'
    ]);
    
    console.log('Organisation details seeded successfully!');
  } catch (error) {
    console.error('Error seeding organisation details:', error);
    throw error;
  }
};

const seedDepartments = async () => {
  try {
    console.log('Seeding departments...');
    
    const departments = [
      {
        department_name: 'Computer Science and Engineering',
        short_name: 'CSE',
        chairman_name: 'Dr. Sarah Johnson',
        chairman_email: 'sarah.johnson@nexus.edu',
        chairman_phone: '+1-555-0101',
        journal_publications: 45,
        magazine_publications: 12,
        professional_body_collaborations: ['ACM', 'IEEE', 'ISTE'],
        is_first_year_department: false
      },
      {
        department_name: 'Information Technology',
        short_name: 'IT',
        chairman_name: 'Prof. Michael Chen',
        chairman_email: 'michael.chen@nexus.edu',
        chairman_phone: '+1-555-0102',
        journal_publications: 38,
        magazine_publications: 8,
        professional_body_collaborations: ['IEEE', 'ACM', 'CSI'],
        is_first_year_department: false
      },
      {
        department_name: 'Electronics and Communication Engineering',
        short_name: 'ECE',
        chairman_name: 'Dr. Emily Rodriguez',
        chairman_email: 'emily.rodriguez@nexus.edu',
        chairman_phone: '+1-555-0103',
        journal_publications: 52,
        magazine_publications: 15,
        professional_body_collaborations: ['IEEE', 'IETE', 'ISTE'],
        is_first_year_department: false
      },
      {
        department_name: 'Mechanical Engineering',
        short_name: 'ME',
        chairman_name: 'Prof. David Kumar',
        chairman_email: 'david.kumar@nexus.edu',
        chairman_phone: '+1-555-0104',
        journal_publications: 41,
        magazine_publications: 10,
        professional_body_collaborations: ['ASME', 'ISTE', 'SAE'],
        is_first_year_department: false
      },
      {
        department_name: 'Civil Engineering',
        short_name: 'CE',
        chairman_name: 'Dr. Lisa Anderson',
        chairman_email: 'lisa.anderson@nexus.edu',
        chairman_phone: '+1-555-0105',
        journal_publications: 35,
        magazine_publications: 9,
        professional_body_collaborations: ['ASCE', 'ISTE', 'IStructE'],
        is_first_year_department: false
      },
      {
        department_name: 'Basic Sciences',
        short_name: 'BS',
        chairman_name: 'Prof. Robert Wilson',
        chairman_email: 'robert.wilson@nexus.edu',
        chairman_phone: '+1-555-0106',
        journal_publications: 28,
        magazine_publications: 6,
        professional_body_collaborations: ['ISTE', 'IAPT'],
        is_first_year_department: true
      },
      {
        department_name: 'Mathematics',
        short_name: 'MATH',
        chairman_name: 'Dr. Jennifer Lee',
        chairman_email: 'jennifer.lee@nexus.edu',
        chairman_phone: '+1-555-0107',
        journal_publications: 33,
        magazine_publications: 7,
        professional_body_collaborations: ['ISTE', 'AMS'],
        is_first_year_department: true
      }
    ];

    for (const dept of departments) {
      await db.query(`
        INSERT INTO departments 
        (department_name, short_name, chairman_name, chairman_email, chairman_phone, 
         journal_publications, magazine_publications, professional_body_collaborations, 
         is_first_year_department) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (department_name) DO NOTHING
      `, [
        dept.department_name,
        dept.short_name,
        dept.chairman_name,
        dept.chairman_email,
        dept.chairman_phone,
        dept.journal_publications,
        dept.magazine_publications,
        dept.professional_body_collaborations,
        dept.is_first_year_department
      ]);
    }
    
    console.log('Departments seeded successfully!');
  } catch (error) {
    console.error('Error seeding departments:', error);
    throw error;
  }
};

const seedPrograms = async () => {
  try {
    console.log('Seeding programs...');
    
    // Get program type and mode IDs
    const programTypes = await db.query('SELECT id, program_name FROM program_types');
    const programModes = await db.query('SELECT id, mode_name FROM program_modes');
    
    const ugType = programTypes.rows.find(pt => pt.program_name.includes('Undergraduate'));
    const pgType = programTypes.rows.find(pt => pt.program_name.includes('Postgraduate'));
    const mbaType = programTypes.rows.find(pt => pt.program_name.includes('MBA'));
    const engType = programTypes.rows.find(pt => pt.program_name.includes('Engineering'));
    
    const fullTimeMode = programModes.rows.find(pm => pm.mode_name === 'Full-Time');
    const partTimeMode = programModes.rows.find(pm => pm.mode_name === 'Part-Time');
    const hybridMode = programModes.rows.find(pm => pm.mode_name === 'Hybrid');

    const programs = [
      {
        program_type_id: ugType.id,
        program_mode_id: fullTimeMode.id,
        specializations: ['Software Engineering', 'Data Science', 'Cybersecurity'],
        acronym: 'B.Tech CSE',
        title: 'Bachelor of Technology in Computer Science and Engineering',
        duration_years: 4,
        duration_semesters: 8,
        total_credits: 160,
        nba_sar_type: 'Tier 1',
        course_types: ['Core', 'Elective', 'Lab', 'Project']
      },
      {
        program_type_id: ugType.id,
        program_mode_id: fullTimeMode.id,
        specializations: ['Web Technologies', 'Mobile Computing', 'Cloud Computing'],
        acronym: 'B.Tech IT',
        title: 'Bachelor of Technology in Information Technology',
        duration_years: 4,
        duration_semesters: 8,
        total_credits: 160,
        nba_sar_type: 'Tier 1',
        course_types: ['Core', 'Elective', 'Lab', 'Project']
      },
      {
        program_type_id: ugType.id,
        program_mode_id: fullTimeMode.id,
        specializations: ['VLSI Design', 'Communication Systems', 'Embedded Systems'],
        acronym: 'B.Tech ECE',
        title: 'Bachelor of Technology in Electronics and Communication Engineering',
        duration_years: 4,
        duration_semesters: 8,
        total_credits: 160,
        nba_sar_type: 'Tier 1',
        course_types: ['Core', 'Elective', 'Lab', 'Project']
      },
      {
        program_type_id: pgType.id,
        program_mode_id: fullTimeMode.id,
        specializations: ['Machine Learning', 'Artificial Intelligence', 'Data Analytics'],
        acronym: 'M.Tech CSE',
        title: 'Master of Technology in Computer Science and Engineering',
        duration_years: 2,
        duration_semesters: 4,
        total_credits: 80,
        nba_sar_type: 'Tier 1',
        course_types: ['Core', 'Elective', 'Lab', 'Thesis']
      },
      {
        program_type_id: mbaType.id,
        program_mode_id: partTimeMode.id,
        specializations: ['Technology Management', 'Digital Marketing', 'Finance'],
        acronym: 'MBA',
        title: 'Master of Business Administration',
        duration_years: 2,
        duration_semesters: 4,
        total_credits: 96,
        nba_sar_type: 'Tier 2',
        course_types: ['Core', 'Elective', 'Project']
      },
      {
        program_type_id: engType.id,
        program_mode_id: hybridMode.id,
        specializations: ['Robotics', 'Automation', 'Industrial Engineering'],
        acronym: 'B.Tech ME',
        title: 'Bachelor of Technology in Mechanical Engineering',
        duration_years: 4,
        duration_semesters: 8,
        total_credits: 160,
        nba_sar_type: 'Tier 1',
        course_types: ['Core', 'Elective', 'Lab', 'Project']
      }
    ];

    for (const program of programs) {
      try {
        await db.query(`
          INSERT INTO programs 
          (program_type_id, program_mode_id, specializations, acronym, title, 
           duration_years, duration_semesters, total_credits, nba_sar_type, course_types) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (acronym) DO NOTHING
        `, [
          program.program_type_id,
          program.program_mode_id,
          program.specializations,
          program.acronym,
          program.title,
          program.duration_years,
          program.duration_semesters,
          program.total_credits,
          program.nba_sar_type,
          program.course_types
        ]);
      } catch (error) {
        if (error.code === '42P10') {
          // If unique constraint doesn't exist, try without ON CONFLICT
          await db.query(`
            INSERT INTO programs 
            (program_type_id, program_mode_id, specializations, acronym, title, 
             duration_years, duration_semesters, total_credits, nba_sar_type, course_types) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            program.program_type_id,
            program.program_mode_id,
            program.specializations,
            program.acronym,
            program.title,
            program.duration_years,
            program.duration_semesters,
            program.total_credits,
            program.nba_sar_type,
            program.course_types
          ]);
        } else {
          throw error;
        }
      }
    }
    
    console.log('Programs seeded successfully!');
  } catch (error) {
    console.error('Error seeding programs:', error);
    throw error;
  }
};

const seedUsers = async () => {
  try {
    console.log('Seeding users...');
    
    // Get faculty type and department IDs
    const facultyTypes = await db.query('SELECT id, type_name FROM faculty_types');
    const departments = await db.query('SELECT id, department_name FROM departments');
    
    const profType = facultyTypes.rows.find(ft => ft.type_name === 'Professor');
    const assocProfType = facultyTypes.rows.find(ft => ft.type_name === 'Associate Professor');
    const asstProfType = facultyTypes.rows.find(ft => ft.type_name === 'Assistant Professor');
    const lecturerType = facultyTypes.rows.find(ft => ft.type_name === 'Lecturer');
    
    const cseDept = departments.rows.find(d => d.department_name.includes('Computer Science'));
    const itDept = departments.rows.find(d => d.department_name.includes('Information Technology'));
    const eceDept = departments.rows.find(d => d.department_name.includes('Electronics'));
    const meDept = departments.rows.find(d => d.department_name.includes('Mechanical'));
    const ceDept = departments.rows.find(d => d.department_name.includes('Civil'));
    const bsDept = departments.rows.find(d => d.department_name.includes('Basic Sciences'));
    const mathDept = departments.rows.find(d => d.department_name.includes('Mathematics'));

    const users = [
      // CSE Department
      {
        faculty_type_id: profType.id,
        department_id: cseDept.id,
        employee_id: 'CSE001',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@nexus.edu',
        phone: '+1-555-1001',
        qualification: ['Ph.D. Computer Science', 'M.Tech Software Engineering'],
        experience_years: 15,
        designation: 'Professor & HOD',
        user_groups: ['Faculty', 'HOD', 'BOS']
      },
      {
        faculty_type_id: assocProfType.id,
        department_id: cseDept.id,
        employee_id: 'CSE002',
        first_name: 'Michael',
        last_name: 'Chen',
        email: 'michael.chen@nexus.edu',
        phone: '+1-555-1002',
        qualification: ['Ph.D. Information Technology', 'M.Tech Computer Science'],
        experience_years: 12,
        designation: 'Associate Professor',
        user_groups: ['Faculty', 'BOS']
      },
      {
        faculty_type_id: asstProfType.id,
        department_id: cseDept.id,
        employee_id: 'CSE003',
        first_name: 'Emily',
        last_name: 'Davis',
        email: 'emily.davis@nexus.edu',
        phone: '+1-555-1003',
        qualification: ['Ph.D. Computer Science', 'M.Tech Data Science'],
        experience_years: 8,
        designation: 'Assistant Professor',
        user_groups: ['Faculty']
      },
      // IT Department
      {
        faculty_type_id: profType.id,
        department_id: itDept.id,
        employee_id: 'IT001',
        first_name: 'David',
        last_name: 'Wilson',
        email: 'david.wilson@nexus.edu',
        phone: '+1-555-2001',
        qualification: ['Ph.D. Information Technology', 'M.Tech Computer Science'],
        experience_years: 18,
        designation: 'Professor & HOD',
        user_groups: ['Faculty', 'HOD', 'BOS']
      },
      {
        faculty_type_id: assocProfType.id,
        department_id: itDept.id,
        employee_id: 'IT002',
        first_name: 'Lisa',
        last_name: 'Anderson',
        email: 'lisa.anderson@nexus.edu',
        phone: '+1-555-2002',
        qualification: ['Ph.D. Information Systems', 'M.Tech IT'],
        experience_years: 10,
        designation: 'Associate Professor',
        user_groups: ['Faculty', 'BOS']
      },
      // ECE Department
      {
        faculty_type_id: profType.id,
        department_id: eceDept.id,
        employee_id: 'ECE001',
        first_name: 'Robert',
        last_name: 'Brown',
        email: 'robert.brown@nexus.edu',
        phone: '+1-555-3001',
        qualification: ['Ph.D. Electronics Engineering', 'M.Tech Communication Systems'],
        experience_years: 16,
        designation: 'Professor & HOD',
        user_groups: ['Faculty', 'HOD', 'BOS']
      },
      {
        faculty_type_id: asstProfType.id,
        department_id: eceDept.id,
        employee_id: 'ECE002',
        first_name: 'Jennifer',
        last_name: 'Garcia',
        email: 'jennifer.garcia@nexus.edu',
        phone: '+1-555-3002',
        qualification: ['Ph.D. Electronics', 'M.Tech VLSI Design'],
        experience_years: 6,
        designation: 'Assistant Professor',
        user_groups: ['Faculty']
      },
      // ME Department
      {
        faculty_type_id: profType.id,
        department_id: meDept.id,
        employee_id: 'ME001',
        first_name: 'William',
        last_name: 'Martinez',
        email: 'william.martinez@nexus.edu',
        phone: '+1-555-4001',
        qualification: ['Ph.D. Mechanical Engineering', 'M.Tech Manufacturing'],
        experience_years: 14,
        designation: 'Professor & HOD',
        user_groups: ['Faculty', 'HOD', 'BOS']
      },
      // CE Department
      {
        faculty_type_id: profType.id,
        department_id: ceDept.id,
        employee_id: 'CE001',
        first_name: 'Maria',
        last_name: 'Rodriguez',
        email: 'maria.rodriguez@nexus.edu',
        phone: '+1-555-5001',
        qualification: ['Ph.D. Civil Engineering', 'M.Tech Structural Engineering'],
        experience_years: 13,
        designation: 'Professor & HOD',
        user_groups: ['Faculty', 'HOD', 'BOS']
      },
      // Basic Sciences
      {
        faculty_type_id: profType.id,
        department_id: bsDept.id,
        employee_id: 'BS001',
        first_name: 'James',
        last_name: 'Taylor',
        email: 'james.taylor@nexus.edu',
        phone: '+1-555-6001',
        qualification: ['Ph.D. Physics', 'M.Sc Applied Physics'],
        experience_years: 11,
        designation: 'Professor & HOD',
        user_groups: ['Faculty', 'HOD', 'BOS']
      },
      {
        faculty_type_id: lecturerType.id,
        department_id: bsDept.id,
        employee_id: 'BS002',
        first_name: 'Patricia',
        last_name: 'White',
        email: 'patricia.white@nexus.edu',
        phone: '+1-555-6002',
        qualification: ['M.Sc Chemistry', 'B.Ed'],
        experience_years: 5,
        designation: 'Lecturer',
        user_groups: ['Faculty']
      },
      // Mathematics
      {
        faculty_type_id: profType.id,
        department_id: mathDept.id,
        employee_id: 'MATH001',
        first_name: 'John',
        last_name: 'Harris',
        email: 'john.harris@nexus.edu',
        phone: '+1-555-7001',
        qualification: ['Ph.D. Mathematics', 'M.Sc Applied Mathematics'],
        experience_years: 17,
        designation: 'Professor & HOD',
        user_groups: ['Faculty', 'HOD', 'BOS']
      },
      {
        faculty_type_id: asstProfType.id,
        department_id: mathDept.id,
        employee_id: 'MATH002',
        first_name: 'Susan',
        last_name: 'Clark',
        email: 'susan.clark@nexus.edu',
        phone: '+1-555-7002',
        qualification: ['Ph.D. Statistics', 'M.Sc Mathematics'],
        experience_years: 7,
        designation: 'Assistant Professor',
        user_groups: ['Faculty']
      }
    ];

    for (const user of users) {
      await db.query(`
        INSERT INTO users 
        (faculty_type_id, department_id, employee_id, first_name, last_name, 
         email, phone, qualification, experience_years, designation, user_groups) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (email) DO NOTHING
      `, [
        user.faculty_type_id,
        user.department_id,
        user.employee_id,
        user.first_name,
        user.last_name,
        user.email,
        user.phone,
        user.qualification,
        user.experience_years,
        user.designation,
        user.user_groups
      ]);
    }
    
    console.log('Users seeded successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

const seedBOSMembers = async () => {
  try {
    console.log('Seeding BOS members...');
    
    // Get user and department IDs
    const users = await db.query(`
      SELECT u.id, u.first_name, u.last_name, u.department_id, d.department_name 
      FROM users u 
      JOIN departments d ON u.department_id = d.id 
      WHERE 'BOS' = ANY(u.user_groups)
    `);
    
    const departments = await db.query('SELECT id, department_name FROM departments');

    const bosMembers = [
      {
        user_id: users.rows[0].id, // Sarah Johnson (CSE HOD)
        department_id: users.rows[0].department_id,
        qualifications: ['Ph.D. Computer Science', 'M.Tech Software Engineering'],
        experience_years: 15,
        designation: 'Professor & HOD',
        is_chairman: true,
        is_secretary: false,
        term_start_date: '2024-01-01',
        term_end_date: '2026-12-31'
      },
      {
        user_id: users.rows[1].id, // Michael Chen (CSE Assoc Prof)
        department_id: users.rows[1].department_id,
        qualifications: ['Ph.D. Information Technology', 'M.Tech Computer Science'],
        experience_years: 12,
        designation: 'Associate Professor',
        is_chairman: false,
        is_secretary: true,
        term_start_date: '2024-01-01',
        term_end_date: '2026-12-31'
      },
      {
        user_id: users.rows[2].id, // David Wilson (IT HOD)
        department_id: users.rows[2].department_id,
        qualifications: ['Ph.D. Information Technology', 'M.Tech Computer Science'],
        experience_years: 18,
        designation: 'Professor & HOD',
        is_chairman: false,
        is_secretary: false,
        term_start_date: '2024-01-01',
        term_end_date: '2026-12-31'
      },
      {
        user_id: users.rows[3].id, // Robert Brown (ECE HOD)
        department_id: users.rows[3].department_id,
        qualifications: ['Ph.D. Electronics Engineering', 'M.Tech Communication Systems'],
        experience_years: 16,
        designation: 'Professor & HOD',
        is_chairman: false,
        is_secretary: false,
        term_start_date: '2024-01-01',
        term_end_date: '2026-12-31'
      },
      {
        user_id: users.rows[4].id, // William Martinez (ME HOD)
        department_id: users.rows[4].department_id,
        qualifications: ['Ph.D. Mechanical Engineering', 'M.Tech Manufacturing'],
        experience_years: 14,
        designation: 'Professor & HOD',
        is_chairman: false,
        is_secretary: false,
        term_start_date: '2024-01-01',
        term_end_date: '2026-12-31'
      },
      {
        user_id: users.rows[5].id, // Maria Rodriguez (CE HOD)
        department_id: users.rows[5].department_id,
        qualifications: ['Ph.D. Civil Engineering', 'M.Tech Structural Engineering'],
        experience_years: 13,
        designation: 'Professor & HOD',
        is_chairman: false,
        is_secretary: false,
        term_start_date: '2024-01-01',
        term_end_date: '2026-12-31'
      },
      {
        user_id: users.rows[6].id, // James Taylor (Basic Sciences HOD)
        department_id: users.rows[6].department_id,
        qualifications: ['Ph.D. Physics', 'M.Sc Applied Physics'],
        experience_years: 11,
        designation: 'Professor & HOD',
        is_chairman: false,
        is_secretary: false,
        term_start_date: '2024-01-01',
        term_end_date: '2026-12-31'
      },
      {
        user_id: users.rows[7].id, // John Harris (Mathematics HOD)
        department_id: users.rows[7].department_id,
        qualifications: ['Ph.D. Mathematics', 'M.Sc Applied Mathematics'],
        experience_years: 17,
        designation: 'Professor & HOD',
        is_chairman: false,
        is_secretary: false,
        term_start_date: '2024-01-01',
        term_end_date: '2026-12-31'
      }
    ];

    for (const member of bosMembers) {
      await db.query(`
        INSERT INTO bos_members 
        (user_id, department_id, qualifications, experience_years, designation, 
         is_chairman, is_secretary, term_start_date, term_end_date) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        member.user_id,
        member.department_id,
        member.qualifications,
        member.experience_years,
        member.designation,
        member.is_chairman,
        member.is_secretary,
        member.term_start_date,
        member.term_end_date
      ]);
    }
    
    console.log('BOS members seeded successfully!');
  } catch (error) {
    console.error('Error seeding BOS members:', error);
    throw error;
  }
};

const seedProgramOutcomes = async () => {
  try {
    console.log('Seeding program outcomes...');
    
    const programOutcomes = [
      // Engineering Knowledge
      {
        po_type: 'NBA',
        accreditation_type: 'Tier 1',
        po_code: 'PO1',
        po_reference: 'NBA-1',
        category: 'Technical',
        description: 'Engineering Knowledge: Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization to the solution of complex engineering problems.'
      },
      {
        po_type: 'NBA',
        accreditation_type: 'Tier 1',
        po_code: 'PO2',
        po_reference: 'NBA-2',
        category: 'Technical',
        description: 'Problem Analysis: Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences, and engineering sciences.'
      },
      {
        po_type: 'NBA',
        accreditation_type: 'Tier 1',
        po_code: 'PO3',
        po_reference: 'NBA-3',
        category: 'Technical',
        description: 'Design/Development of Solutions: Design solutions for complex engineering problems and design system components or processes that meet the specified needs with appropriate consideration for the public health and safety, and the cultural, societal, and environmental considerations.'
      },
      {
        po_type: 'NBA',
        accreditation_type: 'Tier 1',
        po_code: 'PO4',
        po_reference: 'NBA-4',
        category: 'Technical',
        description: 'Conduct Investigations of Complex Problems: Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of the information to provide valid conclusions.'
      },
      {
        po_type: 'NBA',
        accreditation_type: 'Tier 1',
        po_code: 'PO5',
        po_reference: 'NBA-5',
        category: 'Technical',
        description: 'Modern Tool Usage: Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling to complex engineering activities with an understanding of the limitations.'
      },
      {
        po_type: 'NBA',
        accreditation_type: 'Tier 1',
        po_code: 'PO6',
        po_reference: 'NBA-6',
        category: 'Professional',
        description: 'The Engineer and Society: Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal and cultural issues and the consequent responsibilities relevant to the professional engineering practice.'
      },
      {
        po_type: 'NBA',
        accreditation_type: 'Tier 1',
        po_code: 'PO7',
        po_reference: 'NBA-7',
        category: 'Professional',
        description: 'Environment and Sustainability: Understand the impact of the professional engineering solutions in societal and environmental contexts, and demonstrate the knowledge of, and need for sustainable development.'
      },
      {
        po_type: 'NBA',
        accreditation_type: 'Tier 1',
        po_code: 'PO8',
        po_reference: 'NBA-8',
        category: 'Professional',
        description: 'Ethics: Apply ethical principles and commit to professional ethics and responsibilities and norms of the engineering practice.'
      },
      {
        po_type: 'NBA',
        accreditation_type: 'Tier 1',
        po_code: 'PO9',
        po_reference: 'NBA-9',
        category: 'Professional',
        description: 'Individual and Team Work: Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings.'
      },
      {
        po_type: 'NBA',
        accreditation_type: 'Tier 1',
        po_code: 'PO10',
        po_reference: 'NBA-10',
        category: 'Professional',
        description: 'Communication: Communicate effectively on complex engineering activities with the engineering community and with society at large, such as, being able to comprehend and write effective reports and design documentation, make effective presentations, and give and receive clear instructions.'
      },
      {
        po_type: 'NBA',
        accreditation_type: 'Tier 1',
        po_code: 'PO11',
        po_reference: 'NBA-11',
        category: 'Professional',
        description: 'Project Management and Finance: Demonstrate knowledge and understanding of the engineering and management principles and apply these to one\'s own work, as a member and leader in a team, to manage projects and in multidisciplinary environments.'
      },
      {
        po_type: 'NBA',
        accreditation_type: 'Tier 1',
        po_code: 'PO12',
        po_reference: 'NBA-12',
        category: 'Critical Thinking',
        description: 'Life-long Learning: Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change.'
      },
      // Program Specific Outcomes (PSOs)
      {
        po_type: 'PSO',
        accreditation_type: 'Tier 1',
        po_code: 'PSO1',
        po_reference: 'PSO-1',
        category: 'Technical',
        description: 'Professional Skills: The ability to understand, analyze and develop computer programs in the areas related to algorithms, system software, multimedia, web design, big data analytics, and networking for efficient design of computer-based systems of varying complexity.'
      },
      {
        po_type: 'PSO',
        accreditation_type: 'Tier 1',
        po_code: 'PSO2',
        po_reference: 'PSO-2',
        category: 'Technical',
        description: 'Problem-Solving Skills: The ability to apply standard practices and strategies in software project development using open-ended programming environments to deliver a quality product for business success.'
      },
      {
        po_type: 'PSO',
        accreditation_type: 'Tier 1',
        po_code: 'PSO3',
        po_reference: 'PSO-3',
        category: 'Professional',
        description: 'Successful Career and Entrepreneurship: The ability to employ modern computer languages, environments, and platforms in creating innovative career paths to be an entrepreneur and a zest for higher studies.'
      }
    ];

    for (const po of programOutcomes) {
      await db.query(`
        INSERT INTO program_outcomes 
        (po_type, accreditation_type, po_code, po_reference, category, description) 
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (po_code) DO NOTHING
      `, [
        po.po_type,
        po.accreditation_type,
        po.po_code,
        po.po_reference,
        po.category,
        po.description
      ]);
    }
    
    console.log('Program outcomes seeded successfully!');
  } catch (error) {
    console.error('Error seeding program outcomes:', error);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedSampleData()
    .then(() => {
      console.log('Sample data seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Sample data seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSampleData };
