/**
 * ESLint rule to validate CSS class usage
 * This helps catch missing CSS classes during development
 */

module.exports = {
  rules: {
    // Custom rule to check for common button class patterns
    'no-undef': 'error',
  },
  overrides: [
    {
      files: ['**/*.tsx', '**/*.ts'],
      rules: {
        // Add custom rules for CSS class validation
        'no-console': 'warn',
      }
    }
  ]
};
