import React, { useState, useEffect } from 'react';
import Grid from '../../components/Grid/Grid';
import BookChapterModal from '../../components/BookChapterModal';
import '../../styles/pages/Faculty/BookChapter.css';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

interface BookChapterData {
  id: number;
  bookTitle: string;
  chapterTitle: string;
  authors: string;
  editor: string;
  isbn: string;
  year: string;
  publisherDetails: string;
  description: string;
  uploadFile?: string;
}

const BookChapter: React.FC = () => {
  const [data, setData] = useState<BookChapterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BookChapterData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  const sampleData: BookChapterData[] = [
    {
      id: 1,
      bookTitle: 'Machine Learning in Practice',
      chapterTitle: 'Deep Learning Applications in Healthcare',
      authors: 'Dr. John Smith, Dr. Jane Doe',
      editor: 'Dr. Michael Johnson',
      isbn: '978-0-123456-78-9',
      year: '2024',
      publisherDetails: 'Tech Publications Ltd., New York',
      description: 'This chapter explores the applications of deep learning techniques in healthcare domain.',
      uploadFile: 'chapter_draft.pdf'
    }
  ];

  useEffect(() => {
    setData(sampleData);
  }, []);

  const columns = [
    {
      key: 'bookTitle',
      title: 'Book Title',
      width: '25%',
      render: (value: string) => (
        <div style={{ fontWeight: '600', color: '#1f2937' }}>{value}</div>
      )
    },
    {
      key: 'chapterTitle',
      title: 'Chapter Title',
      width: '25%',
      render: (value: string) => (
        <div style={{ fontWeight: '600', color: '#1f2937' }}>{value}</div>
      )
    },
    {
      key: 'authors',
      title: 'Author(s)',
      width: '20%'
    },
    {
      key: 'editor',
      title: 'Editor',
      width: '15%'
    },
    {
      key: 'year',
      title: 'Year',
      width: '15%'
    }
  ];

  const handleSave = (newItem: BookChapterData) => {
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

  const handleEdit = (item: BookChapterData) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = (item: BookChapterData) => {
    if (window.confirm('Are you sure you want to delete this book chapter entry?')) {
      setData(prev => prev.filter(dataItem => dataItem.id !== item.id));
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  // Filter data based on search query
  const filteredData = data.filter(item =>
    item.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.authors.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1>Book Chapter</h1>
        <p>Manage book chapter records with detailed publication information.</p>
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
        addButtonText="Add Book Chapter"
        searchPlaceholder="Search book chapters..."
      />

      {/* Book Chapter Modal */}
      <BookChapterModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingItem={editingItem}
      />
    </div>
  );
};

export default BookChapter;