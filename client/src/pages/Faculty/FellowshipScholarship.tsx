import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import Grid from '../../components/Grid/Grid';
import { DocumentViewer, DocumentInfo } from '../../components/DocumentViewer';
import { DocumentUpload } from '../../components/DocumentUpload';
import UnifiedValidationPopup from '../../components/UnifiedValidationPopup';
import { useUnifiedValidation, commonValidationRules } from '../../hooks/useUnifiedValidation';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';
import '../../styles/components/SharedModal.css';
import '../../styles/components/UnifiedValidationPopup.css';
import '../../styles/components/FellowshipModal.css';

// Utility function to get the correct base URL for static files
const getStaticBaseUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace('/api', '');
};

interface FellowshipData {
  id?: number;
  fellowshipFor: string;
  awardedBy: string;
  startDate: string;
  endDate: string;
  amount: number;
  type: string;
  abstract: string;
  uploadFile?: string;
  created_at?: string;
  updated_at?: string;
}

// API Response interface for database fields
interface FellowshipAPIResponse {
  id: number;
  fellowship_for: string;
  awarded_by: string;
  start_date: string;
  end_date: string;
  amount: string;
  type: string;
  abstract: string;
  upload_file: string | null;
  created_at: string;
  updated_at: string;
}

const FellowshipScholarship: React.FC = () => {
  const [data, setData] = useState<FellowshipAPIResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAccordion, setShowAccordion] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    onPageChange: (page: number) => handlePageChange(page)
  });

  const [formData, setFormData] = useState<FellowshipData>({
    fellowshipFor: '',
    awardedBy: '',
    startDate: '',
    endDate: '',
    amount: 0,
    type: '',
    abstract: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [existingFile, setExistingFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentInfo | null>(null);

  // Use unified validation hook
  const {
    validationErrors,
    message,
    setMessage,
    validateForm: validateFormUnified,
    clearFieldError,
    clearAllErrors,
    showSuccessPopup,
    getFieldClassName
  } = useUnifiedValidation();

  // Grid columns configuration
  const gridColumns = [
    { key: 'fellowshipFor', title: 'Fellowship/Scholarship For', width: '30%' },
    { key: 'awardedBy', title: 'Awarded By', width: '25%' },
    { key: 'type', title: 'Type', width: '15%' },
    { key: 'amount', title: 'Amount (₹)', width: '15%' },
    { key: 'startDate', title: 'Start Date', width: '7.5%' },
    { key: 'endDate', title: 'End Date', width: '7.5%' }
  ];

  // Utility functions
  const getStaticBaseUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace('/api', '');
  };

  // Handle document view
  const handleDocumentView = (item: FellowshipAPIResponse) => {
    if (item.upload_file) {
      setSelectedDocument({
        url: `${getStaticBaseUrl()}/uploads/fellowship-scholarship/${item.upload_file}`,
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

  // Enhanced validation functions
  const validateDate = (dateString: string): boolean => {
    if (!dateString.trim()) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const validateDateRange = (startDate: string, endDate: string): boolean => {
    if (!startDate || !endDate) return true;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  };

  const validateAmount = (amount: number): boolean => {
    return amount >= 0 && amount <= 999999999;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateTextLength = (text: string, minLength: number, maxLength: number): boolean => {
    const trimmedText = text.trim();
    return trimmedText.length >= minLength && trimmedText.length <= maxLength;
  };

  const validatePastDate = (dateString: string): boolean => {
    if (!dateString.trim()) return true;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const validateDuplicateFellowship = (fellowshipFor: string, awardedBy: string, startDate: string, currentId?: number): boolean => {
    return !data.some(item => 
      item.id !== currentId && 
      item.fellowship_for.toLowerCase() === fellowshipFor.toLowerCase() &&
      item.awarded_by.toLowerCase() === awardedBy.toLowerCase() &&
      item.start_date === startDate
    );
  };

  // Define validation rules
  const validationRules = {
    fellowshipFor: [
      commonValidationRules.required('Fellowship/Scholarship For is required'),
      commonValidationRules.minLength(3, 'Fellowship/Scholarship For must be at least 3 characters'),
      commonValidationRules.maxLength(200, 'Fellowship/Scholarship For must not exceed 200 characters')
    ],
    awardedBy: [
      commonValidationRules.required('Awarded By is required'),
      commonValidationRules.minLength(2, 'Awarded By must be at least 2 characters'),
      commonValidationRules.maxLength(150, 'Awarded By must not exceed 150 characters'),
      {
        custom: (value: any) => {
          const emailMatch = value.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
          if (emailMatch && !validateEmail(emailMatch[0])) {
            return 'Please enter a valid email address in Awarded By field';
          }
          return null;
        }
      }
    ],
    startDate: [
      commonValidationRules.required('Start Date is required'),
      {
        custom: (value: any) => {
          if (!validateDate(value)) {
            return 'Please enter a valid start date';
          }
          return null;
        }
      }
    ],
    endDate: [
      commonValidationRules.required('End Date is required'),
      {
        custom: (value: any) => {
          if (!validateDate(value)) {
            return 'Please enter a valid end date';
          }
          if (formData.startDate && !validateDateRange(formData.startDate, value)) {
            return 'End date must be after or equal to start date';
          }
          return null;
        }
      }
    ],
    type: [
      commonValidationRules.required('Type is required'),
      commonValidationRules.minLength(2, 'Type must be at least 2 characters'),
      commonValidationRules.maxLength(50, 'Type must not exceed 50 characters')
    ],
    abstract: [
      commonValidationRules.required('Abstract is required'),
      commonValidationRules.minLength(10, 'Abstract must be at least 10 characters'),
      commonValidationRules.maxLength(2000, 'Abstract must not exceed 2000 characters')
    ]
  };

  // Validate form data using unified validation
  const validateForm = (): boolean => {
    const isValid = validateFormUnified(formData, validationRules);
    
    // Additional duplicate fellowship validation
    if (isValid && formData.fellowshipFor && formData.awardedBy && formData.startDate) {
      if (!validateDuplicateFellowship(formData.fellowshipFor, formData.awardedBy, formData.startDate, editingId || undefined)) {
        setMessage({ type: 'error', text: 'A fellowship with the same details already exists' });
        return false;
      }
    }
    
    return isValid;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));

    if (message && message.type === 'error') {
      setMessage(null);
    }
    
    // Clear field-specific validation error
    clearFieldError(name);
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
      formDataToSend.append('fellowshipFor', formData.fellowshipFor.trim());
      formDataToSend.append('awardedBy', formData.awardedBy.trim());
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', formData.endDate);
      formDataToSend.append('amount', formData.amount.toString());
      formDataToSend.append('type', formData.type.trim());
      formDataToSend.append('abstract', formData.abstract.trim());

      if (selectedFile) {
        formDataToSend.append('uploadFile', selectedFile, selectedFile.name);
      } else if (editingId && !filePreview && !existingFile) {
        formDataToSend.append('delete_file', 'true');
      }

      if (editingId) {
        await configAPI.fellowshipScholarship.update(editingId.toString(), formDataToSend);
      } else {
        await configAPI.fellowshipScholarship.create(formDataToSend);
      }

      showSuccessPopup(editingId ? 'Fellowship/Scholarship updated successfully!' : 'Fellowship/Scholarship added successfully!');
      setShowAccordion(false);
      setFormData({
        fellowshipFor: '',
        awardedBy: '',
        startDate: '',
        endDate: '',
        amount: 0,
        type: '',
        abstract: ''
      });
      setSelectedFile(null);
      setFilePreview(null);
      setExistingFile(null);
      setEditingId(null);
      fetchData();
    } catch (error: any) {
      console.error('Error saving fellowship/scholarship:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save fellowship/scholarship' 
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle file selection
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

  // Handle file deletion
  const handleFileDelete = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setExistingFile(null);
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
    e.stopPropagation();
    setIsDragOver(true);
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };


  // Fetch data
  const fetchData = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await configAPI.fellowshipScholarship.getAll({ page, search });
      setData(response.data.data);
      setPagination(prev => ({
        ...prev,
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        totalItems: response.data.pagination.totalCount,
        itemsPerPage: response.data.pagination.itemsPerPage || 10
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setFormData({
      fellowshipFor: '',
      awardedBy: '',
      startDate: '',
      endDate: '',
      amount: 0,
      type: '',
      abstract: ''
    });
    setSelectedFile(null);
    setFilePreview(null);
    setExistingFile(null);
    setEditingId(null);
    clearAllErrors();
    setShowAccordion(true);
  };

  // Handle edit
  const handleEdit = (item: FellowshipAPIResponse) => {
    setFormData({
      fellowshipFor: item.fellowship_for,
      awardedBy: item.awarded_by,
      startDate: item.start_date.split('T')[0],
      endDate: item.end_date.split('T')[0],
      amount: parseFloat(item.amount),
      type: item.type,
      abstract: item.abstract
    });
    setEditingId(item.id);
    setExistingFile(item.upload_file ? `${getStaticBaseUrl()}/uploads/fellowship-scholarship/${item.upload_file}` : null);
    setFileName(item.upload_file || '');
    setSelectedFile(null);
    setFilePreview(null);
    clearAllErrors();
    setShowAccordion(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAccordion(false);
    setFormData({
      fellowshipFor: '',
      awardedBy: '',
      startDate: '',
      endDate: '',
      amount: 0,
      type: '',
      abstract: ''
    });
    setSelectedFile(null);
    setFilePreview(null);
    setExistingFile(null);
    setFileName('');
    setEditingId(null);
    clearAllErrors();
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this fellowship/scholarship?')) {
      try {
        await configAPI.fellowshipScholarship.delete(id.toString());
        showSuccessPopup('Fellowship/Scholarship deleted successfully!');
        fetchData();
      } catch (error) {
        console.error('Error deleting fellowship/scholarship:', error);
        setMessage({ type: 'error', text: 'Failed to delete fellowship/scholarship' });
      }
    }
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    fetchData(1, term);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchTerm);
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Grid data with actions
  const gridData = data.map(item => ({
    ...item,
    fellowshipFor: item.fellowship_for,
    awardedBy: item.awarded_by,
    startDate: new Date(item.start_date).toLocaleDateString(),
    endDate: new Date(item.end_date).toLocaleDateString(),
    amount: `₹${parseFloat(item.amount).toLocaleString()}`,
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

  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Fellowship/Scholarship Management</h1>
        <p>Manage fellowship and scholarship information, awards, and document details.</p>
      </div>

      <Grid
        data={gridData}
        columns={gridColumns}
        loading={loading}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleDocumentView}
        onSearch={handleSearch}
        pagination={pagination}
        addButtonText="Add New Fellowship/Scholarship"
        searchPlaceholder="Search fellowships/scholarships..."
      />

      {/* Unified Validation Popup */}
      <UnifiedValidationPopup
        isOpen={!!message}
        type={message?.type || 'error'}
        message={message?.text || ''}
        onClose={() => setMessage(null)}
        onTryAgain={() => setMessage(null)}
        showProgress={message?.type === 'success'}
        autoClose={message?.type === 'success'}
        autoCloseDelay={3000}
      />

      {/* Modal */}
      {showAccordion && createPortal(
        <div className="modal-overlay">
          <div className="modal fellowship-modal">
            <div className="modal-header">
              <div className="modal-title">
                <h2>{editingId ? 'Edit Fellowship/Scholarship' : 'Add New Fellowship/Scholarship'}</h2>
                <p>Enter fellowship/scholarship details below</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCancel}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <form id="fellowship-form" onSubmit={handleSubmit} className="fellowship-form-container">
                {/* Row 1: Fellowship/Scholarship For & Awarded By */}
                <div className="book-chapter-form-row">
                  <div className="book-chapter-form-group">
                    <label>Fellowship/Scholarship For</label>
                    <div className="book-chapter-input-wrapper">
                      <input
                        type="text"
                        id="fellowshipFor"
                        name="fellowshipFor"
                        className={getFieldClassName('fellowshipFor', 'book-chapter-input')}
                        value={formData.fellowshipFor}
                        onChange={handleInputChange}
                        placeholder="Enter fellowship/scholarship name"
                      />
                      <div className="book-chapter-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    {validationErrors.fellowshipFor && (
                      <div className="book-chapter-error-message">
                        <span className="error-text">{validationErrors.fellowshipFor}</span>
                      </div>
                    )}
                    <div className={`character-count ${
                      formData.fellowshipFor.length > 180 ? 'warning' : 
                      formData.fellowshipFor.length > 200 ? 'error' : ''
                    }`}>
                      {formData.fellowshipFor.length}/200 characters
                    </div>
                  </div>

                  <div className="book-chapter-form-group">
                    <label>Awarded By</label>
                    <div className="book-chapter-input-wrapper">
                      <input
                        type="text"
                        id="awardedBy"
                        name="awardedBy"
                        className={getFieldClassName('awardedBy', 'book-chapter-input')}
                        value={formData.awardedBy}
                        onChange={handleInputChange}
                        placeholder="Enter awarding organization"
                      />
                      <div className="book-chapter-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    {validationErrors.awardedBy && (
                      <div className="book-chapter-error-message">
                        <span className="error-text">{validationErrors.awardedBy}</span>
                      </div>
                    )}
                    <div className={`character-count ${
                      formData.awardedBy.length > 135 ? 'warning' : 
                      formData.awardedBy.length > 150 ? 'error' : ''
                    }`}>
                      {formData.awardedBy.length}/150 characters
                    </div>
                  </div>
                </div>

                {/* Row 2: Type & Amount */}
                <div className="book-chapter-form-row">
                  <div className="book-chapter-form-group">
                    <label>Type</label>
                    <div className="book-chapter-input-wrapper">
                      <div className="book-chapter-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 17L12 22L22 17"/>
                          <path d="M2 12L12 17L22 12"/>
                        </svg>
                      </div>
                      <select
                        id="type"
                        name="type"
                        className={getFieldClassName('type', 'book-chapter-input')}
                        value={formData.type}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Type</option>
                        <option value="Fellowship">Fellowship</option>
                        <option value="Scholarship">Scholarship</option>
                        <option value="Grant">Grant</option>
                        <option value="Award">Award</option>
                      </select>
                    </div>
                    {validationErrors.type && (
                      <div className="book-chapter-error-message">
                        <span className="error-text">{validationErrors.type}</span>
                      </div>
                    )}
                    <div className={`character-count ${
                      formData.type.length > 45 ? 'warning' : 
                      formData.type.length > 50 ? 'error' : ''
                    }`}>
                      {formData.type.length}/50 characters
                    </div>
                  </div>

                  <div className="book-chapter-form-group">
                    <label>Amount (₹)</label>
                    <div className="book-chapter-input-wrapper">
                      <div className="book-chapter-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                      </div>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        className={getFieldClassName('amount', 'book-chapter-input')}
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="Enter amount"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Start Date & End Date */}
                <div className="book-chapter-form-row">
                  <div className="book-chapter-form-group">
                    <label>Start Date</label>
                    <div className="book-chapter-input-wrapper">
                      <div className="book-chapter-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </div>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        className={getFieldClassName('startDate', 'book-chapter-input')}
                        value={formData.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    {validationErrors.startDate && (
                      <div className="book-chapter-error-message">
                        <span className="error-text">{validationErrors.startDate}</span>
                      </div>
                    )}
                  </div>

                  <div className="book-chapter-form-group">
                    <label>End Date</label>
                    <div className="book-chapter-input-wrapper">
                      <div className="book-chapter-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </div>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        className={getFieldClassName('endDate', 'book-chapter-input')}
                        value={formData.endDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    {validationErrors.endDate && (
                      <div className="book-chapter-error-message">
                        <span className="error-text">{validationErrors.endDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 4: Abstract/Description (Full Width) */}
                <div className="book-chapter-form-group book-chapter-form-group-full">
                  <label>Abstract/Description</label>
                  <div className="book-chapter-textarea-wrapper">
                    <textarea
                      id="abstract"
                      name="abstract"
                      className={getFieldClassName('abstract', 'book-chapter-textarea')}
                      value={formData.abstract}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Enter fellowship/scholarship description and objectives..."
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
                  {validationErrors.abstract && (
                    <div className="book-chapter-error-message">
                      <span className="error-text">{validationErrors.abstract}</span>
                    </div>
                  )}
                  <div className={`character-count ${
                    formData.abstract.length > 1800 ? 'warning' : 
                    formData.abstract.length > 2000 ? 'error' : ''
                  }`}>
                    {formData.abstract.length}/2000 characters
                  </div>
                </div>

              {/* File Upload Section */}
              <div className="book-chapter-form-group book-chapter-form-group-full" style={{ marginTop: '24px' }}>
                <label>Document Upload</label>
                <div className="book-chapter-upload-area">
                  <div
                    className={`book-chapter-upload-dropzone ${isDragOver ? 'book-chapter-drag-over' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const files = e.dataTransfer.files;
                      if (files && files.length > 0) {
                        const file = files[0];
                        setSelectedFile(file);
                        setFileName(file.name);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFilePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
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
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                form="fellowship-form"
                className="modal-btn modal-btn-primary"
                disabled={saving}
                onClick={handleSubmit}
              >
                {saving ? (
                  <>
                    <div className="spinner"></div>
                    {editingId ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {editingId ? 'Update Fellowship/Scholarship' : 'Save Fellowship/Scholarship'}
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

export default FellowshipScholarship;
