import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Grid from '../../components/Grid/Grid';
import { configAPI } from '../../services/api';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';
import '../../styles/components/SharedModal.css';

interface TechnicalTalkData {
  id?: number;
  topic_of_lecture: string;
  nationality: string;
  date: string;
  institution: string;
  upload_file?: string;
  created_at?: string;
  updated_at?: string;
}

interface TechnicalTalkFormData {
  topicOfLecture: string;
  nationality: string;
  date: string;
  institution: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const TechnicalTalk: React.FC = () => {
  const [data, setData] = useState<TechnicalTalkData[]>([]);
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

  const [formData, setFormData] = useState<TechnicalTalkFormData>({
    topicOfLecture: '',
    nationality: 'National',
    date: '',
    institution: ''
  });

  // Grid columns configuration
  const gridColumns = [
    { key: 'topic_of_lecture', title: 'Topic of Lecture', width: '40%' },
    { key: 'nationality', title: 'National/International', width: '20%' },
    { key: 'date', title: 'Date', width: '15%' },
    { key: 'institution', title: 'Institution', width: '25%' }
  ];

  // Utility functions
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };


  // Fetch data
  const fetchData = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await configAPI.technicalTalks.getAll({ page, search });
      const responseData = response.data;

      if (responseData.success && Array.isArray(responseData.data)) {
        setData(responseData.data);
        setPagination({
          currentPage: responseData.pagination?.currentPage || page,
          totalPages: responseData.pagination?.totalPages || 1,
          totalCount: responseData.pagination?.totalCount || 0,
          hasNext: responseData.pagination?.hasNext || false,
          hasPrev: responseData.pagination?.hasPrev || false
        });
      } else {
        console.error('Invalid API response structure:', responseData);
        setData([]);
        setMessage({ type: 'error', text: 'Invalid data format received from server' });
      }
    } catch (error: any) {
      console.error('Error fetching technical talks:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to fetch technical talk data' 
      });
      setData([]);
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
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('topicOfLecture', formData.topicOfLecture);
      formDataToSend.append('nationality', formData.nationality);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('institution', formData.institution);

      if (editingId) {
        await configAPI.technicalTalks.update(editingId.toString(), formDataToSend);
        setMessage({ type: 'success', text: 'Technical talk updated successfully' });
      } else {
        await configAPI.technicalTalks.create(formDataToSend);
        setMessage({ type: 'success', text: 'Technical talk created successfully' });
      }

      setShowAccordion(false);
      setEditingId(null);
      setFormData({
        topicOfLecture: '',
        nationality: 'National',
        date: '',
        institution: ''
      });
      setSaving(false);
      fetchData(pagination.currentPage, searchTerm);
    } catch (error: any) {
      console.error('Error saving technical talk:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save technical talk' 
      });
      setSaving(false);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setFormData({
      topicOfLecture: '',
      nationality: 'National',
      date: '',
      institution: ''
    });
    setEditingId(null);
    setShowAccordion(true);
  };

  // Handle edit
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

  const handleEdit = (item: TechnicalTalkData) => {
    setFormData({
      topicOfLecture: item.topic_of_lecture || '',
      nationality: item.nationality || 'National',
      date: formatDateForInput(item.date),
      institution: item.institution || ''
    });
    setEditingId(item.id!);
    setShowAccordion(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this technical talk entry?')) {
      try {
        const response = await configAPI.technicalTalks.delete(id.toString());
        if (response.data.success) {
          setMessage({ type: 'success', text: 'Technical talk deleted successfully' });
          fetchData(pagination.currentPage, searchTerm);
        } else {
          setMessage({ type: 'error', text: response.data.message || 'Failed to delete technical talk' });
        }
      } catch (error: any) {
        console.error('Error deleting technical talk:', error);
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || error.message || 'Failed to delete technical talk' 
        });
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAccordion(false);
    setEditingId(null);
    setFormData({
      topicOfLecture: '',
      nationality: 'National',
      date: '',
      institution: ''
    });
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

  const handleGridEdit = (item: TechnicalTalkData) => {
    handleEdit(item);
  };

  const handleGridDelete = (item: TechnicalTalkData) => {
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
    topic_of_lecture: item.topic_of_lecture ? truncateText(item.topic_of_lecture, 50) : '-',
    nationality: item.nationality || '-',
    date: item.date || '-',
    institution: item.institution ? truncateText(item.institution, 40) : '-'
  }));

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Technical Talk / Special Lecture</h1>
        <p>Manage technical talks and special lectures delivered by faculty members.</p>
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
                <h3>{editingId ? 'Edit Technical Talk' : 'Add New Technical Talk'}</h3>
                <p className="modal-subtitle">Enter technical talk details below</p>
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
              <form id="technical-talk-form" onSubmit={handleSubmit}>
                <div className="book-chapter-form-container">
                  <div className="book-chapter-form-layout">
                    {/* Left Column */}
                    <div className="book-chapter-form-left">
                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Topic of Lecture</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="topicOfLecture"
                            name="topicOfLecture"
                            className="book-chapter-input"
                            value={formData.topicOfLecture}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter topic of lecture"
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
                        <label className="book-chapter-required">Institution</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="institution"
                            name="institution"
                            className="book-chapter-input"
                            value={formData.institution}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter institution name"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="book-chapter-form-right">
                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Nationality</label>
                        <div className="book-chapter-input-wrapper">
                          <select
                            id="nationality"
                            name="nationality"
                            className="book-chapter-input"
                            value={formData.nationality}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="National">National</option>
                            <option value="International">International</option>
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

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Date</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="date"
                            id="date"
                            name="date"
                            className="book-chapter-input"
                            value={formData.date}
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
                form="technical-talk-form"
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
        addButtonText="Add Technical Talk"
        searchPlaceholder="Search Technical Talks"
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

export default TechnicalTalk;