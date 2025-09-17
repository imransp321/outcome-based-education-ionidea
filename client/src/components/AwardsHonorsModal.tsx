import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/modals.css';

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

interface AwardsHonorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AwardsHonorsFormData) => void;
  editingItem?: AwardsHonorsData | null;
}

const AwardsHonorsModal: React.FC<AwardsHonorsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState<AwardsHonorsFormData>({
    awarded_name: '',
    awarded_for: '',
    awarded_organization: '',
    awarded_year: '',
    venue: '',
    award_details: '',
    upload_file: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        awarded_name: editingItem.awarded_name,
        awarded_for: editingItem.awarded_for,
        awarded_organization: editingItem.awarded_organization,
        awarded_year: editingItem.awarded_year,
        venue: editingItem.venue,
        award_details: editingItem.award_details,
        upload_file: editingItem.upload_file || ''
      });
    } else {
      setFormData({
        awarded_name: '',
        awarded_for: '',
        awarded_organization: '',
        awarded_year: '',
        venue: '',
        award_details: '',
        upload_file: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.awarded_name) newErrors.awarded_name = 'Awarded Name is required';
    if (!formData.awarded_for) newErrors.awarded_for = 'Awarded for is required';
    if (!formData.awarded_year) newErrors.awarded_year = 'Awarded Year is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | File) => {
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

    const newItem: AwardsHonorsFormData = {
      awarded_name: formData.awarded_name,
      awarded_for: formData.awarded_for,
      awarded_organization: formData.awarded_organization,
      awarded_year: formData.awarded_year,
      venue: formData.venue,
      award_details: formData.award_details,
      upload_file: formData.upload_file
    };

    onSave(newItem);
    onClose();
  };


  const closeModal = () => {
    setFormData({
      awarded_name: '',
      awarded_for: '',
      awarded_organization: '',
      awarded_year: '',
      venue: '',
      award_details: '',
      upload_file: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <h3>{editingItem ? 'Edit Award' : 'Add New Award'}</h3>
            <p className="modal-subtitle">Manage awards, honors and recognition details</p>
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
          <div className="form-row">
            <div className="form-group">
              <label className="required">Awarded Name</label>
              <input
                type="text"
                value={formData.awarded_name}
                onChange={(e) => handleInputChange('awarded_name', e.target.value)}
                placeholder="Enter Awarded Name"
                className={`form-control ${errors.awarded_name ? 'error' : ''}`}
              />
              {errors.awarded_name && <span className="error-message">{errors.awarded_name}</span>}
            </div>

            <div className="form-group">
              <label className="required">Awarded Year</label>
              <input
                type="text"
                value={formData.awarded_year}
                onChange={(e) => handleInputChange('awarded_year', e.target.value)}
                placeholder="Select year"
                className={`form-control year-picker ${errors.awarded_year ? 'error' : ''}`}
                readOnly
                onClick={() => {
                  // Create a year picker modal
                  const currentYear = new Date().getFullYear();
                  const startYear = 1900;
                  const endYear = currentYear + 10;
                  
                  // Create year picker container
                  const yearPicker = document.createElement('div');
                  yearPicker.className = 'year-picker-modal';
                  yearPicker.innerHTML = `
                    <div class="year-picker-content">
                      <div class="year-picker-header">
                        <h3>Select Year</h3>
                        <button class="year-picker-close">&times;</button>
                      </div>
                      <div class="year-picker-body">
                        <div class="year-picker-grid">
                          ${Array.from({ length: endYear - startYear + 1 }, (_, i) => {
                            const year = endYear - i;
                            return `<div class="year-option ${formData.awarded_year === year.toString() ? 'selected' : ''}" data-year="${year}">${year}</div>`;
                          }).join('')}
                        </div>
                      </div>
                    </div>
                  `;
                  
                  // Add styles
                  const style = document.createElement('style');
                  style.textContent = `
                    .year-picker-modal {
                      position: fixed;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      background: rgba(0, 0, 0, 0.5);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      z-index: 10000000;
                    }
                    .year-picker-content {
                      background: white;
                      border-radius: 8px;
                      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                      max-width: 400px;
                      width: 90%;
                      max-height: 80vh;
                      overflow: hidden;
                    }
                    .year-picker-header {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      padding: 20px;
                      border-bottom: 1px solid #e5e7eb;
                      background: #f8f9fa;
                    }
                    .year-picker-header h3 {
                      margin: 0;
                      font-size: 18px;
                      font-weight: 600;
                      color: #1f2937;
                      font-family: 'Calibri', sans-serif;
                    }
                    .year-picker-close {
                      background: none;
                      border: none;
                      font-size: 24px;
                      cursor: pointer;
                      color: #6b7280;
                      padding: 0;
                      width: 30px;
                      height: 30px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                    .year-picker-close:hover {
                      color: #374151;
                    }
                    .year-picker-body {
                      padding: 20px;
                      max-height: 400px;
                      overflow-y: auto;
                    }
                    .year-picker-grid {
                      display: grid;
                      grid-template-columns: repeat(4, 1fr);
                      gap: 8px;
                    }
                    .year-option {
                      padding: 12px 8px;
                      text-align: center;
                      border: 1px solid #e5e7eb;
                      border-radius: 6px;
                      cursor: pointer;
                      font-size: 14px;
                      font-weight: 500;
                      color: #374151;
                      font-family: 'Calibri', sans-serif;
                      transition: all 0.2s ease;
                    }
                    .year-option:hover {
                      background: #f3f4f6;
                      border-color: #d1d5db;
                    }
                    .year-option.selected {
                      background: #3b82f6;
                      color: white;
                      border-color: #3b82f6;
                    }
                  `;
                  
                  document.head.appendChild(style);
                  document.body.appendChild(yearPicker);
                  
                  // Add event listeners
                  const closeBtn = yearPicker.querySelector('.year-picker-close');
                  const yearOptions = yearPicker.querySelectorAll('.year-option');
                  
                  const closeModal = () => {
                    document.body.removeChild(yearPicker);
                    document.head.removeChild(style);
                  };
                  
                  closeBtn?.addEventListener('click', closeModal);
                  yearPicker.addEventListener('click', (e) => {
                    if (e.target === yearPicker) closeModal();
                  });
                  
                  yearOptions.forEach(option => {
                    option.addEventListener('click', () => {
                      const year = option.getAttribute('data-year');
                      if (year) {
                        handleInputChange('awarded_year', year);
                        closeModal();
                      }
                    });
                  });
                }}
              />
              {errors.awarded_year && <span className="error-message">{errors.awarded_year}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Awarded Organization</label>
              <textarea
                value={formData.awarded_organization}
                onChange={(e) => handleInputChange('awarded_organization', e.target.value)}
                placeholder="Enter Awarded Organization"
                className="form-control"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Venue</label>
              <textarea
                value={formData.venue}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                placeholder="Enter Venue"
                className="form-control"
                rows={3}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="required">Awarded for</label>
              <textarea
                value={formData.awarded_for}
                onChange={(e) => handleInputChange('awarded_for', e.target.value)}
                placeholder="Enter Awarded for"
                className={`form-control ${errors.awarded_for ? 'error' : ''}`}
                rows={3}
              />
              {errors.awarded_for && <span className="error-message">{errors.awarded_for}</span>}
            </div>

            <div className="form-group">
              <label>Any other detail about award</label>
              <textarea
                value={formData.award_details}
                onChange={(e) => handleInputChange('award_details', e.target.value)}
                placeholder="Enter other details"
                className="form-control"
                rows={3}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group upload-group">
              <label>Upload Document</label>
              <div className="upload-container">
                <div 
                  className="upload-area" 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('dragover');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('dragover');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('dragover');
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      const file = files[0];
                      if (file) {
                        handleInputChange('upload_file', file);
                      }
                    }
                  }}
                >
                  <div className="upload-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                  </div>
                  <div className="upload-text">
                    <p className="upload-primary">Drop your document here</p>
                    <p className="upload-secondary">Or click to browse</p>
                  </div>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleInputChange('upload_file', file);
                    }
                  }}
                  className="file-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                {formData.upload_file && (
                  <div className="file-selected">
                    <span className="file-name">Selected: {typeof formData.upload_file === 'string' ? formData.upload_file : formData.upload_file.name}</span>
                    <button 
                      type="button" 
                      className="remove-file"
                      onClick={() => handleInputChange('upload_file', '')}
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="file-requirements">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG. Max size: 10MB
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
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

export default AwardsHonorsModal;