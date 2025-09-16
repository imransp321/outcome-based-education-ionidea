import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Grid from '../../components/Grid/Grid';
import { DocumentViewer, DocumentInfo } from '../../components/DocumentViewer';
import { DocumentUpload } from '../../components/DocumentUpload';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';
import '../../styles/components/SharedModal.css';

interface FacultyInternshipData {
  id?: number;
  nameOfInternship: string;
  companyAndPlace: string;
  duration: string;
  year: string;
  outcome: string;
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

const FacultyInternship: React.FC = () => {
  const [data, setData] = useState<FacultyInternshipData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAccordion, setShowAccordion] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  const [formData, setFormData] = useState<FacultyInternshipData>({
    nameOfInternship: '',
    companyAndPlace: '',
    duration: '',
    year: '',
    outcome: '',
    uploadFile: ''
  });

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [existingFile, setExistingFile] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentInfo | null>(null);

  // Grid columns configuration
  const gridColumns = [
    { key: 'nameOfInternship', title: 'Internship/Training', width: '25%' },
    { key: 'companyAndPlace', title: 'Company & Place', width: '20%' },
    { key: 'duration', title: 'Duration', width: '12%' },
    { key: 'year', title: 'Year', width: '8%' },
    { key: 'outcome', title: 'Outcome', width: '20%' },
    { 
      key: 'uploadFile', 
      title: 'Upload', 
      width: '15%',
      render: (value: string, row: FacultyInternshipData) => (
        value ? (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleDocumentView(row)}
            title="View Document"
          >
            📄 View
          </button>
        ) : '-'
      )
    }
  ];

  // Utility functions
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Sample data
  const sampleData: FacultyInternshipData[] = [
    {
      id: 1,
      nameOfInternship: 'Industry Collaboration Program',
      companyAndPlace: 'TechCorp Solutions, Bangalore',
      duration: '3 months',
      year: '2024',
      outcome: 'Successfully completed industry training in software development methodologies and gained hands-on experience with modern technologies.',
      uploadFile: 'internship_certificate.pdf'
    },
    {
      id: 2,
      nameOfInternship: 'Faculty Development Program',
      companyAndPlace: 'Microsoft India, Hyderabad',
      duration: '6 months',
      year: '2023',
      outcome: 'Enhanced skills in cloud computing and AI technologies, leading to improved curriculum design and student training.',
      uploadFile: 'fdp_certificate.pdf'
    }
  ];

  // Fetch data
  const fetchData = async (page = 1, search = '') => {
    setLoading(true);
    try {
      // Simulate API call with sample data
      setTimeout(() => {
        const filteredData = sampleData.filter(item =>
          item.nameOfInternship.toLowerCase().includes(search.toLowerCase()) ||
          item.companyAndPlace.toLowerCase().includes(search.toLowerCase()) ||
          item.outcome.toLowerCase().includes(search.toLowerCase())
        );
        
        const itemsPerPage = 10;
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        setData(paginatedData);
        setPagination({
          currentPage: page,
          totalPages,
          totalCount: filteredData.length,
          hasNext: page < totalPages,
          hasPrev: page > 1
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch internship data' });
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
  };

  // Handle document view
  const handleDocumentView = (item: FacultyInternshipData) => {
    if (item.uploadFile) {
      setSelectedDocument({
        url: `/uploads/internship/${item.uploadFile}`, // Adjust path as needed
        name: item.uploadFile
      });
      setShowDocumentViewer(true);
    }
  };

  // Handle close document viewer
  const handleCloseDocumentViewer = () => {
    setShowDocumentViewer(false);
    setSelectedDocument(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Simulate API call
      setTimeout(() => {
        if (editingId) {
          setData(prev => prev.map(item => 
            item.id === editingId ? { ...formData, id: editingId } : item
          ));
          setMessage({ type: 'success', text: 'Internship updated successfully' });
    } else {
          const newItem = {
            ...formData,
            id: Date.now()
          };
          setData(prev => [newItem, ...prev]);
          setMessage({ type: 'success', text: 'Internship created successfully' });
        }

        setShowAccordion(false);
        setEditingId(null);
        setFormData({
          nameOfInternship: '',
          companyAndPlace: '',
          duration: '',
          year: '',
          outcome: '',
          uploadFile: ''
        });
        setFilePreview(null);
        setExistingFile(null);
        setSaving(false);
        fetchData(pagination.currentPage, searchTerm);
      }, 500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save internship' });
      setSaving(false);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setFormData({
      nameOfInternship: '',
      companyAndPlace: '',
      duration: '',
      year: '',
      outcome: '',
      uploadFile: ''
    });
    setFilePreview(null);
    setExistingFile(null);
    setEditingId(null);
    setShowAccordion(true);
  };

  // Handle edit
  const handleEdit = (item: FacultyInternshipData) => {
    setFormData({
      nameOfInternship: item.nameOfInternship,
      companyAndPlace: item.companyAndPlace,
      duration: item.duration,
      year: item.year,
      outcome: item.outcome,
      uploadFile: item.uploadFile || ''
    });
    setExistingFile(item.uploadFile || null);
    setFilePreview(null);
    setEditingId(item.id!);
    setShowAccordion(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this internship entry?')) {
      try {
        setData(prev => prev.filter(item => item.id !== id));
        setMessage({ type: 'success', text: 'Internship deleted successfully' });
        fetchData(pagination.currentPage, searchTerm);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete internship' });
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAccordion(false);
    setEditingId(null);
    setFormData({
      nameOfInternship: '',
      companyAndPlace: '',
      duration: '',
      year: '',
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

  const handleGridEdit = (item: FacultyInternshipData) => {
    handleEdit(item);
  };

  const handleGridDelete = (item: FacultyInternshipData) => {
    if (item.id) {
      handleDelete(item.id);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchTerm);
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilePreview(file.name);
    }
  };

  // Handle drag and drop
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
      setFilePreview(file.name);
    }
  };

  // Handle delete file
  const handleDeleteFile = () => {
    setFilePreview(null);
    setExistingFile(null);
  };

  // Prepare data for Grid component
  const gridData = data.map(item => ({
    ...item,
    nameOfInternship: item.nameOfInternship ? truncateText(item.nameOfInternship, 40) : '-',
    companyAndPlace: item.companyAndPlace ? truncateText(item.companyAndPlace, 30) : '-',
    duration: item.duration || '-',
    year: item.year || '-',
    outcome: item.outcome ? truncateText(item.outcome, 50) : '-'
  }));

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Faculty Internship / Training</h1>
        <p>Manage faculty internship, training, and collaboration records with industry partners.</p>
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

      {/* Modal */}
      {showAccordion && createPortal(
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal book-chapter-modal-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <h3>{editingId ? 'Edit Internship' : 'Add New Internship'}</h3>
                <p className="modal-subtitle">Enter internship details below</p>
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
              <form id="internship-form" onSubmit={handleSubmit}>
                <div className="book-chapter-form-container">
                  <div className="book-chapter-form-layout">
                    {/* Left Column */}
                    <div className="book-chapter-form-left">
                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Internship/Training Name</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="nameOfInternship"
                            name="nameOfInternship"
                            className="book-chapter-input"
                            value={formData.nameOfInternship}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter internship or training name"
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
                        <label className="book-chapter-required">Company & Place</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="companyAndPlace"
                            name="companyAndPlace"
                            className="book-chapter-input"
                            value={formData.companyAndPlace}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter company name and location"
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
                        <label className="book-chapter-required">Duration</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="duration"
                            name="duration"
                            className="book-chapter-input"
                            value={formData.duration}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., 3 months, 6 weeks"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Year</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="year"
                            name="year"
                            className="book-chapter-input"
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
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="book-chapter-form-right">
                      <div className="book-chapter-form-group">
                        <label>Outcome/Results</label>
                        <div className="book-chapter-textarea-wrapper">
                          <textarea
                            id="outcome"
                            name="outcome"
                            className="book-chapter-textarea"
                            value={formData.outcome}
                            onChange={handleInputChange}
                            rows={8}
                            placeholder="Describe the outcomes and results of the internship/training..."
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
                    <DocumentUpload
                      selectedFile={selectedFile}
                      filePreview={filePreview}
                      existingFile={existingFile}
                      fileLoading={false}
                      isDragOver={isDragOver}
                      onFileSelect={setSelectedFile}
                      onFileDelete={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                        setExistingFile(null);
                      }}
                      onUploadClick={() => {
                        const fileInput = document.getElementById('uploadFile') as HTMLInputElement;
                        fileInput?.click();
                      }}
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
                          setSelectedFile(files[0]);
                        }
                      }}
                      accept="image/*,.pdf,.doc,.docx"
                      maxSize={5}
                    />
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
                form="internship-form"
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
        addButtonText="Add Internship"
        searchPlaceholder="Search Internships"
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
    </div>
  );
};

export default FacultyInternship;

