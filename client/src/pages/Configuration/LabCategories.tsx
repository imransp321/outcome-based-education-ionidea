import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import ValidationPopup from '../../components/ValidationPopup';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

interface LabCategory {
  id?: number;
  category_name: string;
  description: string;
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

const LabCategories: React.FC = () => {
  const [labCategories, setLabCategories] = useState<LabCategory[]>([]);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [showAccordion, setShowAccordion] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    category_name: '',
    description: ''
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [successProgress, setSuccessProgress] = useState(100);

  useEffect(() => {
    fetchLabCategories();
  }, [pagination.currentPage, searchTerm]);

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

  const fetchLabCategories = async () => {
    try {
      setLoading(true);
      const response = await configAPI.labCategories.getAll({
        page: pagination.currentPage,
        limit: 10,
        search: searchTerm
      });
      
      if (response.data.data) {
        setLabCategories(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch lab categories' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error message and field-specific errors when user starts typing
    if (message && message.type === 'error') {
      setMessage(null);
    }
    
    // Clear field-specific error
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchLabCategories();
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Validate form data
  const validateForm = (): boolean => {
    // Clear any existing validation errors
    setValidationErrors({});

    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    // Check required fields
    if (!formData.category_name.trim()) {
      errors.category_name = 'Category name is required';
      hasErrors = true;
    } else if (formData.category_name.trim().length < 2) {
      errors.category_name = 'Category name must be at least 2 characters long';
      hasErrors = true;
    } else if (formData.category_name.trim().length > 50) {
      errors.category_name = 'Category name must not exceed 50 characters';
      hasErrors = true;
    }

    // Validate description if provided
    if (formData.description && formData.description.trim().length > 500) {
      errors.description = 'Description must not exceed 500 characters';
      hasErrors = true;
    }

    if (hasErrors) {
      setValidationErrors(errors);
      // Show first validation error as popup
      const firstError = Object.values(errors)[0];
      setMessage({ type: 'error', text: firstError });
      return false;
    }

    return true;
  };

  const handleAddNew = () => {
    setFormData({
      category_name: '',
      description: ''
    });
    setEditingId(null);
    setValidationErrors({});
    setMessage(null);
    setShowAccordion(true);
  };

  const handleEdit = (category: LabCategory) => {
    setFormData({
      category_name: category.category_name,
      description: category.description || ''
    });
    setEditingId(category.id || null);
    setValidationErrors({});
    setMessage(null);
    setShowAccordion(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this lab category?')) {
      try {
        await configAPI.labCategories.delete(id.toString());
        setMessage({ type: 'success', text: 'Lab category deleted successfully!' });
        fetchLabCategories();
      } catch (error: any) {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Failed to delete lab category' 
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Validate form before submission
    if (!validateForm()) {
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        await configAPI.labCategories.update(editingId.toString(), formData);
        setMessage({ type: 'success', text: 'Lab category updated successfully!' });
      } else {
        await configAPI.labCategories.create(formData);
        setMessage({ type: 'success', text: 'Lab category created successfully!' });
      }
      
      setShowAccordion(false);
      fetchLabCategories();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save lab category' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowAccordion(false);
    setFormData({
      category_name: '',
      description: ''
    });
    setEditingId(null);
    setValidationErrors({});
    setMessage(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
                <h2>{editingId ? 'Edit Lab Category' : 'Add new Lab Category'}</h2>
                <p>Enter lab category details below</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCancel}
                title="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <form id="lab-category-form" onSubmit={handleSubmit} className="business-form">
                {/* Basic Information Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Basic information</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group business-form-group-full">
                      <label htmlFor="category_name" className="business-form-label">
                        Category Name <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          id="category_name"
                          name="category_name"
                          className={`business-form-input ${validationErrors.category_name ? 'is-invalid' : ''}`}
                          value={formData.category_name}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., Computer Lab, Physics Lab, Chemistry Lab"
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {validationErrors.category_name && (
                        <div className="business-form-error">{validationErrors.category_name}</div>
                      )}
                    </div>

                    <div className="business-form-group business-form-group-full">
                      <label htmlFor="description" className="business-form-label">Description</label>
                      <div className="business-form-textarea-wrapper">
                        <textarea
                          id="description"
                          name="description"
                          className={`business-form-textarea ${validationErrors.description ? 'is-invalid' : ''}`}
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Detailed description of the lab category and its purpose..."
                        />
                        <div className="business-form-textarea-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {validationErrors.description && (
                        <div className="business-form-error">{validationErrors.description}</div>
                      )}
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Cancel
              </button>
              <button 
                type="submit" 
                form="lab-category-form"
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
        <h1>Lab Categories</h1>
        <p>Manage lab category information and details</p>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add Lab Category
            </button>
            <div className="grid-header-spacer"></div>
            <div className="grid-search">
              <svg className="grid-search-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search Lab Categories..."
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
            <p>Loading lab categories...</p>
          </div>
        ) : labCategories.length === 0 ? (
          <div className="grid-empty">
            <div className="grid-empty-icon">🔬</div>
            <p>No lab categories found</p>
            <p>Get started by adding your first lab category.</p>
          </div>
        ) : (
          <div className="grid-table-wrapper">
            <table className="grid-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th className="grid-actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {labCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🔬</span>
                        {category.category_name}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: '#6b7280' }}>
                        {category.description ? truncateText(category.description, 120) : '-'}
                      </div>
                    </td>
                    <td className="grid-actions">
                      <button
                        className="grid-action-btn edit"
                        onClick={() => handleEdit(category)}
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        className="grid-action-btn delete"
                        onClick={() => handleDelete(category.id!)}
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
            <div>Total: {labCategories.length} items</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabCategories;
