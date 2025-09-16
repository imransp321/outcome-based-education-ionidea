import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import Grid from '../../components/Grid/Grid';
import DocumentViewer from '../../components/DocumentViewer/DocumentViewer';
import { DocumentUpload } from '../../components/DocumentUpload';
import ValidationPopup from '../../components/ValidationPopup';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';
import '../../styles/components/SharedModal.css';
import '../../styles/pages/Faculty/ResearchProjects.css';

interface ResearchProjectsData {
  id?: number;
  projectTitle: string;
  role: string;
  teamMembers: string;
  status: string;
  collaboration: string;
  sanctionedDate: string;
  amountSanctioned: number;
  duration: number;
  fundingAgency: string;
  amountUtilized: number;
  outcome: string;
  uploadFile?: string;
  created_at?: string;
  updated_at?: string;
}

// API Response interface for database fields
interface ResearchProjectsAPIResponse {
  id: number;
  project_title: string;
  role: string;
  team_members: string | null;
  status: string;
  collaboration: string | null;
  sanctioned_date: string;
  amount_sanctioned: number;
  duration: number;
  funding_agency: string;
  amount_utilized: number;
  outcome: string | null;
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

const ResearchProjects: React.FC = () => {
  const [data, setData] = useState<ResearchProjectsAPIResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAccordion, setShowAccordion] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    showPagination: false,
    hasNext: false,
    hasPrev: false,
    onPageChange: (page: number) => handlePageChange(page)
  });

  // Document handling states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [existingFile, setExistingFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ url: string; name: string } | null>(null);

  const [formData, setFormData] = useState<ResearchProjectsData>({
    projectTitle: '',
    role: '',
    teamMembers: '',
    status: 'On Going',
    collaboration: '',
    sanctionedDate: '',
    amountSanctioned: 0,
    duration: 0,
    fundingAgency: '',
    amountUtilized: 0,
    outcome: '',
    uploadFile: ''
  });

  // Utility function to get the correct base URL for static files
  const getStaticBaseUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace('/api', '');
  };

  // Grid columns configuration
  const gridColumns = [
    { key: 'projectTitle', title: 'Project Title', width: '30%' },
    { key: 'role', title: 'Role', width: '15%' },
    { key: 'fundingAgency', title: 'Funding Agency', width: '20%' },
    { key: 'status', title: 'Status', width: '15%' },
    { key: 'duration', title: 'Duration (months)', width: '10%' },
    { key: 'actions', title: 'Document', width: '10%' }
  ];

  // Utility functions
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Fetch data from API
  const fetchData = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await configAPI.researchProjects.getAll({
        page,
        limit: 10,
        search
      });

      if (response.data.success) {
        setData(response.data.data);
        setPagination(prev => ({
          ...prev,
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.totalCount,
          showPagination: response.data.pagination.totalCount > 10,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev
        }));
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch research projects data' });
      }
    } catch (error) {
      console.error('Error fetching research projects:', error);
      setMessage({ type: 'error', text: 'Failed to fetch research projects data' });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));

    // Clear field-specific validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear any existing messages
    if (message) {
      setMessage(null);
    }
  };

  // Form validation function
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    // Project Title validation
    if (!formData.projectTitle.trim()) {
      errors.projectTitle = 'Project Title is required';
      hasErrors = true;
    } else if (formData.projectTitle.trim().length < 5) {
      errors.projectTitle = 'Project Title must be at least 5 characters long';
      hasErrors = true;
    }

    // Role validation
    if (!formData.role.trim()) {
      errors.role = 'Role is required';
      hasErrors = true;
    }

    // Funding Agency validation
    if (!formData.fundingAgency.trim()) {
      errors.fundingAgency = 'Funding Agency is required';
      hasErrors = true;
    }

    // Sanctioned Date validation
    if (!formData.sanctionedDate) {
      errors.sanctionedDate = 'Sanctioned Date is required';
      hasErrors = true;
    }

    // Amount Sanctioned validation
    if (formData.amountSanctioned <= 0) {
      errors.amountSanctioned = 'Amount Sanctioned must be greater than 0';
      hasErrors = true;
    }

    // Duration validation
    if (formData.duration <= 0) {
      errors.duration = 'Duration must be greater than 0 months';
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
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('projectTitle', formData.projectTitle);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('teamMembers', formData.teamMembers || '');
      formDataToSend.append('status', formData.status);
      formDataToSend.append('collaboration', formData.collaboration || '');
      formDataToSend.append('sanctionedDate', formData.sanctionedDate);
      formDataToSend.append('amountSanctioned', formData.amountSanctioned.toString());
      formDataToSend.append('duration', formData.duration.toString());
      formDataToSend.append('fundingAgency', formData.fundingAgency);
      formDataToSend.append('amountUtilized', formData.amountUtilized.toString());
      formDataToSend.append('outcome', formData.outcome || '');

      if (selectedFile) {
        formDataToSend.append('uploadFile', selectedFile);
      } else if (existingFile) {
        formDataToSend.append('existingFile', existingFile);
      }

      let response;
      if (editingId) {
        response = await configAPI.researchProjects.update(editingId.toString(), formDataToSend);
      } else {
        response = await configAPI.researchProjects.create(formDataToSend);
      }

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: editingId ? 'Research project updated successfully' : 'Research project created successfully' 
        });
        setShowAccordion(false);
        setEditingId(null);
        setFormData({
          projectTitle: '',
          role: '',
          teamMembers: '',
          status: 'On Going',
          collaboration: '',
          sanctionedDate: '',
          amountSanctioned: 0,
          duration: 0,
          fundingAgency: '',
          amountUtilized: 0,
          outcome: '',
          uploadFile: ''
        });
        setFilePreview(null);
        setExistingFile(null);
        setSelectedFile(null);
        setFileName('');
        fetchData(pagination.currentPage, searchTerm);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to save research project' });
      }
    } catch (error) {
      console.error('Error saving research project:', error);
      setMessage({ type: 'error', text: 'Failed to save research project' });
    } finally {
      setSaving(false);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setFormData({
      projectTitle: '',
      role: '',
      teamMembers: '',
      status: 'On Going',
      collaboration: '',
      sanctionedDate: '',
      amountSanctioned: 0,
      duration: 0,
      fundingAgency: '',
      amountUtilized: 0,
      outcome: '',
      uploadFile: ''
    });
    setFilePreview(null);
    setExistingFile(null);
    setEditingId(null);
    setShowAccordion(true);
  };

  // Handle edit
  const handleEdit = (item: ResearchProjectsAPIResponse) => {
    setFormData({
      projectTitle: item.project_title,
      role: item.role,
      teamMembers: item.team_members || '',
      status: item.status,
      collaboration: item.collaboration || '',
      sanctionedDate: item.sanctioned_date,
      amountSanctioned: item.amount_sanctioned,
      duration: item.duration,
      fundingAgency: item.funding_agency,
      amountUtilized: item.amount_utilized,
      outcome: item.outcome || '',
      uploadFile: item.upload_file || ''
    });
    setExistingFile(item.upload_file || null);
    setFilePreview(null);
    setSelectedFile(null);
    setFileName('');
    setEditingId(item.id);
    setShowAccordion(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this research project entry?')) {
      try {
        const response = await configAPI.researchProjects.delete(id.toString());
        if (response.data.success) {
          setMessage({ type: 'success', text: 'Research project deleted successfully' });
          fetchData(pagination.currentPage, searchTerm);
        } else {
          setMessage({ type: 'error', text: response.data.message || 'Failed to delete research project' });
        }
      } catch (error) {
        console.error('Error deleting research project:', error);
        setMessage({ type: 'error', text: 'Failed to delete research project' });
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAccordion(false);
    setEditingId(null);
    setFormData({
      projectTitle: '',
      role: '',
      teamMembers: '',
      status: 'On Going',
      collaboration: '',
      sanctionedDate: '',
      amountSanctioned: 0,
      duration: 0,
      fundingAgency: '',
      amountUtilized: 0,
      outcome: '',
      uploadFile: ''
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

  const handleGridEdit = (item: ResearchProjectsAPIResponse) => {
    handleEdit(item);
  };

  const handleGridDelete = (item: ResearchProjectsAPIResponse) => {
    if (item.id) {
      handleDelete(item.id);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchTerm);
  };

  // File handling functions
  const handleFileDelete = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setExistingFile(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Document viewer functions
  const handleDocumentView = (item: ResearchProjectsAPIResponse) => {
    if (!item.upload_file) {
      setMessage({ type: 'error', text: 'No document available for this project' });
      return;
    }

    const documentUrl = `${getStaticBaseUrl()}/api/faculty/uploads/${item.upload_file}`;
    const documentInfo = {
      url: documentUrl,
      name: item.upload_file
    };
    
    setSelectedDocument(documentInfo);
    setShowDocumentViewer(true);
  };

  const handleCloseDocumentViewer = () => {
    setShowDocumentViewer(false);
    setSelectedDocument(null);
  };

  // Prepare data for Grid component
  const gridData = data.map(item => ({
    ...item,
    projectTitle: item.project_title ? truncateText(item.project_title, 50) : '-',
    role: item.role || '-',
    fundingAgency: item.funding_agency ? truncateText(item.funding_agency, 30) : '-',
    status: item.status || '-',
    duration: item.duration ? `${item.duration} months` : '-',
    actions: item.upload_file ? (
      <button
        className="document-view-btn"
        onClick={() => handleDocumentView(item)}
        title={`View Document: ${item.upload_file}`}
      >
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
        <h1>Research Projects</h1>
        <p>Manage research projects, funding details, and collaboration information.</p>
      </div>

      {/* Business Alert Messages */}
      {message && (
        <div className={`business-alert business-alert-${message.type}`}>
          <div className="business-alert-content">
            <div className="business-alert-icon">
              {message.type === 'success' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" >
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </div>
            <span className="business-alert-text">{message.text}</span>
          </div>
          <button
            className="business-alert-close"
            onClick={() => setMessage(null)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" >
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      )}

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
        addButtonText="Add Research Project"
        searchPlaceholder="Search Research Projects"
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
            Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalItems)} of {pagination.totalItems} entries
          </div>
        </div>
      )}

      {/* Modal */}
      {showAccordion && createPortal(
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal book-chapter-modal-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <h3>{editingId ? 'Edit Research Project' : 'Add New Research Project'}</h3>
                <p className="modal-subtitle">Enter research project details below</p>
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
              <form id="research-project-form" onSubmit={handleSubmit}>
                <div className="book-chapter-form-container">
                  <div className="book-chapter-form-layout">
                    {/* Left Column */}
                    <div className="book-chapter-form-left">
                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Project Title</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="projectTitle"
                            name="projectTitle"
                            className={`book-chapter-input ${validationErrors.projectTitle ? 'book-chapter-field-error' : ''}`}
                            value={formData.projectTitle}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter project title"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.projectTitle && (
                          <div className="book-chapter-field-error-message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.projectTitle}
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Role</label>
                        <div className="book-chapter-input-wrapper">
                          <select
                            id="role"
                            name="role"
                            className={`book-chapter-input ${validationErrors.role ? 'book-chapter-field-error' : ''}`}
                            value={formData.role}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Role</option>
                            <option value="Principal Investigator">Principal Investigator</option>
                            <option value="Co-Investigator">Co-Investigator</option>
                            <option value="Research Associate">Research Associate</option>
                            <option value="Project Manager">Project Manager</option>
                          </select>
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.role && (
                          <div className="book-chapter-field-error-message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.role}
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Funding Agency</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="fundingAgency"
                            name="fundingAgency"
                            className={`book-chapter-input ${validationErrors.fundingAgency ? 'book-chapter-field-error' : ''}`}
                            value={formData.fundingAgency}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter funding agency"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.fundingAgency && (
                          <div className="book-chapter-field-error-message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.fundingAgency}
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Sanctioned Date</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="date"
                            id="sanctionedDate"
                            name="sanctionedDate"
                            className={`book-chapter-input ${validationErrors.sanctionedDate ? 'book-chapter-field-error' : ''}`}
                            value={formData.sanctionedDate}
                            onChange={handleInputChange}
                            required
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
                        {validationErrors.sanctionedDate && (
                          <div className="book-chapter-field-error-message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.sanctionedDate}
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Amount Sanctioned (₹)</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="number"
                            id="amountSanctioned"
                            name="amountSanctioned"
                            className={`book-chapter-input ${validationErrors.amountSanctioned ? 'book-chapter-field-error' : ''}`}
                            value={formData.amountSanctioned}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter sanctioned amount"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.amountSanctioned && (
                          <div className="book-chapter-field-error-message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.amountSanctioned}
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Duration (months)</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="number"
                            id="duration"
                            name="duration"
                            className={`book-chapter-input ${validationErrors.duration ? 'book-chapter-field-error' : ''}`}
                            value={formData.duration}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter duration in months"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.duration && (
                          <div className="book-chapter-field-error-message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.duration}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="book-chapter-form-right">
                      <div className="book-chapter-form-group">
                        <label>Team Members</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="teamMembers"
                            name="teamMembers"
                            className="book-chapter-input"
                            value={formData.teamMembers}
                            onChange={handleInputChange}
                            placeholder="Enter team member names"
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
                      </div>

                      <div className="book-chapter-form-group">
                        <label>Collaboration</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="collaboration"
                            name="collaboration"
                            className="book-chapter-input"
                            value={formData.collaboration}
                            onChange={handleInputChange}
                            placeholder="Enter collaboration details"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Status</label>
                        <div className="book-chapter-input-wrapper">
                          <select
                            id="status"
                            name="status"
                            className="book-chapter-input"
                            value={formData.status}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="On Going">On Going</option>
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="book-chapter-form-group">
                        <label>Amount Utilized (₹)</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="number"
                            id="amountUtilized"
                            name="amountUtilized"
                            className="book-chapter-input"
                            value={formData.amountUtilized}
                            onChange={handleInputChange}
                            placeholder="Enter utilized amount"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Outcome Section */}
                  <div className="book-chapter-form-group book-chapter-form-group-full">
                    <label>Project Outcome</label>
                    <div className="book-chapter-textarea-wrapper">
                      <textarea
                        id="outcome"
                        name="outcome"
                        className="book-chapter-textarea"
                        value={formData.outcome}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Describe the project outcomes and achievements..."
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
                  <div className="book-chapter-form-group book-chapter-form-group-full" style={{ marginTop: '24px' }}>
                    <label className="book-chapter-required">Project Document Upload</label>
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
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" >
                                  <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <div className="book-chapter-file-info">
                                <span className="book-chapter-file-name">{filePreview || existingFile}</span>
                                <button
                                  type="button"
                                  className="book-chapter-btn book-chapter-btn-sm book-chapter-btn-danger"
                                  onClick={handleFileDelete}
                                  title="Delete file"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" >
                                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="book-chapter-upload-placeholder">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" >
                                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <div className="book-chapter-upload-text">
                                <p className="book-chapter-upload-title">Drop your project document here</p>
                                <p className="book-chapter-upload-subtitle">Or click to browse</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Hidden File Input */}
                        <input
                          ref={fileInputRef}
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
                form="research-project-form"
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
    </div>
  );
};

export default ResearchProjects;