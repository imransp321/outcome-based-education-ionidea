const { body } = require('express-validator');

// Validation rules for sponsored projects
const sponsoredProjectsValidation = [
  body('projectType')
    .notEmpty()
    .withMessage('Project type is required')
    .isIn(['Sponsored Project', 'Consultancy Work', 'Research Grant', 'Industry Collaboration'])
    .withMessage('Project type must be one of: Sponsored Project, Consultancy Work, Research Grant, Industry Collaboration'),
  
  body('projectTitle')
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Project title must be between 5 and 500 characters'),
  
  body('yearOfSanction')
    .notEmpty()
    .withMessage('Year of sanction is required')
    .isLength({ min: 4, max: 4 })
    .withMessage('Year of sanction must be 4 digits')
    .isNumeric()
    .withMessage('Year of sanction must be numeric')
    .custom((value) => {
      const currentYear = new Date().getFullYear();
      const year = parseInt(value);
      if (year < 1900 || year > currentYear + 5) {
        throw new Error('Year of sanction must be between 1900 and ' + (currentYear + 5));
      }
      return true;
    }),
  
  body('principalInvestigator')
    .notEmpty()
    .withMessage('Principal investigator is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Principal investigator name must be between 2 and 255 characters'),
  
  body('coInvestigator')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Co-investigator names must not exceed 1000 characters'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isNumeric()
    .withMessage('Amount must be numeric')
    .custom((value) => {
      const amount = parseFloat(value);
      if (amount < 0) {
        throw new Error('Amount must be between 0 and 999,999');
      }
      if (amount > 999999) {
        throw new Error('Amount must be between 0 and 999,999');
      }
      return true;
    }),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['On Going', 'Completed', 'Pending', 'Cancelled'])
    .withMessage('Status must be one of: On Going, Completed, Pending, Cancelled'),
  
  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 1, max: 120 })
    .withMessage('Duration must be between 1 and 120 months'),
  
  body('sponsoringOrganization')
    .notEmpty()
    .withMessage('Sponsoring organization is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Sponsoring organization must be between 2 and 255 characters'),
  
  body('collaboratingOrganization')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Collaborating organization must not exceed 1000 characters'),
  
  body('sanctionedDepartment')
    .notEmpty()
    .withMessage('Sanctioned department is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Sanctioned department must be between 2 and 255 characters'),
  
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters')
];

module.exports = sponsoredProjectsValidation;
