#!/usr/bin/env node

/**
 * CSS Class Validation Script
 * 
 * This script validates that all CSS classes used in React components
 * have corresponding definitions in CSS files.
 * 
 * Usage: node scripts/validate-css-classes.js
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
  /book-chapter-btn-(primary|secondary|danger)/g,
  /modal-btn-(primary|secondary|danger)/g,
  /faculty-modal-btn-(save|cancel|danger)/g
];

// CSS class patterns to extract
const CSS_CLASS_PATTERN = /\.([a-zA-Z0-9_-]+)/g;

class CSSValidator {
  constructor() {
    this.cssClasses = new Set();
    this.usedClasses = new Set();
    this.missingClasses = new Set();
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
      
      let match;
      while ((match = CSS_CLASS_PATTERN.exec(content)) !== null) {
        this.cssClasses.add(match[1]);
      }
    });
    
    console.log(`📁 Found ${this.cssClasses.size} CSS classes in ${cssFiles.length} files`);
  }

  /**
   * Extract used classes from React components
   */
  extractUsedClasses() {
    const componentFiles = glob.sync(COMPONENT_FILES, { cwd: SRC_DIR, ignore: ['**/node_modules/**', '**/*.d.ts'] });
    
    componentFiles.forEach(file => {
      const filePath = path.join(SRC_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract className attributes with static strings only
      const staticClassNameMatches = content.match(/className\s*=\s*["']([^"']+)["']/g);
      if (staticClassNameMatches) {
        staticClassNameMatches.forEach(match => {
          const classString = match.match(/["']([^"']+)["']/)[1];
          const classes = classString.split(/\s+/).filter(cls => 
            cls.trim() && 
            !cls.includes('${') && 
            !cls.includes('}') &&
            /^[a-zA-Z0-9_-]+$/.test(cls)
          );
          classes.forEach(cls => this.usedClasses.add(cls));
        });
      }
      
      // Extract template literals with className (only static parts)
      const templateMatches = content.match(/className\s*=\s*{`([^`]+)`}/g);
      if (templateMatches) {
        templateMatches.forEach(match => {
          const classString = match.match(/`([^`]+)`/)[1];
          // Only extract static class names, not template expressions
          const staticClasses = classString.match(/\b[a-zA-Z0-9_-]+\b/g) || [];
          staticClasses.forEach(cls => {
            if (!cls.includes('${') && !cls.includes('}') && /^[a-zA-Z0-9_-]+$/.test(cls)) {
              this.usedClasses.add(cls);
            }
          });
        });
      }
    });
    
    console.log(`⚛️  Found ${this.usedClasses.size} used classes in ${componentFiles.length} files`);
  }

  /**
   * Validate button class completeness
   */
  validateButtonClasses() {
    const buttonClassGroups = new Map();
    
    // Group button classes by their base class
    this.usedClasses.forEach(className => {
      BUTTON_CLASS_PATTERNS.forEach(pattern => {
        const match = className.match(pattern);
        if (match) {
          const baseClass = className.replace(/-primary|-secondary|-danger|-save|-cancel$/, '');
          if (!buttonClassGroups.has(baseClass)) {
            buttonClassGroups.set(baseClass, new Set());
          }
          buttonClassGroups.get(baseClass).add(className);
        }
      });
    });
    
    // Check for missing variants
    buttonClassGroups.forEach((variants, baseClass) => {
      const hasPrimary = variants.has(`${baseClass}-primary`) || variants.has(`${baseClass}-save`);
      const hasSecondary = variants.has(`${baseClass}-secondary`) || variants.has(`${baseClass}-cancel`);
      const hasDanger = variants.has(`${baseClass}-danger`);
      
      if (hasPrimary && !this.cssClasses.has(`${baseClass}-primary`) && !this.cssClasses.has(`${baseClass}-save`)) {
        this.errors.push(`❌ Missing CSS definition for ${baseClass}-primary or ${baseClass}-save`);
      }
      
      if (hasSecondary && !this.cssClasses.has(`${baseClass}-secondary`) && !this.cssClasses.has(`${baseClass}-cancel`)) {
        this.errors.push(`❌ Missing CSS definition for ${baseClass}-secondary or ${baseClass}-cancel`);
      }
      
      if (hasDanger && !this.cssClasses.has(`${baseClass}-danger`)) {
        this.errors.push(`❌ Missing CSS definition for ${baseClass}-danger`);
      }
    });
  }

  /**
   * Validate all used classes have CSS definitions
   */
  validateAllClasses() {
    this.usedClasses.forEach(className => {
      if (!this.cssClasses.has(className)) {
        this.missingClasses.add(className);
      }
    });
    
    if (this.missingClasses.size > 0) {
      this.errors.push(`❌ ${this.missingClasses.size} classes used but not defined in CSS:`);
      Array.from(this.missingClasses).sort().forEach(cls => {
        this.errors.push(`   - ${cls}`);
      });
    }
  }

  /**
   * Run validation
   */
  validate() {
    console.log('🔍 Starting CSS class validation...\n');
    
    this.extractCSSClasses();
    this.extractUsedClasses();
    this.validateButtonClasses();
    this.validateAllClasses();
    
    if (this.errors.length === 0) {
      console.log('✅ All CSS classes are properly defined!');
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
  const validator = new CSSValidator();
  const success = validator.validate();
  process.exit(success ? 0 : 1);
}

module.exports = CSSValidator;
