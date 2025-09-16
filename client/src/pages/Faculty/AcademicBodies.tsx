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
import '../../styles/pages/Faculty/AcademicBodies.css';

interface AcademicBodiesData {
  id?: number;
  memberOf: string;
  institution: string;
  description?: string;
  upload_file?: string;
  created_at?: string;
  updated_at?: string;
}

// API Response interface for database fields
interface AcademicBodiesAPIResponse {
  id: number;
  member_of: string;
  institution: string;
  description: string | null;
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

const AcademicBodies: React.FC = () => {
  const [data, setData] = useState<AcademicBodiesAPIResponse[]>([]);
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

  const [formData, setFormData] = useState<AcademicBodiesData>({
    memberOf: '',
    institution: '',
    description: '',
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
    return apiUrl + '/faculty';
  };

  // Grid columns configuration (replicated from Fellowship Scholarship)
  const gridColumns = [
    { key: 'memberOf', title: 'Member of', width: '40%' },
    { key: 'institution', title: 'Institution', width: '40%' },
    { key: 'actions', title: 'Document', width: '20%' }
  ];

  // Utility functions
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Fetch data from API
  const fetchData = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await configAPI.academicBodies.getAll({ page, search });
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
  const validateForm = (): boolean => {
    // Clear any existing messages and validation errors
    setMessage(null);
    setValidationErrors({});

    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    // Check required fields
    if (!formData.memberOf.trim()) {
      errors.memberOf = 'Academic body name is required';
      hasErrors = true;
    } else if (formData.memberOf.trim().length < 2) {
      errors.memberOf = 'Academic body name must be at least 2 characters long';
      hasErrors = true;
    } else if (formData.memberOf.trim().length > 100) {
      errors.memberOf = 'Academic body name must not exceed 100 characters';
      hasErrors = true;
    }

    if (!formData.institution.trim()) {
      errors.institution = 'Institution name is required';
      hasErrors = true;
    } else if (formData.institution.trim().length < 2) {
      errors.institution = 'Institution name must be at least 2 characters long';
      hasErrors = true;
    } else if (formData.institution.trim().length > 100) {
      errors.institution = 'Institution name must not exceed 100 characters';
      hasErrors = true;
    }

    // Validate description if provided
    if (formData.description && formData.description.trim().length > 500) {
      errors.description = 'Description must not exceed 500 characters';
      hasErrors = true;
    }

    // Validate file upload if provided
    if (formData.upload_file && formData.upload_file.trim().length > 255) {
      errors.upload_file = 'File name must not exceed 255 characters';
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('memberOf', formData.memberOf.trim());
      formDataToSend.append('institution', formData.institution.trim());
      formDataToSend.append('description', formData.description?.trim() || '');

      if (selectedFile) {
        formDataToSend.append('uploadFile', selectedFile, selectedFile.name);
      } else if (editingId && !filePreview && !existingFile) {
        formDataToSend.append('delete_file', 'true');
      }

      if (editingId) {
        await configAPI.academicBodies.update(editingId.toString(), formDataToSend);
      } else {
        await configAPI.academicBodies.create(formDataToSend);
      }

      setMessage({ type: 'success', text: editingId ? 'Academic body updated successfully!' : 'Academic body added successfully!' });
      setShowAccordion(false);
      setFormData({
        memberOf: '',
        institution: '',
        description: '',
        upload_file: ''
      });
      setSelectedFile(null);
      setFilePreview(null);
      setExistingFile(null);
      setEditingId(null);
      fetchData();
    } catch (error: any) {
      console.error('Error saving academic body:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save academic body' 
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setFormData({
      memberOf: '',
      institution: '',
      description: '',
      upload_file: ''
    });
    setFilePreview(null);
    setExistingFile(null);
    setEditingId(null);
    setShowAccordion(true);
  };

  // Handle edit
  const handleEdit = (item: AcademicBodiesData) => {
    setFormData({
      memberOf: item.memberOf,
      institution: item.institution,
      description: item.description || '',
      upload_file: item.upload_file || ''
    });
    setExistingFile(item.upload_file ? `${getStaticBaseUrl()}/uploads/${item.upload_file}` : null);
    setFilePreview(null);
    setSelectedFile(null);
    setEditingId(item.id!);
    setValidationErrors({}); // Clear validation errors
    setMessage(null); // Clear any existing messages
    setShowAccordion(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this academic body entry?')) {
      try {
        await configAPI.academicBodies.delete(id.toString());
        setMessage({ type: 'success', text: 'Academic body deleted successfully' });
        fetchData();
      } catch (error: any) {
        console.error('Error deleting academic body:', error);
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Failed to delete academic body' 
        });
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAccordion(false);
    setEditingId(null);
    setValidationErrors({}); // Clear validation errors
    setFormData({
      memberOf: '',
      institution: '',
      description: '',
      upload_file: ''
    });
    setFilePreview(null);
    setExistingFile(null);
    setSelectedFile(null);
  };

  // File handling functions (replicated from Fellowship Scholarship)
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setExistingFile(null);
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFilePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDelete = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setExistingFile(null);
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
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle document view (replicated from Fellowship Scholarship)
  const handleDocumentView = (item: AcademicBodiesAPIResponse) => {
    if (item.upload_file) {
      setSelectedDocument({
        url: `${getStaticBaseUrl()}/uploads/${item.upload_file}`,
        name: item.upload_file
      });
      setShowDocumentViewer(true);
    } else {
      setMessage({ 
        type: 'error', 
        text: 'No document available for this academic body' 
      });
    }
  };

  // Handle close document viewer
  const handleCloseDocumentViewer = () => {
    setShowDocumentViewer(false);
    setSelectedDocument(null);
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

  const handleGridEdit = (item: AcademicBodiesData) => {
    handleEdit(item);
  };

  const handleGridDelete = (item: AcademicBodiesData) => {
    if (item.id) {
      handleDelete(item.id);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchTerm);
  };

  // Helper function to get file type and icon
  const getFileTypeInfo = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return { type: 'PDF', color: 'red', icon: '📄' };
      case 'doc':
      case 'docx':
        return { type: 'DOC', color: 'blue', icon: '📝' };
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return { type: 'IMG', color: 'green', icon: '🖼️' };
      default:
        return { type: 'FILE', color: 'gray', icon: '📄' };
    }
  };

  // Grid data with actions (replicated from Fellowship Scholarship)
  const gridData = data.map(item => ({
    ...item,
    memberOf: item.member_of ? truncateText(item.member_of, 40) : '-',
    institution: item.institution ? truncateText(item.institution, 40) : '-',
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
        <h1>Member of Academic/Administrative/Cocurricular Bodies</h1>
        <p>Manage memberships in academic, administrative, and cocurricular bodies.</p>
      </div>


      {/* Grid Component - Replicated from Fellowship Scholarship */}
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
        addButtonText="Add New Academic Body"
        searchPlaceholder="Search academic bodies..."
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
                <h3>{editingId ? 'Edit Academic Body' : 'Add New Academic Body'}</h3>
                <p className="modal-subtitle">Enter academic body membership details below</p>
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
              <form id="academic-body-form" onSubmit={handleSubmit}>
                <div className="book-chapter-form-container">
                  <div className="book-chapter-form-layout">
                    {/* Left Column */}
                    <div className="book-chapter-form-left">
                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Member of</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="memberOf"
                            name="memberOf"
                            className={`book-chapter-input ${validationErrors.memberOf ? 'book-chapter-input-error' : ''}`}
                            value={formData.memberOf}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter academic body name"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.memberOf && (
                          <div className="book-chapter-field-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.memberOf}
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Institution</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="institution"
                            name="institution"
                            className={`book-chapter-input ${validationErrors.institution ? 'book-chapter-input-error' : ''}`}
                            value={formData.institution}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter institution name"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M3 21h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M5 21V7l8-4v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M19 21V11l-6-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.institution && (
                          <div className="book-chapter-field-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.institution}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="book-chapter-form-right">
                      <div className="book-chapter-form-group">
                        <label>Description</label>
                        <div className="book-chapter-textarea-wrapper">
                          <textarea
                            id="description"
                            name="description"
                            className={`book-chapter-textarea ${validationErrors.description ? 'book-chapter-input-error' : ''}`}
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Describe your role and responsibilities in this academic body..."
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
                        {validationErrors.description && (
                          <div className="book-chapter-field-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* File Upload Section - Replicated from Fellowship Scholarship */}
                  <div className="book-chapter-form-group book-chapter-form-group-full" style={{ marginTop: '24px' }}>
                    <label className="book-chapter-required">Document Upload</label>
                    <div className="book-chapter-upload-area">
                      <div
                        className={`book-chapter-upload-dropzone ${isDragOver ? 'book-chapter-drag-over' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => {
                          const fileInput = document.getElementById('uploadFile') as HTMLInputElement;
                          fileInput?.click();
                        }}
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
                                <span className="book-chapter-file-name">
                                  {fileName || selectedFile?.name || (existingFile && existingFile.includes('/') ? existingFile.split('/').pop() : 'Document')}
                                </span>
                                <button
                                  type="button"
                                  className="book-chapter-btn book-chapter-btn-sm book-chapter-btn-danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFile(null);
                                    setFilePreview(null);
                                    setExistingFile(null);
                                    setFileName('');
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
                              setSelectedFile(file);
                              setFileName(file.name);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFilePreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>

                      <div className="book-chapter-upload-info">
                        <p className="book-chapter-upload-hint">
                          Supported formats: PDF, DOC, DOCX, JPG, PNG. Max size: 5MB
                        </p>
                      </div>
                      {validationErrors.upload_file && (
                        <div className="book-chapter-field-error">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          {validationErrors.upload_file}
                        </div>
                      )}
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
                form="academic-body-form"
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

export default AcademicBodies;