#!/usr/bin/env node

/**
 * Button CSS Class Validation Script
 * 
 * This script specifically validates that button class variants are complete
 * to prevent the issue where primary buttons have no styling.
 * 
 * Usage: node scripts/validate-button-classes.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const CSS_FILES = '**/*.css';
const COMPONENT_FILES = '**/*.{tsx,ts}';

// Button class patterns to validate
const BUTTON_CLASS_PATTERNS = [
  {
    name: 'book-chapter-btn',
    variants: ['primary', 'secondary', 'danger'],
    baseClass: 'book-chapter-btn'
  },
  {
    name: 'modal-btn',
    variants: ['primary', 'secondary', 'danger'],
    baseClass: 'modal-btn'
  },
  {
    name: 'faculty-modal-btn',
    variants: ['save', 'cancel', 'danger'],
    baseClass: 'faculty-modal-btn'
  }
];

class ButtonClassValidator {
  constructor() {
    this.cssClasses = new Set();
    this.usedButtonClasses = new Set();
    this.errors = [];
  }

  /**
   * Extract CSS classes from all CSS files
   */
  extractCSSClasses() {
    const cssFiles = glob.sync(CSS_FILES, { cwd: SRC_DIR, ignore: ['**/node_modules/**'] });
    
    cssFiles.forEach(file => {
      const filePath = path.join(SRC_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract class names from CSS
      const classMatches = content.match(/\.([a-zA-Z0-9_-]+)/g);
      if (classMatches) {
        classMatches.forEach(match => {
          this.cssClasses.add(match.substring(1)); // Remove the dot
        });
      }
    });
    
    console.log(`📁 Found ${this.cssClasses.size} CSS classes in ${cssFiles.length} files`);
  }

  /**
   * Extract used button classes from React components
   */
  extractUsedButtonClasses() {
    const componentFiles = glob.sync(COMPONENT_FILES, { cwd: SRC_DIR, ignore: ['**/node_modules/**', '**/*.d.ts'] });
    
    componentFiles.forEach(file => {
      const filePath = path.join(SRC_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract className attributes with static strings only
      const classNameMatches = content.match(/className\s*=\s*["']([^"']+)["']/g);
      if (classNameMatches) {
        classNameMatches.forEach(match => {
          const classString = match.match(/["']([^"']+)["']/)[1];
          const classes = classString.split(/\s+/).filter(cls => 
            cls.trim() && 
            !cls.includes('${') && 
            !cls.includes('}') &&
            /^[a-zA-Z0-9_-]+$/.test(cls)
          );
          
          // Check if any of these classes match our button patterns
          classes.forEach(cls => {
            BUTTON_CLASS_PATTERNS.forEach(pattern => {
              if (cls.startsWith(pattern.baseClass + '-')) {
                this.usedButtonClasses.add(cls);
              }
            });
          });
        });
      }
    });
    
    console.log(`🔘 Found ${this.usedButtonClasses.size} button classes in use`);
  }

  /**
   * Validate button class completeness
   */
  validateButtonClasses() {
    BUTTON_CLASS_PATTERNS.forEach(pattern => {
      const usedVariants = new Set();
      
      // Find which variants of this button class are being used
      this.usedButtonClasses.forEach(className => {
        if (className.startsWith(pattern.baseClass + '-')) {
          const variant = className.replace(pattern.baseClass + '-', '');
          usedVariants.add(variant);
        }
      });
      
      // Check if all used variants have CSS definitions
      usedVariants.forEach(variant => {
        const fullClassName = `${pattern.baseClass}-${variant}`;
        if (!this.cssClasses.has(fullClassName)) {
          this.errors.push(`❌ Missing CSS definition for ${fullClassName}`);
        }
      });
      
      // Check for incomplete button class sets
      if (usedVariants.size > 0) {
        const missingVariants = pattern.variants.filter(variant => 
          !usedVariants.has(variant) && 
          this.usedButtonClasses.has(`${pattern.baseClass}-${variant}`)
        );
        
        if (missingVariants.length > 0) {
          this.errors.push(`⚠️  Incomplete button class set for ${pattern.baseClass}. Missing variants: ${missingVariants.join(', ')}`);
        }
      }
    });
  }

  /**
   * Run validation
   */
  validate() {
    console.log('🔍 Starting button class validation...\n');
    
    this.extractCSSClasses();
    this.extractUsedButtonClasses();
    this.validateButtonClasses();
    
    if (this.errors.length === 0) {
      console.log('✅ All button classes are properly defined!');
      return true;
    } else {
      console.log('\n🚨 Validation Errors:');
      this.errors.forEach(error => console.log(error));
      return false;
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ButtonClassValidator();
  const success = validator.validate();
  process.exit(success ? 0 : 1);
}

module.exports = ButtonClassValidator;
