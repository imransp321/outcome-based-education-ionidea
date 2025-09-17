import React, { useState, useEffect } from 'react';
import Grid from '../../components/Grid/Grid';
import CoursesCompletedModal from '../../components/CoursesCompletedModal';
import DocumentViewer from '../../components/DocumentViewer/DocumentViewer';
import { DocumentInfo } from '../../components/DocumentViewer/types';
import { configAPI } from '../../services/api';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

interface CoursesCompletedData {
  id?: number;
  course_title: string;
  start_date: string;
  end_date: string;
  duration: string;
  platform: string;
  upload_certificate?: string;
  created_at?: string;
  updated_at?: string;
}

interface CoursesCompletedFormData {
  courseTitle: string;
  startDate: string;
  endDate: string;
  duration: string;
  platform: string;
  uploadCertificate?: string;
}

const CoursesCompleted: React.FC = () => {
  const [data, setData] = useState<CoursesCompletedData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CoursesCompletedFormData | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentInfo | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Utility functions
  const getStaticBaseUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace('/api', '');
  };

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Fetch data from API
  const fetchData = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await configAPI.coursesCompleted.getAll({ page, search });
      const responseData = response.data;
      
      if (responseData.success) {
        setData(responseData.data);
        // Note: Pagination would be handled here if needed
      } else {
        setMessage({ type: 'error', text: responseData.message || 'Failed to fetch courses completed data' });
      }
    } catch (error: any) {
      console.error('Error fetching courses completed data:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to fetch courses completed data' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle document view
  const handleDocumentView = (item: CoursesCompletedData) => {
    if (item.upload_certificate) {
      const documentUrl = `${getStaticBaseUrl()}/uploads/courses-completed/${item.upload_certificate}`;
      setSelectedDocument({
        url: documentUrl,
        name: item.upload_certificate
      });
      setShowDocumentViewer(true);
    }
  };

  // Handle close document viewer
  const handleCloseDocumentViewer = () => {
    setShowDocumentViewer(false);
    setSelectedDocument(null);
  };

  const columns = [
    {
      key: 'course_title',
      title: 'Course Title',
      width: '25%',
      render: (value: string) => (
        <div style={{ fontWeight: '600', color: '#1f2937' }}>{value}</div>
      )
    },
    {
      key: 'start_date',
      title: 'Date: From- To',
      width: '20%',
      render: (value: string, row: CoursesCompletedData) => (
        <div>
          <div>{row.start_date}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}> : {row.end_date}</div>
        </div>
      )
    },
    {
      key: 'duration',
      title: 'Duration',
      width: '15%'
    },
    {
      key: 'platform',
      title: 'Platform',
      width: '15%'
    },
    {
      key: 'upload_certificate',
      title: 'Certificate',
      width: '15%',
      render: (value: string, row: CoursesCompletedData) => (
        <div style={{ textAlign: 'center' }}>
          {value ? (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleDocumentView(row)}
              title="View Certificate"
            >
              📄 View
            </button>
          ) : (
            <span style={{ color: '#9ca3af' }}>-</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '10%',
      render: (value: any, row: CoursesCompletedData) => (
        <div className="action-buttons">
          <button
            className="btn btn-sm btn-outline-primary me-1"
            onClick={() => handleEdit(row)}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(row)}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      )
    }
  ];

  const handleSave = async (newItem: CoursesCompletedFormData) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('courseTitle', newItem.courseTitle);
      formDataToSend.append('startDate', newItem.startDate);
      formDataToSend.append('endDate', newItem.endDate);
      formDataToSend.append('duration', newItem.duration);
      formDataToSend.append('platform', newItem.platform);
      
      if (newItem.uploadCertificate) {
        formDataToSend.append('uploadCertificate', newItem.uploadCertificate);
      }

      if (editingItem && editingItemId) {
        await configAPI.coursesCompleted.update(editingItemId.toString(), formDataToSend);
        setMessage({ type: 'success', text: 'Course completed record updated successfully' });
      } else {
        await configAPI.coursesCompleted.create(formDataToSend);
        setMessage({ type: 'success', text: 'Course completed record created successfully' });
      }

      setShowModal(false);
      setEditingItem(null);
      setEditingItemId(null);
      await fetchData();
    } catch (error: any) {
      console.error('Error saving course completed record:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save course completed record' 
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setEditingItemId(null);
  };

  const handleEdit = (item: CoursesCompletedData) => {
    // Convert database format to form format
    const formItem: CoursesCompletedFormData = {
      courseTitle: item.course_title,
      startDate: formatDateForInput(item.start_date),
      endDate: formatDateForInput(item.end_date),
      duration: item.duration,
      platform: item.platform,
      uploadCertificate: item.upload_certificate
    };
    setEditingItem(formItem);
    setEditingItemId(item.id!);
    setShowModal(true);
  };

  const handleDelete = async (item: CoursesCompletedData) => {
    if (window.confirm('Are you sure you want to delete this course entry?')) {
      try {
        await configAPI.coursesCompleted.delete(item.id!.toString());
        setMessage({ type: 'success', text: 'Course completed record deleted successfully' });
        await fetchData();
      } catch (error: any) {
        console.error('Error deleting course completed record:', error);
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Failed to delete course completed record' 
        });
      }
    }
  };

  const handleAdd = () => {
    console.log('handleAdd called - setting showModal to true');
    setEditingItem(null);
    setEditingItemId(null);
    setShowModal(true);
  };

  // Filter data based on search query
  const filteredData = data.filter(item =>
    item.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Courses Completed</h1>
        <p>Manage completed course records with certificates and platform details.</p>
        {/* Debug button */}
        <button 
          onClick={handleAdd}
          style={{
            background: 'red',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            marginTop: '10px',
            cursor: 'pointer'
          }}
        >
          DEBUG: Test Modal
        </button>
      </div>

      {/* Grid Component */}
      <Grid
        columns={columns}
        data={paginatedData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSearch={handleSearch}
        searchable={true}
        loading={loading}
        addButtonText="Add Course"
        searchPlaceholder="Search completed courses..."
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-controls">
            <button
              className="pagination-btn pagination-btn-secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Previous
            </button>
            
            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-btn ${page === currentPage ? 'pagination-btn-primary' : 'pagination-btn-secondary'}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              className="pagination-btn pagination-btn-secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
          </div>
        </div>
      )}

      {/* Courses Completed Modal */}
      <CoursesCompletedModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingItem={editingItem}
      />

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={showDocumentViewer}
        onClose={handleCloseDocumentViewer}
        document={selectedDocument}
      />

      {/* Message Display */}
      {message && (
        <div className={`message ${message.type}`} style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          borderRadius: '8px',
          color: 'white',
          backgroundColor: message.type === 'success' ? '#10b981' : '#ef4444',
          zIndex: 10000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default CoursesCompleted;