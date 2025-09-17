import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Grid from '../../components/Grid/Grid';
import { DocumentViewer, DocumentInfo } from '../../components/DocumentViewer';
import UnifiedValidationPopup from '../../components/UnifiedValidationPopup';
import { useUnifiedValidation, commonValidationRules } from '../../hooks/useUnifiedValidation';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';
import '../../styles/components/BookChapterModal.css';
import '../../styles/components/SharedModal.css';
import '../../styles/components/UnifiedValidationPopup.css';

interface JournalData {
  id?: number;
  position: string;
  journal_name: string;
  description?: string;
  upload_file?: string;
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

const JournalEditorial: React.FC = () => {
  const [data, setData] = useState<JournalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAccordion, setShowAccordion] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  const [formData, setFormData] = useState<JournalData>({
    position: '',
    journal_name: '',
    description: '',
    upload_file: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [existingFile, setExistingFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentInfo | null>(null);
  // Unified validation system
  const {
    validationErrors,
    message: validationMessage,
    setMessage,
    validateForm,
    clearFieldError,
    clearAllErrors,
    showSuccessPopup,
    getFieldClassName
  } = useUnifiedValidation();

  // Define validation rules - memoized to prevent recreation
  const validationRules = React.useMemo(() => ({
    position: [
      commonValidationRules.required('Position is required')
    ],
    journal_name: [
      commonValidationRules.required('Journal name is required'),
      commonValidationRules.minLength(3, 'Journal name must be at least 3 characters'),
      commonValidationRules.maxLength(200, 'Journal name must not exceed 200 characters')
    ]
  }), []);

  // Grid columns configuration - memoized to prevent recreation
  const gridColumns = React.useMemo(() => [
    { key: 'position', title: 'Position', width: '20%' },
    { key: 'journal_name', title: 'Journal Name', width: '60%' },
    { key: 'upload_file', title: 'Document', width: '20%' }
  ], []);

  // Utility functions
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  // Utility function to get the correct base URL for static files
  const getStaticBaseUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace('/api', '');
  };

  // Fetch data from API
  const fetchData = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search
      });

