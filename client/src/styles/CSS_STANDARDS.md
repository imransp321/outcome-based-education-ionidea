# CSS Standards and Guidelines

## Button Class Standards

### Primary Button Classes
Use these standardized button classes across the application:

#### 1. Modal Buttons (Recommended for all modals)
```css
.modal-btn.modal-btn-primary    /* Primary action (Save, Submit, etc.) */
.modal-btn.modal-btn-secondary  /* Secondary action (Cancel, Close, etc.) */
.modal-btn.modal-btn-danger     /* Destructive action (Delete, etc.) */
```

#### 2. Book Chapter Buttons (For faculty forms)
```css
.book-chapter-btn.book-chapter-btn-primary    /* Primary action */
.book-chapter-btn.book-chapter-btn-secondary  /* Secondary action */
.book-chapter-btn.book-chapter-btn-danger     /* Destructive action */
```

#### 3. Faculty Modal Buttons (Alternative for faculty forms)
```css
.faculty-modal-btn.faculty-modal-btn-save     /* Primary action */
.faculty-modal-btn.faculty-modal-btn-cancel   /* Secondary action */
```

## CSS Class Naming Conventions

### Pattern: `{component}-{element}-{variant}`
- `modal-btn-primary` ✅
- `book-chapter-btn-secondary` ✅
- `faculty-modal-btn-save` ✅

### Avoid:
- Inconsistent naming: `btn-primary` vs `modal-btn-primary` ❌
- Missing variants: Using `book-chapter-btn-primary` without defining it ❌

## Required CSS Class Sets

When creating a new button class system, **ALL variants must be defined**:

### Minimum Required Variants:
1. **Primary** - Main action button
2. **Secondary** - Secondary action button  
3. **Danger** - Destructive action button
4. **Disabled** state for each variant

### Example Complete Set:
```css
/* Base button class */
.my-btn {
  /* base styles */
}

/* Primary variant */
.my-btn-primary {
  background: #3b82f6;
  color: #ffffff;
  border: 2px solid #3b82f6;
}

.my-btn-primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.my-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Secondary variant */
.my-btn-secondary {
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #e9ecef;
}

.my-btn-secondary:hover {
  background: #e9ecef;
  color: #495057;
}

.my-btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Danger variant */
.my-btn-danger {
  background: #ef4444;
  color: #ffffff;
  border: 2px solid #ef4444;
}

.my-btn-danger:hover {
  background: #dc2626;
  border-color: #dc2626;
}

.my-btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

## Migration Strategy

### Phase 1: Standardize on Modal Buttons
- Use `modal-btn` classes for all new modals
- Gradually migrate existing components to use `modal-btn`

### Phase 2: Consolidate Faculty Forms
- Standardize faculty forms to use either `modal-btn` or `book-chapter-btn`
- Remove unused button class systems

### Phase 3: CSS Validation
- Implement CSS class validation in build process
- Add linting rules to catch missing CSS classes

## Validation Checklist

Before using any button class system:

- [ ] All required variants are defined (primary, secondary, danger)
- [ ] Hover states are implemented
- [ ] Disabled states are implemented
- [ ] Classes follow naming convention
- [ ] No duplicate functionality with existing systems
- [ ] CSS is properly organized in appropriate files

## File Organization

- **Global button styles**: `client/src/styles/components/modals.css`
- **Component-specific styles**: `client/src/styles/components/BookChapterModal.css`
- **Page-specific styles**: `client/src/styles/pages/{PageName}.css`

## Color Standards

### Primary Actions
- Background: `#3b82f6` (blue-500)
- Hover: `#2563eb` (blue-600)
- Text: `#ffffff` (white)

### Secondary Actions  
- Background: `#f8f9fa` (gray-50)
- Hover: `#e9ecef` (gray-200)
- Text: `#6c757d` (gray-600)

### Danger Actions
- Background: `#ef4444` (red-500)
- Hover: `#dc2626` (red-600)
- Text: `#ffffff` (white)
