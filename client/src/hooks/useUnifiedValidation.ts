import { useState, useCallback } from 'react';

export interface ValidationError {
  [fieldName: string]: string;
}

export interface UseUnifiedValidationReturn {
  validationErrors: ValidationError;
  message: { type: 'success' | 'error'; text: string } | null;
  setMessage: (message: { type: 'success' | 'error'; text: string } | null) => void;
  setValidationErrors: (errors: ValidationError) => void;
  validateField: (fieldName: string, value: any, rules: ValidationRule[]) => string | null;
  validateForm: (formData: any, validationRules: ValidationRules) => boolean;
  clearFieldError: (fieldName: string) => void;
  clearAllErrors: () => void;
  setFieldError: (fieldName: string, error: string) => void;
  showErrorPopup: (message: string) => void;
  showSuccessPopup: (message: string) => void;
  getFieldClassName: (fieldName: string, baseClassName: string) => string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule[];
}

export const useUnifiedValidation = (): UseUnifiedValidationReturn => {
  const [validationErrors, setValidationErrors] = useState<ValidationError>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validateField = useCallback((fieldName: string, value: any, rules: ValidationRule[]): string | null => {
    for (const rule of rules) {
      // Required validation
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return rule.message || `${fieldName} is required`;
      }

      // Skip other validations if value is empty and not required
      if (!value || (typeof value === 'string' && !value.trim())) {
        continue;
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
    }

    return null;
  }, []);

  const validateForm = useCallback((formData: any, validationRules: ValidationRules): boolean => {
    const errors: ValidationError = {};
    let hasErrors = false;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName], validationRules[fieldName]);
      if (error) {
        errors[fieldName] = error;
        hasErrors = true;
      }
    });

    setValidationErrors(errors);
    
    if (hasErrors) {
      // Show unified error popup with standard message
      setMessage({ 
        type: 'error', 
        text: 'Please fix the errors in the form before submitting.\nCheck the highlighted fields and try again.' 
      });
    }

    return !hasErrors;
  }, [validateField]);

  const clearFieldError = useCallback((fieldName: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setValidationErrors({});
    setMessage(null);
  }, []);

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  const showErrorPopup = useCallback((messageText: string) => {
    setMessage({ type: 'error', text: messageText });
  }, []);

  const showSuccessPopup = useCallback((messageText: string) => {
    setMessage({ type: 'success', text: messageText });
  }, []);

  const getFieldClassName = useCallback((fieldName: string, baseClassName: string): string => {
    const hasError = validationErrors[fieldName];
    return hasError ? `${baseClassName} ${baseClassName}-error` : baseClassName;
  }, [validationErrors]);

  return {
    validationErrors,
    message,
    setMessage,
    setValidationErrors,
    validateField,
    validateForm,
    clearFieldError,
    clearAllErrors,
    setFieldError,
    showErrorPopup,
    showSuccessPopup,
    getFieldClassName
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
  
  percentage: (message?: string): ValidationRule => ({
    custom: (value: any) => {
      const num = Number(value);
      if (num < 0) return message || 'Percentage cannot be negative';
      if (num > 100) return message || 'Percentage cannot exceed 100%';
      if (num === 0) return message || 'Percentage must be greater than 0';
      return null;
    }
  }),
  
  hours: (max: number = 2000, message?: string): ValidationRule => ({
    custom: (value: any) => {
      const num = Number(value);
      if (num < 0) return message || 'Hours cannot be negative';
      if (num > max) return message || `Hours cannot exceed ${max}`;
      return null;
    }
  })
};
