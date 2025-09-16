import React, { useState, useEffect } from 'react';
import Grid from '../../components/Grid/Grid';
import CoursesCompletedModal from '../../components/CoursesCompletedModal';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

interface CoursesCompletedData {
  id: number;
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
  const [editingItem, setEditingItem] = useState<CoursesCompletedData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  const sampleData: CoursesCompletedData[] = [
    {
      id: 1,
      courseTitle: 'Course title 1',
      startDate: '2025-01-20',
      endDate: '2025-01-23',
      duration: 'Duration',
      platform: 'Platform',
      uploadCertificate: 'certificate.pdf'
    }
  ];

  useEffect(() => {
    setData(sampleData);
  }, []);

  const columns = [
    {
      key: 'courseTitle',
      title: 'Course Title',
      width: '30%',
      render: (value: string) => (
        <div style={{ fontWeight: '600', color: '#1f2937' }}>{value}</div>
      )
    },
    {
      key: 'startDate',
      title: 'Date: From- To',
      width: '20%',
      render: (value: string, row: CoursesCompletedData) => (
        <div>
          <div>{row.startDate}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}> : {row.endDate}</div>
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
      width: '20%'
    },
    {
      key: 'uploadCertificate',
      title: 'Upload Certificate',
      width: '15%',
      render: (value: string) => (
        <div style={{ textAlign: 'center' }}>
          {value ? (
            <a href="#" style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              📄 View
            </a>
          ) : (
            <span style={{ color: '#9ca3af' }}>-</span>
          )}
        </div>
      )
    }
  ];

  const handleSave = (newItem: CoursesCompletedData) => {
    if (editingItem) {
      setData(prev => prev.map(item => item.id === editingItem.id ? newItem : item));
    } else {
      setData(prev => [...prev, newItem]);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleEdit = (item: CoursesCompletedData) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = (item: CoursesCompletedData) => {
    if (window.confirm('Are you sure you want to delete this course entry?')) {
      setData(prev => prev.filter(dataItem => dataItem.id !== item.id));
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  // Filter data based on search query
  const filteredData = data.filter(item =>
    item.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    </div>
  );
};

export default CoursesCompleted;