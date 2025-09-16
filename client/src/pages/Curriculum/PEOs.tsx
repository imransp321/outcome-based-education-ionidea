import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import ValidationPopup from '../../components/ValidationPopup';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';
import '../../styles/shared/pagination.css';

interface PEO {
  id: number;
  curriculum_regulation_id: number;
  peo_number: string;
  peo_title: string;
  peo_description: string;
  peo_statement: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  curriculum_batch: string;
  program_name: string;
  program_acronym: string;
  department_name: string;
  department_acronym: string;
}

interface CurriculumRegulation {
  id: number;
  curriculum_batch: string;
  program_name: string;
  program_acronym: string;
  department_name: string;
  department_acronym: string;
  from_year: number;
  to_year: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const PEOs: React.FC = () => {
  
  // State management
  const [peos, setPEOs] = useState<PEO[]>([]);
  const [curriculumRegulations, setCurriculumRegulations] = useState<CurriculumRegulation[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [successProgress, setSuccessProgress] = useState(100);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  // Form data
  const [formData, setFormData] = useState({
    curriculum_regulation_id: '',
    peo_number: '',
    peo_title: '',
    peo_description: '',
    peo_statement: ''
  });

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

  // Utility functions
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };


  // Fetch curriculum regulations for dropdown
  const fetchCurriculumRegulations = useCallback(async () => {
    try {
      const response = await configAPI.peos.getCurriculumRegulations();
      setCurriculumRegulations(response.data.data);
    } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to fetch curriculum regulations' });
      setShowMessageModal(true);
    }
  }, []);

