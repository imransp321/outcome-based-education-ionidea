import React from 'react';
import './FormField.css';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  options = [],
  rows = 3,
  min,
  max,
  step
}) => {
  const fieldId = `field-${name}`;

  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      name,
      value: value || '',
      onChange,
      placeholder,
      disabled,
      className: `form-field-input ${error ? 'error' : ''} ${className}`
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            style={{ fontFamily: 'Calibri, sans-serif' }}
          />
        );

      case 'select':
        return (
          <select
            {...commonProps}
            style={{ fontFamily: 'Calibri, sans-serif' }}
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            min={min}
            max={max}
            step={step}
            style={{ fontFamily: 'Calibri, sans-serif' }}
          />
        );

      default:
        return (
          <input
            {...commonProps}
            type={type}
            style={{ fontFamily: 'Calibri, sans-serif' }}
          />
        );
    }
  };

  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={fieldId} className="form-field-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      {renderInput()}
      {error && (
        <div className="form-field-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default FormField;
