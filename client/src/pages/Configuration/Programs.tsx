import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import ValidationPopup from '../../components/ValidationPopup';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

interface Program {
  id?: number;
  program_type_id: number;
  program_mode_id: number;
  specializations: string[];
  acronym: string;
  title: string;
  program_min_duration: number;
  program_max_duration: number;
  duration_unit: string;
  term_min_duration?: number;
  term_max_duration?: number;
  total_semesters: number;
  total_credits: number;
  term_min_credits?: number;
  term_max_credits?: number;
  nba_sar_type: string;
  course_types: string[];
  number_of_topics?: number;
  is_active: boolean;
  program_type_name?: string;
  program_mode_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProgramType {
  id: number;
  program_name: string;
}

interface ProgramMode {
  id: number;
  mode_name: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const Programs: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programTypes, setProgramTypes] = useState<ProgramType[]>([]);
  const [programModes, setProgramModes] = useState<ProgramMode[]>([]);
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
    program_type_id: '',
    program_mode_id: '',
    specializations: '',
    acronym: '',
    title: '',
    program_min_duration: 4,
    program_max_duration: 4,
    duration_unit: 'years',
    term_min_duration: '',
    term_max_duration: '',
    total_semesters: 8,
    total_credits: 120,
    term_min_credits: '',
    term_max_credits: '',
    nba_sar_type: '',
    course_types: '',
    number_of_topics: '',
    is_active: true
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [successProgress, setSuccessProgress] = useState(100);

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await configAPI.programs.getAll({
        page: pagination.currentPage,
        limit: 10,
        search: searchTerm
      });
      
      if (response.data.data) {
        setPrograms(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch programs' });
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, searchTerm, setMessage]);

  useEffect(() => {
    fetchPrograms();
    fetchLookupData();
  }, [pagination.currentPage, searchTerm, fetchPrograms]);

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

