# Button CSS Classes Reference

## Available Button Class Systems

### 1. Modal Buttons (Recommended)
**File**: `client/src/styles/components/modals.css`

```tsx
// Primary action (Save, Submit, etc.)
<button className="modal-btn modal-btn-primary">Save</button>

// Secondary action (Cancel, Close, etc.)  
<button className="modal-btn modal-btn-secondary">Cancel</button>

// Destructive action (Delete, etc.)
<button className="modal-btn modal-btn-danger">Delete</button>
```

**CSS Classes:**
- `.modal-btn` - Base button styles
- `.modal-btn-primary` - Blue primary button
- `.modal-btn-secondary` - Gray secondary button  
- `.modal-btn-danger` - Red danger button

### 2. Book Chapter Buttons
**File**: `client/src/styles/components/BookChapterModal.css`

```tsx
// Primary action
<button className="book-chapter-btn book-chapter-btn-primary">Save</button>

// Secondary action
<button className="book-chapter-btn book-chapter-btn-secondary">Cancel</button>

// Danger action
<button className="book-chapter-btn book-chapter-btn-danger">Delete</button>
```

**CSS Classes:**
- `.book-chapter-btn` - Base button styles
- `.book-chapter-btn-primary` - Blue primary button ✅ **FIXED**
- `.book-chapter-btn-secondary` - Gray secondary button
- `.book-chapter-btn-danger` - Red danger button

### 3. Faculty Modal Buttons
**File**: `client/src/styles/components/modals.css`

```tsx
// Primary action
<button className="faculty-modal-btn faculty-modal-btn-save">Save</button>

// Secondary action
<button className="faculty-modal-btn faculty-modal-btn-cancel">Cancel</button>
```

**CSS Classes:**
- `.faculty-modal-btn` - Base button styles
- `.faculty-modal-btn-save` - Blue primary button
- `.faculty-modal-btn-cancel` - Gray secondary button

## Usage Guidelines

### ✅ DO:
- Use `modal-btn` classes for new modals
- Ensure all variants (primary, secondary, danger) are defined
- Use consistent naming patterns
- Test all button states (hover, disabled, active)

### ❌ DON'T:
- Mix different button class systems in the same component
- Use undefined CSS classes
- Create new button class systems without defining all variants
- Use inline styles for buttons

## Migration Path

### For New Components:
Use `modal-btn` classes:
```tsx
<div className="modal-footer">
  <button className="modal-btn modal-btn-secondary">Cancel</button>
  <button className="modal-btn modal-btn-primary">Save</button>
</div>
```

### For Existing Components:
1. **Faculty Workload** - Fixed ✅ (added missing `book-chapter-btn-primary`)
2. **Other Faculty Components** - Consider migrating to `modal-btn` for consistency
3. **Configuration Components** - Already using `modal-btn` ✅

## Validation

Run CSS validation:
```bash
npm run validate-css
```

This will check:
- All used CSS classes are defined
- Button class variants are complete
- No missing CSS definitions

## Color Reference

| Variant | Background | Text | Border | Hover Background |
|---------|------------|------|--------|------------------|
| Primary | #3b82f6 | #ffffff | #3b82f6 | #2563eb |
| Secondary | #f8f9fa | #6c757d | #e9ecef | #e9ecef |
| Danger | #ef4444 | #ffffff | #ef4444 | #dc2626 |
