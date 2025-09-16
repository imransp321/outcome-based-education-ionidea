import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import ValidationPopup from '../../components/ValidationPopup';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

interface Department {
  id?: number;
  department_name: string;
  short_name: string;
  chairman_name?: string;
  chairman_email?: string;
  chairman_phone?: string;
  journal_publications: number;
  magazine_publications: number;
  professional_body_collaborations: string[];
  is_first_year_department: boolean;
  created_at?: string;
  updated_at?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [successProgress, setSuccessProgress] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAccordion, setShowAccordion] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Department>({
    department_name: '',
    short_name: '',
    chairman_name: '',
    chairman_email: '',
    chairman_phone: '',
    journal_publications: 0,
    magazine_publications: 0,
    professional_body_collaborations: [],
    is_first_year_department: false
  });

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await configAPI.departments.getAll({
        page: pagination.currentPage,
        limit: 10,
        search: searchTerm
      });
      
      if (response.data.data) {
        setDepartments(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch departments' });
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, searchTerm, setMessage]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Auto-dismiss success messages after 3 seconds with progress animation
  useEffect(() => {
    if (message && message.type === 'success') {
      setSuccessProgress(100);
      
      const progressInterval = setInterval(() => {
        setSuccessProgress(prev => {
          const newProgress = prev - (100 / 30); // 30 updates over 3 seconds
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);
      
      const timer = setTimeout(() => {
        setMessage(null);
        setSuccessProgress(100);
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error message and field-specific errors when user starts typing
    if (message && message.type === 'error') {
      setMessage(null);
    }
    
    // Clear field-specific error
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  // Comprehensive form validation
  const validateForm = (): boolean => {
    // Clear any existing messages and field errors
    setMessage(null);
    setFieldErrors({});

    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    // Check required fields
    if (!formData.department_name.trim()) {
      errors.department_name = 'Department name is required';
      hasErrors = true;
    } else if (formData.department_name.trim().length < 2) {
      errors.department_name = 'Department name must be at least 2 characters long';
      hasErrors = true;
    }

    if (!formData.short_name.trim()) {
      errors.short_name = 'Short name is required';
      hasErrors = true;
    } else if (formData.short_name.trim().length < 2) {
      errors.short_name = 'Short name must be at least 2 characters long';
      hasErrors = true;
    }

    // Validate chairman email if provided
    if (formData.chairman_email && !validateEmail(formData.chairman_email)) {
      errors.chairman_email = 'Please enter a valid email address';
      hasErrors = true;
    }

    // Validate chairman phone if provided
    if (formData.chairman_phone && !validatePhone(formData.chairman_phone)) {
      errors.chairman_phone = 'Please enter a valid phone number';
      hasErrors = true;
    }

    // Validate numeric fields
    if (formData.journal_publications < 0) {
      errors.journal_publications = 'Journal publications cannot be negative';
      hasErrors = true;
    }

    if (formData.magazine_publications < 0) {
      errors.magazine_publications = 'Magazine publications cannot be negative';
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(errors);
      // Show first validation error as popup
      const firstError = Object.values(errors)[0];
      setMessage({ type: 'error', text: firstError });
      return false;
    }

    return true;
  };

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      professional_body_collaborations: array
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchDepartments();
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleAddNew = () => {
    setFormData({
      department_name: '',
      short_name: '',
      chairman_name: '',
      chairman_email: '',
      chairman_phone: '',
      journal_publications: 0,
      magazine_publications: 0,
      professional_body_collaborations: [],
      is_first_year_department: false
    });
    setEditingId(null);
    setFieldErrors({});
    setShowAccordion(true);
  };

  const handleEdit = (dept: Department) => {
    setFormData(dept);
    setEditingId(dept.id || null);
    setFieldErrors({});
    setShowAccordion(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await configAPI.departments.delete(id.toString());
        setMessage({ type: 'success', text: 'Department deleted successfully!' });
        fetchDepartments();
      } catch (error: any) {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Failed to delete department' 
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await configAPI.departments.update(editingId.toString(), formData);
        setMessage({ type: 'success', text: 'Department updated successfully!' });
      } else {
        await configAPI.departments.create(formData);
        setMessage({ type: 'success', text: 'Department created successfully!' });
      }
      
      setShowAccordion(false);
      fetchDepartments();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save department' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowAccordion(false);
    setFormData({
      department_name: '',
      short_name: '',
      chairman_name: '',
      chairman_email: '',
      chairman_phone: '',
      journal_publications: 0,
      magazine_publications: 0,
      professional_body_collaborations: [],
      is_first_year_department: false
    });
    setEditingId(null);
    setFieldErrors({});
  };



  return (
    <div className="grid-page">

      {/* Success Message Popup */}
      {message && message.type === 'success' && createPortal(
        <div className="modal-overlay">
          <div className="success-popup">
            <div className="success-popup-progress">
              <div 
                className="success-popup-progress-bar"
                style={{ width: `${successProgress}%` }}
              ></div>
            </div>
            <div className="success-popup-content">
              <div className="success-popup-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="success-popup-title">Success!</h3>
              <p className="success-popup-message">{message.text}</p>
              <button
                className="success-popup-button"
                onClick={() => setMessage(null)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Continue
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Error Message Popup */}
      {message && message.type === 'error' && createPortal(
        <div className="modal-overlay">
          <div className="error-popup">
            <div className="error-popup-content">
              <div className="error-popup-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="error-popup-title">Validation Error</h3>
              <p className="error-popup-message">{message.text}</p>
              <button
                className="error-popup-button"
                onClick={() => setMessage(null)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal */}
      {showAccordion && createPortal(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <h2>{editingId ? 'Edit Department' : 'Add New Department'}</h2>
                <p>Enter department details below</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCancel}
                title="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" >
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <form id="department-form" onSubmit={handleSubmit} className="business-form">
                {/* Basic Information Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Basic information</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="department_name" className="business-form-label">
                        Department name <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          id="department_name"
                          name="department_name"
                          className={`business-form-input ${fieldErrors.department_name ? 'is-invalid' : ''}`}
                          value={formData.department_name}
                          onChange={handleInputChange}
                          placeholder="Enter department name"
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 21h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5 21V7l8-4v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 21V11l-6-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {fieldErrors.department_name && (
                        <div className="business-form-error">{fieldErrors.department_name}</div>
                      )}
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="short_name" className="business-form-label">
                        Short name <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          id="short_name"
                          name="short_name"
                          className={`business-form-input ${fieldErrors.short_name ? 'is-invalid' : ''}`}
                          value={formData.short_name}
                          onChange={handleInputChange}
                          placeholder="Enter short name"
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {fieldErrors.short_name && (
                        <div className="business-form-error">{fieldErrors.short_name}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chairman Information Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Chairman information</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="chairman_name" className="business-form-label">Chairman name</label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          id="chairman_name"
                          name="chairman_name"
                          className="business-form-input"
                          value={formData.chairman_name}
                          onChange={handleInputChange}
                          placeholder="Enter chairman name"
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="chairman_email" className="business-form-label">Chairman email</label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="email"
                          id="chairman_email"
                          name="chairman_email"
                          className={`business-form-input ${fieldErrors.chairman_email ? 'is-invalid' : ''}`}
                          value={formData.chairman_email}
                          onChange={handleInputChange}
                          placeholder="Enter chairman email"
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {fieldErrors.chairman_email && (
                        <div className="business-form-error">{fieldErrors.chairman_email}</div>
                      )}
                    </div>
                  </div>
                  <div className="business-form-group business-form-group-full">
                    <label htmlFor="chairman_phone" className="business-form-label">Chairman phone</label>
                    <div className="business-form-input-wrapper">
                      <input
                        type="tel"
                        id="chairman_phone"
                        name="chairman_phone"
                        className={`business-form-input ${fieldErrors.chairman_phone ? 'is-invalid' : ''}`}
                        value={formData.chairman_phone}
                        onChange={handleInputChange}
                        placeholder="Enter chairman phone"
                      />
                      <div className="business-form-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    {fieldErrors.chairman_phone && (
                      <div className="business-form-error">{fieldErrors.chairman_phone}</div>
                    )}
                  </div>
                </div>

                {/* Publications Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Publications</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="journal_publications" className="business-form-label">Journal publications</label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="number"
                          id="journal_publications"
                          name="journal_publications"
                          className={`business-form-input ${fieldErrors.journal_publications ? 'is-invalid' : ''}`}
                          value={formData.journal_publications}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="0"
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {fieldErrors.journal_publications && (
                        <div className="business-form-error">{fieldErrors.journal_publications}</div>
                      )}
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="magazine_publications" className="business-form-label">Magazine publications</label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="number"
                          id="magazine_publications"
                          name="magazine_publications"
                          className={`business-form-input ${fieldErrors.magazine_publications ? 'is-invalid' : ''}`}
                          value={formData.magazine_publications}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="0"
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {fieldErrors.magazine_publications && (
                        <div className="business-form-error">{fieldErrors.magazine_publications}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Additional information</h3>
                  <div className="business-form-group business-form-group-full">
                    <label htmlFor="professional_body_collaborations" className="business-form-label">Professional body collaborations</label>
                    <div className="business-form-input-wrapper">
                      <input
                        type="text"
                        id="professional_body_collaborations"
                        className="business-form-input"
                        value={formData.professional_body_collaborations.join(', ')}
                        onChange={handleArrayInputChange}
                        placeholder="Enter comma-separated values (e.g., IEEE, ACM, ISTE)"
                      />
                      <div className="business-form-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="business-form-group business-form-group-full">
                    <div className="business-form-checkbox">
                      <input
                        type="checkbox"
                        id="is_first_year_department"
                        name="is_first_year_department"
                        checked={formData.is_first_year_department}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="is_first_year_department" className="business-form-label">First year department</label>
                    </div>
                  </div>
                </div>

              </form>
            </div>
            <div className="modal-footer">
              <button 
                type="button"
                className="modal-btn modal-btn-secondary"
                onClick={handleCancel}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" >
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Cancel
              </button>
              <button 
                type="submit" 
                form="department-form"
                className="modal-btn modal-btn-primary"
                disabled={saving}
                onClick={handleSubmit}
              >
                {saving ? (
                  <>
                    <div className="modal-spinner"></div>
                    {editingId ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" >
                      <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 3V8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {editingId ? 'Update' : 'Save'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Page Header */}
      <div className="page-header">
        <h1>Departments</h1>
        <p>Manage department information and details</p>
      </div>

      {/* Grid Container */}
      <div className="grid-container">
        {/* Grid Header */}
        <div className="grid-header">
          <div className="grid-header-actions">
            <button
              type="button"
              className="grid-add-button"
              onClick={handleAddNew}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" >
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add Department
            </button>
            <div className="grid-header-spacer"></div>
            <div className="grid-search">
              <svg className="grid-search-icon" viewBox="0 0 24 24" fill="none" >
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search Departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="grid-search-input"
                />
              </form>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="grid-loading">
            <div className="grid-empty-icon">⏳</div>
            <p>Loading departments...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="grid-empty">
            <div className="grid-empty-icon">🏢</div>
            <p>No departments found</p>
            <p>Get started by adding your first department.</p>
          </div>
        ) : (
          <div className="grid-table-wrapper">
            <table className="grid-table">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Short Name</th>
                  <th>Chairman</th>
                  <th>Publications</th>
                  <th>Status</th>
                  <th className="grid-actions-header">Actions</th>
                </tr>
              </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>{dept.department_name}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ color: '#6b7280' }}>{dept.short_name}</div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>{dept.chairman_name || 'N/A'}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>{dept.chairman_email || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>Journal: {dept.journal_publications}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>Magazine: {dept.magazine_publications}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`grid-status ${dept.is_first_year_department ? 'active' : 'inactive'}`}>
                      {dept.is_first_year_department ? 'First Year' : 'Regular'}
                    </span>
                  </td>
                  <td className="grid-actions">
                    <button
                      className="grid-action-btn edit"
                      onClick={() => handleEdit(dept)}
                      title="Edit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      className="grid-action-btn delete"
                      onClick={() => handleDelete(dept.id!)}
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}

        {/* Grid Footer */}
        <div className="grid-footer">
          {pagination.totalPages > 1 ? (
            <>
              <div className="grid-pagination">
                <button
                  className="grid-pagination-btn"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Previous
                </button>
                
                <div className="grid-pagination">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`grid-pagination-btn ${page === pagination.currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  className="grid-pagination-btn"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div>
                Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalCount)} of {pagination.totalCount} entries
              </div>
            </>
          ) : (
            <div>Total: {departments.length} items</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Departments;
