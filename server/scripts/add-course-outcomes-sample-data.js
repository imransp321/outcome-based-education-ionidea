const { query, transaction } = require('../config/database');

async function addCourseOutcomesSampleData() {
  try {
    console.log('Adding Course Outcomes sample data...');

    // First, let's check if we have the required tables and data
    const checkCurriculum = await query('SELECT id FROM curriculum_regulations LIMIT 1');
    const checkTerms = await query('SELECT id FROM terms LIMIT 1');
    const checkCourses = await query('SELECT id FROM courses LIMIT 1');
    const checkUsers = await query('SELECT id FROM users LIMIT 1');
    const checkBloomsLevels = await query('SELECT id FROM blooms_levels LIMIT 1');
    const checkDeliveryMethods = await query('SELECT id FROM delivery_methods LIMIT 1');

    if (checkCurriculum.rows.length === 0) {
      console.log('No curriculum regulations found. Please add curriculum regulations first.');
      return;
    }

    if (checkTerms.rows.length === 0) {
      console.log('No terms found. Please add terms first.');
      return;
    }

    if (checkCourses.rows.length === 0) {
      console.log('No courses found. Please add courses first.');
      return;
    }

    if (checkUsers.rows.length === 0) {
      console.log('No users found. Please add users first.');
      return;
    }

    if (checkBloomsLevels.rows.length === 0) {
      console.log('No Bloom\'s levels found. Please add Bloom\'s levels first.');
      return;
    }

    if (checkDeliveryMethods.rows.length === 0) {
      console.log('No delivery methods found. Please add delivery methods first.');
      return;
    }

    // Get the first available IDs
    const curriculumId = checkCurriculum.rows[0].id;
    const termId = checkTerms.rows[0].id;
    const courseId = checkCourses.rows[0].id;
    const userId = checkUsers.rows[0].id;

    // Get Bloom's levels
    const bloomsLevels = await query('SELECT id, level_name FROM blooms_levels ORDER BY id');
    const deliveryMethods = await query('SELECT id, method_name FROM delivery_methods ORDER BY id');

    console.log('Found curriculum ID:', curriculumId);
    console.log('Found term ID:', termId);
    console.log('Found course ID:', courseId);
    console.log('Found user ID:', userId);
    console.log('Found Bloom\'s levels:', bloomsLevels.rows.length);
    console.log('Found delivery methods:', deliveryMethods.rows.length);

    // Sample course outcomes data
    const courseOutcomesData = [
      {
        co_code: 'CO1',
        course_outcome: 'Identify the major elements of data communication and computer network',
        blooms_level_ids: [1], // L1-Remembering
        delivery_method_ids: [1] // Brain Storming
      },
      {
        co_code: 'CO2',
        course_outcome: 'Distinguish between the different data transmission techniques like line coding and block coding',
        blooms_level_ids: [1, 2], // L1-Remembering, L2-Understanding
        delivery_method_ids: [2, 3] // Case Study, Class Room Delivery
      },
      {
        co_code: 'CO3',
        course_outcome: 'Choose optimized solution for managing varying data traffic using tdm, fdm and wdm',
        blooms_level_ids: [2, 3], // L2-Understanding, L3-Applying
        delivery_method_ids: [1, 2, 3, 4] // Brain Storming, Case Study, Class Room Delivery, Demonstration
      },
      {
        co_code: 'CO4',
        course_outcome: 'Discuss different link control protocols and devices used at data link layer',
        blooms_level_ids: [1, 2], // L1-Remembering, L2-Understanding
        delivery_method_ids: [2, 4] // Case Study, Demonstration
      },
      {
        co_code: 'CO5',
        course_outcome: 'Analyze the components, processes involved in addressing and routing the data',
        blooms_level_ids: [4], // L4-Analyzing
        delivery_method_ids: [2, 4] // Case Study, Demonstration
      }
    ];

    // Insert course outcomes
    for (const coData of courseOutcomesData) {
      const result = await transaction(async (client) => {
        // Insert course outcome
        const insertQuery = `
          INSERT INTO course_outcomes (co_code, course_outcome, curriculum_id, term_id, course_id, faculty_id)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `;
        const courseOutcomeResult = await client.query(insertQuery, [
          coData.co_code,
          coData.course_outcome,
          curriculumId,
          termId,
          courseId,
          userId
        ]);

        const courseOutcomeId = courseOutcomeResult.rows[0].id;

        // Insert Bloom's level mappings
        if (coData.blooms_level_ids.length > 0) {
          for (const levelId of coData.blooms_level_ids) {
            await client.query(
              'INSERT INTO course_outcome_blooms_mapping (course_outcome_id, blooms_level_id) VALUES ($1, $2)',
              [courseOutcomeId, levelId]
            );
          }
        }

        // Insert delivery method mappings
        if (coData.delivery_method_ids.length > 0) {
          for (const methodId of coData.delivery_method_ids) {
            await client.query(
              'INSERT INTO course_outcome_delivery_methods_mapping (course_outcome_id, delivery_method_id) VALUES ($1, $2)',
              [courseOutcomeId, methodId]
            );
          }
        }

        return courseOutcomeId;
      });

      console.log(`Created course outcome: ${coData.co_code} (ID: ${result})`);
    }

    console.log('Course Outcomes sample data added successfully!');
    console.log(`Added ${courseOutcomesData.length} course outcomes with their mappings.`);

  } catch (error) {
    console.error('Error adding course outcomes sample data:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  addCourseOutcomesSampleData()
    .then(() => {
      console.log('Sample data addition completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Sample data addition failed:', error);
      process.exit(1);
    });
}

module.exports = addCourseOutcomesSampleData;
