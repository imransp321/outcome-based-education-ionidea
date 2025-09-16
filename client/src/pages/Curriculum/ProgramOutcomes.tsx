import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import ValidationPopup from '../../components/ValidationPopup';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

interface ProgramOutcome {
  id: number;
  curriculum_regulation_id: number;
  po_reference: string;
  pso_flag: boolean;
  po_type: string;
  map_ga?: string;
  po_statement: string;
  standard: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  curriculum_batch: string;
  program_name: string;
  department_name: string;
}

interface CurriculumRegulation {
  id: number;
  curriculum_batch: string;
  program_name: string;
  department_name: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const ProgramOutcomes: React.FC = () => {
  const [programOutcomes, setProgramOutcomes] = useState<ProgramOutcome[]>([]);
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

  const [formData, setFormData] = useState({
    curriculum_regulation_id: '',
    po_reference: '',
    pso_flag: false,
    po_type: '',
    map_ga: '',
    po_statement: '',
    standard: 'NBA'
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
      const response = await configAPI.programOutcomes.getCurriculumRegulations();
      setCurriculumRegulations(response.data.data);
    } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to fetch curriculum regulations' });
      setShowMessageModal(true);
    }
  }, []);

  // Fetch program outcomes
  const fetchProgramOutcomes = useCallback(async (page = 1) => {
    if (!selectedCurriculum) {
      setProgramOutcomes([]);
      return;
    }

      setLoading(true);
    try {
      const params: any = {
        page,
        limit: 10,
        curriculum_regulation_id: selectedCurriculum,
        standard: 'NBA'
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await configAPI.programOutcomes.getAll(params);
        setProgramOutcomes(response.data.data);
        setPagination(response.data.pagination);
    } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to fetch program outcomes' });
      setShowMessageModal(true);
    } finally {
      setLoading(false);
    }
  }, [selectedCurriculum, searchTerm]);

  // Load data on component mount
  useEffect(() => {
    fetchCurriculumRegulations();
  }, [fetchCurriculumRegulations]);

  // Fetch program outcomes when curriculum changes
  useEffect(() => {
    if (selectedCurriculum) {
      fetchProgramOutcomes(1);
    }
  }, [selectedCurriculum, fetchProgramOutcomes]);

  // Handle curriculum change
  const handleCurriculumChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurriculum(e.target.value);
    setSearchTerm('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };


  // Handle add new program outcome
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
      po_reference: '',
      pso_flag: false,
      po_type: '',
      map_ga: '',
      po_statement: '',
      standard: 'NBA'
    });
    setIsEditMode(false);
    setEditingId(null);
    setShowModal(true);
  };

  // Handle edit
  const handleEdit = (programOutcome: ProgramOutcome) => {
    setFieldErrors({});
    setMessage(null);
    setFormData({
      curriculum_regulation_id: programOutcome.curriculum_regulation_id.toString(),
      po_reference: programOutcome.po_reference,
      pso_flag: programOutcome.pso_flag,
      po_type: programOutcome.po_type,
      map_ga: programOutcome.map_ga || '',
      po_statement: programOutcome.po_statement,
      standard: programOutcome.standard
    });
    setIsEditMode(true);
    setEditingId(programOutcome.id);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = (id: number) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      setSaving(true);
      await configAPI.programOutcomes.delete(deletingId.toString());
      setMessage({ type: 'success', text: 'Program outcome deleted successfully' });
      setShowMessageModal(true);
      setShowDeleteModal(false);
      setDeletingId(null);
      fetchProgramOutcomes(pagination.currentPage);
      } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to delete program outcome' });
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
      po_reference: '',
      pso_flag: false,
      po_type: '',
      map_ga: '',
      po_statement: '',
      standard: 'NBA'
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

    if (!formData.po_reference.trim()) {
      errors.po_reference = 'PO reference is required';
      hasErrors = true;
    } else if (formData.po_reference.trim().length < 2) {
      errors.po_reference = 'PO reference must be at least 2 characters long';
      hasErrors = true;
    } else if (formData.po_reference.trim().length > 10) {
      errors.po_reference = 'PO reference must not exceed 10 characters';
      hasErrors = true;
    }

    if (!formData.po_type) {
      errors.po_type = 'PO type is required';
      hasErrors = true;
    }

    if (!formData.po_statement.trim()) {
      errors.po_statement = 'PO statement is required';
      hasErrors = true;
    } else if (formData.po_statement.trim().length < 10) {
      errors.po_statement = 'PO statement must be at least 10 characters long';
      hasErrors = true;
    } else if (formData.po_statement.trim().length > 2000) {
      errors.po_statement = 'PO statement must not exceed 2000 characters';
      hasErrors = true;
    }

    // Check for duplicate PO reference within the same curriculum regulation
    if (formData.po_reference && formData.curriculum_regulation_id) {
      const existingPO = programOutcomes.find(
        po => po.po_reference.toLowerCase() === formData.po_reference.toLowerCase() &&
                po.curriculum_regulation_id === parseInt(formData.curriculum_regulation_id) &&
                (!isEditMode || po.id !== editingId)
      );
      if (existingPO) {
        errors.po_reference = 'A PO with this reference already exists for this curriculum regulation';
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
        await configAPI.programOutcomes.update(editingId.toString(), data);
        setMessage({ type: 'success', text: 'Program outcome updated successfully!' });
      } else {
        await configAPI.programOutcomes.create(data);
        setMessage({ type: 'success', text: 'Program outcome created successfully!' });
      }

      setShowModal(false);
      setIsEditMode(false);
      setEditingId(null);
      setFieldErrors({});
      setFormData({
        curriculum_regulation_id: '',
        po_reference: '',
        pso_flag: false,
        po_type: '',
        map_ga: '',
        po_statement: '',
        standard: 'NBA'
      });
      fetchProgramOutcomes(pagination.currentPage);
    } catch (error: any) {
      
      let errorMessage = 'Failed to save program outcome';
      
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

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchProgramOutcomes(page);
  };

  // Get curriculum display name
  const getCurriculumDisplayName = (curriculum: CurriculumRegulation) => {
    return `${curriculum.curriculum_batch} - ${curriculum.program_name} (${curriculum.department_name})`;
  };


  // Add modal-open class to body when modal is open
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

  // PO Types for dropdown
  const poTypes = [
    'Engineering Knowledge',
    'Problem Analysis',
    'Design/Development of Solutions',
    'Conduct Investigations',
    'Modern Tool Usage',
    'Engineer and Society',
    'Environment and Sustainability',
    'Ethics',
    'Individual and Team Work',
    'Communication',
    'Project Management',
    'Life-long Learning',
    'Software Development',
    'System Design'
  ];

  // Map GA options
  const mapGAOptions = [
    'GA1', 'GA2', 'GA3', 'GA4', 'GA5', 'GA6', 'GA7', 'GA8', 'GA9', 'GA10', 'GA11', 'GA12'
  ];

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
        <h1>Program Outcomes</h1>
        <p>Manage Program Outcomes for curriculum batches</p>
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
                Add Program Outcome
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
                placeholder="Search Program Outcomes..."
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
                <p>Loading Program Outcomes...</p>
              </div>
            ) : programOutcomes.length === 0 ? (
              <div className="grid-empty">
                <div className="grid-empty-icon">🎯</div>
                <p>No Program Outcomes found</p>
                <p>Start by adding your first Program Outcome for this curriculum</p>
              </div>
            ) : (
              <>
                <div className="grid-table-wrapper">
                  <table className="grid-table">
                    <thead>
                      <tr>
                        <th>Program Outcome</th>
                        <th>Type</th>
                        <th>PSO Flag</th>
                        <th>Map GA</th>
                        <th>Statement</th>
                        <th>Standard</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {programOutcomes.map((po) => (
                        <tr key={po.id}>
                          <td>{po.po_reference}</td>
                          <td>{po.po_type}</td>
                          <td>
                            {po.pso_flag ? (
                              <span className="grid-status active">Yes</span>
                            ) : (
                              <span className="grid-status inactive">No</span>
                            )}
                          </td>
                          <td>{po.map_ga || '-'}</td>
                          <td>{truncateText(po.po_statement, 100)}</td>
                          <td>
                            <span className="grid-status active">{po.standard}</span>
                          </td>
                          <td>
                            <div className="grid-action-btn-container">
                              <button
                                className="grid-action-btn edit"
                                onClick={() => handleEdit(po)}
                                title="Edit"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                              </button>
                              <button
                                className="grid-action-btn delete"
                                onClick={() => handleDelete(po.id)}
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

                {/* Grid Footer */}
                <div className="grid-footer">
                  <div className="grid-pagination">
                    <button
                      className="grid-pagination-btn"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      Previous
                    </button>
                    <span className="grid-pagination-info">
                      Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} total)
                    </span>
                    <button
                      className="grid-pagination-btn"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="grid-empty">
            <div className="grid-empty-icon">📚</div>
            <p>Select a Curriculum Batch</p>
            <p>Please select a curriculum batch from the dropdown above to view and manage Program Outcomes</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && createPortal(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <h2>{isEditMode ? 'Edit Program Outcome' : 'Add New Program Outcome'}</h2>
                <p>Enter Program Outcome details below</p>
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
              <form id="program-outcome-form" onSubmit={handleSubmit} className="business-form">
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Program Outcome Details</h3>
                  
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label className="business-form-label">PO Reference *</label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          name="po_reference"
                          className={`business-form-input ${fieldErrors.po_reference ? 'is-invalid' : ''}`}
                          value={formData.po_reference}
                          onChange={handleInputChange}
                          placeholder="e.g., PO1, PSO1"
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {fieldErrors.po_reference && (
                        <div className="business-form-error">{fieldErrors.po_reference}</div>
                      )}
                    </div>

                    <div className="business-form-group">
                      <label className="business-form-label">PO Type *</label>
                      <div className="business-form-input-wrapper">
                        <select
                          name="po_type"
                          className={`business-form-input ${fieldErrors.po_type ? 'is-invalid' : ''}`}
                          value={formData.po_type}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select PO Type</option>
                          {poTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
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
                      {fieldErrors.po_type && (
                        <div className="business-form-error">{fieldErrors.po_type}</div>
                      )}
                    </div>

                    <div className="business-form-group">
                      <label className="business-form-label">Map GA</label>
                      <div className="business-form-input-wrapper">
                        <select
                          name="map_ga"
                          className="business-form-input"
                          value={formData.map_ga}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Map GA</option>
                          {mapGAOptions.map((ga) => (
                            <option key={ga} value={ga}>
                              {ga}
                            </option>
                          ))}
                        </select>
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.91.37 4.15 1.02" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="business-form-group">
                      <label className="business-form-label">Standard</label>
                      <div className="business-radio-group">
                        <label className="business-radio-item">
                          <input
                            type="radio"
                            name="standard"
                            value="NBA"
                            checked={formData.standard === 'NBA'}
                            onChange={handleInputChange}
                          />
                          <span className="business-radio-label">NBA</span>
                        </label>
                        <label className="business-radio-item">
                          <input
                            type="radio"
                            name="standard"
                            value="ABET"
                            checked={formData.standard === 'ABET'}
                            onChange={handleInputChange}
                          />
                          <span className="business-radio-label">ABET</span>
                        </label>
                        <label className="business-radio-item">
                      <input
                            type="radio"
                            name="standard"
                            value="CUSTOM"
                            checked={formData.standard === 'CUSTOM'}
                        onChange={handleInputChange}
                      />
                          <span className="business-radio-label">CUSTOM</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="business-form-group">
                    <label className="business-form-label">
                      <input
                        type="checkbox"
                        name="pso_flag"
                        checked={formData.pso_flag}
                      onChange={handleInputChange}
                      />
                      <span style={{ marginLeft: '8px' }}>PSO Flag (Program Specific Outcome)</span>
                    </label>
                  </div>

                  <div className="business-form-group">
                    <label className="business-form-label">PO Statement *</label>
                    <textarea
                      name="po_statement"
                      className={`business-form-textarea ${fieldErrors.po_statement ? 'is-invalid' : ''}`}
                      value={formData.po_statement}
                      onChange={handleInputChange}
                      placeholder="Enter the program outcome statement..."
                      rows={4}
                      required
                    />
                    <div className="business-form-help">
                      {formData.po_statement.length} of 2000 characters
                    </div>
                    {fieldErrors.po_statement && (
                      <div className="business-form-error">{fieldErrors.po_statement}</div>
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
                Cancel
              </button>
              <button
                type="submit"
                form="program-outcome-form"
                className="modal-btn modal-btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <div className="modal-spinner"></div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M17 21V13H7V21" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M7 3V8H12" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                )}
                {isEditMode ? 'Update PO' : 'Create PO'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div className="modal-overlay">
          <div className="modal modal-small">
            <div className="modal-header">
              <div className="modal-title">
                <h2>Delete Program Outcome</h2>
                <p>This action cannot be undone</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCancel}
                title="Close"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
            <div className="modal-content">
              <div className="modal-warning">
                <div className="modal-warning-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div className="modal-warning-content">
                  <h3>Are you sure you want to delete this program outcome?</h3>
                  <p>This action cannot be undone. The program outcome will be permanently removed from the system.</p>
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
                className="modal-btn modal-btn-danger"
                onClick={handleDeleteConfirm}
                disabled={saving}
              >
                {saving ? (
                  <div className="modal-spinner"></div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                  </svg>
                )}
                Delete PO
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Message Modal */}
      {showMessageModal && message && createPortal(
        <div className="modal-overlay">
          <div className="modal modal-small">
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
              <div className={`modal-message ${message.type === 'success' ? 'modal-message-success' : 'modal-message-error'}`}>
                <div className="modal-message-icon">
                  {message.type === 'success' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.9.37 4.13 1.02"></path>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                      <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </div>
                <div className="modal-message-content">
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
                  <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.9.37 4.13 1.02"></path>
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

export default ProgramOutcomes;
