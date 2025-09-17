import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import Grid from '../../components/Grid/Grid';
import DocumentViewer from '../../components/DocumentViewer/DocumentViewer';
import ValidationPopup from '../../components/ValidationPopup';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';
import '../../styles/components/SharedModal.css';

interface ResearchPublicationData {
  id?: number;
  titleOfPaper: string;
  authors: string;
  pageNo: string;
  publicationJournalTitle: string;
  publicationYear: string;
  publisher: string;
  volumeNo: string;
  issnIsbn: string;
  scopusSciPeerReviewed: string;
  doi: string;
  impactFactor: string;
  type: string;
  levelStatus: string;
  status: string;
  hIndex: string;
  i10Index: string;
  snip: string;
  sjrIndex: string;
  publishedUrl: string;
  indexTerms: string;
  issueNo: string;
  conferenceName: string;
  eventOrganizer: string;
  anyAwards: boolean;
  institutionalAffiliation: boolean;
  abstract: string;
  uploadFile?: string;
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

// API Response interface for database fields
interface ResearchPublicationAPIResponse {
  id: number;
  title_of_paper: string;
  authors: string;
  page_no: string;
  publication_journal_title: string;
  publication_year: string;
  publisher: string;
  volume_no: string;
  issn_isbn: string;
  scopus_sci_peer_reviewed: string;
  doi: string;
  impact_factor: string;
  type: string;
  level_status: string;
  status: string;
  h_index: string;
  i10_index: string;
  snip: string;
  sjr_index: string;
  published_url: string;
  index_terms: string;
  issue_no: string;
  conference_name: string;
  event_organizer: string;
  any_awards: boolean;
  institutional_affiliation: boolean;
  abstract: string;
  upload_file: string | null;
  created_at: string;
  updated_at: string;
}

const ResearchPublication: React.FC = () => {
  const [data, setData] = useState<ResearchPublicationAPIResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAccordion, setShowAccordion] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filterType, setFilterType] = useState('Journal');

  // File handling states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [existingFile, setExistingFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ url: string; name: string } | null>(null);

  const [formData, setFormData] = useState<ResearchPublicationData>({
    titleOfPaper: '',
    authors: '',
    pageNo: '',
    publicationJournalTitle: '',
    publicationYear: '',
    publisher: '',
    volumeNo: '',
    issnIsbn: '',
    scopusSciPeerReviewed: 'SCI',
    doi: '',
    impactFactor: '',
    type: 'Journal',
    levelStatus: 'International',
    status: 'Published',
    hIndex: '',
    i10Index: '',
    snip: '',
    sjrIndex: '',
    publishedUrl: '',
    indexTerms: '',
    issueNo: '',
    conferenceName: '',
    eventOrganizer: '',
    anyAwards: false,
    institutionalAffiliation: true,
    abstract: '',
    uploadFile: ''
  });


  // Grid columns configuration
  const gridColumns = [
    { key: 'titleOfPaper', title: 'Title of Paper', width: '25%' },
    { key: 'authors', title: 'Author(s)', width: '15%' },
    { key: 'publicationJournalTitle', title: 'Journal/Conference', width: '15%' },
    { key: 'publicationYear', title: 'Year', width: '8%' },
    { key: 'type', title: 'Type', width: '8%' },
    { key: 'status', title: 'Status', width: '8%' },
    { key: 'upload_file', title: 'Document', width: '12%' },
    { key: 'actions', title: 'Actions', width: '9%' }
  ];

  // Utility functions
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Sample data
  const sampleData: ResearchPublicationData[] = [
    {
      id: 1,
      titleOfPaper: 'Machine Learning Approaches for Educational Data Mining',
      authors: 'Dr. John Smith, Dr. Jane Doe, Dr. Michael Johnson',
      pageNo: '45-62',
      publicationJournalTitle: 'Journal of Educational Technology',
      publicationYear: '2024',
      publisher: 'Springer Nature',
      volumeNo: '15',
      issnIsbn: 'ISSN: 1234-5678',
      scopusSciPeerReviewed: 'SCI',
      doi: '10.1007/s12345-024-00123-4',
      impactFactor: '3.45',
      type: 'Journal',
      levelStatus: 'International',
      status: 'Published',
      hIndex: '25',
      i10Index: '18',
      snip: '1.2',
      sjrIndex: '0.8',
      publishedUrl: 'https://link.springer.com/article/10.1007/s12345-024-00123-4',
      indexTerms: 'Machine Learning, Educational Data Mining, Learning Analytics',
      issueNo: '3',
      conferenceName: '',
      eventOrganizer: '',
      anyAwards: false,
      institutionalAffiliation: true,
      abstract: 'This paper presents novel machine learning approaches for analyzing educational data...',
      uploadFile: 'publication_paper.pdf'
    }
  ];

  // Utility function to get the correct base URL for static files
  const getStaticBaseUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace('/api', '');
  };

  // Fetch data
  const fetchData = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await configAPI.researchPublications.getAll({
        page,
        limit: 10,
        search
      });

      if (response.data.success) {
        setData(response.data.data);
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalCount: response.data.pagination.totalCount,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch research publications data' });
      }
    } catch (error) {
      console.error('Error fetching research publications:', error);
      setMessage({ type: 'error', text: 'Failed to fetch research publications data' });
    } finally {
      setLoading(false);
    }
  };

  // File handling functions (replicated from Professional Bodies)
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


  // Document viewer functions
  const handleDocumentView = (item: ResearchPublicationAPIResponse) => {
    if (!item.upload_file) {
      setMessage({ type: 'error', text: 'No document available for this entry' });
      return;
    }

    const documentUrl = `${getStaticBaseUrl()}/uploads/research-publications/${item.upload_file}`;
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

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error message and field-specific validation errors when user starts typing
    if (message && message.type === 'error') {
      setMessage(null);
    }
    
    // Clear field-specific validation error
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
    if (!formData.titleOfPaper.trim()) {
      errors.titleOfPaper = 'Title of paper is required';
      hasErrors = true;
    }

    if (!formData.authors.trim()) {
      errors.authors = 'Authors are required';
      hasErrors = true;
    }

    if (!formData.publicationJournalTitle.trim()) {
      errors.publicationJournalTitle = 'Publication journal title is required';
      hasErrors = true;
    }

    if (!formData.publicationYear.trim()) {
      errors.publicationYear = 'Publication year is required';
      hasErrors = true;
    }

    if (!formData.type.trim()) {
      errors.type = 'Type is required';
      hasErrors = true;
    }

    if (!formData.levelStatus.trim()) {
      errors.levelStatus = 'Level status is required';
      hasErrors = true;
    }

    if (!formData.status.trim()) {
      errors.status = 'Status is required';
      hasErrors = true;
    }

    // Validate year format
    if (formData.publicationYear && !/^\d{4}$/.test(formData.publicationYear)) {
      errors.publicationYear = 'Publication year must be a valid 4-digit year';
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
      formDataToSend.append('titleOfPaper', formData.titleOfPaper);
      formDataToSend.append('authors', formData.authors);
      formDataToSend.append('pageNo', formData.pageNo || '');
      formDataToSend.append('publicationJournalTitle', formData.publicationJournalTitle);
      formDataToSend.append('publicationYear', formData.publicationYear);
      formDataToSend.append('publisher', formData.publisher || '');
      formDataToSend.append('volumeNo', formData.volumeNo || '');
      formDataToSend.append('issnIsbn', formData.issnIsbn || '');
      formDataToSend.append('scopusSciPeerReviewed', formData.scopusSciPeerReviewed);
      formDataToSend.append('doi', formData.doi || '');
      formDataToSend.append('impactFactor', formData.impactFactor || '');
      formDataToSend.append('type', formData.type);
      formDataToSend.append('levelStatus', formData.levelStatus);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('hIndex', formData.hIndex || '');
      formDataToSend.append('i10Index', formData.i10Index || '');
      formDataToSend.append('snip', formData.snip || '');
      formDataToSend.append('sjrIndex', formData.sjrIndex || '');
      formDataToSend.append('publishedUrl', formData.publishedUrl || '');
      formDataToSend.append('indexTerms', formData.indexTerms || '');
      formDataToSend.append('issueNo', formData.issueNo || '');
      formDataToSend.append('conferenceName', formData.conferenceName || '');
      formDataToSend.append('eventOrganizer', formData.eventOrganizer || '');
      formDataToSend.append('anyAwards', formData.anyAwards.toString());
      formDataToSend.append('institutionalAffiliation', formData.institutionalAffiliation.toString());
      formDataToSend.append('abstract', formData.abstract || '');

      if (selectedFile) {
        formDataToSend.append('uploadFile', selectedFile, selectedFile.name);
      } else if (editingId && !filePreview && !existingFile) {
        formDataToSend.append('delete_file', 'true');
      }

      let response;
      if (editingId) {
        response = await configAPI.researchPublications.update(editingId.toString(), formDataToSend);
        setMessage({ type: 'success', text: 'Research publication updated successfully' });
      } else {
        response = await configAPI.researchPublications.create(formDataToSend);
        setMessage({ type: 'success', text: 'Research publication created successfully' });
      }

      // Refresh data
      await fetchData(pagination.currentPage, searchTerm);
      
      setShowAccordion(false);
      setEditingId(null);
      setFormData({
        titleOfPaper: '',
        authors: '',
        pageNo: '',
        publicationJournalTitle: '',
        publicationYear: '',
        publisher: '',
        volumeNo: '',
        issnIsbn: '',
        scopusSciPeerReviewed: 'SCI',
        doi: '',
        impactFactor: '',
        type: 'Journal',
        levelStatus: 'International',
        status: 'Published',
        hIndex: '',
        i10Index: '',
        snip: '',
        sjrIndex: '',
        publishedUrl: '',
        indexTerms: '',
        issueNo: '',
        conferenceName: '',
        eventOrganizer: '',
        anyAwards: false,
        institutionalAffiliation: true,
        abstract: '',
        uploadFile: ''
      });
      handleFileDelete();
    } catch (error) {
      console.error('Error saving research publication:', error);
      setMessage({ type: 'error', text: 'Failed to save research publication' });
    } finally {
      setSaving(false);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setFormData({
      titleOfPaper: '',
      authors: '',
      pageNo: '',
      publicationJournalTitle: '',
      publicationYear: '',
      publisher: '',
      volumeNo: '',
      issnIsbn: '',
      scopusSciPeerReviewed: 'SCI',
      doi: '',
      impactFactor: '',
      type: 'Journal',
      levelStatus: 'International',
      status: 'Published',
      hIndex: '',
      i10Index: '',
      snip: '',
      sjrIndex: '',
      publishedUrl: '',
      indexTerms: '',
      issueNo: '',
      conferenceName: '',
      eventOrganizer: '',
      anyAwards: false,
      institutionalAffiliation: true,
      abstract: '',
      uploadFile: ''
    });
    setFilePreview(null);
    setExistingFile(null);
    setEditingId(null);
    setShowAccordion(true);
  };

  // Handle edit
  const handleEdit = (item: ResearchPublicationAPIResponse) => {
    setFormData({
      titleOfPaper: item.title_of_paper,
      authors: item.authors,
      pageNo: item.page_no || '',
      publicationJournalTitle: item.publication_journal_title,
      publicationYear: item.publication_year,
      publisher: item.publisher || '',
      volumeNo: item.volume_no || '',
      issnIsbn: item.issn_isbn || '',
      scopusSciPeerReviewed: item.scopus_sci_peer_reviewed,
      doi: item.doi || '',
      impactFactor: item.impact_factor || '',
      type: item.type,
      levelStatus: item.level_status,
      status: item.status,
      hIndex: item.h_index || '',
      i10Index: item.i10_index || '',
      snip: item.snip || '',
      sjrIndex: item.sjr_index || '',
      publishedUrl: item.published_url || '',
      indexTerms: item.index_terms || '',
      issueNo: item.issue_no || '',
      conferenceName: item.conference_name || '',
      eventOrganizer: item.event_organizer || '',
      anyAwards: item.any_awards,
      institutionalAffiliation: item.institutional_affiliation,
      abstract: item.abstract || '',
      uploadFile: item.upload_file || ''
    });
    setExistingFile(item.upload_file ? `${getStaticBaseUrl()}/api/faculty/uploads/${item.upload_file}` : null);
    setFilePreview(null);
    setSelectedFile(null);
    setFileName(item.upload_file || '');
    setEditingId(item.id);
    setShowAccordion(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this research publication entry?')) {
      try {
        await configAPI.researchPublications.delete(id.toString());
        setMessage({ type: 'success', text: 'Research publication deleted successfully' });
        await fetchData(pagination.currentPage, searchTerm);
      } catch (error) {
        console.error('Error deleting research publication:', error);
        setMessage({ type: 'error', text: 'Failed to delete research publication' });
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAccordion(false);
    setEditingId(null);
    setFormData({
      titleOfPaper: '',
      authors: '',
      pageNo: '',
      publicationJournalTitle: '',
      publicationYear: '',
      publisher: '',
      volumeNo: '',
      issnIsbn: '',
      scopusSciPeerReviewed: 'SCI',
      doi: '',
      impactFactor: '',
      type: 'Journal',
      levelStatus: 'International',
      status: 'Published',
      hIndex: '',
      i10Index: '',
      snip: '',
      sjrIndex: '',
      publishedUrl: '',
      indexTerms: '',
      issueNo: '',
      conferenceName: '',
      eventOrganizer: '',
      anyAwards: false,
      institutionalAffiliation: true,
      abstract: '',
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

  const handleGridEdit = (item: ResearchPublicationAPIResponse) => {
    handleEdit(item);
  };

  const handleGridDelete = (item: ResearchPublicationAPIResponse) => {
    if (item.id) {
      handleDelete(item.id);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchTerm);
  };


  // Prepare data for Grid component
  const gridData = data.map(item => ({
    ...item,
    titleOfPaper: item.title_of_paper ? truncateText(item.title_of_paper, 50) : '-',
    authors: item.authors ? truncateText(item.authors, 30) : '-',
    publicationJournalTitle: item.publication_journal_title ? truncateText(item.publication_journal_title, 30) : '-',
    publicationYear: item.publication_year || '-',
    type: item.type || '-',
    status: item.status || '-',
    upload_file: item.upload_file ? (
      <button
        className="book-chapter-btn book-chapter-btn-sm book-chapter-btn-primary"
        onClick={() => handleDocumentView(item)}
        title="View Document"
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
        <h1>Research Publication</h1>
        <p>Manage research publications, journal articles, and conference papers with comprehensive metadata.</p>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-controls">
          <div className="filter-group">
            <label>Filter Type by:</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="Journal">Journal</option>
              <option value="Conference">Conference</option>
              <option value="Book">Book</option>
              <option value="All">All</option>
            </select>
          </div>
        </div>
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
        addButtonText="Add Research Publication"
        searchPlaceholder="Search Research Publications"
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
                <h3>{editingId ? 'Edit Research Publication' : 'Add New Research Publication'}</h3>
                <p className="modal-subtitle">Enter research publication details below</p>
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
              <form id="research-publication-form" onSubmit={handleSubmit}>
                <div className="book-chapter-form-container">
                  <div className="book-chapter-form-layout">
                    {/* Left Column */}
                    <div className="book-chapter-form-left">
                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Title of Paper</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="titleOfPaper"
                            name="titleOfPaper"
                            className={`book-chapter-input ${validationErrors.titleOfPaper ? 'book-chapter-input-error' : ''}`}
                            value={formData.titleOfPaper}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter paper title"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.titleOfPaper && (
                          <div className="book-chapter-field-error-message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.titleOfPaper}
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Author(s)</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="authors"
                            name="authors"
                            className={`book-chapter-input ${validationErrors.authors ? 'book-chapter-input-error' : ''}`}
                            value={formData.authors}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter author names"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.authors && (
                          <div className="book-chapter-field-error-message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.authors}
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Publication/Journal Title</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="publicationJournalTitle"
                            name="publicationJournalTitle"
                            className={`book-chapter-input ${validationErrors.publicationJournalTitle ? 'book-chapter-input-error' : ''}`}
                            value={formData.publicationJournalTitle}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter journal/conference title"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.publicationJournalTitle && (
                          <div className="book-chapter-field-error-message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.publicationJournalTitle}
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Publication Year</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="publicationYear"
                            name="publicationYear"
                            className={`book-chapter-input ${validationErrors.publicationYear ? 'book-chapter-input-error' : ''}`}
                            value={formData.publicationYear}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter publication year"
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
                        {validationErrors.publicationYear && (
                          <div className="book-chapter-field-error-message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {validationErrors.publicationYear}
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Publisher</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="publisher"
                            name="publisher"
                            className="book-chapter-input"
                            value={formData.publisher}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter publisher name"
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
                        <label className="book-chapter-required">Type</label>
                        <div className="book-chapter-input-wrapper">
                          <select
                            id="type"
                            name="type"
                            className="book-chapter-input"
                            value={formData.type}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="Journal">Journal</option>
                            <option value="Conference">Conference</option>
                            <option value="Book">Book</option>
                            <option value="Book Chapter">Book Chapter</option>
                          </select>
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="book-chapter-form-right">
                      <div className="book-chapter-form-group">
                        <label>Volume No.</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="volumeNo"
                            name="volumeNo"
                            className="book-chapter-input"
                            value={formData.volumeNo}
                            onChange={handleInputChange}
                            placeholder="Enter volume number"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="book-chapter-form-group">
                        <label>Issue No.</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="issueNo"
                            name="issueNo"
                            className="book-chapter-input"
                            value={formData.issueNo}
                            onChange={handleInputChange}
                            placeholder="Enter issue number"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="book-chapter-form-group">
                        <label>ISSN/ISBN</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="issnIsbn"
                            name="issnIsbn"
                            className="book-chapter-input"
                            value={formData.issnIsbn}
                            onChange={handleInputChange}
                            placeholder="Enter ISSN/ISBN"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="book-chapter-form-group">
                        <label>DOI</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="doi"
                            name="doi"
                            className="book-chapter-input"
                            value={formData.doi}
                            onChange={handleInputChange}
                            placeholder="Enter DOI"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="book-chapter-form-group">
                        <label>Impact Factor</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="impactFactor"
                            name="impactFactor"
                            className="book-chapter-input"
                            value={formData.impactFactor}
                            onChange={handleInputChange}
                            placeholder="Enter impact factor"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                            <option value="Published">Published</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Submitted">Submitted</option>
                          </select>
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
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
                        placeholder="Enter paper abstract..."
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
                    <label>Publication Document Upload</label>
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
                                <p className="book-chapter-upload-title">Drop your publication document here</p>
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
                form="research-publication-form"
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
      {showDocumentViewer && selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={handleCloseDocumentViewer}
          isOpen={showDocumentViewer}
        />
      )}
    </div>
  );
};

export default ResearchPublication;