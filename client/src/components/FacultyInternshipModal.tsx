import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/MessageModal.css';
import '../styles/components/FacultyInternshipModal.css';

interface FacultyInternshipData {
  id: number;
  nameOfInternship: string;
  companyAndPlace: string;
  duration: string;
  year: string;
  outcome: string;
  uploadFile?: string;
}

interface FacultyInternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FacultyInternshipData) => void;
  editingItem?: FacultyInternshipData | null;
}

const FacultyInternshipModal: React.FC<FacultyInternshipModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    nameOfInternship: '',
    companyAndPlace: '',
    duration: '',
    year: '',
    outcome: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        nameOfInternship: editingItem.nameOfInternship,
        companyAndPlace: editingItem.companyAndPlace,
        duration: editingItem.duration,
        year: editingItem.year,
        outcome: editingItem.outcome
      });
    } else {
      setFormData({
        nameOfInternship: '',
        companyAndPlace: '',
        duration: '',
        year: '',
        outcome: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nameOfInternship) newErrors.nameOfInternship = 'Internship/Training/Collaboration is required';
    if (!formData.companyAndPlace) newErrors.companyAndPlace = 'Company and Place is required';
    if (!formData.duration) newErrors.duration = 'Duration is required';
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

    const newItem: FacultyInternshipData = {
      id: editingItem ? editingItem.id : Date.now(),
      nameOfInternship: formData.nameOfInternship,
      companyAndPlace: formData.companyAndPlace,
      duration: formData.duration,
      year: formData.year,
      outcome: formData.outcome
    };

    onSave(newItem);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      nameOfInternship: '',
      companyAndPlace: '',
      duration: '',
      year: '',
      outcome: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="faculty-internship-modal" onClick={(e) => e.stopPropagation()}>
        <div className="faculty-internship-modal-content">
          {/* Modal Header */}
          <div className="faculty-internship-modal-header">
            <div className="faculty-internship-modal-header-content">
              <h3>{editingItem ? 'Edit Faculty Internship' : 'Add New Faculty Internship'}</h3>
              <p className="faculty-internship-modal-subtitle">Manage faculty internship and industry collaboration</p>
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
          <div className="faculty-internship-modal-body">
            <div className="faculty-internship-form-layout">
              <div className="faculty-internship-form-group">
                <label className="faculty-internship-required">Internship/Training/Collaboration*</label>
                <textarea
                  value={formData.nameOfInternship}
                  onChange={(e) => handleInputChange('nameOfInternship', e.target.value)}
                  placeholder="Internship/Training/Collaboration"
                  rows={3}
                  className={errors.nameOfInternship ? 'faculty-internship-error' : ''}
                />
                {errors.nameOfInternship && <span className="faculty-internship-error-message">{errors.nameOfInternship}</span>}
              </div>

              <div className="faculty-internship-form-group">
                <label className="faculty-internship-required">Company and Place*</label>
                <textarea
                  value={formData.companyAndPlace}
                  onChange={(e) => handleInputChange('companyAndPlace', e.target.value)}
                  placeholder="Enter Company and Place"
                  rows={3}
                  className={errors.companyAndPlace ? 'faculty-internship-error' : ''}
                />
                {errors.companyAndPlace && <span className="faculty-internship-error-message">{errors.companyAndPlace}</span>}
              </div>

              <div className="faculty-internship-form-group">
                <label className="faculty-internship-required">Year*</label>
                <select
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className={errors.year ? 'faculty-internship-error' : ''}
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
                {errors.year && <span className="faculty-internship-error-message">{errors.year}</span>}
              </div>

              <div className="faculty-internship-form-group">
                <label className="faculty-internship-required">Duration*</label>
                <div className="faculty-internship-duration-group">
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="Enter Duration"
                    className={errors.duration ? 'faculty-internship-error' : ''}
                  />
                  <select className="faculty-internship-duration-select">
                    <option value="">Select Duration</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
                {errors.duration && <span className="faculty-internship-error-message">{errors.duration}</span>}
              </div>

              <div className="faculty-internship-form-group">
                <label>Outcome/Result</label>
                <textarea
                  value={formData.outcome}
                  onChange={(e) => handleInputChange('outcome', e.target.value)}
                  placeholder="Outcome / Result"
                  rows={4}
                  className={errors.outcome ? 'faculty-internship-error' : ''}
                />
                {errors.outcome && <span className="faculty-internship-error-message">{errors.outcome}</span>}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="faculty-internship-modal-footer">
            <button
              type="button"
              className="faculty-internship-btn faculty-internship-btn-secondary"
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

export default FacultyInternshipModal;
