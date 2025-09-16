import React, { useState, useEffect } from 'react';
import Grid from '../../components/Grid/Grid';
import BookPublishedModal from '../../components/BookPublishedModal';
import '../../styles/pages/Faculty/BookPublished.css';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

interface BookPublishedData {
  id: number;
  bookTitle: string;
  author: string;
  coAuthors: string;
  isbn: string;
  languages: string;
  publisher: string;
  publishedYear: string;
  bookNo: string;
  copyrightYear: string;
  noOfChapters: string;
  type: string;
  publishedIn: string;
  aboutBook: string;
  uploadFile?: string;
}

const BookPublished: React.FC = () => {
  const [data, setData] = useState<BookPublishedData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BookPublishedData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  const sampleData: BookPublishedData[] = [
    {
      id: 1,
      bookTitle: 'Advanced Machine Learning Techniques',
      author: 'Dr. John Smith',
      coAuthors: 'Dr. Jane Doe, Dr. Michael Johnson',
      isbn: '978-0-123456-78-9',
      languages: 'English, Hindi',
      publisher: 'Tech Publications Ltd.',
      publishedYear: '2024',
      bookNo: 'BK-001',
      copyrightYear: '2024',
      noOfChapters: '12',
      type: 'Text Book',
      publishedIn: 'India',
      aboutBook: 'Comprehensive guide to advanced machine learning techniques and applications.',
      uploadFile: 'book_cover.pdf'
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
      key: 'author',
      title: 'Author',
      width: '15%'
    },
    {
      key: 'coAuthors',
      title: 'Co-author(s)',
      width: '15%'
    },
    {
      key: 'isbn',
      title: 'ISBN',
      width: '15%'
    },
    {
      key: 'languages',
      title: 'Language(s)',
      width: '10%'
    },
    {
      key: 'publisher',
      title: 'Publisher',
      width: '10%'
    },
    {
      key: 'publishedYear',
      title: 'Published Year',
      width: '10%'
    }
  ];

  const handleSave = (newItem: BookPublishedData) => {
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

  const handleEdit = (item: BookPublishedData) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = (item: BookPublishedData) => {
    if (window.confirm('Are you sure you want to delete this book entry?')) {
      setData(prev => prev.filter(dataItem => dataItem.id !== item.id));
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  // Filter data based on search query
  const filteredData = (data || []).filter(item =>
    (item.bookTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.publisher || '').toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1>Book Published</h1>
        <p>Manage published book records with detailed publication information.</p>
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
        addButtonText="Add Book"
        searchPlaceholder="Search published books..."
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

      {/* Book Published Modal */}
      <BookPublishedModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingItem={editingItem}
      />
    </div>
  );
};

export default BookPublished;