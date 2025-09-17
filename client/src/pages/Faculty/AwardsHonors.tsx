import React, { useState, useEffect } from 'react';
import Grid from '../../components/Grid/Grid';
import AwardsHonorsModal from '../../components/AwardsHonorsModal';
import DocumentViewer from '../../components/DocumentViewer/DocumentViewer';
import { DocumentInfo } from '../../components/DocumentViewer/types';
import { configAPI } from '../../services/api';
import '../../styles/pages/Faculty/AwardsHonors.css';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

interface AwardsHonorsData {
  id: number;
  awarded_name: string;
  awarded_for: string;
  awarded_organization: string;
  awarded_year: string;
  venue: string;
  award_details: string;
  upload_file?: string;
}

interface AwardsHonorsFormData {
  awarded_name: string;
  awarded_for: string;
  awarded_organization: string;
  awarded_year: string;
  venue: string;
  award_details: string;
  upload_file?: File | string;
}

const AwardsHonors: React.FC = () => {
  const [data, setData] = useState<AwardsHonorsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AwardsHonorsData | null>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentInfo | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Utility functions
  const getStaticBaseUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace('/api', '');
  };

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await configAPI.awardsHonors.getAll();
        console.log('API Response:', response);
        // API returns { success: true, data: [...] }
        const awardsData = response.data?.data || [];
        console.log('Awards Data:', awardsData);
        setData(Array.isArray(awardsData) ? awardsData : []);
      } catch (error) {
        console.error('Error loading awards:', error);
        setMessage({ 
          type: 'error', 
          text: 'Failed to load awards honors data' 
        });
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');



  // Handle document view
  const handleDocumentView = (item: AwardsHonorsData) => {
    if (item.upload_file) {
      const documentUrl = `${getStaticBaseUrl()}/uploads/awards-honors/${item.upload_file}`;
      setSelectedDocument({
        url: documentUrl,
        name: item.upload_file
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
      key: 'awarded_name',
      title: 'Awarded Name',
      width: '20%',
      render: (value: string) => (
        <div style={{ fontWeight: '600', color: '#1f2937' }}>{value}</div>
      )
    },
    {
      key: 'awarded_for',
      title: 'Awarded for',
      width: '20%'
    },
    {
      key: 'awarded_organization',
      title: 'Organization',
      width: '15%'
    },
    {
      key: 'awarded_year',
      title: 'Year',
      width: '10%'
    },
    {
      key: 'venue',
      title: 'Venue',
      width: '15%'
    },
    {
      key: 'upload_file',
      title: 'Document',
      width: '10%',
      render: (value: string, row: AwardsHonorsData) => (
        <div style={{ textAlign: 'center' }}>
          {value ? (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleDocumentView(row)}
              title="View Document"
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
      render: (value: any, row: AwardsHonorsData) => (
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

  const handleSave = async (newItem: AwardsHonorsFormData) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('awarded_name', newItem.awarded_name);
      formDataToSend.append('awarded_for', newItem.awarded_for);
      formDataToSend.append('awarded_organization', newItem.awarded_organization || '');
      formDataToSend.append('awarded_year', newItem.awarded_year);
      formDataToSend.append('venue', newItem.venue || '');
      formDataToSend.append('award_details', newItem.award_details || '');
      
      // Handle file upload - if it's a File object, append it directly
      if (newItem.upload_file) {
        if (newItem.upload_file instanceof File) {
          formDataToSend.append('upload_file', newItem.upload_file);
        } else {
          // If it's a string (existing file), we don't need to upload again
          formDataToSend.append('upload_file', newItem.upload_file);
        }
      }

      if (editingItem) {
        await configAPI.awardsHonors.update(editingItem.id.toString(), formDataToSend);
        setMessage({ type: 'success', text: 'Awards honors record updated successfully' });
      } else {
        await configAPI.awardsHonors.create(formDataToSend);
        setMessage({ type: 'success', text: 'Awards honors record created successfully' });
      }

      setShowModal(false);
      setEditingItem(null);
      // Reload data
      const response = await configAPI.awardsHonors.getAll();
      setData(response.data?.data || []);
    } catch (error: any) {
      console.error('Error saving awards honors record:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save awards honors record' 
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleEdit = (item: AwardsHonorsData) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (item: AwardsHonorsData) => {
    if (window.confirm('Are you sure you want to delete this award entry?')) {
      try {
        await configAPI.awardsHonors.delete(item.id.toString());
        setMessage({ type: 'success', text: 'Awards honors record deleted successfully' });
        // Reload data
        const response = await configAPI.awardsHonors.getAll();
        setData(response.data?.data || []);
      } catch (error: any) {
        console.error('Error deleting awards honors record:', error);
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Failed to delete awards honors record' 
        });
      }
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  // Filter data based on search query
  const filteredData = (data || []).filter(item =>
    (item.awarded_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.awarded_for || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.awarded_organization || '').toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1>Award & Honors</h1>
        <p>Manage award and honors records with detailed recognition information.</p>
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
        addButtonText="Add Award"
        searchPlaceholder="Search awards and honors..."
      />

      {/* Awards Honors Modal */}
      <AwardsHonorsModal
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

export default AwardsHonors;