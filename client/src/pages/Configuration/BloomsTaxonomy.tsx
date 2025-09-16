import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import ValidationPopup from '../../components/ValidationPopup';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

interface BloomsDomain {
  id: number;
  domain_name: string;
  domain_acronym: string;
  description: string;
  created_at: string;
}

interface BloomsLevel {
  id: number;
  domain_id: number;
  level_number: number | number[];
  level_name: string | string[];
  learning_characteristics: string;
  action_words: string[];
  domain_name: string;
  domain_acronym: string;
  created_at: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const BloomsTaxonomy: React.FC = () => {
  const [domains, setDomains] = useState<BloomsDomain[]>([]);
  const [levels, setLevels] = useState<BloomsLevel[]>([]);
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
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'domains' | 'levels'>('domains');
  const [showAccordion, setShowAccordion] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<'domain' | 'level' | null>(null);
  const [formData, setFormData] = useState({
    // Domain fields
    domain_name: '',
    domain_acronym: '',
    description: '',
    // Level fields
    domain_id: '',
    level_number: '' as string | string[],
    level_name: '' as string | string[],
    learning_characteristics: '',
    action_words: [] as string[]
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [successProgress, setSuccessProgress] = useState(100);

  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true);
      const response = await configAPI.blooms.getDomains({
        page: pagination?.currentPage || 1,
        limit: 10,
        search: searchTerm
      });
      
      if (response.data.data) {
        setDomains(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch Bloom\'s domains' });
    } finally {
      setLoading(false);
    }
  }, [pagination?.currentPage, searchTerm, setMessage]);

  const fetchLevels = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination?.currentPage || 1,
        limit: 10,
        search: searchTerm
      };
      
      if (selectedDomain) {
        // If a domain is selected, get levels for that domain only
        const response = await configAPI.blooms.getLevelsByDomain(selectedDomain.toString());
        setLevels(response.data.data);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: response.data.data.length,
          hasNext: false,
          hasPrev: false
        });
      } else {
        const response = await configAPI.blooms.getLevels(params);
        if (response.data.data) {
          setLevels(response.data.data);
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch Bloom\'s levels' });
    } finally {
      setLoading(false);
    }
  }, [pagination?.currentPage, searchTerm, selectedDomain, setMessage]);

  useEffect(() => {
    if (viewMode === 'domains') {
      fetchDomains();
    } else {
      fetchLevels();
    }
  }, [viewMode, pagination?.currentPage, searchTerm, selectedDomain, fetchDomains, fetchLevels]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    if (viewMode === 'domains') {
      fetchDomains();
    } else {
      fetchLevels();
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));

    // Clear error message and field-specific errors when user starts typing
    if (message && message.type === 'error') {
      setMessage(null);
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const levels = value.split(',').map(level => level.trim()).filter(level => level);
    setFormData(prev => ({
      ...prev,
      level_number: levels,
      level_name: levels // Assuming level names match level numbers for now
    }));

    // Clear error message when user starts typing
    if (message && message.type === 'error') {
      setMessage(null);
    }

    // Clear validation errors for level fields
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.level_number;
      delete newErrors.level_name;
      return newErrors;
    });
  };

  const handleActionWordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const words = value.split(',').map(word => word.trim()).filter(word => word);
    setFormData(prev => ({
      ...prev,
      action_words: words
    }));

    // Clear error message when user starts typing
    if (message && message.type === 'error') {
      setMessage(null);
    }

    // Clear validation error for action words
    if (validationErrors.action_words) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.action_words;
        return newErrors;
      });
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    // Clear any existing messages and validation errors
    setMessage(null);
    setValidationErrors({});

    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    if (editingType === 'domain') {
      // Domain validation
      if (!formData.domain_name.trim()) {
        errors.domain_name = 'Domain name is required';
        hasErrors = true;
      } else if (formData.domain_name.trim().length < 2) {
        errors.domain_name = 'Domain name must be at least 2 characters long';
        hasErrors = true;
      }

      if (!formData.domain_acronym.trim()) {
        errors.domain_acronym = 'Domain acronym is required';
        hasErrors = true;
      } else if (formData.domain_acronym.trim().length < 2) {
        errors.domain_acronym = 'Domain acronym must be at least 2 characters long';
        hasErrors = true;
      } else if (formData.domain_acronym.trim().length > 10) {
        errors.domain_acronym = 'Domain acronym must not exceed 10 characters';
        hasErrors = true;
      }
    } else {
      // Level validation
      if (!formData.domain_id) {
        errors.domain_id = 'Domain selection is required';
        hasErrors = true;
      }

      if (!formData.level_number || (Array.isArray(formData.level_number) && formData.level_number.length === 0)) {
        errors.level_number = 'Level numbers are required';
        hasErrors = true;
      } else if (Array.isArray(formData.level_number)) {
        // Validate each level number
        const invalidLevels = formData.level_number.filter(level => 
          isNaN(Number(level)) || Number(level) < 1 || Number(level) > 10
        );
        if (invalidLevels.length > 0) {
          errors.level_number = 'Level numbers must be between 1 and 10';
          hasErrors = true;
        }
      }

      if (!formData.level_name || (Array.isArray(formData.level_name) && formData.level_name.length === 0)) {
        errors.level_name = 'Level names are required';
        hasErrors = true;
      } else if (Array.isArray(formData.level_name)) {
        // Validate each level name
        const invalidNames = formData.level_name.filter(name => 
          !name.trim() || name.trim().length < 2
        );
        if (invalidNames.length > 0) {
          errors.level_name = 'Level names must be at least 2 characters long';
          hasErrors = true;
        }
      }

      if (formData.learning_characteristics && formData.learning_characteristics.trim().length < 10) {
        errors.learning_characteristics = 'Learning characteristics must be at least 10 characters long';
        hasErrors = true;
      }

      if (formData.action_words && formData.action_words.length > 0) {
        const invalidWords = formData.action_words.filter(word => 
          !word.trim() || word.trim().length < 2
        );
        if (invalidWords.length > 0) {
          errors.action_words = 'Action words must be at least 2 characters long';
          hasErrors = true;
        }
      }
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

  const handleAddNew = (type: 'domain' | 'level') => {
    setFormData({
      domain_name: '',
      domain_acronym: '',
      description: '',
      domain_id: '',
      level_number: '',
      level_name: '',
      learning_characteristics: '',
      action_words: []
    });
    setEditingId(null);
    setEditingType(type);
    setValidationErrors({});
    setMessage(null);
    setShowAccordion(true);
  };

  const handleEdit = (item: BloomsDomain | BloomsLevel, type: 'domain' | 'level') => {
    if (type === 'domain') {
      const domain = item as BloomsDomain;
      setFormData({
        domain_name: domain.domain_name,
        domain_acronym: domain.domain_acronym,
        description: domain.description || '',
        domain_id: '',
        level_number: '',
        level_name: '',
        learning_characteristics: '',
        action_words: []
      });
    } else {
      const level = item as BloomsLevel;
      setFormData({
        domain_name: '',
        domain_acronym: '',
        description: '',
        domain_id: level.domain_id.toString(),
        level_number: Array.isArray(level.level_number) ? level.level_number.join(', ') : level.level_number.toString(),
        level_name: Array.isArray(level.level_name) ? level.level_name.join(', ') : level.level_name,
        learning_characteristics: level.learning_characteristics || '',
        action_words: level.action_words || []
      });
    }
    setEditingId(item.id);
    setEditingType(type);
    setValidationErrors({});
    setMessage(null);
    setShowAccordion(true);
  };

  const handleDelete = async (id: number, type: 'domain' | 'level') => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        if (type === 'domain') {
          await configAPI.blooms.deleteDomain(id.toString());
        } else {
          await configAPI.blooms.deleteLevel(id.toString());
        }
        setMessage({ type: 'success', text: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!` });
        if (viewMode === 'domains') {
          fetchDomains();
        } else {
          fetchLevels();
        }
      } catch (error: any) {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || `Failed to delete ${type}` 
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
      if (editingType === 'domain') {
        const domainData = {
          domain_name: formData.domain_name,
          domain_acronym: formData.domain_acronym,
          description: formData.description
        };

        if (editingId) {
          await configAPI.blooms.updateDomain(editingId.toString(), domainData);
          setMessage({ type: 'success', text: 'Domain updated successfully!' });
        } else {
          await configAPI.blooms.createDomain(domainData);
          setMessage({ type: 'success', text: 'Domain created successfully!' });
        }
        fetchDomains();
      } else {
        const levelData = {
          domain_id: parseInt(formData.domain_id),
          level_number: Array.isArray(formData.level_number) 
            ? formData.level_number.map(num => parseInt(num.toString()))
            : parseInt(formData.level_number.toString()),
          level_name: Array.isArray(formData.level_name) 
            ? formData.level_name.join(', ')
            : formData.level_name,
          learning_characteristics: formData.learning_characteristics,
          action_words: formData.action_words
        };

        if (editingId) {
          await configAPI.blooms.updateLevel(editingId.toString(), levelData);
          setMessage({ type: 'success', text: 'Level updated successfully!' });
        } else {
          await configAPI.blooms.createLevel(levelData);
          setMessage({ type: 'success', text: 'Level created successfully!' });
        }
        fetchLevels();
      }
      
      setShowAccordion(false);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || `Failed to save ${editingType}` 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowAccordion(false);
    setFormData({
      domain_name: '',
      domain_acronym: '',
      description: '',
      domain_id: '',
      level_number: '',
      level_name: '',
      learning_characteristics: '',
      action_words: []
    });
    setEditingId(null);
    setEditingType(null);
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
      {/* Navigation Tabs */}
      <div className="business-navigation-tabs" style={{ 
        display: 'flex', 
        gap: '0', 
        marginBottom: '24px',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '0'
      }}>
        <button
          className={`business-nav-tab ${viewMode === 'domains' ? 'business-nav-tab-active' : 'business-nav-tab-inactive'}`}
          onClick={() => setViewMode('domains')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: viewMode === 'domains' ? '#3b82f6' : 'transparent',
            color: viewMode === 'domains' ? 'white' : '#6b7280',
            borderRadius: '8px 8px 0 0',
            fontFamily: 'Calibri, sans-serif',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderBottom: viewMode === 'domains' ? '2px solid #3b82f6' : '2px solid transparent'
          }}
        >
          Domains
        </button>
        <button
          className={`business-nav-tab ${viewMode === 'levels' ? 'business-nav-tab-active' : 'business-nav-tab-inactive'}`}
          onClick={() => setViewMode('levels')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: viewMode === 'levels' ? '#3b82f6' : 'transparent',
            color: viewMode === 'levels' ? 'white' : '#6b7280',
            borderRadius: '8px 8px 0 0',
            fontFamily: 'Calibri, sans-serif',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderBottom: viewMode === 'levels' ? '2px solid #3b82f6' : '2px solid transparent'
          }}
        >
          Levels
        </button>
      </div>

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

      {/* Validation Popup */}
      <ValidationPopup
        isOpen={!!(message && message.type === 'error')}
        type="error"
        message={message?.text || ''}
        onClose={() => setMessage(null)}
      />

      {/* Modal */}
      {showAccordion && createPortal(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <h2>
                  {editingId 
                    ? `Edit ${editingType === 'domain' ? 'Domain' : 'Level'}` 
                    : `Add new ${editingType === 'domain' ? 'Domain' : 'Level'}`
                  }
                </h2>
                <p>Enter {editingType === 'domain' ? 'domain' : 'level'} details below</p>
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
              <form id="blooms-form" onSubmit={handleSubmit} className="business-form">
                {editingType === 'domain' ? (
                  // Domain Form
                  <div className="business-form-section">
                    <h3 className="business-form-section-title">Domain information</h3>
                    <div className="business-form-grid">
                      <div className="business-form-group">
                        <label htmlFor="domain_name" className="business-form-label">
                          Domain Name <span className="required">*</span>
                        </label>
                        <div className="business-form-input-wrapper">
                          <input
                            type="text"
                            id="domain_name"
                            name="domain_name"
                            className={`business-form-input ${validationErrors.domain_name ? 'is-invalid' : ''}`}
                            value={formData.domain_name}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., Cognitive, Affective, Psychomotor"
                          />
                          <div className="business-form-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.domain_name && (
                          <div className="business-form-error">{validationErrors.domain_name}</div>
                        )}
                      </div>
                      <div className="business-form-group">
                        <label htmlFor="domain_acronym" className="business-form-label">
                          Acronym <span className="required">*</span>
                        </label>
                        <div className="business-form-input-wrapper">
                          <input
                            type="text"
                            id="domain_acronym"
                            name="domain_acronym"
                            className={`business-form-input ${validationErrors.domain_acronym ? 'is-invalid' : ''}`}
                            value={formData.domain_acronym}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., COG, AFF, PSY"
                          />
                          <div className="business-form-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.domain_acronym && (
                          <div className="business-form-error">{validationErrors.domain_acronym}</div>
                        )}
                      </div>
                    </div>
                    <div className="business-form-group business-form-group-full">
                      <label htmlFor="description" className="business-form-label">Description</label>
                      <div className="business-form-textarea-wrapper">
                        <textarea
                          id="description"
                          name="description"
                          className="business-form-textarea"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Brief description of this domain..."
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
                    </div>
                  </div>
                ) : (
                  // Level Form
                  <div className="business-form-section">
                    <h3 className="business-form-section-title">Level information</h3>
                    <div className="business-form-grid">
                      <div className="business-form-group">
                        <label htmlFor="domain_id" className="business-form-label">
                          Domain <span className="required">*</span>
                        </label>
                        <div className="business-form-input-wrapper">
                          <select
                            id="domain_id"
                            name="domain_id"
                            className={`business-form-input ${validationErrors.domain_id ? 'is-invalid' : ''}`}
                            value={formData.domain_id}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select a domain</option>
                            {domains.map(domain => (
                              <option key={domain.id} value={domain.id}>
                                {domain.domain_name} ({domain.domain_acronym})
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
                        {validationErrors.domain_id && (
                          <div className="business-form-error">{validationErrors.domain_id}</div>
                        )}
                      </div>
                      <div className="business-form-group">
                        <label htmlFor="level_number" className="business-form-label">
                          Level Numbers <span className="required">*</span>
                        </label>
                        <div className="business-form-input-wrapper">
                          <input
                            type="text"
                            id="level_number"
                            name="level_number"
                            className={`business-form-input ${validationErrors.level_number ? 'is-invalid' : ''}`}
                            value={Array.isArray(formData.level_number) ? formData.level_number.join(', ') : formData.level_number}
                            onChange={handleLevelChange}
                            required
                            placeholder="e.g., 1, 2, 3 or 4, 5, 6"
                          />
                          <div className="business-form-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        <div className="business-form-help">
                          Enter multiple level numbers separated by commas
                        </div>
                        {validationErrors.level_number && (
                          <div className="business-form-error">{validationErrors.level_number}</div>
                        )}
                      </div>
                      <div className="business-form-group">
                        <label htmlFor="level_name" className="business-form-label">
                          Level Names <span className="required">*</span>
                        </label>
                        <div className="business-form-input-wrapper">
                          <input
                            type="text"
                            id="level_name"
                            name="level_name"
                            className={`business-form-input ${validationErrors.level_name ? 'is-invalid' : ''}`}
                            value={Array.isArray(formData.level_name) ? formData.level_name.join(', ') : formData.level_name}
                            onChange={handleLevelChange}
                            required
                            placeholder="e.g., Remember, Understand, Apply"
                          />
                          <div className="business-form-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        <div className="business-form-help">
                          Enter multiple level names separated by commas
                        </div>
                        {validationErrors.level_name && (
                          <div className="business-form-error">{validationErrors.level_name}</div>
                        )}
                      </div>
                    </div>
                    <div className="business-form-group business-form-group-full">
                      <label htmlFor="learning_characteristics" className="business-form-label">
                        Learning Characteristics
                      </label>
                      <div className="business-form-textarea-wrapper">
                        <textarea
                          id="learning_characteristics"
                          name="learning_characteristics"
                          className={`business-form-textarea ${validationErrors.learning_characteristics ? 'is-invalid' : ''}`}
                          value={formData.learning_characteristics}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Describe the learning characteristics for this level..."
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
                      {validationErrors.learning_characteristics && (
                        <div className="business-form-error">{validationErrors.learning_characteristics}</div>
                      )}
                    </div>
                    <div className="business-form-group business-form-group-full">
                      <label htmlFor="action_words" className="business-form-label">
                        Action Words
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          id="action_words"
                          name="action_words"
                          className={`business-form-input ${validationErrors.action_words ? 'is-invalid' : ''}`}
                          value={formData.action_words.join(', ')}
                          onChange={handleActionWordsChange}
                          placeholder="Enter action words separated by commas (e.g., define, identify, list)"
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      <small className="business-form-help">Separate multiple action words with commas</small>
                      {validationErrors.action_words && (
                        <div className="business-form-error">{validationErrors.action_words}</div>
                      )}
                    </div>
                  </div>
                )}

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
                form="blooms-form"
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
        <h1>Bloom's Taxonomy</h1>
        <p>Manage learning domains and levels for educational outcomes</p>
      </div>

      {/* Grid Container */}
      <div className="grid-container">
        {/* Grid Header */}
        <div className="grid-header">
          <div className="grid-header-actions">
            <button
              type="button"
              className="grid-add-button"
              onClick={() => handleAddNew(viewMode === 'domains' ? 'domain' : 'level')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add {viewMode === 'domains' ? 'Domain' : 'Level'}
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
                  placeholder={
                    viewMode === 'domains' 
                      ? "Search Domains..."
                      : "Search Levels..."
                  }
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
            <p>Loading Bloom's taxonomy data...</p>
          </div>
        ) : (
          <>
            {viewMode === 'domains' ? (
              // Domains Grid
              domains.length === 0 ? (
                <div className="grid-empty">
                  <div className="grid-empty-icon">🧠</div>
                  <p>No learning domains found</p>
                  <p>Get started by adding your first learning domain.</p>
                </div>
              ) : (
                <div className="grid-table-wrapper">
                  <table className="grid-table">
                    <thead>
                      <tr>
                        <th>Domain</th>
                        <th>Acronym</th>
                        <th>Description</th>
                        <th className="grid-actions-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domains.map((domain) => (
                        <tr key={domain.id}>
                          <td>
                            <div style={{ fontWeight: '600', color: '#1f2937' }}>{domain.domain_name}</div>
                          </td>
                          <td>
                            <div style={{ color: '#6b7280' }}>
                              <span style={{ 
                                background: '#f3f4f6', 
                                color: '#374151', 
                                padding: '2px 8px', 
                                borderRadius: '4px', 
                                fontSize: '12px',
                                fontWeight: '500'
                              }}>
                                {domain.domain_acronym}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ color: '#6b7280' }}>
                              {domain.description ? truncateText(domain.description, 100) : <span>-</span>}
                            </div>
                          </td>
                          <td className="grid-actions">
                            <button
                              className="grid-action-btn edit"
                              onClick={() => handleEdit(domain, 'domain')}
                              title="Edit"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button
                              className="grid-action-btn delete"
                              onClick={() => handleDelete(domain.id, 'domain')}
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
              )
            ) : (
              // Levels Grid
              levels.length === 0 ? (
                <div className="grid-empty">
                  <div className="grid-empty-icon">📚</div>
                  <p>No learning levels found</p>
                  <p>Get started by adding your first learning level.</p>
                </div>
              ) : (
                <div className="grid-table-wrapper">
                  <table className="grid-table">
                    <thead>
                      <tr>
                        <th>Domain</th>
                        <th>Level</th>
                        <th>Level Name</th>
                        <th>Characteristics</th>
                        <th>Action Words</th>
                        <th className="grid-actions-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {levels.map((level) => (
                        <tr key={level.id}>
                          <td>
                            <div style={{ color: '#6b7280' }}>
                              <span style={{ 
                                background: '#f3f4f6', 
                                color: '#374151', 
                                padding: '2px 8px', 
                                borderRadius: '4px', 
                                fontSize: '12px',
                                fontWeight: '500'
                              }}>
                                {level.domain_acronym}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ color: '#6b7280' }}>
                              {Array.isArray(level.level_number) 
                                ? level.level_number.join(', ')
                                : level.level_number
                              }
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '600', color: '#1f2937' }}>
                              {Array.isArray(level.level_name) 
                                ? level.level_name.join(', ')
                                : level.level_name
                              }
                            </div>
                          </td>
                          <td>
                            <div style={{ color: '#6b7280' }}>
                              {level.learning_characteristics ? truncateText(level.learning_characteristics, 80) : <span>-</span>}
                            </div>
                          </td>
                          <td>
                            <div style={{ color: '#6b7280' }}>
                              {level.action_words && level.action_words.length > 0 ? (
                                Array.isArray(level.action_words) 
                                  ? level.action_words.join(', ')
                                  : (level.action_words as string).split(/(?=[A-Z])/).join(', ')
                              ) : (
                                <span>-</span>
                              )}
                            </div>
                          </td>
                          <td className="grid-actions">
                            <button
                              className="grid-action-btn edit"
                              onClick={() => handleEdit(level, 'level')}
                              title="Edit"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button
                              className="grid-action-btn delete"
                              onClick={() => handleDelete(level.id, 'level')}
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
              )
            )}
          </>
        )}

        {/* Grid Footer */}
        <div className="grid-footer">
          {pagination && pagination.totalPages > 1 ? (
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
            <div>Total: {viewMode === 'domains' ? domains.length : levels.length} items</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloomsTaxonomy;
