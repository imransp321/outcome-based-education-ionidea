import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/MessageModal.css';
import '../styles/components/EContentDevelopmentModal.css';

interface EContentDevelopmentData {
  id: number;
  eContentTypes: string;
  nameOfCourse: string;
  year: string;
  uploadFile?: string;
}

interface EContentDevelopmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EContentDevelopmentData) => void;
  editingItem?: EContentDevelopmentData | null;
  activeTab: string;
}

const EContentDevelopmentModal: React.FC<EContentDevelopmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  activeTab
}) => {
  const [formData, setFormData] = useState({
    eContentTypes: 'SWAYAM MOOCs',
    nameOfCourse: '',
    year: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        eContentTypes: editingItem.eContentTypes,
        nameOfCourse: editingItem.nameOfCourse,
        year: editingItem.year
      });
    } else {
      setFormData({
        eContentTypes: 'SWAYAM MOOCs',
        nameOfCourse: '',
        year: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.eContentTypes) newErrors.eContentTypes = 'E-Content Types is required';
    if (!formData.nameOfCourse) newErrors.nameOfCourse = 'Name/Title of the course developed is required';
    if (!formData.year) newErrors.year = 'Year is required';

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

    const newItem: EContentDevelopmentData = {
      id: editingItem ? editingItem.id : Date.now(),
      eContentTypes: formData.eContentTypes,
      nameOfCourse: formData.nameOfCourse,
      year: formData.year
    };

    onSave(newItem);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      eContentTypes: 'SWAYAM MOOCs',
      nameOfCourse: '',
      year: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="e-content-development-modal" onClick={(e) => e.stopPropagation()}>
        <div className="e-content-development-modal-content">
          {/* Modal Header */}
          <div className="e-content-development-modal-header">
            <div className="e-content-development-modal-header-content">
              <h3>{editingItem ? 'Edit E-Content Entry' : 'Add New E-Content Entry'}</h3>
              <p className="e-content-development-modal-subtitle">Manage e-content development and MOOC certifications</p>
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

          {/* Modal Body */}
          <div className="e-content-development-modal-body">
            <div className="e-content-development-form-layout">
              <div className="e-content-development-form-group">
                <label className="e-content-development-required">E-Content Types*</label>
                <select
                  value={formData.eContentTypes}
                  onChange={(e) => handleInputChange('eContentTypes', e.target.value)}
                  className={errors.eContentTypes ? 'e-content-development-error' : ''}
                >
                  <option value="SWAYAM MOOCs">SWAYAM MOOCs</option>
                  <option value="NPTEL">NPTEL</option>
                  <option value="Coursera">Coursera</option>
                  <option value="edX">edX</option>
                  <option value="Udemy">Udemy</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Other">Other</option>
                </select>
                {errors.eContentTypes && <span className="e-content-development-error-message">{errors.eContentTypes}</span>}
              </div>

              <div className="e-content-development-form-group">
                <label className="e-content-development-required">Name/Title of the course developed*</label>
                <input
                  type="text"
                  value={formData.nameOfCourse}
                  onChange={(e) => handleInputChange('nameOfCourse', e.target.value)}
                  placeholder="Enter course name/title"
                  className={errors.nameOfCourse ? 'e-content-development-error' : ''}
                />
                {errors.nameOfCourse && <span className="e-content-development-error-message">{errors.nameOfCourse}</span>}
              </div>

              <div className="e-content-development-form-group">
                <label className="e-content-development-required">Year*</label>
                <div className="e-content-development-input-with-icon">
                  <select
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    className={errors.year ? 'e-content-development-error' : ''}
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                  <svg className="e-content-development-calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {errors.year && <span className="e-content-development-error-message">{errors.year}</span>}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="e-content-development-modal-footer">
            <button
              type="button"
              className="e-content-development-btn e-content-development-btn-secondary"
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
      </div>
    </div>,
    document.body
  );
};

export default EContentDevelopmentModal;
