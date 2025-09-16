import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/MessageModal.css';
import '../styles/components/SharedModal.css';

interface CoursesCompletedData {
  id: number;
  courseTitle: string;
  startDate: string;
  endDate: string;
  duration: string;
  platform: string;
  uploadCertificate?: string;
}

interface CoursesCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CoursesCompletedData) => void;
  editingItem?: CoursesCompletedData | null;
}

const CoursesCompletedModal: React.FC<CoursesCompletedModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    courseTitle: '',
    startDate: '',
    endDate: '',
    duration: '',
    platform: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        courseTitle: editingItem.courseTitle,
        startDate: editingItem.startDate,
        endDate: editingItem.endDate,
        duration: editingItem.duration,
        platform: editingItem.platform
      });
    } else {
      setFormData({
        courseTitle: '',
        startDate: '',
        endDate: '',
        duration: '',
        platform: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.courseTitle) newErrors.courseTitle = 'Course title is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    if (!formData.platform) newErrors.platform = 'Platform is required';

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

    const newItem: CoursesCompletedData = {
      id: editingItem ? editingItem.id : Date.now(),
      courseTitle: formData.courseTitle,
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration: formData.duration,
      platform: formData.platform
    };

    onSave(newItem);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      courseTitle: '',
      startDate: '',
      endDate: '',
      duration: '',
      platform: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="courses-completed-modal" onClick={(e) => e.stopPropagation()}>
        <div className="courses-completed-modal-content">
          {/* Modal Header */}
          <div className="courses-completed-modal-header">
            <div className="courses-completed-modal-header-content">
              <h3>{editingItem ? 'Edit Course' : 'Add New Course'}</h3>
              <p className="courses-completed-modal-subtitle">Manage completed course records and certifications</p>
            </div>
            <div className="courses-completed-modal-header-actions">
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
          </div>

          {/* Modal Body */}
          <div className="courses-completed-modal-body">
            <div className="courses-completed-form-layout">
              <div className="courses-completed-form-group">
                <label className="courses-completed-required">Course title</label>
                <div className="courses-completed-input-with-icon">
                  <input
                    type="text"
                    value={formData.courseTitle}
                    onChange={(e) => handleInputChange('courseTitle', e.target.value)}
                    placeholder="Enter course title"
                    className={errors.courseTitle ? 'courses-completed-error' : ''}
                  />
                  <svg className="courses-completed-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {errors.courseTitle && <span className="courses-completed-error-message">{errors.courseTitle}</span>}
              </div>

              <div className="courses-completed-form-group">
                <label className="courses-completed-required">Date</label>
                <div className="courses-completed-date-group">
                  <div className="courses-completed-date-field">
                    <label>Start Date</label>
                    <div className="courses-completed-input-with-icon">
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className={errors.startDate ? 'courses-completed-error' : ''}
                      />
                      <svg className="courses-completed-calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {errors.startDate && <span className="courses-completed-error-message">{errors.startDate}</span>}
                  </div>
                  <div className="courses-completed-date-field">
                    <label>End Date</label>
                    <div className="courses-completed-input-with-icon">
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        className={errors.endDate ? 'courses-completed-error' : ''}
                      />
                      <svg className="courses-completed-calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {errors.endDate && <span className="courses-completed-error-message">{errors.endDate}</span>}
                  </div>
                </div>
              </div>

              <div className="courses-completed-form-group">
                <label className="courses-completed-required">Duration</label>
                <div className="courses-completed-input-with-icon">
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="Enter duration"
                    className={errors.duration ? 'courses-completed-error' : ''}
                  />
                  <svg className="courses-completed-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {errors.duration && <span className="courses-completed-error-message">{errors.duration}</span>}
              </div>

              <div className="courses-completed-form-group">
                <label className="courses-completed-required">Platform</label>
                <div className="courses-completed-input-with-icon">
                  <input
                    type="text"
                    value={formData.platform}
                    onChange={(e) => handleInputChange('platform', e.target.value)}
                    placeholder="Enter platform"
                    className={errors.platform ? 'courses-completed-error' : ''}
                  />
                  <svg className="courses-completed-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                {errors.platform && <span className="courses-completed-error-message">{errors.platform}</span>}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="courses-completed-modal-footer">
            <button
              type="button"
              className="courses-completed-btn courses-completed-btn-secondary"
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

export default CoursesCompletedModal;