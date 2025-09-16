import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/MessageModal.css';
import '../styles/components/TechnicalTalkModal.css';

interface TechnicalTalkData {
  id: number;
  topicOfLecture: string;
  nationality: string;
  date: string;
  institution: string;
}

interface TechnicalTalkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TechnicalTalkData) => void;
  editingItem?: TechnicalTalkData | null;
}

const TechnicalTalkModal: React.FC<TechnicalTalkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    topicOfLecture: '',
    nationality: 'National',
    date: '',
    institution: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        topicOfLecture: editingItem.topicOfLecture,
        nationality: editingItem.nationality,
        date: editingItem.date,
        institution: editingItem.institution
      });
    } else {
      setFormData({
        topicOfLecture: '',
        nationality: 'National',
        date: '',
        institution: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.topicOfLecture) newErrors.topicOfLecture = 'Topic of lecture is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.institution) newErrors.institution = 'Institution is required';

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

    const newItem: TechnicalTalkData = {
      id: editingItem ? editingItem.id : Date.now(),
      topicOfLecture: formData.topicOfLecture,
      nationality: formData.nationality,
      date: formData.date,
      institution: formData.institution
    };

    onSave(newItem);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      topicOfLecture: '',
      nationality: 'National',
      date: '',
      institution: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="technical-talk-modal" onClick={(e) => e.stopPropagation()}>
        <div className="technical-talk-modal-content">
          {/* Modal Header */}
          <div className="technical-talk-modal-header">
            <h3>{editingItem ? 'Edit Technical Talk' : 'Add New Technical Talk'}</h3>
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
          <div className="technical-talk-modal-body">
            <div className="technical-talk-form-layout">
              <div className="technical-talk-form-group">
                <label className="technical-talk-required">Topic of lecture*</label>
                <input
                  type="text"
                  value={formData.topicOfLecture}
                  onChange={(e) => handleInputChange('topicOfLecture', e.target.value)}
                  placeholder="Enter topic of lecture"
                  className={errors.topicOfLecture ? 'technical-talk-error' : ''}
                />
                {errors.topicOfLecture && <span className="technical-talk-error-message">{errors.topicOfLecture}</span>}
              </div>

              <div className="technical-talk-form-group">
                <label className="technical-talk-required">Nationality*</label>
                <select
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className={errors.nationality ? 'technical-talk-error' : ''}
                >
                  <option value="National">National</option>
                  <option value="International">International</option>
                </select>
                {errors.nationality && <span className="technical-talk-error-message">{errors.nationality}</span>}
              </div>

              <div className="technical-talk-form-group">
                <label className="technical-talk-required">Date*</label>
                <div className="technical-talk-input-with-icon">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={errors.date ? 'technical-talk-error' : ''}
                  />
                  <svg className="technical-talk-calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {errors.date && <span className="technical-talk-error-message">{errors.date}</span>}
              </div>

              <div className="technical-talk-form-group">
                <label className="technical-talk-required">Institution*</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  placeholder="Enter institution name"
                  className={errors.institution ? 'technical-talk-error' : ''}
                />
                {errors.institution && <span className="technical-talk-error-message">{errors.institution}</span>}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="technical-talk-modal-footer">
            <button
              type="button"
              className="technical-talk-btn technical-talk-btn-secondary"
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

export default TechnicalTalkModal;
