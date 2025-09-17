import React, { useState, useEffect } from 'react';
import { configAPI } from '../../services/api';
import { DataTable, Column } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { FormField } from '../../components/FormField';
import { Button } from '../../components/Button';
import { useFormValidation, commonValidationRules } from '../../hooks/useFormValidation';
import DocumentViewer from '../../components/DocumentViewer/DocumentViewer';
import DocumentUpload from '../../components/DocumentUpload/DocumentUpload';
import ValidationPopup from '../../components/ValidationPopup';
import '../../styles/pages/Faculty/ProfessionalBodies.css';
import '../../styles/components/form-layout.css';

interface ProfessionalBodiesData {
  id?: number;
  organizationName: string;
  membershipType: string;
  membershipNo: string;
  date: string;
  description: string;
  upload_file?: string;
  created_at?: string;
  updated_at?: string;
}

// API Response interface for database fields
interface ProfessionalBodiesAPIResponse {
  id: number;
  organization_name: string;
  membership_type: string;
  membership_no: string;
  date: string;
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

const ProfessionalBodies: React.FC = () => {
  const [data, setData] = useState<ProfessionalBodiesAPIResponse[]>([]);
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

  const [formData, setFormData] = useState<ProfessionalBodiesData>({
    organizationName: '',
    membershipType: '',
    membershipNo: '',
    date: '',
    description: '',
    upload_file: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [existingFile, setExistingFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ url: string; name: string } | null>(null);

  // Form validation
  const validationRules = {
    organizationName: {
      ...commonValidationRules.required('Organization name is required'),
      ...commonValidationRules.textLength(2, 100, 'Organization name must be between 2 and 100 characters')
    },
    membershipType: {
      ...commonValidationRules.required('Membership type is required'),
      ...commonValidationRules.textLength(2, 50, 'Membership type must be between 2 and 50 characters')
    },
    membershipNo: {
      ...commonValidationRules.required('Membership number is required'),
      ...commonValidationRules.textLength(1, 50, 'Membership number must be between 1 and 50 characters')
    },
    date: {
      ...commonValidationRules.required('Date is required')
    },
    description: {
      ...commonValidationRules.maxLength(500, 'Description must not exceed 500 characters')
    }
  };

  const { validationErrors, validateForm, clearFieldError, clearAllErrors } = useFormValidation(validationRules);

  // Utility function to get the correct base URL for static files
  const getStaticBaseUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace('/api', '');
  };

  // DataTable columns configuration
  const columns: Column[] = [
    { 
      key: 'organization_name', 
      title: 'Organization Name', 
      width: '30%',
      render: (value) => truncateText(value, 30)
    },
    { 
      key: 'membership_type', 
      title: 'Membership Type', 
      width: '15%',
      render: (value) => truncateText(value, 20)
    },
    { 
      key: 'membership_no', 
      title: 'Membership No.', 
      width: '15%',
      render: (value) => truncateText(value, 15)
    },
    { 
      key: 'date', 
      title: 'Date', 
      width: '12%',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'upload_file', 
      title: 'Document', 
      width: '13%',
      render: (value, record) => (
        value ? (
          <Button
            size="small"
            variant="outline"
            onClick={() => handleViewDocument(value)}
          >
            View
          </Button>
        ) : (
          <span style={{ color: '#6c757d' }}>No file</span>
        )
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '15%',
      render: (value, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            size="small"
            variant="outline"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="danger"
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  // Utility functions
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Fetch data from API
  const fetchData = async (page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      const response = await configAPI.professionalBodies.getAll({ page, search });
      const responseData = response.data;
      
      // Handle the API response structure: { success: true, data: [...], pagination: {...} }
      if (responseData.success && Array.isArray(responseData.data)) {
        setData(responseData.data);
        setPagination(prev => ({
          ...prev,
          currentPage: page,
          totalPages: responseData.pagination?.totalPages || 1,
          totalItems: responseData.pagination?.totalCount || 0,
          showPagination: (responseData.pagination?.totalCount || 0) > 10
        }));
      } else {
        console.error('Invalid API response structure:', responseData);
        setData([]);
        setMessage({ type: 'error', text: 'Invalid data format received from server' });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
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
    
    // Clear validation error when user starts typing
    clearFieldError(name);
    
    // Clear message
    if (message) {
      setMessage(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      const firstError = Object.values(validationErrors)[0];
      setMessage({ type: 'error', text: firstError });
      return;
    }

    setSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('organizationName', formData.organizationName);
      formDataToSend.append('membershipType', formData.membershipType);
      formDataToSend.append('membershipNo', formData.membershipNo);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('description', formData.description);

      if (selectedFile) {
        formDataToSend.append('uploadFile', selectedFile);
      }

      let response;
      if (editingId) {
        response = await configAPI.professionalBodies.update(editingId.toString(), formDataToSend);
      } else {
        response = await configAPI.professionalBodies.create(formDataToSend);
      }

      if (response.status === 200 || response.status === 201) {
        setMessage({ type: 'success', text: editingId ? 'Professional body updated successfully!' : 'Professional body created successfully!' });
        setShowAccordion(false);
        resetForm();
        fetchData();
      } else {
        setMessage({ type: 'error', text: response.data?.message || 'An error occurred' });
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setMessage({ type: 'error', text: 'Failed to save data' });
    } finally {
      setSaving(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      organizationName: '',
      membershipType: '',
      membershipNo: '',
      date: '',
      description: '',
      upload_file: ''
    });
    clearAllErrors();
    setSelectedFile(null);
    setFilePreview(null);
    setExistingFile(null);
    setFileName('');
    setEditingId(null);
  };

  // Handle add new
  const handleAddNew = () => {
    resetForm();
    setShowAccordion(true);
  };

  // Utility function to convert ISO date to yyyy-MM-dd format
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Handle edit
  const handleEdit = (item: ProfessionalBodiesAPIResponse) => {
    setFormData({
      organizationName: item.organization_name,
      membershipType: item.membership_type,
      membershipNo: item.membership_no,
      date: formatDateForInput(item.date),
      description: item.description || '',
      upload_file: item.upload_file || ''
    });
    setEditingId(item.id);
    setExistingFile(item.upload_file ? `${getStaticBaseUrl()}/uploads/professional-bodies/${item.upload_file}` : null);
    setFileName(item.upload_file || '');
    setShowAccordion(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this professional body?')) {
      try {
        const response = await configAPI.professionalBodies.delete(id.toString());
        if (response.status === 200) {
          setMessage({ type: 'success', text: 'Professional body deleted successfully!' });
          fetchData();
        } else {
          setMessage({ type: 'error', text: response.data?.message || 'Failed to delete' });
        }
      } catch (error) {
        console.error('Error deleting data:', error);
        setMessage({ type: 'error', text: 'Failed to delete data' });
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAccordion(false);
    resetForm();
  };

  // File handling functions
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
    setFileName(file.name);
    setExistingFile(null);
  };

  const handleFileDelete = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileName('');
    setExistingFile(null);
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

  const handleViewDocument = (fileName: string) => {
    const documentInfo = {
      url: `${getStaticBaseUrl()}/uploads/professional-bodies/${fileName}`,
      name: fileName
    };
    
    setSelectedDocument(documentInfo);
    setShowDocumentViewer(true);
  };

  const handleCloseDocumentViewer = () => {
    setShowDocumentViewer(false);
    setSelectedDocument(null);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchTerm);
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Professional Bodies</h1>
        <p>Manage professional body memberships and certifications.</p>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <div className="table-header">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search professional bodies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <Button onClick={() => setShowAccordion(true)}>
            Add New Professional Body
          </Button>
        </div>
        
        <DataTable
          data={data}
          columns={columns}
          loading={loading}
          emptyMessage="No professional bodies found"
        />
      </div>

      {/* Success Message Popup */}
      {/* Validation Popup */}
      <ValidationPopup
        isOpen={!!(message && message.type === 'success')}
        type="success"
        message={message?.text || ''}
        onClose={() => setMessage(null)}
        showProgress={true}
        progressValue={100}
      />

      {/* Error Message Popup */}
      {message && message.type === 'error' && (
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
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showAccordion}
        onClose={handleCancel}
        title={editingId ? 'Edit Professional Body' : 'Add New Professional Body'}
        size="large"
      >
        <form id="professional-body-form" onSubmit={handleSubmit}>
          <div className="form-container">
            <div className="form-row">
              <FormField
                label="Organization Name"
                name="organizationName"
                type="text"
                value={formData.organizationName}
                onChange={handleInputChange}
                error={validationErrors.organizationName}
                placeholder="Enter organization name"
                required
              />

              <FormField
                label="Membership Type"
                name="membershipType"
                type="select"
                value={formData.membershipType}
                onChange={handleInputChange}
                error={validationErrors.membershipType}
                required
                options={[
                  { value: 'Life Time', label: 'Life Time' },
                  { value: 'Annual', label: 'Annual' },
                  { value: 'Student', label: 'Student' },
                  { value: 'Professional', label: 'Professional' },
                  { value: 'Associate', label: 'Associate' }
                ]}
              />
            </div>

            <div className="form-row">
              <FormField
                label="Membership Number"
                name="membershipNo"
                type="text"
                value={formData.membershipNo}
                onChange={handleInputChange}
                error={validationErrors.membershipNo}
                placeholder="Enter membership number"
                required
              />

              <FormField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                error={validationErrors.date}
                required
              />
            </div>

            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleInputChange}
              error={validationErrors.description}
              placeholder="Enter description (optional)"
              rows={3}
            />

            <div className="form-group">
              <label>Document Upload</label>
              <DocumentUpload
                selectedFile={selectedFile}
                filePreview={filePreview}
                existingFile={existingFile}
                fileLoading={fileLoading}
                isDragOver={isDragOver}
                onFileSelect={handleFileSelect}
                onFileDelete={handleFileDelete}
                onUploadClick={() => {}}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                maxSize={5}
              />
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={saving}
              >
                {editingId ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Document Viewer */}
      <DocumentViewer
        isOpen={showDocumentViewer}
        onClose={handleCloseDocumentViewer}
        document={selectedDocument}
      />
    </div>
  );
};

export default ProfessionalBodies;