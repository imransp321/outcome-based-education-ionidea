const db = require('../config/database');

const addComprehensiveCourseData = async () => {
  try {
    console.log('Adding comprehensive course sample data...');

    // Add more terms if they don't exist
    const termsData = [
      { term_name: '3 - Semester', term_number: 3, description: 'Third Semester' },
      { term_name: '4 - Semester', term_number: 4, description: 'Fourth Semester' },
      { term_name: '5 - Semester', term_number: 5, description: 'Fifth Semester' },
      { term_name: '6 - Semester', term_number: 6, description: 'Sixth Semester' },
      { term_name: '7 - Semester', term_number: 7, description: 'Seventh Semester' },
      { term_name: '8 - Semester', term_number: 8, description: 'Eighth Semester' }
    ];

    for (const term of termsData) {
      try {
        await db.query(`
          INSERT INTO terms (term_name, term_number, description, is_active)
          VALUES ($1, $2, $3, true)
        `, [term.term_name, term.term_number, term.description]);
      } catch (error) {
        // Ignore duplicate key errors
        if (!error.message.includes('duplicate key')) {
          console.log('Term already exists or error:', term.term_name);
        }
      }
    }

    // Add comprehensive course data for different curriculum regulations and terms
    const coursesData = [
      // Semester 1 - Foundation Courses
      {
        curriculum_id: 1, term_id: 1,
        courses: [
          { code: 'MAT101', title: 'Mathematics I', type: 'Core', lecture: 3, tutorial: 1, practical: 0, self_study: 0, credits: 4, marks: 100, mode: 'Theory' },
          { code: 'PHY101', title: 'Physics I', type: 'Core', lecture: 3, tutorial: 0, practical: 2, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'CHE101', title: 'Chemistry I', type: 'Core', lecture: 3, tutorial: 0, practical: 2, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'ENG101', title: 'English Communication', type: 'Core', lecture: 2, tutorial: 1, practical: 0, self_study: 0, credits: 3, marks: 100, mode: 'Theory' },
          { code: 'CSC101', title: 'Programming Fundamentals', type: 'Core', lecture: 2, tutorial: 1, practical: 2, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' }
        ]
      },
      // Semester 2 - Foundation Courses
      {
        curriculum_id: 1, term_id: 2,
        courses: [
          { code: 'MAT102', title: 'Mathematics II', type: 'Core', lecture: 3, tutorial: 1, practical: 0, self_study: 0, credits: 4, marks: 100, mode: 'Theory' },
          { code: 'PHY102', title: 'Physics II', type: 'Core', lecture: 3, tutorial: 0, practical: 2, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC102', title: 'Data Structures', type: 'Core', lecture: 2, tutorial: 1, practical: 2, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC103', title: 'Computer Organization', type: 'Core', lecture: 3, tutorial: 0, practical: 1, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'HUM101', title: 'Humanities', type: 'Core', lecture: 2, tutorial: 0, practical: 0, self_study: 0, credits: 2, marks: 100, mode: 'Theory' }
        ]
      },
      // Semester 3 - Core CS Courses
      {
        curriculum_id: 1, term_id: 3,
        courses: [
          { code: 'CSC201', title: 'Object Oriented Programming', type: 'Core', lecture: 2, tutorial: 1, practical: 2, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC202', title: 'Database Management Systems', type: 'Core', lecture: 3, tutorial: 0, practical: 2, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC203', title: 'Computer Networks', type: 'Core', lecture: 3, tutorial: 0, practical: 1, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC204', title: 'Operating Systems', type: 'Core', lecture: 3, tutorial: 0, practical: 1, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'MAT201', title: 'Discrete Mathematics', type: 'Core', lecture: 3, tutorial: 1, practical: 0, self_study: 0, credits: 4, marks: 100, mode: 'Theory' }
        ]
      },
      // Semester 4 - Advanced Core
      {
        curriculum_id: 1, term_id: 4,
        courses: [
          { code: 'CSC301', title: 'Software Engineering', type: 'Core', lecture: 3, tutorial: 0, practical: 2, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC302', title: 'Web Technologies', type: 'Core', lecture: 2, tutorial: 0, practical: 3, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC303', title: 'Machine Learning', type: 'Core', lecture: 3, tutorial: 0, practical: 2, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC304', title: 'Computer Graphics', type: 'Core', lecture: 2, tutorial: 0, practical: 2, self_study: 0, credits: 3, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC305', title: 'Mobile Application Development', type: 'Core', lecture: 2, tutorial: 0, practical: 2, self_study: 0, credits: 3, marks: 100, mode: 'Theory + Practical' }
        ]
      },
      // Semester 5 - Electives and Specializations
      {
        curriculum_id: 1, term_id: 5,
        courses: [
          { code: 'CSC401', title: 'Advanced Algorithms', type: 'Core', lecture: 3, tutorial: 0, practical: 1, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC402', title: 'Cloud Computing', type: 'Elective-1', lecture: 3, tutorial: 0, practical: 1, self_study: 0, credits: 3, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC403', title: 'Cybersecurity', type: 'Elective-1', lecture: 3, tutorial: 0, practical: 1, self_study: 0, credits: 3, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC404', title: 'Data Science', type: 'Elective-2', lecture: 3, tutorial: 0, practical: 2, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC405', title: 'IoT Development', type: 'Elective-2', lecture: 2, tutorial: 0, practical: 2, self_study: 0, credits: 3, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC406', title: 'Blockchain Technology', type: 'Elective-2', lecture: 3, tutorial: 0, practical: 1, self_study: 0, credits: 3, marks: 100, mode: 'Theory + Practical' }
        ]
      },
      // Semester 6 - Advanced Electives
      {
        curriculum_id: 1, term_id: 6,
        courses: [
          { code: 'CSC501', title: 'Artificial Intelligence', type: 'Core', lecture: 3, tutorial: 0, practical: 2, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC502', title: 'Big Data Analytics', type: 'Elective-1', lecture: 3, tutorial: 0, practical: 2, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC503', title: 'DevOps Engineering', type: 'Elective-1', lecture: 2, tutorial: 0, practical: 3, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC504', title: 'Game Development', type: 'Elective-2', lecture: 2, tutorial: 0, practical: 3, self_study: 0, credits: 4, marks: 100, mode: 'Theory + Practical' },
          { code: 'CSC505', title: 'Quantum Computing', type: 'Elective-2', lecture: 3, tutorial: 0, practical: 1, self_study: 0, credits: 3, marks: 100, mode: 'Theory + Practical' }
        ]
      },
      // Semester 7 - Project and Internship
      {
        curriculum_id: 1, term_id: 7,
        courses: [
          { code: 'CSC601', title: 'Capstone Project I', type: 'Project', lecture: 0, tutorial: 0, practical: 6, self_study: 0, credits: 6, marks: 200, mode: 'Practical' },
          { code: 'CSC602', title: 'Industry Internship', type: 'Project', lecture: 0, tutorial: 0, practical: 8, self_study: 0, credits: 8, marks: 200, mode: 'Practical' },
          { code: 'CSC603', title: 'Research Methodology', type: 'Core', lecture: 2, tutorial: 0, practical: 0, self_study: 0, credits: 2, marks: 100, mode: 'Theory' }
        ]
      },
      // Semester 8 - Final Project
      {
        curriculum_id: 1, term_id: 8,
        courses: [
          { code: 'CSC701', title: 'Capstone Project II', type: 'Project', lecture: 0, tutorial: 0, practical: 8, self_study: 0, credits: 8, marks: 300, mode: 'Practical' },
          { code: 'CSC702', title: 'Professional Ethics', type: 'Core', lecture: 2, tutorial: 0, practical: 0, self_study: 0, credits: 2, marks: 100, mode: 'Theory' },
          { code: 'CSC703', title: 'Entrepreneurship', type: 'Core', lecture: 2, tutorial: 0, practical: 0, self_study: 0, credits: 2, marks: 100, mode: 'Theory' }
        ]
      }
    ];

    // Insert courses
    for (const semester of coursesData) {
      for (const course of semester.courses) {
        try {
          await db.query(`
            INSERT INTO courses (
              curriculum_regulation_id, term_id, course_code, course_title, course_type,
              lecture_hours, tutorial_hours, practical_hours, self_study_hours, credits,
              total_marks, delivery_mode, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
          `, [
            semester.curriculum_id, semester.term_id, course.code, course.title, course.type,
            course.lecture, course.tutorial, course.practical, course.self_study, course.credits,
            course.marks, course.mode
          ]);
        } catch (error) {
          // Ignore duplicate key errors
          if (!error.message.includes('duplicate key')) {
            console.log('Course already exists or error:', course.code);
          }
        }
      }
    }

    // Add course assignments for some courses
    const courseAssignments = [
      { course_code: 'CSC101', section: 'A', instructor_id: 1 },
      { course_code: 'CSC101', section: 'B', instructor_id: 2 },
      { course_code: 'CSC102', section: 'A', instructor_id: 1 },
      { course_code: 'CSC201', section: 'A', instructor_id: 3 },
      { course_code: 'CSC201', section: 'B', instructor_id: 4 },
      { course_code: 'CSC202', section: 'A', instructor_id: 2 },
      { course_code: 'CSC301', section: 'A', instructor_id: 3 },
      { course_code: 'CSC302', section: 'A', instructor_id: 4 },
      { course_code: 'CSC401', section: 'A', instructor_id: 1 },
      { course_code: 'CSC501', section: 'A', instructor_id: 2 }
    ];

    for (const assignment of courseAssignments) {
      // Get course ID
      const courseResult = await db.query(`
        SELECT c.id FROM courses c
        WHERE c.course_code = $1 AND c.curriculum_regulation_id = 1
        LIMIT 1
      `, [assignment.course_code]);

      if (courseResult.rows.length > 0) {
        try {
          await db.query(`
            INSERT INTO course_assignments (course_id, instructor_id, section_division, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
          `, [courseResult.rows[0].id, assignment.instructor_id, assignment.section]);
        } catch (error) {
          // Ignore duplicate key errors
          if (!error.message.includes('duplicate key')) {
            console.log('Assignment already exists or error:', assignment.course_code);
          }
        }
      }
    }

    console.log('Comprehensive course sample data added successfully!');
  } catch (error) {
    console.error('Error adding comprehensive course data:', error);
  } finally {
    process.exit(0);
  }
};

addComprehensiveCourseData();
