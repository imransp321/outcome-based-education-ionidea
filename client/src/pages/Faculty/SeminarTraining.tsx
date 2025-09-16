import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import Grid from '../../components/Grid/Grid';
import ValidationPopup from '../../components/ValidationPopup';
import '../../styles/pages/Faculty/SeminarTraining.css';
import '../../styles/components/modals.css';

interface SeminarTrainingData {
  id: number;
  programTitle: string;
  type: string;
  eventOrganizer: string;
  venue: string;
  level: string;
  role: string;
  invitedDeputed: string;
  startDate: string;
  endDate: string;
  highlights: string;
  uploadFile?: string;
}

// API Response interface for database fields
interface SeminarTrainingAPIResponse {
  id: number;
  program_title: string;
  type: string;
  event_organizer: string;
  venue: string;
  level: string;
  role: string;
  invited_deputed: string;
  start_date: string;
  end_date: string;
  highlights: string | null;
  upload_file: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const SeminarTraining: React.FC = () => {
  const [data, setData] = useState<SeminarTrainingAPIResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAccordion, setShowAccordion] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    showPagination: false,
    onPageChange: (page: number) => handlePageChange(page)
  });
  
  // Form data state
  const [formData, setFormData] = useState({
    programTitle: '',
    type: '',
    eventOrganizer: '',
    venue: '',
    level: '',
    role: '',
    invitedDeputed: '',
    startDate: '',
    endDate: '',
    highlights: '',
    upload_file: ''
  });
  
  // File handling states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [existingFile, setExistingFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Utility function to get the correct base URL for static files
  const getStaticBaseUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace('/api', '');
  };

  // Fetch data from API
  const fetchData = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await configAPI.seminarTraining.getAll({
        page,
        limit: 10,
        search
      });

      if (response.data.success) {
        setData(response.data.data);
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.totalCount,
          itemsPerPage: 10,
          showPagination: response.data.pagination.totalCount > 10,
          onPageChange: (page: number) => handlePageChange(page)
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch seminar training data' });
      }
    } catch (error) {
      console.error('Error fetching seminar training:', error);
      setMessage({ type: 'error', text: 'Failed to fetch seminar training data' });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);


  const columns = [
    {
      key: 'slNo',
      title: 'Sl No.',
      width: '80px',
      render: (value: any, row: SeminarTrainingAPIResponse) => {
        const index = data.findIndex(item => item.id === row.id);
        return index + 1;
      }
    },
    {
      key: 'program_title',
      title: 'Program Title',
      width: '250px',
      render: (value: string) => (
        <div style={{ fontWeight: '600', color: '#1f2937' }}>{value}</div>
      )
    },
    {
      key: 'level',
      title: 'Level',
      width: '100px'
    },
    {
      key: 'event_organizer',
      title: 'Event Organizer',
      width: '200px'
    },
    {
      key: 'start_date',
      title: 'Date',
      width: '120px',
      render: (value: string, row: SeminarTrainingAPIResponse) => (
        <div>
          <div>{row.start_date}</div>
          {row.end_date && row.end_date !== row.start_date && (
            <div style={{ fontSize: '12px', color: '#6b7280' }}>to {row.end_date}</div>
          )}
        </div>
      )
    },
    {
      key: 'role',
      title: 'Your Role',
      width: '120px'
    }
  ];

  // Form validation
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.programTitle.trim()) {
      errors.programTitle = 'Program title is required';
    }
    if (!formData.type.trim()) {
      errors.type = 'Type is required';
    }
    if (!formData.eventOrganizer.trim()) {
      errors.eventOrganizer = 'Event organizer is required';
    }
    if (!formData.venue.trim()) {
      errors.venue = 'Venue is required';
    }
    if (!formData.level.trim()) {
      errors.level = 'Level is required';
    }
    if (!formData.role.trim()) {
      errors.role = 'Role is required';
    }
    if (!formData.invitedDeputed.trim()) {
      errors.invitedDeputed = 'Invited/Deputed is required';
    }
    if (!formData.startDate.trim()) {
      errors.startDate = 'Start date is required';
    }
    if (!formData.endDate.trim()) {
      errors.endDate = 'End date is required';
    }
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      setMessage({ type: 'error', text: firstError });
      return false;
    }
    
    return true;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear general message
    if (message) {
      setMessage(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('programTitle', formData.programTitle);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('eventOrganizer', formData.eventOrganizer);
      formDataToSend.append('venue', formData.venue);
      formDataToSend.append('level', formData.level);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('invitedDeputed', formData.invitedDeputed);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', formData.endDate);
      formDataToSend.append('highlights', formData.highlights);
      
      if (selectedFile) {
        formDataToSend.append('uploadFile', selectedFile, selectedFile.name);
      }

      if (editingId) {
        await configAPI.seminarTraining.update(editingId.toString(), formDataToSend);
        setMessage({ type: 'success', text: 'Seminar training updated successfully' });
      } else {
        await configAPI.seminarTraining.create(formDataToSend);
        setMessage({ type: 'success', text: 'Seminar training created successfully' });
      }

      // Reset form
      setFormData({
        programTitle: '',
        type: '',
        eventOrganizer: '',
        venue: '',
        level: '',
        role: '',
        invitedDeputed: '',
        startDate: '',
        endDate: '',
        highlights: '',
        upload_file: ''
      });
      setSelectedFile(null);
      setFilePreview(null);
      setExistingFile(null);
      setFileName('');
      setValidationErrors({});
      setShowAccordion(false);
      setEditingId(null);
      
      // Refresh data
      await fetchData(pagination.currentPage, searchQuery);
    } catch (error) {
      console.error('Error saving seminar training:', error);
      setMessage({ type: 'error', text: 'Failed to save seminar training' });
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      programTitle: '',
      type: '',
      eventOrganizer: '',
      venue: '',
      level: '',
      role: '',
      invitedDeputed: '',
      startDate: '',
      endDate: '',
      highlights: '',
      upload_file: ''
    });
    setSelectedFile(null);
    setFilePreview(null);
    setExistingFile(null);
    setFileName('');
    setValidationErrors({});
    setShowAccordion(false);
    setEditingId(null);
    setMessage(null);
  };

  // Handle edit
  const handleEdit = (item: SeminarTrainingAPIResponse) => {
    setFormData({
      programTitle: item.program_title,
      type: item.type,
      eventOrganizer: item.event_organizer,
      venue: item.venue,
      level: item.level,
      role: item.role,
      invitedDeputed: item.invited_deputed,
      startDate: item.start_date,
      endDate: item.end_date,
      highlights: item.highlights || '',
      upload_file: item.upload_file || ''
    });
    setExistingFile(item.upload_file ? `${getStaticBaseUrl()}/api/faculty/uploads/${item.upload_file}` : null);
    setFilePreview(null);
    setSelectedFile(null);
    setFileName(item.upload_file || '');
    setValidationErrors({});
    setEditingId(item.id);
    setShowAccordion(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this seminar training entry?')) {
      try {
        await configAPI.seminarTraining.delete(id.toString());
        setMessage({ type: 'success', text: 'Seminar training deleted successfully' });
        await fetchData(pagination.currentPage, searchQuery);
      } catch (error) {
        console.error('Error deleting seminar training:', error);
        setMessage({ type: 'error', text: 'Failed to delete seminar training' });
      }
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchData(1, query);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchQuery);
  };

  const handleAdd = () => {
    setFormData({
      programTitle: '',
      type: '',
      eventOrganizer: '',
      venue: '',
      level: '',
      role: '',
      invitedDeputed: '',
      startDate: '',
      endDate: '',
      highlights: '',
      upload_file: ''
    });
    setSelectedFile(null);
    setFilePreview(null);
    setExistingFile(null);
    setFileName('');
    setValidationErrors({});
    setEditingId(null);
    setShowAccordion(true);
  };

  // File handling functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExistingFile(null);
      setFileName(file.name);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleFileDelete = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setExistingFile(null);
      setFileName(file.name);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  // Prepare data for Grid component
  const gridData = data.map(item => ({
    ...item,
    program_title: item.program_title || '-',
    event_organizer: item.event_organizer || '-',
    venue: item.venue || '-',
    level: item.level || '-',
    role: item.role || '-',
    invited_deputed: item.invited_deputed || '-',
    start_date: item.start_date || '-',
    end_date: item.end_date || '-',
    highlights: item.highlights || '-'
  }));

  return (
    <div className="seminar-training-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Seminar / Training / Development / Workshop Attended</h1>
        <p>Manage seminar, training, development, and workshop attendance records.</p>
      </div>

      {/* Success Message Popup */}
      {message && message.type === 'success' && createPortal(
        <div className="modal-overlay">
          <div className="success-popup">
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
              <h3 className="error-popup-title">Error</h3>
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

      {/* Data Grid */}
      <div className="seminar-training-grid-section">
        <Grid
          columns={columns}
          data={gridData}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSearch={handleSearch}
          loading={loading}
          pagination={pagination}
          searchPlaceholder="Search seminar/training entries..."
          addButtonText="Add Seminar/Training"
        />
      </div>

      {/* Modal */}
      {showAccordion && createPortal(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <h2>{editingId ? 'Edit Seminar Training' : 'Add New Seminar Training'}</h2>
                <p>Enter seminar training details below</p>
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
              <form id="seminar-training-form" onSubmit={handleSubmit} className="seminar-training-form">
                <div className="seminar-training-form-container">
                  {/* Left Column - Form Fields */}
                  <div className="seminar-training-form-left">
                    <div className="seminar-training-form-section">
                      <h3 className="seminar-training-form-section-title">Basic Information</h3>
                      <div className="seminar-training-form-grid">
                        <div className="seminar-training-form-group">
                          <label htmlFor="programTitle" className="seminar-training-form-label">
                            Program Title <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            id="programTitle"
                            name="programTitle"
                            className={`seminar-training-form-input ${validationErrors.programTitle ? 'seminar-training-form-input-error' : ''}`}
                            value={formData.programTitle}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter Title"
                          />
                          {validationErrors.programTitle && (
                            <div className="seminar-training-form-error-message">
                              {validationErrors.programTitle}
                            </div>
                          )}
                        </div>

                        <div className="seminar-training-form-group">
                          <label htmlFor="type" className="seminar-training-form-label">
                            Type <span className="required">*</span>
                          </label>
                          <select
                            id="type"
                            name="type"
                            className={`seminar-training-form-input ${validationErrors.type ? 'seminar-training-form-input-error' : ''}`}
                            value={formData.type}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Type</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Training">Training</option>
                            <option value="Conference">Conference</option>
                            <option value="Seminar">Seminar</option>
                            <option value="Development">Development</option>
                          </select>
                          {validationErrors.type && (
                            <div className="seminar-training-form-error-message">
                              {validationErrors.type}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="seminar-training-form-group">
                        <label htmlFor="eventOrganizer" className="seminar-training-form-label">
                          Event Organizer
                        </label>
                        <input
                          type="text"
                          id="eventOrganizer"
                          name="eventOrganizer"
                          className={`seminar-training-form-input ${validationErrors.eventOrganizer ? 'seminar-training-form-input-error' : ''}`}
                          value={formData.eventOrganizer}
                          onChange={handleInputChange}
                          placeholder="Enter Event Organizer"
                        />
                        {validationErrors.eventOrganizer && (
                          <div className="seminar-training-form-error-message">
                            {validationErrors.eventOrganizer}
                          </div>
                        )}
                      </div>

                      <div className="seminar-training-form-group">
                        <label htmlFor="venue" className="seminar-training-form-label">
                          Venue
                        </label>
                        <textarea
                          id="venue"
                          name="venue"
                          className={`seminar-training-form-textarea ${validationErrors.venue ? 'seminar-training-form-input-error' : ''}`}
                          value={formData.venue}
                          onChange={handleInputChange}
                          placeholder="Enter Venue"
                          rows={3}
                        />
                        {validationErrors.venue && (
                          <div className="seminar-training-form-error-message">
                            {validationErrors.venue}
                          </div>
                        )}
                      </div>

                      <div className="seminar-training-form-group">
                        <label htmlFor="level" className="seminar-training-form-label">
                          Select Level <span className="required">*</span>
                        </label>
                        <select
                          id="level"
                          name="level"
                          className={`seminar-training-form-input ${validationErrors.level ? 'seminar-training-form-input-error' : ''}`}
                          value={formData.level}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Level</option>
                          <option value="International">International</option>
                          <option value="National">National</option>
                          <option value="State">State</option>
                          <option value="Local">Local</option>
                        </select>
                        {validationErrors.level && (
                          <div className="seminar-training-form-error-message">
                            {validationErrors.level}
                          </div>
                        )}
                      </div>

                      <div className="seminar-training-form-group">
                        <label htmlFor="role" className="seminar-training-form-label">
                          Your Role <span className="required">*</span>
                        </label>
                        <select
                          id="role"
                          name="role"
                          className={`seminar-training-form-input ${validationErrors.role ? 'seminar-training-form-input-error' : ''}`}
                          value={formData.role}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Role</option>
                          <option value="Participant">Participant</option>
                          <option value="Speaker">Speaker</option>
                          <option value="Resource Person">Resource Person</option>
                          <option value="Organizer">Organizer</option>
                          <option value="Coordinator">Coordinator</option>
                        </select>
                        {validationErrors.role && (
                          <div className="seminar-training-form-error-message">
                            {validationErrors.role}
                          </div>
                        )}
                      </div>

                      <div className="seminar-training-form-group">
                        <label htmlFor="invitedDeputed" className="seminar-training-form-label">
                          Invited/Deputed <span className="required">*</span>
                        </label>
                        <select
                          id="invitedDeputed"
                          name="invitedDeputed"
                          className={`seminar-training-form-input ${validationErrors.invitedDeputed ? 'seminar-training-form-input-error' : ''}`}
                          value={formData.invitedDeputed}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Option</option>
                          <option value="Invited">Invited</option>
                          <option value="Deputed">Deputed</option>
                        </select>
                        {validationErrors.invitedDeputed && (
                          <div className="seminar-training-form-error-message">
                            {validationErrors.invitedDeputed}
                          </div>
                        )}
                      </div>

                      <div className="seminar-training-form-group">
                        <label htmlFor="startDate" className="seminar-training-form-label">
                          Start Date <span className="required">*</span>
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          className={`seminar-training-form-input ${validationErrors.startDate ? 'seminar-training-form-input-error' : ''}`}
                          value={formData.startDate}
                          onChange={handleInputChange}
                          required
                        />
                        {validationErrors.startDate && (
                          <div className="seminar-training-form-error-message">
                            {validationErrors.startDate}
                          </div>
                        )}
                      </div>

                      <div className="seminar-training-form-group">
                        <label htmlFor="endDate" className="seminar-training-form-label">
                          End Date
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          name="endDate"
                          className={`seminar-training-form-input ${validationErrors.endDate ? 'seminar-training-form-input-error' : ''}`}
                          value={formData.endDate}
                          onChange={handleInputChange}
                        />
                        {validationErrors.endDate && (
                          <div className="seminar-training-form-error-message">
                            {validationErrors.endDate}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Rich Text Editor for Highlights */}
                  <div className="seminar-training-form-right">
                    <div className="seminar-training-form-section">
                      <h3 className="seminar-training-form-section-title">Highlights</h3>
                      <div className="seminar-training-rich-text-editor">
                        <div className="seminar-training-editor-toolbar">
                          <div className="seminar-training-toolbar-row">
                            <select className="seminar-training-toolbar-select">
                              <option>File</option>
                            </select>
                            <select className="seminar-training-toolbar-select">
                              <option>Edit</option>
                            </select>
                            <select className="seminar-training-toolbar-select">
                              <option>Insert</option>
                            </select>
                            <select className="seminar-training-toolbar-select">
                              <option>View</option>
                            </select>
                          </div>
                          <div className="seminar-training-toolbar-row">
                            <select className="seminar-training-toolbar-select">
                              <option>Format</option>
                            </select>
                            <select className="seminar-training-toolbar-select">
                              <option>Table</option>
                            </select>
                            <select className="seminar-training-toolbar-select">
                              <option>Tools</option>
                            </select>
                          </div>
                          <div className="seminar-training-toolbar-row">
                            <button type="button" className="seminar-training-toolbar-btn" title="Undo">↶</button>
                            <button type="button" className="seminar-training-toolbar-btn" title="Redo">↷</button>
                            <select className="seminar-training-toolbar-select">
                              <option>Formats</option>
                            </select>
                            <button type="button" className="seminar-training-toolbar-btn" title="Bold"><strong>B</strong></button>
                            <button type="button" className="seminar-training-toolbar-btn" title="Italic"><em>I</em></button>
                            <button type="button" className="seminar-training-toolbar-btn" title="Underline"><u>U</u></button>
                            <button type="button" className="seminar-training-toolbar-btn" title="Align Left">⬅</button>
                            <button type="button" className="seminar-training-toolbar-btn" title="Align Center">⬆</button>
                            <button type="button" className="seminar-training-toolbar-btn" title="Align Right">➡</button>
                            <button type="button" className="seminar-training-toolbar-btn" title="Justify">⬌</button>
                          </div>
                          <div className="seminar-training-toolbar-row">
                            <button type="button" className="seminar-training-toolbar-btn" title="Bullet List">•</button>
                            <button type="button" className="seminar-training-toolbar-btn" title="Numbered List">1.</button>
                            <button type="button" className="seminar-training-toolbar-btn" title="Indent">⤷</button>
                            <button type="button" className="seminar-training-toolbar-btn" title="Outdent">⤶</button>
                            <button type="button" className="seminar-training-toolbar-btn" title="Link">🔗</button>
                            <button type="button" className="seminar-training-toolbar-btn" title="Image">🖼</button>
                            <button type="button" className="seminar-training-toolbar-btn" title="Upload">☁</button>
                            <button type="button" className="seminar-training-toolbar-btn" title="Subscript">X₂</button>
                            <button type="button" className="seminar-training-toolbar-btn" title="Superscript">X²</button>
                            <button type="button" className="seminar-training-toolbar-btn" title="Clear Formatting">Clear</button>
                          </div>
                        </div>
                        <textarea
                          id="highlights"
                          name="highlights"
                          className="seminar-training-editor-content"
                          value={formData.highlights}
                          onChange={handleInputChange}
                          placeholder="Enter highlights here..."
                          rows={15}
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Form Actions */}
                <div className="seminar-training-form-actions">
                  <button
                    type="button"
                    className="seminar-training-btn seminar-training-btn-secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="seminar-training-btn seminar-training-btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default SeminarTraining;

