# Unified Validation System Implementation Guide

## 🎯 Overview

This guide explains how to implement the new unified validation popup system with error highlighting across all pages in the application.

## 🚀 Quick Start

### 1. Import Required Components

```typescript
import UnifiedValidationPopup from '../../components/UnifiedValidationPopup';
import { useUnifiedValidation, commonValidationRules } from '../../hooks/useUnifiedValidation';
import '../../styles/components/UnifiedValidationPopup.css';
```

### 2. Replace State Management

**Before:**
```typescript
const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
```

**After:**
```typescript
const {
  validationErrors,
  message,
  setMessage,
  validateForm: validateFormUnified,
  clearFieldError,
  clearAllErrors,
  showSuccessPopup,
  getFieldClassName
} = useUnifiedValidation();
```

### 3. Define Validation Rules

```typescript
const validationRules = {
  fieldName: [commonValidationRules.required('Custom error message')],
  email: [commonValidationRules.email()],
  percentage: [commonValidationRules.percentage()],
  hours: [commonValidationRules.hours(2000, 'Custom hours message')]
};
```

### 4. Update Form Validation

**Before:**
```typescript
const validateForm = (): boolean => {
  const errors: {[key: string]: string} = {};
  let hasErrors = false;
  
  if (!formData.fieldName.trim()) {
    errors.fieldName = 'Field is required';
    hasErrors = true;
  }
  
  if (hasErrors) {
    setValidationErrors(errors);
    const firstError = Object.values(errors)[0];
    setMessage({ type: 'error', text: firstError });
    return false;
  }
  
  return true;
};
```

**After:**
```typescript
const validateForm = (): boolean => {
  return validateFormUnified(formData, validationRules);
};
```

### 5. Update Input Handling

**Before:**
```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  
  if (validationErrors[name]) {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }
};
```

**After:**
```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  
  if (message && message.type === 'error') {
    setMessage(null);
  }
  
  clearFieldError(name);
};
```

### 6. Update Form Fields with Error Highlighting

**Before:**
```tsx
<input
  className="book-chapter-input"
  name="fieldName"
  value={formData.fieldName}
  onChange={handleInputChange}
/>
{validationErrors.fieldName && (
  <div className="error-message">{validationErrors.fieldName}</div>
)}
```

**After:**
```tsx
<input
  className={getFieldClassName('fieldName', 'book-chapter-input')}
  name="fieldName"
  value={formData.fieldName}
  onChange={handleInputChange}
/>
{validationErrors.fieldName && (
  <div className="error-message">{validationErrors.fieldName}</div>
)}
```

### 7. Replace Popup Components

**Before:**
```tsx
{/* Success Message Popup */}
{message && message.type === 'success' && createPortal(
  <div className="modal-overlay">
    <div className="success-popup">
      {/* Complex popup structure */}
    </div>
  </div>,
  document.body
)}

{/* Error Message Popup */}
{message && message.type === 'error' && createPortal(
  <div className="modal-overlay">
    <div className="error-popup">
      {/* Complex popup structure */}
    </div>
  </div>,
  document.body
)}
```

**After:**
```tsx
<UnifiedValidationPopup
  isOpen={!!message}
  type={message?.type || 'error'}
  message={message?.text || ''}
  onClose={() => setMessage(null)}
  onTryAgain={() => setMessage(null)}
  showProgress={message?.type === 'success'}
  autoClose={message?.type === 'success'}
  autoCloseDelay={3000}
/>
```

### 8. Update Success Messages

**Before:**
```typescript
setMessage({ type: 'success', text: 'Data saved successfully' });
```

**After:**
```typescript
showSuccessPopup('Data saved successfully');
```

## 🎨 Visual Features

### Error Highlighting
- **Red border** on form controls with errors
- **Red background** tint for better visibility
- **Warning icon** next to error messages
- **Consistent styling** across all input types

### Popup Design
- **Header with icon** and close button
- **Standardized message** for validation errors
- **Two-button layout** (Try Again / Close)
- **Progress bar** for success messages
- **Auto-dismiss** for success popups

## 📋 Available Validation Rules

### Basic Rules
```typescript
commonValidationRules.required('Custom message')
commonValidationRules.minLength(3, 'Custom message')
commonValidationRules.maxLength(50, 'Custom message')
commonValidationRules.email('Custom message')
commonValidationRules.year('Custom message')
```

### Numeric Rules
```typescript
commonValidationRules.positiveNumber('Custom message')
commonValidationRules.percentage('Custom message')
commonValidationRules.hours(2000, 'Custom message')
```

### Custom Rules
```typescript
{
  fieldName: [{
    custom: (value: any) => {
      if (value < 0) return 'Value cannot be negative';
      return null;
    }
  }]
}
```

## 🔧 Implementation Checklist

### For Each Page:
- [ ] Import unified validation components
- [ ] Replace state management with hook
- [ ] Define validation rules
- [ ] Update form validation function
- [ ] Update input change handler
- [ ] Add error highlighting to all form fields
- [ ] Replace popup components
- [ ] Update success message calls
- [ ] Test validation flow
- [ ] Test error highlighting
- [ ] Test popup display

### For Form Fields:
- [ ] Add `getFieldClassName` to className
- [ ] Add error message display
- [ ] Ensure proper field names
- [ ] Test error clearing on input

## 🎯 Benefits

### For Developers:
- **Consistent API** across all pages
- **Reusable validation rules**
- **Automatic error highlighting**
- **Standardized popup design**

### For Users:
- **Clear visual feedback** for errors
- **Consistent user experience**
- **Better accessibility**
- **Professional appearance**

## 🚨 Common Issues

### 1. Missing Error Highlighting
**Problem:** Form fields don't highlight in red when there are errors.
**Solution:** Ensure `getFieldClassName` is used in className prop.

### 2. Popup Not Showing
**Problem:** Validation popup doesn't appear.
**Solution:** Check that `message` state is properly set and `isOpen` prop is correct.

### 3. Errors Not Clearing
**Problem:** Field errors don't clear when user types.
**Solution:** Ensure `clearFieldError` is called in input change handler.

### 4. CSS Classes Not Found
**Problem:** Error highlighting styles not applied.
**Solution:** Import `UnifiedValidationPopup.css` and ensure CSS is loaded.

## 📊 Migration Status

### ✅ Completed Pages:
- Faculty Workload

### 🔄 In Progress:
- Research Projects
- Professional Bodies
- Patent Innovation
- Research Publication

### ⏳ Pending:
- All other faculty pages
- Configuration pages
- Curriculum pages

## 🎉 Success Metrics

- **Consistent validation** across all pages
- **Professional popup design** matching requirements
- **Red error highlighting** for all form controls
- **Improved user experience** with clear feedback
- **Reduced code duplication** with reusable components
