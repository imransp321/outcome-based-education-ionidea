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

async function addMoreCourseSampleData() {
  try {
    console.log('Adding more course sample data...');

    // Get curriculum regulation IDs and user IDs
    const curriculumResult = await pool.query('SELECT id FROM curriculum_regulations ORDER BY id LIMIT 3');
    const usersResult = await pool.query('SELECT id FROM users LIMIT 10');
    
    if (curriculumResult.rows.length === 0) {
      console.log('No curriculum regulations found. Please add curriculum regulations first.');
      return;
    }
    
    if (usersResult.rows.length === 0) {
      console.log('No users found. Please add users first.');
      return;
    }

    const curriculumIds = curriculumResult.rows.map(row => row.id);
    const userIds = usersResult.rows.map(row => row.id);

    // Add more courses for different curriculum regulations and terms
    const coursesData = [
      // Curriculum 1, Term 1
      {
        course_code: 'MAT101',
        course_title: 'Mathematics I',
        course_type: 'Core',
        lecture_hours: 4,
        tutorial_hours: 1,
        practical_hours: 0,
        self_study_hours: 0,
        credits: 4.5,
        total_marks: 100,
        course_owner_id: userIds[0],
        course_reviewer_id: userIds[1],
        delivery_mode: 'Theory',
        curriculum_regulation_id: curriculumIds[0],
        term_id: 1
      },
      {
        course_code: 'PHY101',
        course_title: 'Physics I',
        course_type: 'Core',
        lecture_hours: 3,
        tutorial_hours: 1,
        practical_hours: 2,
        self_study_hours: 0,
        credits: 5,
        total_marks: 100,
        course_owner_id: userIds[1],
        course_reviewer_id: userIds[2],
        delivery_mode: 'Theory',
        curriculum_regulation_id: curriculumIds[0],
        term_id: 1
      },
      {
        course_code: 'CHE101',
        course_title: 'Chemistry I',
        course_type: 'Core',
        lecture_hours: 3,
        tutorial_hours: 0,
        practical_hours: 2,
        self_study_hours: 0,
        credits: 4,
        total_marks: 100,
        course_owner_id: userIds[2],
        course_reviewer_id: userIds[3],
        delivery_mode: 'Theory',
        curriculum_regulation_id: curriculumIds[0],
        term_id: 1
      },
      // Curriculum 1, Term 2
      {
        course_code: 'MAT102',
        course_title: 'Mathematics II',
        course_type: 'Core',
        lecture_hours: 4,
        tutorial_hours: 1,
        practical_hours: 0,
        self_study_hours: 0,
        credits: 4.5,
        total_marks: 100,
        course_owner_id: userIds[0],
        course_reviewer_id: userIds[1],
        delivery_mode: 'Theory',
        curriculum_regulation_id: curriculumIds[0],
        term_id: 2
      },
      {
        course_code: 'CSE101',
        course_title: 'Programming Fundamentals',
        course_type: 'Core',
        lecture_hours: 3,
        tutorial_hours: 0,
        practical_hours: 2,
        self_study_hours: 1,
        credits: 4,
        total_marks: 100,
        course_owner_id: userIds[3],
        course_reviewer_id: userIds[4],
        delivery_mode: 'Theory',
        curriculum_regulation_id: curriculumIds[0],
        term_id: 2
      },
      // Curriculum 2, Term 3
      {
        course_code: 'CSE201',
        course_title: 'Data Structures',
        course_type: 'Core',
        lecture_hours: 3,
        tutorial_hours: 0,
        practical_hours: 2,
        self_study_hours: 1,
        credits: 4,
        total_marks: 100,
        course_owner_id: userIds[4],
        course_reviewer_id: userIds[5],
        delivery_mode: 'Theory',
        curriculum_regulation_id: curriculumIds[1],
        term_id: 3
      },
      {
        course_code: 'CSE202',
        course_title: 'Computer Organization',
        course_type: 'Core',
        lecture_hours: 3,
        tutorial_hours: 1,
        practical_hours: 0,
        self_study_hours: 0,
        credits: 4,
        total_marks: 100,
        course_owner_id: userIds[5],
        course_reviewer_id: userIds[6],
        delivery_mode: 'Theory',
        curriculum_regulation_id: curriculumIds[1],
        term_id: 3
      },
      {
        course_code: 'CSE203',
        course_title: 'Discrete Mathematics',
        course_type: 'Core',
        lecture_hours: 3,
        tutorial_hours: 1,
        practical_hours: 0,
        self_study_hours: 0,
        credits: 4,
        total_marks: 100,
        course_owner_id: userIds[6],
        course_reviewer_id: userIds[7],
        delivery_mode: 'Theory',
        curriculum_regulation_id: curriculumIds[1],
        term_id: 3
      },
      // Curriculum 3, Term 4
      {
        course_code: 'CSE301',
        course_title: 'Algorithm Design',
        course_type: 'Core',
        lecture_hours: 3,
        tutorial_hours: 0,
        practical_hours: 2,
        self_study_hours: 1,
        credits: 4,
        total_marks: 100,
        course_owner_id: userIds[7],
        course_reviewer_id: userIds[8],
        delivery_mode: 'Theory',
        curriculum_regulation_id: curriculumIds[2],
        term_id: 4
      },
      {
        course_code: 'CSE302',
        course_title: 'Operating Systems',
        course_type: 'Core',
        lecture_hours: 3,
        tutorial_hours: 0,
        practical_hours: 2,
        self_study_hours: 0,
        credits: 4,
        total_marks: 100,
        course_owner_id: userIds[8],
        course_reviewer_id: userIds[9],
        delivery_mode: 'Theory',
        curriculum_regulation_id: curriculumIds[2],
        term_id: 4
      },
      {
        course_code: 'CSE303',
        course_title: 'Computer Networks',
        course_type: 'Core',
        lecture_hours: 3,
        tutorial_hours: 0,
        practical_hours: 2,
        self_study_hours: 0,
        credits: 4,
        total_marks: 100,
        course_owner_id: userIds[9],
        course_reviewer_id: userIds[0],
        delivery_mode: 'Theory',
        curriculum_regulation_id: curriculumIds[2],
        term_id: 4
      },
      // Elective courses
      {
        course_code: 'CSE401',
        course_title: 'Machine Learning',
        course_type: 'Elective-1',
        lecture_hours: 3,
        tutorial_hours: 0,
        practical_hours: 2,
        self_study_hours: 1,
        credits: 4,
        total_marks: 100,
        course_owner_id: userIds[0],
        course_reviewer_id: userIds[1],
        delivery_mode: 'Theory',
        curriculum_regulation_id: curriculumIds[0],
        term_id: 5
      },
      {
        course_code: 'CSE402',
        course_title: 'Artificial Intelligence',
        course_type: 'Elective-2',
        lecture_hours: 3,
        tutorial_hours: 0,
        practical_hours: 2,
        self_study_hours: 1,
        credits: 4,
        total_marks: 100,
        course_owner_id: userIds[1],
        course_reviewer_id: userIds[2],
        delivery_mode: 'Theory',
        curriculum_regulation_id: curriculumIds[0],
        term_id: 5
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
          course.curriculum_regulation_id, course.term_id
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

    console.log('More course sample data added successfully!');
  } catch (error) {
    console.error('Error adding more course sample data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addMoreCourseSampleData().catch(console.error);




