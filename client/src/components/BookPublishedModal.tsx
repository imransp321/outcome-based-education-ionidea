import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import BookChapterTextEditor from './BookChapterTextEditor';
import '../styles/components/modals.css';
import '../styles/components/SharedModal.css';

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

interface BookPublishedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BookPublishedData) => void;
  editingItem?: BookPublishedData | null;
}

const BookPublishedModal: React.FC<BookPublishedModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    bookTitle: '',
    author: '',
    coAuthors: '',
    isbn: '',
    languages: '',
    publisher: '',
    publishedYear: '',
    bookNo: '',
    copyrightYear: '',
    noOfChapters: '',
    type: 'Text Book',
    publishedIn: '',
    aboutBook: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        bookTitle: editingItem.bookTitle,
        author: editingItem.author,
        coAuthors: editingItem.coAuthors,
        isbn: editingItem.isbn,
        languages: editingItem.languages,
        publisher: editingItem.publisher,
        publishedYear: editingItem.publishedYear,
        bookNo: editingItem.bookNo,
        copyrightYear: editingItem.copyrightYear,
        noOfChapters: editingItem.noOfChapters,
        type: editingItem.type,
        publishedIn: editingItem.publishedIn,
        aboutBook: editingItem.aboutBook
      });
    } else {
      setFormData({
        bookTitle: '',
        author: '',
        coAuthors: '',
        isbn: '',
        languages: '',
        publisher: '',
        publishedYear: '',
        bookNo: '',
        copyrightYear: '',
        noOfChapters: '',
        type: 'Text Book',
        publishedIn: '',
        aboutBook: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.bookTitle) newErrors.bookTitle = 'Book Title is required';
    if (!formData.publishedYear) newErrors.publishedYear = 'Published Year is required';
    if (!formData.type) newErrors.type = 'Type is required';

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
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const newItem: BookPublishedData = {
      id: editingItem?.id || Date.now(),
      bookTitle: formData.bookTitle,
      author: formData.author,
      coAuthors: formData.coAuthors,
      isbn: formData.isbn,
      languages: formData.languages,
      publisher: formData.publisher,
      publishedYear: formData.publishedYear,
      bookNo: formData.bookNo,
      copyrightYear: formData.copyrightYear,
      noOfChapters: formData.noOfChapters,
      type: formData.type,
      publishedIn: formData.publishedIn,
      aboutBook: formData.aboutBook
    };

    onSave(newItem);
    onClose();
  };

  const closeModal = () => {
    setFormData({
      bookTitle: '',
      author: '',
      coAuthors: '',
      isbn: '',
      languages: '',
      publisher: '',
      publishedYear: '',
      bookNo: '',
      copyrightYear: '',
      noOfChapters: '',
      type: 'Text Book',
      publishedIn: '',
      aboutBook: ''
    });
    setErrors({});
    onClose();
  };

  // Reset form data
  const handleReset = () => {
    setFormData({
      bookTitle: '',
      author: '',
      coAuthors: '',
      isbn: '',
      languages: '',
      publisher: '',
      publishedYear: '',
      bookNo: '',
      copyrightYear: '',
      noOfChapters: '',
      type: 'Text Book',
      publishedIn: '',
      aboutBook: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal book-chapter-modal-enhanced" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <h3>{editingItem ? 'Edit Book' : 'Add New Book'}</h3>
            <p className="modal-subtitle">Manage published book records and details</p>
          </div>
          <button
            className="message-modal-close"
            onClick={closeModal}
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
                  <label>Author</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => handleInputChange('author', e.target.value)}
                      placeholder="Enter Author"
                      className={`book-chapter-input ${errors.author ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.author && <span className="book-chapter-error-message">{errors.author}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>Co-author(s)</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.coAuthors}
                      onChange={(e) => handleInputChange('coAuthors', e.target.value)}
                      placeholder="Enter Co-author(s)"
                      className={`book-chapter-input ${errors.coAuthors ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.coAuthors && <span className="book-chapter-error-message">{errors.coAuthors}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>Publisher</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.publisher}
                      onChange={(e) => handleInputChange('publisher', e.target.value)}
                      placeholder="Enter Publisher"
                      className={`book-chapter-input ${errors.publisher ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.publisher && <span className="book-chapter-error-message">{errors.publisher}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Published Year</label>
                  <div className="book-chapter-input-wrapper">
                    <select
                      value={formData.publishedYear}
                      onChange={(e) => handleInputChange('publishedYear', e.target.value)}
                      className="book-chapter-input book-chapter-select"
                    >
                      <option value="">Select year</option>
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
                  {errors.publishedYear && <span className="book-chapter-error-message">{errors.publishedYear}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>ISBN</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.isbn}
                      onChange={(e) => handleInputChange('isbn', e.target.value)}
                      placeholder="Enter ISBN"
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
                  <label>Book No.</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.bookNo}
                      onChange={(e) => handleInputChange('bookNo', e.target.value)}
                      placeholder="Enter Book No."
                      className={`book-chapter-input ${errors.bookNo ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.bookNo && <span className="book-chapter-error-message">{errors.bookNo}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>Copyright Year</label>
                  <div className="book-chapter-input-wrapper">
                    <select
                      value={formData.copyrightYear}
                      onChange={(e) => handleInputChange('copyrightYear', e.target.value)}
                      className="book-chapter-input book-chapter-select"
                    >
                      <option value="">Select year</option>
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
                  {errors.copyrightYear && <span className="book-chapter-error-message">{errors.copyrightYear}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>No. of Chapters</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.noOfChapters}
                      onChange={(e) => handleInputChange('noOfChapters', e.target.value)}
                      placeholder="Enter No. of Chapters"
                      className={`book-chapter-input ${errors.noOfChapters ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.noOfChapters && <span className="book-chapter-error-message">{errors.noOfChapters}</span>}
                </div>
              </div>

              {/* Right Column - Additional Fields and Description Editor */}
              <div className="book-chapter-form-right">
                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Type</label>
                  <div className="book-chapter-input-wrapper">
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="book-chapter-input book-chapter-select"
                    >
                      <option value="Text Book">Text Book</option>
                      <option value="Reference Book">Reference Book</option>
                      <option value="Research Book">Research Book</option>
                      <option value="Monograph">Monograph</option>
                      <option value="Edited Book">Edited Book</option>
                    </select>
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.type && <span className="book-chapter-error-message">{errors.type}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>Language(s)</label>
                  <div className="book-chapter-textarea-wrapper">
                    <textarea
                      value={formData.languages}
                      onChange={(e) => handleInputChange('languages', e.target.value)}
                      placeholder="Enter Language(s)"
                      rows={3}
                      className={`book-chapter-textarea ${errors.languages ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-textarea-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.languages && <span className="book-chapter-error-message">{errors.languages}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>Published in</label>
                  <div className="book-chapter-textarea-wrapper">
                    <textarea
                      value={formData.publishedIn}
                      onChange={(e) => handleInputChange('publishedIn', e.target.value)}
                      placeholder="Enter Published in"
                      rows={3}
                      className={`book-chapter-textarea ${errors.publishedIn ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-textarea-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.publishedIn && <span className="book-chapter-error-message">{errors.publishedIn}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label className="book-chapter-section-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="book-chapter-label-icon">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    About the book
                  </label>
                  <BookChapterTextEditor
                    value={formData.aboutBook}
                    onChange={(value) => handleInputChange('aboutBook', value)}
                    placeholder="Enter book details here..."
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
            onClick={closeModal}
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

export default BookPublishedModal;
