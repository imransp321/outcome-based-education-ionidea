import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import Grid from '../../components/Grid/Grid';
import { DocumentViewer, DocumentInfo } from '../../components/DocumentViewer';
import ValidationPopup from '../../components/ValidationPopup';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';
import '../../styles/components/SharedModal.css';
import '../../styles/pages/Faculty/PatentInnovation.css';

interface PatentData {
  id?: number;
  title: string;
  patentNo: string;
  year: string;
  status: string;
  activityType: string;
  abstract: string;
  upload_file?: string;
  created_at?: string;
  updated_at?: string;
}

// API Response interface for database fields
interface PatentAPIResponse {
  id: number;
  title: string;
  patent_no: string; // Corrected to match API
  year: string;
  status: string;
  activity_type: string; // Corrected to match API
  abstract: string | null;
  upload_file: string | null;
  created_at: string;
  updated_at: string;
}

const PatentInnovation: React.FC = () => {
  const [data, setData] = useState<PatentAPIResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAccordion, setShowAccordion] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    showPagination: false,
    onPageChange: (page: number) => handlePageChange(page)
  });

  const [formData, setFormData] = useState<PatentData>({
    title: '',
    patentNo: '',
    year: '',
    status: 'Submitted',
    activityType: 'Patent',
    abstract: '',
    upload_file: ''
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [existingFile, setExistingFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentInfo | null>(null);

  // Utility function to get the correct base URL for static files
  const getStaticBaseUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace('/api', '');
  };

  // Grid columns configuration
  const gridColumns = [
    { key: 'title', title: 'Title', width: '40%' },
    { key: 'patentNo', title: 'Patent No.', width: '20%' },
    { key: 'year', title: 'Year', width: '10%' },
    { key: 'status', title: 'Status', width: '15%' },
    { key: 'actions', title: 'Document', width: '15%' }
  ];

  // Utility functions
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Fetch data from API
  const fetchData = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await configAPI.patentInnovation.getAll({ page, search });
      setData(response.data.data);
      
      // Only show pagination if there are more than 10 items
      const totalItems = response.data.pagination.totalCount;
      const shouldShowPagination = totalItems > 10;
      
      setPagination(prev => ({
        ...prev,
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        totalItems: totalItems,
        itemsPerPage: response.data.pagination.itemsPerPage || 10,
        showPagination: shouldShowPagination
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.patentNo.trim()) {
      errors.patentNo = 'Patent number is required';
    }

    if (!formData.year.trim()) {
      errors.year = 'Year is required';
    }

    if (!formData.status.trim()) {
      errors.status = 'Status is required';
    }

    if (!formData.activityType.trim()) {
      errors.activityType = 'Activity type is required';
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return false;
    }

    return true;
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
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('patentNo', formData.patentNo.trim());
      formDataToSend.append('year', formData.year.trim());
      formDataToSend.append('status', formData.status.trim());
      formDataToSend.append('activityType', formData.activityType.trim());
      formDataToSend.append('abstract', formData.abstract?.trim() || '');

      if (selectedFile) {
        formDataToSend.append('uploadFile', selectedFile, selectedFile.name);
      } else if (editingId && !filePreview && !existingFile) {
        formDataToSend.append('delete_file', 'true');
      }

      if (editingId) {
        await configAPI.patentInnovation.update(editingId.toString(), formDataToSend);
      } else {
        await configAPI.patentInnovation.create(formDataToSend);
      }

      setMessage({ type: 'success', text: editingId ? 'Patent/Innovation updated successfully!' : 'Patent/Innovation added successfully!' });
      setShowAccordion(false);
      setFormData({
        title: '',
        patentNo: '',
        year: '',
        status: 'Submitted',
        activityType: 'Patent',
        abstract: '',
        upload_file: ''
      });
      setSelectedFile(null);
      setFilePreview(null);
      setExistingFile(null);
      setEditingId(null);
      fetchData();
    } catch (error: any) {
      console.error('Error saving patent/innovation:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to save patent/innovation'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setFormData({
      title: '',
      patentNo: '',
      year: '',
      status: 'Submitted',
      activityType: 'Patent',
      abstract: '',
      upload_file: ''
    });
    setFilePreview(null);
    setExistingFile(null);
    setEditingId(null);
    setShowAccordion(true);
  };

  // Handle edit
  const handleEdit = (item: PatentAPIResponse) => {
    setFormData({
      title: item.title,
      patentNo: item.patent_no,
      year: item.year,
      status: item.status,
      activityType: item.activity_type,
      abstract: item.abstract || '',
      upload_file: item.upload_file || ''
    });
    setExistingFile(item.upload_file || null);
    setFilePreview(null);
    setEditingId(item.id);
    setShowAccordion(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this patent/innovation entry?')) {
      try {
        await configAPI.patentInnovation.delete(id.toString());
        setMessage({ type: 'success', text: 'Patent/Innovation deleted successfully!' });
        fetchData();
      } catch (error: any) {
        console.error('Error deleting patent/innovation:', error);
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Failed to delete patent/innovation'
        });
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAccordion(false);
    setEditingId(null);
    setFormData({
      title: '',
      patentNo: '',
      year: '',
      status: 'Submitted',
      activityType: 'Patent',
      abstract: '',
      upload_file: ''
    });
    setFilePreview(null);
    setExistingFile(null);
  };

  // Manage body class when modal is open
  useEffect(() => {
    if (showAccordion) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showAccordion]);

  // Grid handlers
  const handleGridSearch = (query: string) => {
    setSearchTerm(query);
    fetchData(1, query);
  };

  const handleGridAdd = () => {
    handleAddNew();
  };

  const handleGridEdit = (item: PatentData) => {
    // Convert PatentData to PatentAPIResponse format
    const apiItem: PatentAPIResponse = {
      id: item.id!,
      title: item.title,
      patent_no: item.patentNo,
      year: item.year,
      status: item.status,
      activity_type: item.activityType,
      abstract: item.abstract || null,
      upload_file: item.upload_file || null,
      created_at: item.created_at || '',
      updated_at: item.updated_at || ''
    };
    handleEdit(apiItem);
  };

  const handleGridDelete = (item: PatentData) => {
    if (item.id) {
      handleDelete(item.id);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchTerm);
  };

  // File handling functions (replicated from Fellowship Scholarship)
  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
    setFilePreview(file.name);
    setExistingFile(null);
  };

  const handleFileDelete = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setExistingFile(null);
    setFileName('');
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
      handleFileSelect(file);
    }
  };

  // Document viewer functions
  const handleDocumentView = (item: PatentAPIResponse) => {
    if (item.upload_file) {
      setSelectedDocument({
        url: `${getStaticBaseUrl()}/uploads/patent-innovation/${item.upload_file}`,
        name: item.upload_file
      });
      setShowDocumentViewer(true);
    } else {
      setMessage({
        type: 'error',
        text: 'No document available for this patent/innovation'
      });
    }
  };

  const handleCloseDocumentViewer = () => {
    setShowDocumentViewer(false);
    setSelectedDocument(null);
  };

  // Grid data with actions (replicated from Fellowship Scholarship)
  const gridData = data.map(item => ({
    ...item,
    title: item.title ? truncateText(item.title, 50) : '-',
    patentNo: item.patent_no || '-',
    year: item.year || '-',
    status: item.status || '-',
    activityType: item.activity_type || '-',
    actions: item.upload_file ? (
      <button 
        className="document-view-btn"
        onClick={() => handleDocumentView(item)}
        title="View Document"
      >
        📄 View
      </button>
    ) : '-'
  }));

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Patent, Innovation & Development Activities</h1>
        <p>Manage patent applications, innovations, and development activities with detailed documentation.</p>
      </div>

      {/* Grid Component */}
      <Grid
        data={gridData}
        columns={gridColumns}
        loading={loading}
        onAdd={handleGridAdd}
        onEdit={handleGridEdit}
        onDelete={handleGridDelete}
        onView={handleDocumentView}
        onSearch={handleGridSearch}
        pagination={pagination}
        addButtonText="Add Patent/Innovation"
        searchPlaceholder="Search Patent/Innovation..."
      />

      {/* Success Message Popup */}
      {message && message.type === 'success' && createPortal(
        <div className="modal-overlay">
          <div className="success-popup">
            <div className="success-popup-content">
              <div className="success-popup-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Success!</h3>
              <p>{message.text}</p>
              <button
                className="success-popup-btn"
                onClick={() => setMessage(null)}
              >
                OK
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
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Error!</h3>
              <p>{message.text}</p>
              <button
                className="error-popup-btn"
                onClick={() => setMessage(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal */}
      {showAccordion && createPortal(
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal book-chapter-modal-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <h3>{editingId ? 'Edit Patent/Innovation' : 'Add New Patent/Innovation'}</h3>
                <p className="modal-subtitle">Enter patent/innovation details below</p>
              </div>
              <button
                type="button"
                className="message-modal-close"
                onClick={handleCancel}
                title="Close Modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <form id="patent-innovation-form" onSubmit={handleSubmit}>
                <div className="book-chapter-form-container">
                  <div className="book-chapter-form-layout">
                    {/* Left Column */}
                    <div className="book-chapter-form-left">
                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Title</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="title"
                            name="title"
                            className={`book-chapter-input ${validationErrors.title ? 'book-chapter-input-error' : ''}`}
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter patent/innovation title"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.title && (
                          <div className="book-chapter-field-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.title}
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Patent Number</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="patentNo"
                            name="patentNo"
                            className={`book-chapter-input ${validationErrors.patentNo ? 'book-chapter-input-error' : ''}`}
                            value={formData.patentNo}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter patent number"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.patentNo && (
                          <div className="book-chapter-field-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.patentNo}
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Year</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="year"
                            name="year"
                            className={`book-chapter-input ${validationErrors.year ? 'book-chapter-input-error' : ''}`}
                            value={formData.year}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter year"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.year && (
                          <div className="book-chapter-field-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.year}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="book-chapter-form-right">
                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Activity Type</label>
                        <div className="book-chapter-input-wrapper">
                          <select
                            id="activityType"
                            name="activityType"
                            className={`book-chapter-input ${validationErrors.activityType ? 'book-chapter-input-error' : ''}`}
                            value={formData.activityType}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="Patent">Patent</option>
                            <option value="Innovation">Innovation</option>
                            <option value="Development">Development</option>
                            <option value="Research">Research</option>
                          </select>
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.activityType && (
                          <div className="book-chapter-field-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.activityType}
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Status</label>
                        <div className="book-chapter-input-wrapper">
                          <select
                            id="status"
                            name="status"
                            className={`book-chapter-input ${validationErrors.status ? 'book-chapter-input-error' : ''}`}
                            value={formData.status}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Granted">Granted</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Pending">Pending</option>
                          </select>
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.status && (
                          <div className="book-chapter-field-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.status}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Abstract Section */}
                  <div className="book-chapter-form-group book-chapter-form-group-full">
                    <label>Abstract</label>
                    <div className="book-chapter-textarea-wrapper">
                      <textarea
                        id="abstract"
                        name="abstract"
                        className="book-chapter-textarea"
                        value={formData.abstract}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Enter patent/innovation abstract..."
                      />
                      <div className="book-chapter-textarea-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="book-chapter-form-group book-chapter-form-group-full">
                    <label>Document Upload</label>
                    <div className="book-chapter-upload-area">
                      <div
                        className={`book-chapter-upload-dropzone ${isDragOver ? 'book-chapter-drag-over' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleUploadClick}
                      >
                        <div className="book-chapter-upload-content">
                          {(filePreview || existingFile) ? (
                            <div className="book-chapter-file-preview">
                              <div className="book-chapter-file-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                  <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <div className="book-chapter-file-info">
                                <span className="book-chapter-file-name">{filePreview || existingFile}</span>
                                <button
                                  type="button"
                                  className="book-chapter-btn book-chapter-btn-sm book-chapter-btn-danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFileDelete();
                                  }}
                                  title="Delete file"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="book-chapter-upload-placeholder">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <div className="book-chapter-upload-text">
                                <p className="book-chapter-upload-title">Drop your document here</p>
                                <p className="book-chapter-upload-subtitle">Or click to browse</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Hidden File Input */}
                        <input
                          type="file"
                          id="uploadFile"
                          name="uploadFile"
                          className="book-chapter-file-input-hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileSelect(file);
                            }
                          }}
                          ref={fileInputRef}
                        />
                      </div>

                      <div className="book-chapter-upload-info">
                        <p className="book-chapter-upload-hint">
                          Supported formats: PDF, DOC, DOCX, JPG, PNG. Max size: 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="book-chapter-btn book-chapter-btn-secondary"
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
                form="patent-innovation-form"
                className="book-chapter-btn book-chapter-btn-primary"
                disabled={saving}
                onClick={handleSubmit}
              >
                {saving ? (
                  <>
                    <div className="book-chapter-spinner"></div>
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

      {/* Document Viewer */}
      <DocumentViewer
        isOpen={showDocumentViewer}
        onClose={handleCloseDocumentViewer}
        document={selectedDocument}
      />
    </div>
  );
};

export default PatentInnovation;