      const response = await fetch(`${API_BASE_URL}/faculty/journal-editorial?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching journal editorial data:', error);
      setMessage({ type: 'error', text: 'Failed to fetch journal editorial data' });
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
    
    // Clear field error when user starts typing
    clearFieldError(name);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Validate form using unified validation
    const isValid = validateForm(formData, validationRules);
    if (!isValid) {
      setSaving(false);
      return;
    }

    try {
      // First upload file if selected
      let uploadFile = null;
      if (selectedFile) {
        const fileFormData = new FormData();
        fileFormData.append('file', selectedFile, selectedFile.name);
        
        const uploadResponse = await fetch(`${API_BASE_URL}/faculty/journal-editorial/upload`, {
          method: 'POST',
          body: fileFormData
        });
        
        const uploadResult = await uploadResponse.json();
        if (uploadResult.success) {
          uploadFile = uploadResult.data.filename;
        } else {
          throw new Error(uploadResult.message || 'File upload failed');
        }
      }

      // Create a completely clean submitData object with only primitive values
      const submitData = {
        position: String(formData.position || ''),
        journalName: String(formData.journal_name || ''),
        description: String(formData.description || ''),
        uploadFile: uploadFile ? String(uploadFile) : (editingId && !filePreview && !existingFile ? null : String(formData.upload_file || ''))
      };

      const url = editingId 
        ? `${API_BASE_URL}/faculty/journal-editorial/${editingId}`
        : `${API_BASE_URL}/faculty/journal-editorial`;
      
      const method = editingId ? 'PUT' : 'POST';

      let requestBody;
      try {
        // Test each property individually to identify the problematic one
        console.log('Testing individual properties:');
        console.log('position:', JSON.stringify(submitData.position));
        console.log('journalName:', JSON.stringify(submitData.journalName));
        console.log('description:', JSON.stringify(submitData.description));
        console.log('uploadFile:', JSON.stringify(submitData.uploadFile));
        
        requestBody = JSON.stringify(submitData);
      } catch (error) {
        console.error('JSON.stringify error:', error);
        console.error('submitData that caused error:', submitData);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error details:', errorMessage);
        throw new Error('Failed to serialize form data: ' + errorMessage);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody
      });

      const result = await response.json();
      
      if (result.success) {
        const successMessage = editingId 
          ? 'Journal editorial updated successfully' 
          : 'Journal editorial created successfully';
        showSuccessPopup(successMessage);
        
        setShowAccordion(false);
        setEditingId(null);
        clearAllErrors(); // Clear field errors on success
        setFormData({
          position: '',
          journal_name: '',
          description: '',
          upload_file: ''
        });
        setFilePreview(null);
        setExistingFile(null);
        setSelectedFile(null);
        
        // Refresh data
        fetchData(pagination.currentPage, searchTerm);
      } else {
        // Handle validation errors from server
        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors.map((error: any) => error.msg || error.message).join(', ');
          setMessage({ type: 'error', text: `Validation Error: ${errorMessages}` });
        } else {
          setMessage({ type: 'error', text: result.message || 'Failed to save journal editorial' });
        }
      }
    } catch (error) {
      console.error('Error saving journal editorial:', error);
      setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setFormData({
      position: '',
      journal_name: '',
      description: '',
      upload_file: ''
    });
    setFilePreview(null);
    setExistingFile(null);
    setSelectedFile(null);
    clearAllErrors(); // Clear field errors
    setEditingId(null);
    setShowAccordion(true);
  };

  // Handle edit
  const handleEdit = (item: JournalData) => {
    setFormData({
      position: item.position,
      journal_name: item.journal_name,
      description: item.description || '',
      upload_file: item.upload_file || ''
    });
    setExistingFile(item.upload_file ? `${getStaticBaseUrl()}/uploads/journal-editorial/${item.upload_file}` : null);
    setFileName(item.upload_file || '');
    setFilePreview(null);
    setSelectedFile(null);
    clearAllErrors(); // Clear field errors
    setEditingId(item.id!);
    setShowAccordion(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this journal editorial entry?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/faculty/journal-editorial/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          setMessage({ type: 'success', text: 'Journal editorial deleted successfully' });
          fetchData(pagination.currentPage, searchTerm);
        } else {
          throw new Error(result.message || 'Failed to delete journal editorial');
        }
      } catch (error) {
        console.error('Error deleting journal editorial:', error);
        setMessage({ type: 'error', text: 'Failed to delete journal editorial' });
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAccordion(false);
    setEditingId(null);
    clearAllErrors(); // Clear field errors on cancel
    setFormData({
      position: '',
      journal_name: '',
      description: '',
      upload_file: ''
    });
    setFilePreview(null);
    setExistingFile(null);
    setSelectedFile(null);
  };

  // Handle document view
  const handleDocumentView = (item: JournalData) => {
    if (item.upload_file) {
      setSelectedDocument({
        url: `${getStaticBaseUrl()}/uploads/journal-editorial/${item.upload_file}`,
        name: item.upload_file
      });
      setShowDocumentViewer(true);
    }
  };

  // Handle close document viewer
  const handleCloseDocumentViewer = () => {
    setShowDocumentViewer(false);
    setSelectedDocument(null);
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
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

  // Handle file deletion
  const handleFileDelete = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setExistingFile(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle upload click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
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

  const handleGridEdit = (item: JournalData) => {
    handleEdit(item);
  };

  const handleGridDelete = (item: JournalData) => {
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

  // Prepare data for Grid component
  const gridData = data.map(item => ({
    ...item,
    position: item.position || '-',
    journal_name: item.journal_name ? truncateText(item.journal_name, 50) : '-',
    upload_file: item.upload_file ? (
      <button 
        className="document-view-btn"
        onClick={() => handleDocumentView(item)}
        title="View Document"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        View Document
      </button>
    ) : (
      <span className="no-document-tag">No Document</span>
    )
  }));

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Journal Editorial Board Member</h1>
        <p>Manage journal editorial board memberships and positions.</p>
      </div>


      {/* Unified Validation Popup */}
      <UnifiedValidationPopup
        isOpen={!!validationMessage}
        message={validationMessage?.text || ''}
        type={validationMessage?.type || 'error'}
        onClose={() => setMessage(null)}
      />

      {/* Grid Component */}
      <Grid
        columns={gridColumns}
        data={gridData}
        onAdd={handleGridAdd}
        onEdit={handleGridEdit}
        onDelete={handleGridDelete}
        onSearch={handleGridSearch}
        searchable={true}
        loading={loading}
        addButtonText="Add Journal Editorial"
        searchPlaceholder="Search Journal Editorial"
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-controls">
            <button
              className="pagination-btn pagination-btn-secondary"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Previous
            </button>
            
            <div className="pagination-pages">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-btn ${page === pagination.currentPage ? 'pagination-btn-primary' : 'pagination-btn-secondary'}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              className="pagination-btn pagination-btn-secondary"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              Next
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="pagination-info">
            Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalCount)} of {pagination.totalCount} entries
          </div>
        </div>
      )}

      {/* Modal */}
      {showAccordion && createPortal(
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal book-chapter-modal-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <h3>{editingId ? 'Edit Journal Editorial' : 'Add New Journal Editorial'}</h3>
                <p className="modal-subtitle">Enter journal editorial board membership details below</p>
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
              <form id="journal-editorial-form" onSubmit={handleSubmit}>
                <div className="book-chapter-form-container">
                  <div className="book-chapter-form-layout">
                    {/* Left Column */}
                    <div className="book-chapter-form-left">
                      <div className="book-chapter-form-group">
                        <label>Position</label>
                        <div className="book-chapter-input-wrapper">
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          </div>
                          <select
                            id="position"
                            name="position"
                            className={getFieldClassName('position', 'book-chapter-input')}
                            value={formData.position}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Position</option>
                            <option value="Editor">Editor</option>
                            <option value="Member">Member</option>
                            <option value="Associate Editor">Associate Editor</option>
                            <option value="Reviewer">Reviewer</option>
                          </select>
                        </div>
                        {validationErrors.position && (
                          <div className="book-chapter-error-message">
                            <span className="error-text">{validationErrors.position}</span>
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label>Journal Name</label>
                        <div className="book-chapter-input-wrapper">
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="journal_name"
                            name="journal_name"
                            className={getFieldClassName('journal_name', 'book-chapter-input')}
                            value={formData.journal_name}
                            onChange={handleInputChange}
                            placeholder="Enter journal name"
                          />
                        </div>
                        {validationErrors.journal_name && (
                          <div className="book-chapter-error-message">
                            <span className="error-text">{validationErrors.journal_name}</span>
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
                            className="book-chapter-textarea"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Describe your role and responsibilities in this journal..."
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
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="book-chapter-form-group book-chapter-form-group-full">
                    <label>Membership Document Upload</label>
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
                                <span className="book-chapter-file-name">
                                  {fileName || selectedFile?.name || (existingFile && existingFile.includes('/') ? existingFile.split('/').pop() : 'Document')}
                                </span>
                                <button
                                  type="button"
                                  className="book-chapter-file-delete"
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
                      </div>

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
                        ref={fileInputRef}
                      />

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
                form="journal-editorial-form"
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
        onClose={() => {
          setShowDocumentViewer(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
      />
    </div>
  );
};

export default JournalEditorial;