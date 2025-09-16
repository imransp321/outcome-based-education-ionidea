import React, { useState, useEffect } from 'react';
import Grid from '../../components/Grid/Grid';
import AwardsHonorsModal from '../../components/AwardsHonorsModal';
import api from '../../services/api';
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

const AwardsHonors: React.FC = () => {
  const [data, setData] = useState<AwardsHonorsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AwardsHonorsData | null>(null);

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await api.awardsHonors.getAll();
        console.log('API Response:', response);
        // API returns { success: true, data: [...] }
        const awardsData = response.data?.data || [];
        console.log('Awards Data:', awardsData);
        setData(Array.isArray(awardsData) ? awardsData : []);
      } catch (error) {
        console.error('Error loading awards:', error);
        // Keep sample data as fallback
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



  const columns = [
    {
      key: 'awarded_name',
      title: 'Awarded Name',
      width: '25%',
      render: (value: string) => (
        <div style={{ fontWeight: '600', color: '#1f2937' }}>{value}</div>
      )
    },
    {
      key: 'awarded_for',
      title: 'Awarded for',
      width: '25%'
    },
    {
      key: 'awarded_organization',
      title: 'Awarded Organization',
      width: '20%'
    },
    {
      key: 'awarded_year',
      title: 'Awarded Year',
      width: '15%'
    },
    {
      key: 'venue',
      title: 'Venue',
      width: '15%'
    }
  ];

  const handleSave = async (newItem: AwardsHonorsData) => {
    try {
      if (editingItem) {
        // Update existing item
        await api.awardsHonors.update(editingItem.id.toString(), newItem);
        setData(prev => prev.map(item => item.id === editingItem.id ? newItem : item));
      } else {
        // Create new item
        const response = await api.awardsHonors.create(newItem);
        // API returns { success: true, data: {...} }
        setData(prev => [...prev, { ...newItem, id: response.data.data.id }]);
      }
    } catch (error) {
      console.error('Error saving award:', error);
      // For now, still update local state as fallback
      if (editingItem) {
        setData(prev => prev.map(item => item.id === editingItem.id ? newItem : item));
      } else {
        setData(prev => [...prev, newItem]);
      }
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
        await api.awardsHonors.delete(item.id.toString());
        setData(prev => prev.filter(dataItem => dataItem.id !== item.id));
      } catch (error) {
        console.error('Error deleting award:', error);
        // For now, still update local state as fallback
        setData(prev => prev.filter(dataItem => dataItem.id !== item.id));
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
    </div>
  );
};

export default AwardsHonors;