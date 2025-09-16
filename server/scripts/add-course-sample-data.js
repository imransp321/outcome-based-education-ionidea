const { Pool } = require('pg');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function addCourseSampleData() {
  try {
    console.log('Adding course sample data...');

    // Add terms
    const termsData = [
      { term_name: '1 - Semester', term_number: 1, description: 'First Semester' },
      { term_name: '2 - Semester', term_number: 2, description: 'Second Semester' },
      { term_name: '3 - Semester', term_number: 3, description: 'Third Semester' },
      { term_name: '4 - Semester', term_number: 4, description: 'Fourth Semester' },
      { term_name: '5 - Semester', term_number: 5, description: 'Fifth Semester' },
      { term_name: '6 - Semester', term_number: 6, description: 'Sixth Semester' },
      { term_name: '7 - Semester', term_number: 7, description: 'Seventh Semester' },
      { term_name: '8 - Semester', term_number: 8, description: 'Eighth Semester' }
    ];

    for (const term of termsData) {
      await pool.query(
        'INSERT INTO terms (term_name, term_number, description) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [term.term_name, term.term_number, term.description]
      );
    }

    // Get curriculum regulation IDs and user IDs
    const curriculumResult = await pool.query('SELECT id FROM curriculum_regulations LIMIT 1');
    const usersResult = await pool.query('SELECT id FROM users LIMIT 5');
    
    if (curriculumResult.rows.length === 0) {
      console.log('No curriculum regulations found. Please add curriculum regulations first.');
      return;
    }
    
    if (usersResult.rows.length === 0) {
      console.log('No users found. Please add users first.');
      return;
    }

    const curriculumId = curriculumResult.rows[0].id;
    const userIds = usersResult.rows.map(row => row.id);
    const termId = 5; // 5th Semester

    // Add courses
    const coursesData = [
      {
        course_code: 'CSC319',
        course_title: 'System Software',
        course_type: 'Core',
        lecture_hours: 4,
        tutorial_hours: 0,
        practical_hours: 0,
        self_study_hours: 0,
        credits: 4,
        total_marks: 100,
        course_owner_id: userIds[0],
        course_reviewer_id: userIds[1],
        delivery_mode: 'Theory'
      },
      {
        course_code: 'CSC315',
        course_title: 'Data Communication',
        course_type: 'Core',
        lecture_hours: 4,
        tutorial_hours: 0,
        practical_hours: 0,
        self_study_hours: 1,
        credits: 5,
        total_marks: 100,
        course_owner_id: userIds[1],
        course_reviewer_id: userIds[2],
        delivery_mode: 'Theory'
      },
      {
        course_code: 'CSC305',
        course_title: 'Database Management System',
        course_type: 'Core',
        lecture_hours: 4,
        tutorial_hours: 0,
        practical_hours: 0,
        self_study_hours: 0,
        credits: 4,
        total_marks: 100,
        course_owner_id: userIds[2],
        course_reviewer_id: userIds[3],
        delivery_mode: 'Theory'
      },
      {
        course_code: 'CSE311',
        course_title: 'C# & Net',
        course_type: 'Elective-1',
        lecture_hours: 3,
        tutorial_hours: 0,
        practical_hours: 0,
        self_study_hours: 0,
        credits: 3,
        total_marks: 100,
        course_owner_id: userIds[3],
        course_reviewer_id: userIds[4],
        delivery_mode: 'Theory'
      },
      {
        course_code: 'CSL305',
        course_title: 'Database Design and Applications Lab',
        course_type: 'Core',
        lecture_hours: 0,
        tutorial_hours: 0,
        practical_hours: 1.5,
        self_study_hours: 0,
        credits: 1.5,
        total_marks: 100,
        course_owner_id: userIds[2],
        course_reviewer_id: userIds[3],
        delivery_mode: 'Practical'
      },
      {
        course_code: 'CSL306',
        course_title: 'System Software Lab',
        course_type: 'Core',
        lecture_hours: 0,
        tutorial_hours: 0,
        practical_hours: 1.5,
        self_study_hours: 0,
        credits: 1.5,
        total_marks: 100,
        course_owner_id: userIds[0],
        course_reviewer_id: userIds[1],
        delivery_mode: 'Practical'
      }
    ];

    for (const course of coursesData) {
      const result = await pool.query(
        `INSERT INTO courses (
          course_code, course_title, course_type, lecture_hours, tutorial_hours, 
          practical_hours, self_study_hours, credits, total_marks, course_owner_id, 
          course_reviewer_id, delivery_mode, curriculum_regulation_id, term_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
        ON CONFLICT (course_code) DO NOTHING RETURNING id`,
        [
          course.course_code, course.course_title, course.course_type,
          course.lecture_hours, course.tutorial_hours, course.practical_hours,
          course.self_study_hours, course.credits, course.total_marks,
          course.course_owner_id, course.course_reviewer_id, course.delivery_mode,
          curriculumId, termId
        ]
      );

      if (result.rows.length > 0) {
        const courseId = result.rows[0].id;
        
        // Add course assignment for section A
        await pool.query(
          'INSERT INTO course_assignments (course_id, section_division, instructor_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [courseId, 'A', course.course_owner_id]
        );

        // Add course outcome status
        await pool.query(
          'INSERT INTO course_outcomes (course_id, status) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [courseId, 'Initiated']
        );
      }
    }

    console.log('Course sample data added successfully!');
  } catch (error) {
    console.error('Error adding course sample data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addCourseSampleData().catch(console.error);




