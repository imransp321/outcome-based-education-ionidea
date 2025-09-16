import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface UseFormValidationReturn {
  validationErrors: ValidationErrors;
  validateField: (fieldName: string, value: any) => string | null;
  validateForm: (data: any) => boolean;
  clearFieldError: (fieldName: string) => void;
  clearAllErrors: () => void;
  setFieldError: (fieldName: string, error: string) => void;
}

export const useFormValidation = (rules: ValidationRules): UseFormValidationReturn => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((fieldName: string, value: any): string | null => {
    const rule = rules[fieldName];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rule.message || `${fieldName} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null;
    }

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || `${fieldName} must be at least ${rule.minLength} characters long`;
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || `${fieldName} must not exceed ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${fieldName} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }, [rules]);

  const validateForm = useCallback((data: any): boolean => {
    const errors: ValidationErrors = {};
    let hasErrors = false;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, data[fieldName]);
      if (error) {
        errors[fieldName] = error;
        hasErrors = true;
      }
    });

    setValidationErrors(errors);
    return !hasErrors;
  }, [rules, validateField]);

  const clearFieldError = useCallback((fieldName: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  return {
    validationErrors,
    validateField,
    validateForm,
    clearFieldError,
    clearAllErrors,
    setFieldError
  };
};

// Common validation rules
export const commonValidationRules = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message: message || 'This field is required'
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message: message || `Must be at least ${min} characters long`
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: max,
    message: message || `Must not exceed ${max} characters`
  }),
  
  email: (message?: string): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || 'Please enter a valid email address'
  }),
  
  year: (message?: string): ValidationRule => ({
    pattern: /^\d{4}$/,
    message: message || 'Please enter a valid 4-digit year'
  }),
  
  positiveNumber: (message?: string): ValidationRule => ({
    custom: (value: any) => {
      const num = Number(value);
      return num <= 0 ? (message || 'Must be greater than 0') : null;
    }
  }),
  
  textLength: (min: number, max: number, message?: string): ValidationRule => ({
    custom: (value: any) => {
      if (typeof value === 'string') {
        const length = value.trim().length;
        if (length < min || length > max) {
          return message || `Must be between ${min} and ${max} characters`;
        }
      }
      return null;
    }
  })
};
