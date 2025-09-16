const express = require('express');
const router = express.Router();

// Import route handlers
const organisationRoutes = require('./config/organisation');
const departmentRoutes = require('./config/departments');
const facultyTypeRoutes = require('./config/facultyTypes');
const programTypeRoutes = require('./config/programTypes');
const programModeRoutes = require('./config/programModes');
const programRoutes = require('./config/programs');
const userRoutes = require('./config/users');
const bosRoutes = require('./config/bosMembers');
const courseTypeRoutes = require('./config/courseTypes');
const deliveryMethodRoutes = require('./config/deliveryMethods');
const labCategoryRoutes = require('./config/labCategories');
const bloomsRoutes = require('./config/blooms');
const weightageRoutes = require('./config/weightage');
const curriculumRegulationsRoutes = require('./config/curriculumRegulations');
const peosRoutes = require('./config/peos');
const programOutcomesRoutes = require('./config/programOutcomes');
const poPEOMappingRoutes = require('./config/poPEOMapping');
const coPoMappingRoutes = require('./config/coPoMapping');
const topicsRoutes = require('./config/topics');
const curriculumSettingsRoutes = require('./config/curriculumSettings');
const coursesRoutes = require('./config/courses');
const courseOutcomesRoutes = require('./config/courseOutcomes');
const termDetailsRoutes = require('./config/termDetails');
const facultyWorkloadRoutes = require('./config/facultyWorkload');
const fellowshipScholarshipRoutes = require('./config/fellowshipScholarship');

// Mount routes
router.use('/organisation', organisationRoutes);
router.use('/departments', departmentRoutes);
router.use('/faculty-types', facultyTypeRoutes);
router.use('/program-types', programTypeRoutes);
router.use('/program-modes', programModeRoutes);
router.use('/programs', programRoutes);
router.use('/users', userRoutes);
router.use('/bos-members', bosRoutes);
router.use('/course-types', courseTypeRoutes);
router.use('/delivery-methods', deliveryMethodRoutes);
router.use('/lab-categories', labCategoryRoutes);
router.use('/blooms', bloomsRoutes);
router.use('/weightage', weightageRoutes);
router.use('/curriculum-regulations', curriculumRegulationsRoutes);
router.use('/peos', peosRoutes);
router.use('/program-outcomes', programOutcomesRoutes);
router.use('/po-peo-mapping', poPEOMappingRoutes);
router.use('/co-po-mapping', coPoMappingRoutes);
router.use('/topics', topicsRoutes);
router.use('/curriculum-settings', curriculumSettingsRoutes);
router.use('/courses', coursesRoutes);
router.use('/course-outcomes', courseOutcomesRoutes);
router.use('/term-details', termDetailsRoutes);
router.use('/faculty-workload', facultyWorkloadRoutes);
router.use('/fellowship-scholarship', fellowshipScholarshipRoutes);

module.exports = router;