  const fetchLookupData = async () => {
    try {
      const [typesRes, modesRes] = await Promise.all([
        configAPI.programTypes.getAll(),
        configAPI.programModes.getAll()
      ]);
      
      setProgramTypes(typesRes.data.data);
      setProgramModes(modesRes.data.data);
    } catch (error) {
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    fetchPrograms();
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Validate form data
  const validateForm = (): boolean => {
    // Clear any existing messages and validation errors
    setMessage(null);
    setValidationErrors({});

    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    // Check required fields
    if (!formData.program_type_id) {
      errors.program_type_id = 'Program type is required';
      hasErrors = true;
    }

    if (!formData.program_mode_id) {
      errors.program_mode_id = 'Program mode is required';
      hasErrors = true;
    }

    if (!formData.acronym.trim()) {
      errors.acronym = 'Acronym is required';
      hasErrors = true;
    } else if (formData.acronym.trim().length < 2) {
      errors.acronym = 'Acronym must be at least 2 characters long';
      hasErrors = true;
    } else if (formData.acronym.trim().length > 10) {
      errors.acronym = 'Acronym must not exceed 10 characters';
      hasErrors = true;
    }

    if (!formData.title.trim()) {
      errors.title = 'Program title is required';
      hasErrors = true;
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Program title must be at least 3 characters long';
      hasErrors = true;
    } else if (formData.title.trim().length > 100) {
      errors.title = 'Program title must not exceed 100 characters';
      hasErrors = true;
    }

    // Validate numeric fields
    if (formData.program_min_duration < 1) {
      errors.program_min_duration = 'Minimum duration must be at least 1';
      hasErrors = true;
    }

    if (formData.program_max_duration < 1) {
      errors.program_max_duration = 'Maximum duration must be at least 1';
      hasErrors = true;
    }

    if (formData.program_min_duration > formData.program_max_duration) {
      errors.program_max_duration = 'Maximum duration must be greater than or equal to minimum duration';
      hasErrors = true;
    }

    if (formData.total_semesters < 1) {
      errors.total_semesters = 'Total semesters must be at least 1';
      hasErrors = true;
    }

    if (formData.total_credits < 1) {
      errors.total_credits = 'Total credits must be at least 1';
      hasErrors = true;
    }

    // Validate required numeric fields
    if (!formData.term_min_duration || formData.term_min_duration.trim() === '') {
      errors.term_min_duration = 'Term minimum duration is required';
      hasErrors = true;
    } else if (parseInt(formData.term_min_duration) < 1) {
      errors.term_min_duration = 'Term minimum duration must be at least 1';
      hasErrors = true;
    }

    if (!formData.term_max_duration || formData.term_max_duration.trim() === '') {
      errors.term_max_duration = 'Term maximum duration is required';
      hasErrors = true;
    } else if (parseInt(formData.term_max_duration) < 1) {
      errors.term_max_duration = 'Term maximum duration must be at least 1';
      hasErrors = true;
    }

    if (formData.term_min_duration && formData.term_max_duration && 
        parseInt(formData.term_min_duration) > parseInt(formData.term_max_duration)) {
      errors.term_max_duration = 'Term maximum duration must be greater than or equal to minimum duration';
      hasErrors = true;
    }

    if (!formData.term_min_credits || formData.term_min_credits.trim() === '') {
      errors.term_min_credits = 'Term minimum credits is required';
      hasErrors = true;
    } else if (parseInt(formData.term_min_credits) < 1) {
      errors.term_min_credits = 'Term minimum credits must be at least 1';
      hasErrors = true;
    }

    if (!formData.term_max_credits || formData.term_max_credits.trim() === '') {
      errors.term_max_credits = 'Term maximum credits is required';
      hasErrors = true;
    } else if (parseInt(formData.term_max_credits) < 1) {
      errors.term_max_credits = 'Term maximum credits must be at least 1';
      hasErrors = true;
    }

    if (formData.term_min_credits && formData.term_max_credits && 
        parseInt(formData.term_min_credits) > parseInt(formData.term_max_credits)) {
      errors.term_max_credits = 'Term maximum credits must be greater than or equal to minimum credits';
      hasErrors = true;
    }

    if (!formData.number_of_topics || formData.number_of_topics.trim() === '') {
      errors.number_of_topics = 'Number of topics is required';
      hasErrors = true;
    } else if (parseInt(formData.number_of_topics) < 1) {
      errors.number_of_topics = 'Number of topics must be at least 1';
      hasErrors = true;
    }

    // Validate required text fields
    if (!formData.specializations.trim()) {
      errors.specializations = 'Specializations are required';
      hasErrors = true;
    }

    if (!formData.course_types.trim()) {
      errors.course_types = 'Course types are required';
      hasErrors = true;
    }

    if (!formData.nba_sar_type.trim()) {
      errors.nba_sar_type = 'NBA SAR Type is required';
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
      program_type_id: '',
      program_mode_id: '',
      specializations: '',
      acronym: '',
      title: '',
      program_min_duration: 4,
      program_max_duration: 4,
      duration_unit: 'years',
      term_min_duration: '',
      term_max_duration: '',
      total_semesters: 8,
      total_credits: 120,
      term_min_credits: '',
      term_max_credits: '',
      nba_sar_type: '',
      course_types: '',
      number_of_topics: '',
      is_active: true
    });
    setEditingId(null);
    setValidationErrors({});
    setMessage(null);
    setShowAccordion(true);
  };

  const handleEdit = (program: Program) => {
    setFormData({
      program_type_id: program.program_type_id.toString(),
      program_mode_id: program.program_mode_id.toString(),
      specializations: program.specializations.join(', '),
      acronym: program.acronym,
      title: program.title,
      program_min_duration: program.program_min_duration,
      program_max_duration: program.program_max_duration,
      duration_unit: program.duration_unit,
      term_min_duration: program.term_min_duration?.toString() || '',
      term_max_duration: program.term_max_duration?.toString() || '',
      total_semesters: program.total_semesters,
      total_credits: program.total_credits,
      term_min_credits: program.term_min_credits?.toString() || '',
      term_max_credits: program.term_max_credits?.toString() || '',
      nba_sar_type: program.nba_sar_type || '',
      course_types: program.course_types.join(', '),
      number_of_topics: program.number_of_topics?.toString() || '',
      is_active: program.is_active
    });
    setEditingId(program.id || null);
    setValidationErrors({});
    setMessage(null);
    setShowAccordion(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await configAPI.programs.delete(id.toString());
        setMessage({ type: 'success', text: 'Program deleted successfully!' });
        fetchPrograms();
      } catch (error: any) {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Failed to delete program' 
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
      const submitData = {
        ...formData,
        program_type_id: parseInt(formData.program_type_id),
        program_mode_id: parseInt(formData.program_mode_id),
        program_min_duration: typeof formData.program_min_duration === 'string' ? parseInt(formData.program_min_duration) : formData.program_min_duration,
        program_max_duration: typeof formData.program_max_duration === 'string' ? parseInt(formData.program_max_duration) : formData.program_max_duration,
        total_semesters: typeof formData.total_semesters === 'string' ? parseInt(formData.total_semesters) : formData.total_semesters,
        total_credits: typeof formData.total_credits === 'string' ? parseInt(formData.total_credits) : formData.total_credits,
        specializations: formData.specializations.split(',').map(s => s.trim()).filter(s => s),
        course_types: formData.course_types.split(',').map(s => s.trim()).filter(s => s),
        term_min_duration: formData.term_min_duration ? parseInt(formData.term_min_duration) : null,
        term_max_duration: formData.term_max_duration ? parseInt(formData.term_max_duration) : null,
        term_min_credits: formData.term_min_credits ? parseInt(formData.term_min_credits) : null,
        term_max_credits: formData.term_max_credits ? parseInt(formData.term_max_credits) : null,
        number_of_topics: formData.number_of_topics ? parseInt(formData.number_of_topics) : null
      };

      if (editingId) {
        await configAPI.programs.update(editingId.toString(), submitData);
        setMessage({ type: 'success', text: 'Program updated successfully!' });
      } else {
        await configAPI.programs.create(submitData);
        setMessage({ type: 'success', text: 'Program created successfully!' });
      }
      
      setShowAccordion(false);
      fetchPrograms();
    } catch (error: any) {
      
      let errorMessage = 'Failed to save program';
      
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

  const handleCancel = () => {
    setShowAccordion(false);
    setFormData({
      program_type_id: '',
      program_mode_id: '',
      specializations: '',
      acronym: '',
      title: '',
      program_min_duration: 4,
      program_max_duration: 4,
      duration_unit: 'years',
      term_min_duration: '',
      term_max_duration: '',
      total_semesters: 8,
      total_credits: 120,
      term_min_credits: '',
      term_max_credits: '',
      nba_sar_type: '',
      course_types: '',
      number_of_topics: '',
      is_active: true
    });
    setEditingId(null);
    setValidationErrors({});
    setMessage(null);
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
                <h2>{editingId ? 'Edit Program' : 'Add new Program'}</h2>
                <p>Enter program details below</p>
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
              <form id="program-form" onSubmit={handleSubmit} className="business-form">
                {/* Basic Information Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Basic information</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="program_type_id" className="business-form-label">
                        Program type <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <select
                          id="program_type_id"
                          name="program_type_id"
                          className={`business-form-input ${validationErrors.program_type_id ? 'is-invalid' : ''}`}
                          value={formData.program_type_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select program type</option>
                          {programTypes.map(type => (
                            <option key={type.id} value={type.id}>
                              {type.program_name}
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
                      {validationErrors.program_type_id && (
                        <div className="business-form-error">{validationErrors.program_type_id}</div>
                      )}
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="program_mode_id" className="business-form-label">
                        Program mode <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <select
                          id="program_mode_id"
                          name="program_mode_id"
                          className={`business-form-input ${validationErrors.program_mode_id ? 'is-invalid' : ''}`}
                          value={formData.program_mode_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select program mode</option>
                          {programModes.map(mode => (
                            <option key={mode.id} value={mode.id}>
                              {mode.mode_name}
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
                      {validationErrors.program_mode_id && (
                        <div className="business-form-error">{validationErrors.program_mode_id}</div>
                      )}
                    </div>
                  </div>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="acronym" className="business-form-label">
                        Acronym <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          id="acronym"
                          name="acronym"
                          className={`business-form-input ${validationErrors.acronym ? 'is-invalid' : ''}`}
                          value={formData.acronym}
                          onChange={handleInputChange}
                          placeholder="e.g., B.Tech, MBA, MCA"
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {validationErrors.acronym && (
                        <div className="business-form-error">{validationErrors.acronym}</div>
                      )}
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="title" className="business-form-label">
                        Program title <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          id="title"
                          name="title"
                          className={`business-form-input ${validationErrors.title ? 'is-invalid' : ''}`}
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="e.g., Bachelor of Technology"
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {validationErrors.title && (
                        <div className="business-form-error">{validationErrors.title}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Program Duration Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Program duration</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="program_min_duration" className="business-form-label">
                        Minimum duration <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="number"
                          id="program_min_duration"
                          name="program_min_duration"
                          className={`business-form-input ${validationErrors.program_min_duration ? 'is-invalid' : ''}`}
                          value={formData.program_min_duration}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {validationErrors.program_min_duration && (
                        <div className="business-form-error">{validationErrors.program_min_duration}</div>
                      )}
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="program_max_duration" className="business-form-label">
                        Maximum duration <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="number"
                          id="program_max_duration"
                          name="program_max_duration"
                          className={`business-form-input ${validationErrors.program_max_duration ? 'is-invalid' : ''}`}
                          value={formData.program_max_duration}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {validationErrors.program_max_duration && (
                        <div className="business-form-error">{validationErrors.program_max_duration}</div>
                      )}
                    </div>
                  </div>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="duration_unit" className="business-form-label">
                        Duration unit <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <select
                          id="duration_unit"
                          name="duration_unit"
                          className="business-form-input"
                          value={formData.duration_unit}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="years">Years</option>
                          <option value="months">Months</option>
                          <option value="weeks">Weeks</option>
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
                    <div className="business-form-group">
                      {/* Empty div to maintain grid layout */}
                    </div>
                  </div>
                </div>

                {/* Term Duration Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Term duration</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="term_min_duration" className="business-form-label">
                        Term minimum duration <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="number"
                          id="term_min_duration"
                          name="term_min_duration"
                          className={`business-form-input ${validationErrors.term_min_duration ? 'is-invalid' : ''}`}
                          value={formData.term_min_duration}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {validationErrors.term_min_duration && (
                        <div className="business-form-error">{validationErrors.term_min_duration}</div>
                      )}
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="term_max_duration" className="business-form-label">
                        Term maximum duration <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="number"
                          id="term_max_duration"
                          name="term_max_duration"
                          className={`business-form-input ${validationErrors.term_max_duration ? 'is-invalid' : ''}`}
                          value={formData.term_max_duration}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {validationErrors.term_max_duration && (
                        <div className="business-form-error">{validationErrors.term_max_duration}</div>
                      )}
                    </div>
                  </div>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="total_semesters" className="business-form-label">
                        Total semesters <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="number"
                          id="total_semesters"
                          name="total_semesters"
                          className="business-form-input"
                          value={formData.total_semesters}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      {/* Empty div to maintain grid layout */}
                    </div>
                  </div>
                </div>

                {/* Credits Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Credits</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="total_credits" className="business-form-label">
                        Program total credits <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="number"
                          id="total_credits"
                          name="total_credits"
                          className="business-form-input"
                          value={formData.total_credits}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="term_min_credits" className="business-form-label">
                        Term minimum credits <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="number"
                          id="term_min_credits"
                          name="term_min_credits"
                          className={`business-form-input ${validationErrors.term_min_credits ? 'is-invalid' : ''}`}
                          value={formData.term_min_credits}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {validationErrors.term_min_credits && (
                        <div className="business-form-error">{validationErrors.term_min_credits}</div>
                      )}
                    </div>
                  </div>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="term_max_credits" className="business-form-label">
                        Term maximum credits <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="number"
                          id="term_max_credits"
                          name="term_max_credits"
                          className={`business-form-input ${validationErrors.term_max_credits ? 'is-invalid' : ''}`}
                          value={formData.term_max_credits}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {validationErrors.term_max_credits && (
                        <div className="business-form-error">{validationErrors.term_max_credits}</div>
                      )}
                    </div>
                    <div className="business-form-group">
                      {/* Empty div to maintain grid layout */}
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Additional information</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="nba_sar_type" className="business-form-label">
                        NBA SAR type <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <select
                          id="nba_sar_type"
                          name="nba_sar_type"
                          className={`business-form-input ${validationErrors.nba_sar_type ? 'is-invalid' : ''}`}
                          value={formData.nba_sar_type}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select NBA SAR type</option>
                          <option value="NBA">NBA (National Board of Accreditation)</option>
                          <option value="SAR">SAR (Self Assessment Report)</option>
                          <option value="Both">Both NBA & SAR</option>
                          <option value="None">None</option>
                        </select>
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {validationErrors.nba_sar_type && (
                        <div className="business-form-error">{validationErrors.nba_sar_type}</div>
                      )}
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="number_of_topics" className="business-form-label">Number of topics <span className="required">*</span></label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="number"
                          id="number_of_topics"
                          name="number_of_topics"
                          className={`business-form-input ${validationErrors.number_of_topics ? 'is-invalid' : ''}`}
                          value={formData.number_of_topics}
                          onChange={handleInputChange}
                          min="1"
                          placeholder="Enter number of topics"
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {validationErrors.number_of_topics && (
                        <div className="business-form-error">{validationErrors.number_of_topics}</div>
                      )}
                    </div>
                  </div>
                  <div className="business-form-group business-form-group-full">
                    <label htmlFor="specializations" className="business-form-label">Specializations <span className="required">*</span></label>
                    <div className="business-form-input-wrapper">
                      <input
                        type="text"
                        id="specializations"
                        name="specializations"
                        className={`business-form-input ${validationErrors.specializations ? 'is-invalid' : ''}`}
                        value={formData.specializations}
                        onChange={handleInputChange}
                        placeholder="Enter comma-separated specializations"
                        required
                      />
                      <div className="business-form-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {validationErrors.specializations && (
                        <div className="business-form-error">{validationErrors.specializations}</div>
                      )}
                    </div>
                  </div>
                  <div className="business-form-group business-form-group-full">
                    <label htmlFor="course_types" className="business-form-label">Course types <span className="required">*</span></label>
                    <div className="business-form-input-wrapper">
                      <input
                        type="text"
                        id="course_types"
                        name="course_types"
                        className={`business-form-input ${validationErrors.course_types ? 'is-invalid' : ''}`}
                        value={formData.course_types}
                        onChange={handleInputChange}
                        placeholder="Enter comma-separated course types (e.g., Humanities, Sciences, Engineering)"
                        required
                      />
                      <div className="business-form-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {validationErrors.course_types && (
                        <div className="business-form-error">{validationErrors.course_types}</div>
                      )}
                    </div>
                  </div>
                  <div className="business-form-group business-form-group-full">
                    <div className="business-form-checkbox">
                      <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="is_active" className="business-form-label">Active program</label>
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
                form="program-form"
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
        <h1>Programs</h1>
        <p>Manage program information and details</p>
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
              Add Program
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
                  placeholder="Search Programs..."
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
            <p>Loading programs...</p>
          </div>
        ) : programs.length === 0 ? (
          <div className="grid-empty">
            <div className="grid-empty-icon">🎓</div>
            <p>No programs found</p>
            <p>Get started by adding your first program.</p>
          </div>
        ) : (
          <div className="grid-table-wrapper">
            <table className="grid-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Type</th>
                  <th>Mode</th>
                  <th>Duration</th>
                  <th>Semesters</th>
                  <th>NBA SAR</th>
                  <th className="grid-actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program) => (
                  <tr key={program.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>{program.title}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{program.acronym}</div>
                    </td>
                    <td>
                      <div style={{ color: '#6b7280' }}>
                        {program.program_type_name}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: '#6b7280' }}>
                        {program.program_mode_name}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: '#6b7280' }}>
                        {program.program_min_duration}-{program.program_max_duration} {program.duration_unit}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: '#6b7280' }}>{program.total_semesters} semesters</div>
                    </td>
                    <td>
                      <div style={{ color: '#6b7280' }}>
                        {program.nba_sar_type}
                      </div>
                    </td>
                    <td className="grid-actions">
                      <button
                        className="grid-action-btn edit"
                        onClick={() => handleEdit(program)}
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        className="grid-action-btn delete"
                        onClick={() => handleDelete(program.id!)}
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
            <div>Total: {programs.length} items</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Programs;
