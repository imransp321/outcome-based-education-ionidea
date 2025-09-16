import React, { useState, useEffect } from 'react';
import Grid from '../../components/Grid/Grid';
import ConsultancyTestingModal from '../../components/ConsultancyTestingModal';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

interface ConsultancyTestingData {
  id: number;
  projectTitle: string;
  projectCode: string;
  client: string;
  role: string;
  commencementYear: string;
  completionYear: string;
  status: string;
  coConsultants: string;
  revenueEarned: number;
  abstract: string;
  uploadFile?: string;
}

const ConsultancyTesting: React.FC = () => {
  const [data, setData] = useState<ConsultancyTestingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ConsultancyTestingData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  const sampleData: ConsultancyTestingData[] = [
    {
      id: 1,
      projectTitle: 'Enterprise Software Development',
      projectCode: 'ESD-2024-001',
      client: 'ABC Corporation',
      role: 'Lead Consultant',
      commencementYear: '2024',
      completionYear: '2024',
      status: 'Completed',
      coConsultants: 'Dr. John Smith, Dr. Jane Doe',
      revenueEarned: 500000,
      abstract: 'Development of enterprise-level software solution for client requirements.',
      uploadFile: 'project_report.pdf'
    }
  ];

  useEffect(() => {
    setData(sampleData);
  }, []);

  const columns = [
    {
      key: 'projectTitle',
      title: 'Project Title',
      width: '25%',
      render: (value: string) => (
        <div style={{ fontWeight: '600', color: '#1f2937' }}>{value}</div>
      )
    },
    {
      key: 'client',
      title: 'Client',
      width: '20%'
    },
    {
      key: 'role',
      title: 'Your Role',
      width: '15%'
    },
    {
      key: 'commencementYear',
      title: 'Commencement Year',
      width: '15%'
    },
    {
      key: 'completionYear',
      title: 'Completion Year',
      width: '15%'
    },
    {
      key: 'revenueEarned',
      title: 'Revenue Earned',
      width: '10%',
      render: (value: number) => (
        <div style={{ textAlign: 'right' }}>
          ₹{value.toLocaleString()}
        </div>
      )
    }
  ];

  const handleSave = (newItem: ConsultancyTestingData) => {
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

  const handleEdit = (item: ConsultancyTestingData) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = (item: ConsultancyTestingData) => {
    if (window.confirm('Are you sure you want to delete this consultancy project entry?')) {
      setData(prev => prev.filter(dataItem => dataItem.id !== item.id));
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  // Filter data based on search query
  const filteredData = data.filter(item =>
    item.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.projectCode.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1>Consultancy / Testing Projects</h1>
        <p>Manage consultancy and testing project records with detailed project information.</p>
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
        addButtonText="Add Consultancy Project"
        searchPlaceholder="Search consultancy projects..."
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

      {/* Consultancy Testing Modal */}
      <ConsultancyTestingModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingItem={editingItem}
      />
    </div>
  );
};

export default ConsultancyTesting;