  // Fetch PEOs
  const fetchPEOs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 10
      };

      if (selectedCurriculum) {
        params.curriculum_regulation_id = selectedCurriculum;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await configAPI.peos.getAll(params);
      setPEOs(response.data.data);
      setPagination(response.data.pagination);
    } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to fetch PEOs' });
      setShowMessageModal(true);
    } finally {
      setLoading(false);
    }
  }, [selectedCurriculum, searchTerm]);

  // Load data on component mount
  useEffect(() => {
    fetchCurriculumRegulations();
  }, [fetchCurriculumRegulations]);

  // Manage modal body class
  useEffect(() => {
    if (showModal || showDeleteModal || showMessageModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showModal, showDeleteModal, showMessageModal]);

  // Fetch PEOs when curriculum or search changes
  useEffect(() => {
    if (selectedCurriculum) {
      fetchPEOs(1);
    } else {
      setPEOs([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
      });
    }
  }, [selectedCurriculum, fetchPEOs]);

  // Handle curriculum selection
  const handleCurriculumChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurriculum(e.target.value);
    setSearchTerm('');
  };


  // Handle add new PEO
  const handleAddNew = () => {
    if (!selectedCurriculum) {
      setMessage({ type: 'error', text: 'Please select a curriculum first' });
      setShowMessageModal(true);
      return;
    }
    setFieldErrors({});
    setMessage(null);
    setFormData({
      curriculum_regulation_id: selectedCurriculum,
      peo_number: '',
      peo_title: '',
      peo_description: '',
      peo_statement: ''
    });
    setIsEditMode(false);
    setEditingId(null);
    setShowModal(true);
  };

  // Handle edit PEO
  const handleEdit = (peo: PEO) => {
    setIsEditMode(true);
    setEditingId(peo.id);
    setFieldErrors({});
    setMessage(null);
    setFormData({
      curriculum_regulation_id: peo.curriculum_regulation_id.toString(),
      peo_number: peo.peo_number,
      peo_title: peo.peo_title,
      peo_description: peo.peo_description,
      peo_statement: peo.peo_statement
    });
    setShowModal(true);
  };

  // Handle delete PEO
  const handleDelete = (id: number) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  // Handle form submission
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
      const data = {
        ...formData,
        curriculum_regulation_id: parseInt(formData.curriculum_regulation_id)
      };

      if (isEditMode && editingId) {
        await configAPI.peos.update(editingId.toString(), data);
        setMessage({ type: 'success', text: 'PEO updated successfully!' });
      } else {
        await configAPI.peos.create(data);
        setMessage({ type: 'success', text: 'PEO created successfully!' });
      }

      setShowModal(false);
      setIsEditMode(false);
      setEditingId(null);
      setFieldErrors({});
      setFormData({
        curriculum_regulation_id: '',
        peo_number: '',
        peo_title: '',
        peo_description: '',
        peo_statement: ''
      });
      fetchPEOs(pagination.currentPage);
    } catch (error: any) {
      
      let errorMessage = 'Failed to save PEO';
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors.map((err: any) => err.msg).join(', ');
        errorMessage = `Validation errors: ${validationErrors}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      setSaving(true);
      await configAPI.peos.delete(deletingId.toString());
      setMessage({ type: 'success', text: 'PEO deleted successfully' });
      setShowMessageModal(true);
      setShowDeleteModal(false);
      setDeletingId(null);
      fetchPEOs(pagination.currentPage);
    } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to delete PEO' });
      setShowMessageModal(true);
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setIsEditMode(false);
    setEditingId(null);
    setDeletingId(null);
    setFieldErrors({});
    setMessage(null);
    setFormData({
      curriculum_regulation_id: '',
      peo_number: '',
      peo_title: '',
      peo_description: '',
      peo_statement: ''
    });
  };

  // Handle message modal close
  const handleMessageClose = () => {
    setShowMessageModal(false);
    setMessage(null);
  };

  // Validate form data
  const validateForm = (): boolean => {
    // Clear any existing messages and validation errors
    setMessage(null);
    setFieldErrors({});

    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    // Check required fields
    if (!formData.curriculum_regulation_id) {
      errors.curriculum_regulation_id = 'Curriculum regulation is required';
      hasErrors = true;
    }

    if (!formData.peo_number.trim()) {
      errors.peo_number = 'PEO number is required';
      hasErrors = true;
    } else if (formData.peo_number.trim().length < 1) {
      errors.peo_number = 'PEO number must be at least 1 character long';
      hasErrors = true;
    } else if (formData.peo_number.trim().length > 10) {
      errors.peo_number = 'PEO number must not exceed 10 characters';
      hasErrors = true;
    }

    if (!formData.peo_title.trim()) {
      errors.peo_title = 'PEO title is required';
      hasErrors = true;
    } else if (formData.peo_title.trim().length < 3) {
      errors.peo_title = 'PEO title must be at least 3 characters long';
      hasErrors = true;
    } else if (formData.peo_title.trim().length > 100) {
      errors.peo_title = 'PEO title must not exceed 100 characters';
      hasErrors = true;
    }

    if (!formData.peo_description.trim()) {
      errors.peo_description = 'PEO description is required';
      hasErrors = true;
    } else if (formData.peo_description.trim().length < 10) {
      errors.peo_description = 'PEO description must be at least 10 characters long';
      hasErrors = true;
    } else if (formData.peo_description.trim().length > 500) {
      errors.peo_description = 'PEO description must not exceed 500 characters';
      hasErrors = true;
    }

    if (!formData.peo_statement.trim()) {
      errors.peo_statement = 'PEO statement is required';
      hasErrors = true;
    } else if (formData.peo_statement.trim().length < 10) {
      errors.peo_statement = 'PEO statement must be at least 10 characters long';
      hasErrors = true;
    } else if (formData.peo_statement.trim().length > 1000) {
      errors.peo_statement = 'PEO statement must not exceed 1000 characters';
      hasErrors = true;
    }

    // Check for duplicate PEO number within the same curriculum regulation
    if (formData.peo_number && formData.curriculum_regulation_id) {
      const existingPEO = peos.find(
        peo => peo.peo_number.toLowerCase() === formData.peo_number.toLowerCase() &&
                peo.curriculum_regulation_id === parseInt(formData.curriculum_regulation_id) &&
                (!isEditMode || peo.id !== editingId)
      );
      if (existingPEO) {
        errors.peo_number = 'A PEO with this number already exists for this curriculum regulation';
        hasErrors = true;
      }
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

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchPEOs(page);
  };

  // Get curriculum display name
  const getCurriculumDisplayName = (curriculum: CurriculumRegulation) => {
    return `${curriculum.curriculum_batch} - ${curriculum.program_name} (${curriculum.department_name})`;
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
              <div className="success-popup-text">
                <h3>Success!</h3>
                <p>{message.text}</p>
              </div>
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
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="error-popup-text">
                <h3>Error</h3>
                <p>{message.text}</p>
              </div>
              <button 
                className="error-popup-close"
                onClick={() => setMessage(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Page Header */}
      <div className="page-header">
        <h1>Program Educational Objectives (PEOs)</h1>
        <p>Manage Program Educational Objectives for curriculum batches</p>
      </div>

      {/* Curriculum Selection Header */}
      <div className="curriculum-selection-header">
        <div className="curriculum-selection-container">
          <div className="curriculum-batch-dropdown">
            <label htmlFor="curriculum-select" className="business-form-label">
              Curriculum Batch
            </label>
            <div className="business-form-input-wrapper">
              <select
                id="curriculum-select"
                value={selectedCurriculum}
                onChange={handleCurriculumChange}
                className="business-form-input"
              >
                <option value="">Select a curriculum batch...</option>
                {curriculumRegulations.map((curriculum) => (
                  <option key={curriculum.id} value={curriculum.id.toString()}>
                    {getCurriculumDisplayName(curriculum)}
                  </option>
                ))}
              </select>
              <div className="business-form-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid-container">
        {/* Grid Header - Only show when curriculum is selected */}
        {selectedCurriculum && (
          <div className="grid-header">
            <div className="grid-header-actions">
              <button
                className="grid-add-button"
                onClick={handleAddNew}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/>
                  <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Add PEO
              </button>
            </div>
            <div className="grid-header-spacer"></div>
            <div className="grid-search">
              <div className="grid-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <input
                type="text"
                className="grid-search-input"
                placeholder="Search PEOs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Grid Content */}
        {selectedCurriculum ? (
          <>
            {loading ? (
              <div className="grid-loading">
                <div className="grid-loading-icon">⏳</div>
                <p>Loading PEOs...</p>
              </div>
            ) : peos.length === 0 ? (
              <div className="grid-empty">
                <div className="grid-empty-icon">🎯</div>
                <p>No PEOs found</p>
                <p>Start by adding your first PEO for this curriculum</p>
              </div>
            ) : (
              <>
                <div className="grid-table-wrapper">
                <table className="grid-table">
                  <thead>
                    <tr>
                      <th>PEO Number</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Statement</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {peos.map((peo) => (
                      <tr key={peo.id}>
                        <td>{peo.peo_number}</td>
                        <td>{peo.peo_title}</td>
                        <td>{peo.peo_description ? truncateText(peo.peo_description, 60) : '-'}</td>
                        <td>{peo.peo_statement ? truncateText(peo.peo_statement, 50) : '-'}</td>
                        <td>
                          <div className="grid-action-btn-container">
                            <button
                              className="grid-action-btn edit"
                              onClick={() => handleEdit(peo)}
                              title="Edit"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </button>
                            <button
                              className="grid-action-btn delete"
                              onClick={() => handleDelete(peo.id)}
                              title="Delete"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalCount)} of {pagination.totalCount} PEOs
                </div>
                {pagination.totalPages > 1 && (
                  <div className="pagination-controls">
                    <div className="pagination-nav">
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.currentPage === 1}
                        title="First page"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M11 19L4 12L11 5M20 19L13 12L20 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrev}
                        title="Previous page"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      
                      <div className="pagination-pages">
                        {(() => {
                          const pages = [];
                          const startPage = Math.max(1, pagination.currentPage - 2);
                          const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);
                          
                          if (startPage > 1) {
                            pages.push(
                              <button 
                                key={1}
                                className="pagination-btn"
                                onClick={() => handlePageChange(1)}
                              >
                                1
                              </button>
                            );
                            if (startPage > 2) {
                              pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
                            }
                          }
                          
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <button 
                                key={i}
                                className={`pagination-btn ${i === pagination.currentPage ? 'active' : ''}`}
                                onClick={() => handlePageChange(i)}
                              >
                                {i}
                              </button>
                            );
                          }
                          
                          if (endPage < pagination.totalPages) {
                            if (endPage < pagination.totalPages - 1) {
                              pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
                            }
                            pages.push(
                              <button 
                                key={pagination.totalPages}
                                className="pagination-btn"
                                onClick={() => handlePageChange(pagination.totalPages)}
                              >
                                {pagination.totalPages}
                              </button>
                            );
                          }
                          
                          return pages;
                        })()}
                      </div>
                      
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNext}
                        title="Next page"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        title="Last page"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M13 5L20 12L13 19M4 5L11 12L4 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              </>
            )}
          </>
        ) : (
          <div className="grid-empty">
            <div className="grid-empty-icon">📚</div>
            <p>Select a Curriculum Batch</p>
            <p>Please select a curriculum batch from the dropdown above to view and manage PEOs</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && createPortal(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <h2>{isEditMode ? 'Edit PEO' : 'Add new PEO'}</h2>
                <p>Enter PEO details below</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCancel}
                title="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <form id="peo-form" onSubmit={handleSubmit} className="business-form">
                {/* Basic Information Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">PEO Information</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="peo_number" className="business-form-label">
                        PEO Number <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          id="peo_number"
                          name="peo_number"
                          className={`business-form-input ${fieldErrors.peo_number ? 'is-invalid' : ''}`}
                          value={formData.peo_number}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., PEO1, PEO2"
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {fieldErrors.peo_number && (
                        <div className="business-form-error">{fieldErrors.peo_number}</div>
                      )}
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="peo_title" className="business-form-label">
                        PEO Title <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          id="peo_title"
                          name="peo_title"
                          className={`business-form-input ${fieldErrors.peo_title ? 'is-invalid' : ''}`}
                          value={formData.peo_title}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., Technical Competence"
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {fieldErrors.peo_title && (
                        <div className="business-form-error">{fieldErrors.peo_title}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="business-form-group">
                    <label htmlFor="peo_description" className="business-form-label">
                      Description <span className="required">*</span>
                    </label>
                    <div className="business-form-input-wrapper">
                      <textarea
                        id="peo_description"
                        name="peo_description"
                        className={`business-form-textarea ${fieldErrors.peo_description ? 'is-invalid' : ''}`}
                        value={formData.peo_description}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        placeholder="Brief description of the PEO"
                      />
                      <div className="business-form-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    {fieldErrors.peo_description && (
                      <div className="business-form-error">{fieldErrors.peo_description}</div>
                    )}
                  </div>

                  <div className="business-form-group">
                    <label htmlFor="peo_statement" className="business-form-label">
                      PEO Statement <span className="required">*</span>
                    </label>
                    <div className="business-form-input-wrapper">
                      <textarea
                        id="peo_statement"
                        name="peo_statement"
                        className={`business-form-textarea ${fieldErrors.peo_statement ? 'is-invalid' : ''}`}
                        value={formData.peo_statement}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        placeholder="Detailed statement of the PEO"
                      />
                      <div className="business-form-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    {fieldErrors.peo_statement && (
                      <div className="business-form-error">{fieldErrors.peo_statement}</div>
                    )}
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
                type="button"
                className="modal-btn modal-btn-primary"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="modal-spinner"></div>
                    {isEditMode ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 3V8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {isEditMode ? 'Update' : 'Save'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <h2>Delete PEO</h2>
                <p>This action cannot be undone</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCancel}
                title="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <div className="business-warning">
                <div className="business-warning-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div className="business-warning-content">
                  <h3>Are you sure?</h3>
                  <p>This action cannot be undone. The PEO will be permanently deleted.</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn modal-btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-primary"
                onClick={handleDeleteConfirm}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="modal-spinner"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                      <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Delete PEO
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Message Modal */}
      {showMessageModal && message && createPortal(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <h2>{message.type === 'success' ? 'Success' : 'Error'}</h2>
                <p>{message.text}</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleMessageClose}
                title="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <div className={`business-message ${message.type === 'success' ? 'business-message-success' : 'business-message-error'}`}>
                <div className="business-message-icon">
                  {message.type === 'success' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                      <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </div>
                <div className="business-message-content">
                  <h3>{message.type === 'success' ? 'Operation Successful' : 'Operation Failed'}</h3>
                  <p>{message.text}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn modal-btn-primary"
                onClick={handleMessageClose}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                OK
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PEOs;
