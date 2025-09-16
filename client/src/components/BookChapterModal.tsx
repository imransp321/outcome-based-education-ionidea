import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import BookChapterTextEditor from './BookChapterTextEditor';
import '../styles/components/modals.css';
import '../styles/components/BookChapterModal.css';

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

interface BookChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BookChapterData) => void;
  editingItem?: BookChapterData | null;
}

const BookChapterModal: React.FC<BookChapterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    bookTitle: '',
    chapterTitle: '',
    authors: '',
    editor: '',
    isbn: '',
    year: '',
    publisherDetails: '',
    description: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        bookTitle: editingItem.bookTitle,
        chapterTitle: editingItem.chapterTitle,
        authors: editingItem.authors,
        editor: editingItem.editor,
        isbn: editingItem.isbn,
        year: editingItem.year,
        publisherDetails: editingItem.publisherDetails,
        description: editingItem.description
      });
    } else {
      setFormData({
        bookTitle: '',
        chapterTitle: '',
        authors: '',
        editor: '',
        isbn: '',
        year: '',
        publisherDetails: '',
        description: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.bookTitle) newErrors.bookTitle = 'Book Title is required';
    if (!formData.chapterTitle) newErrors.chapterTitle = 'Chapter Title is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const newItem: BookChapterData = {
      id: editingItem ? editingItem.id : Date.now(),
      bookTitle: formData.bookTitle,
      chapterTitle: formData.chapterTitle,
      authors: formData.authors,
      editor: formData.editor,
      isbn: formData.isbn,
      year: formData.year,
      publisherDetails: formData.publisherDetails,
      description: formData.description
    };

    onSave(newItem);
    onClose();
  };

  // Reset form data
  const handleReset = () => {
    setFormData({
      bookTitle: '',
      chapterTitle: '',
      authors: '',
      editor: '',
      isbn: '',
      year: '',
      publisherDetails: '',
      description: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal book-chapter-modal-enhanced" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <h3>{editingItem ? 'Edit Book Chapter' : 'Add New Book Chapter'}</h3>
            <p className="modal-subtitle">Manage book chapter publications and contributions</p>
          </div>
          <button
            className="message-modal-close"
            onClick={onClose}
            title="Close Modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="book-chapter-form-container">
            <div className="book-chapter-form-layout">
              {/* Left Column */}
              <div className="book-chapter-form-left">
                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Book Title</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.bookTitle}
                      onChange={(e) => handleInputChange('bookTitle', e.target.value)}
                      placeholder="Enter Book Title"
                      className={`book-chapter-input ${errors.bookTitle ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.bookTitle && <span className="book-chapter-error-message">{errors.bookTitle}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Chapter Title</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.chapterTitle}
                      onChange={(e) => handleInputChange('chapterTitle', e.target.value)}
                      placeholder="Enter Chapter Title"
                      className={`book-chapter-input ${errors.chapterTitle ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.chapterTitle && <span className="book-chapter-error-message">{errors.chapterTitle}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>Author(s)</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.authors}
                      onChange={(e) => handleInputChange('authors', e.target.value)}
                      placeholder="Enter Author(s)"
                      className={`book-chapter-input ${errors.authors ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.authors && <span className="book-chapter-error-message">{errors.authors}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>Editor</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.editor}
                      onChange={(e) => handleInputChange('editor', e.target.value)}
                      placeholder="Enter Editor Details"
                      className={`book-chapter-input ${errors.editor ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.editor && <span className="book-chapter-error-message">{errors.editor}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>ISBN</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.isbn}
                      onChange={(e) => handleInputChange('isbn', e.target.value)}
                      placeholder="International Standard Book Number"
                      className={`book-chapter-input ${errors.isbn ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.isbn && <span className="book-chapter-error-message">{errors.isbn}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>Year</label>
                  <div className="book-chapter-input-wrapper">
                    <select
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      className="book-chapter-input book-chapter-select"
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </select>
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="book-chapter-form-group">
                  <label>Publisher Details</label>
                  <div className="book-chapter-textarea-wrapper">
                    <textarea
                      value={formData.publisherDetails}
                      onChange={(e) => handleInputChange('publisherDetails', e.target.value)}
                      placeholder="Enter Publisher Details"
                      rows={3}
                      className={`book-chapter-textarea ${errors.publisherDetails ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-textarea-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.publisherDetails && <span className="book-chapter-error-message">{errors.publisherDetails}</span>}
                </div>
              </div>

              {/* Right Column - Description Editor */}
              <div className="book-chapter-form-right">
                <div className="book-chapter-form-group">
                  <label className="book-chapter-section-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="book-chapter-label-icon">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Description
                  </label>
                  <BookChapterTextEditor
                    value={formData.description}
                    onChange={(value) => handleInputChange('description', value)}
                    placeholder="Enter chapter description here..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="book-chapter-btn book-chapter-btn-secondary"
            onClick={handleReset}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M1 4V10H7M23 20V14H17M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Reset
          </button>
          <button
            type="button"
            className="faculty-modal-btn faculty-modal-btn-cancel"
            onClick={onClose}
          >
            <span className="faculty-modal-btn-icon"></span>
            Cancel
          </button>
          <button
            type="button"
            className="faculty-modal-btn faculty-modal-btn-save"
            onClick={handleSave}
          >
            <span className="faculty-modal-btn-icon"></span>
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BookChapterModal;
