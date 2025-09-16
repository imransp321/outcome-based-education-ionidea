import React, { useState } from 'react';
import '../../styles/components/grid.css';

interface GridColumn {
  key: string;
  title: string;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface GridProps {
  title?: string;
  columns: GridColumn[];
  data: any[];
  onAdd?: () => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  addButtonText?: string;
  searchPlaceholder?: string;
  // Pagination props
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    showPagination?: boolean;
    onPageChange: (page: number) => void;
  };
}

const Grid: React.FC<GridProps> = ({
  title,
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  onView,
  searchable = true,
  onSearch,
  loading = false,
  emptyMessage = "No data available",
  className = "",
  addButtonText = "Add",
  searchPlaceholder = "Search...",
  pagination
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const renderCell = (column: GridColumn, row: any) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }
    return row[column.key] || '-';
  };

  const hasActions = onEdit || onDelete || onView;

  return (
    <div className={`grid-container ${className}`}>
      {/* Grid Header */}
      <div className="grid-header">
        <div className="grid-header-actions">
          {onAdd && (
            <button className="grid-add-button" onClick={onAdd}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {addButtonText}
            </button>
          )}
          <div className="grid-header-spacer"></div>
          {searchable && (
            <div className="grid-search">
              <svg className="grid-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                className="grid-search-input"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Grid Table */}
      <div className="grid-table-wrapper">
        {loading ? (
          <div className="grid-loading">
            <div>Loading...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="grid-empty">
            <div className="grid-empty-icon">📋</div>
            <div>{emptyMessage}</div>
          </div>
        ) : (
          <table className="grid-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} style={{ width: column.width }}>
                    {column.title}
                  </th>
                ))}
                {hasActions && (
                  <th className="grid-actions-header" style={{ width: '120px', textAlign: 'left' }}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {renderCell(column, row)}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="grid-actions">
                      {onView && (
                        <button
                          className="grid-action-btn view"
                          onClick={() => onView(row)}
                          title="View"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      {onEdit && (
                        <button
                          className="grid-action-btn edit"
                          onClick={() => onEdit(row)}
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="grid-action-btn delete"
                          onClick={() => onDelete(row)}
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Grid Footer */}
      <div className="grid-footer">
        {pagination && pagination.showPagination ? (
          <>
            <div className="pagination-info">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} entries
            </div>
            <div className="grid-pagination">
              <button
                className="grid-pagination-btn"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                ← Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`grid-pagination-btn ${pagination.currentPage === page ? 'active' : ''}`}
                  onClick={() => pagination.onPageChange(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="grid-pagination-btn"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next →
              </button>
            </div>
          </>
        ) : (
          <div>Total: {data.length} items</div>
        )}
      </div>
    </div>
  );
};

export default Grid;
