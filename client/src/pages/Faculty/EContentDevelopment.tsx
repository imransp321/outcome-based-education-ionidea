import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Grid from '../../components/Grid/Grid';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

interface EContentDevelopmentData {
  id?: number;
  eContentTypes: string;
  nameOfCourse: string;
  year: string;
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

const EContentDevelopment: React.FC = () => {
  const [data, setData] = useState<EContentDevelopmentData[]>([]);
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

  const [formData, setFormData] = useState<EContentDevelopmentData>({
    eContentTypes: '',
    nameOfCourse: '',
    year: '',
    uploadFile: ''
  });

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [existingFile, setExistingFile] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Grid columns configuration
  const gridColumns = [
    { key: 'eContentTypes', title: 'E-Content Types', width: '25%' },
    { key: 'nameOfCourse', title: 'Course Name', width: '40%' },
    { key: 'year', title: 'Year', width: '15%' },
    { key: 'uploadFile', title: 'File', width: '20%' }
  ];

  // Utility functions
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Sample data
  const sampleData: EContentDevelopmentData[] = [
    {
      id: 1,
      eContentTypes: 'SWAYAM MOOCs',
      nameOfCourse: 'Introduction to Machine Learning',
      year: '2024',
      uploadFile: 'course_certificate.pdf'
    },
    {
      id: 2,
      eContentTypes: 'NPTEL',
      nameOfCourse: 'Data Structures and Algorithms',
      year: '2023',
      uploadFile: 'nptel_certificate.pdf'
    }
  ];

  // Fetch data
  const fetchData = async (page = 1, search = '') => {
    setLoading(true);
    try {
      // Simulate API call with sample data
      setTimeout(() => {
        const filteredData = sampleData.filter(item =>
          item.nameOfCourse.toLowerCase().includes(search.toLowerCase()) ||
          item.eContentTypes.toLowerCase().includes(search.toLowerCase())
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
      setMessage({ type: 'error', text: 'Failed to fetch e-content data' });
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
          setMessage({ type: 'success', text: 'E-content updated successfully' });
    } else {
          const newItem = {
            ...formData,
            id: Date.now()
          };
          setData(prev => [newItem, ...prev]);
          setMessage({ type: 'success', text: 'E-content created successfully' });
        }

        setShowAccordion(false);
        setEditingId(null);
        setFormData({
          eContentTypes: '',
          nameOfCourse: '',
          year: '',
          uploadFile: ''
        });
        setFilePreview(null);
        setExistingFile(null);
        setSaving(false);
        fetchData(pagination.currentPage, searchTerm);
      }, 500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save e-content' });
      setSaving(false);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setFormData({
      eContentTypes: '',
      nameOfCourse: '',
      year: '',
      uploadFile: ''
    });
    setFilePreview(null);
    setExistingFile(null);
    setEditingId(null);
    setShowAccordion(true);
  };

  // Handle edit
  const handleEdit = (item: EContentDevelopmentData) => {
    setFormData({
      eContentTypes: item.eContentTypes,
      nameOfCourse: item.nameOfCourse,
      year: item.year,
      uploadFile: item.uploadFile || ''
    });
    setExistingFile(item.uploadFile || null);
    setFilePreview(null);
    setEditingId(item.id!);
    setShowAccordion(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this e-content entry?')) {
      try {
        setData(prev => prev.filter(item => item.id !== id));
        setMessage({ type: 'success', text: 'E-content deleted successfully' });
        fetchData(pagination.currentPage, searchTerm);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete e-content' });
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAccordion(false);
    setEditingId(null);
    setFormData({
      eContentTypes: '',
      nameOfCourse: '',
      year: '',
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

  const handleGridEdit = (item: EContentDevelopmentData) => {
    handleEdit(item);
  };

  const handleGridDelete = (item: EContentDevelopmentData) => {
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
    eContentTypes: item.eContentTypes || '-',
    nameOfCourse: item.nameOfCourse ? truncateText(item.nameOfCourse, 50) : '-',
    year: item.year || '-',
    uploadFile: item.uploadFile ? '📄 View' : '-'
  }));

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>E-Content Development / MOOCs</h1>
        <p>Manage e-content development and certifications for MOOCs and online courses.</p>
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
                <h3>{editingId ? 'Edit E-Content Development' : 'Add New E-Content Development'}</h3>
                <p className="modal-subtitle">Manage e-content development and certifications for MOOCs and online courses</p>
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

            <div className="modal-content">
              <form id="econtent-form" onSubmit={handleSubmit} className="book-chapter-form-container">
                <div className="book-chapter-form-layout">
                  {/* Left Column */}
                  <div className="book-chapter-form-left">
                    <div className="book-chapter-form-group">
                      <label className="book-chapter-required">E-Content Types</label>
                      <div className="book-chapter-input-wrapper">
                        <select
                          id="eContentTypes"
                          name="eContentTypes"
                          className="book-chapter-input book-chapter-select"
                          value={formData.eContentTypes}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select E-Content Type</option>
                          <option value="SWAYAM MOOCs">SWAYAM MOOCs</option>
                          <option value="NPTEL">NPTEL</option>
                          <option value="Coursera">Coursera</option>
                          <option value="edX">edX</option>
                          <option value="Udemy">Udemy</option>
                          <option value="Other">Other</option>
                        </select>
                        <div className="book-chapter-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                            <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="book-chapter-form-right">
                    <div className="book-chapter-form-group">
                      <label className="book-chapter-required">Course Name/Title</label>
                      <div className="book-chapter-textarea-wrapper">
                        <textarea
                          id="nameOfCourse"
                          name="nameOfCourse"
                          className="book-chapter-textarea"
                          value={formData.nameOfCourse}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Enter course name or title..."
                          required
                        />
                        <div className="book-chapter-textarea-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Upload Section - Full Width */}
                <div className="book-chapter-form-group" style={{ gridColumn: '1 / -1', marginTop: '24px' }}>
                  <label className="book-chapter-section-label">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="book-chapter-label-icon">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Certificate/Document Upload
                  </label>
                  
                  {/* Drag and Drop Area */}
                  <div
                    className={`book-chapter-upload-area ${isDragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="book-chapter-upload-content">
                      {(filePreview || existingFile) ? (
                        <div className="book-chapter-file-preview">
                          <div className="book-chapter-file-info">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="book-chapter-file-icon">
                              <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div className="book-chapter-file-details">
                              <span className="book-chapter-file-name">{filePreview || existingFile}</span>
                              <span className="book-chapter-file-size">Certificate Document</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="book-chapter-file-delete"
                            onClick={handleDeleteFile}
                            title="Delete file"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="book-chapter-upload-placeholder">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="book-chapter-upload-icon">
                            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <div className="book-chapter-upload-text">
                            <p className="book-chapter-upload-title">Drop your certificate here</p>
                            <p className="book-chapter-upload-subtitle">Or click to browse files</p>
                            <p className="book-chapter-upload-hint">Supported: PDF, DOC, DOCX, JPG, PNG (Max 5MB)</p>
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
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

              </form>
            </div>

            <div className="modal-footer">
              <div className="modal-footer-actions">
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
                  form="econtent-form"
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
                      {editingId ? 'Update E-Content' : 'Save E-Content'}
                    </>
                  )}
                </button>
              </div>
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
          addButtonText="Add E-Content"
        searchPlaceholder="Search E-Content"
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

export default EContentDevelopment;

