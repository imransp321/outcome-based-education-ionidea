import React, { useState, useEffect } from 'react';
import Grid from '../../components/Grid/Grid';
import ConferenceOrganizedModal from '../../components/ConferenceOrganizedModal';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

interface ConferenceOrganizedData {
  id: number;
  programTitle: string;
  type: string;
  eventOrganizer: string;
  collaboration: string;
  startDate: string;
  endDate: string;
  sponsoredBy: string;
  role: string;
  level: string;
  noOfParticipants: string;
  venue: string;
  durationHours: string;
  durationMinutes: string;
  highlights: string;
  uploadFile?: string;
}

const ConferenceOrganized: React.FC = () => {
  const [data, setData] = useState<ConferenceOrganizedData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ConferenceOrganizedData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  const sampleData: ConferenceOrganizedData[] = [
    {
      id: 1,
      programTitle: 'International Conference on AI and Machine Learning',
      type: 'Conference',
      eventOrganizer: 'Tech Institute',
      collaboration: 'IEEE Computer Society',
      startDate: '2024-06-15',
      endDate: '2024-06-17',
      sponsoredBy: 'Ministry of Education, Government of India',
      role: 'Organizing Secretary',
      level: 'International',
      noOfParticipants: '250',
      venue: 'Convention Center, New Delhi',
      durationHours: '48',
      durationMinutes: '0',
      highlights: 'Three-day international conference featuring keynote speakers from leading tech companies and academic institutions.',
      uploadFile: 'conference_report.pdf'
    }
  ];

  useEffect(() => {
    setData(sampleData);
  }, []);

  const columns = [
    {
      key: 'programTitle',
      title: 'Program Title',
      width: '20%',
      render: (value: string) => (
        <div style={{ fontWeight: '600', color: '#1f2937' }}>{value}</div>
      )
    },
    {
      key: 'level',
      title: 'Level',
      width: '10%'
    },
    {
      key: 'eventOrganizer',
      title: 'Event Organizer',
      width: '15%'
    },
    {
      key: 'collaboration',
      title: 'Collaboration',
      width: '15%'
    },
    {
      key: 'startDate',
      title: 'Date',
      width: '10%',
      render: (value: string, row: ConferenceOrganizedData) => (
        <div>
          <div>{row.startDate}</div>
          {row.endDate && row.endDate !== row.startDate && (
            <div style={{ fontSize: '12px', color: '#6b7280' }}>to {row.endDate}</div>
          )}
        </div>
      )
    },
    {
      key: 'sponsoredBy',
      title: 'Sponsored by',
      width: '15%'
    },
    {
      key: 'role',
      title: 'Your Role',
      width: '15%'
    }
  ];

  const handleSave = (newItem: ConferenceOrganizedData) => {
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

  const handleEdit = (item: ConferenceOrganizedData) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = (item: ConferenceOrganizedData) => {
    if (window.confirm('Are you sure you want to delete this conference entry?')) {
      setData(prev => prev.filter(dataItem => dataItem.id !== item.id));
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  // Filter data based on search query
  const filteredData = data.filter(item =>
    item.programTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.eventOrganizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1>Conference / Seminar / Training / Development / Workshop Organized</h1>
        <p>Manage organized conferences, seminars, training, development, and workshop events.</p>
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
        addButtonText="Add Event"
        searchPlaceholder="Search organized events..."
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

      {/* Conference Organized Modal */}
      <ConferenceOrganizedModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingItem={editingItem}
      />
    </div>
  );
};

export default ConferenceOrganized;