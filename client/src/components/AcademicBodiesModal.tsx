import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/MessageModal.css';
import '../styles/components/AcademicBodiesModal.css';

interface AcademicBodiesData {
  id: number;
  memberOf: string;
  institution: string;
}

interface AcademicBodiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AcademicBodiesData) => void;
  editingItem?: AcademicBodiesData | null;
}

const AcademicBodiesModal: React.FC<AcademicBodiesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    memberOf: '',
    institution: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        memberOf: editingItem.memberOf,
        institution: editingItem.institution
      });
    } else {
      setFormData({
        memberOf: '',
        institution: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.memberOf) newErrors.memberOf = 'Member of is required';
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

    const newItem: AcademicBodiesData = {
      id: editingItem ? editingItem.id : Date.now(),
      memberOf: formData.memberOf,
      institution: formData.institution
    };

    onSave(newItem);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      memberOf: '',
      institution: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="academic-bodies-modal" onClick={(e) => e.stopPropagation()}>
        <div className="academic-bodies-modal-content">
          {/* Modal Header */}
          <div className="academic-bodies-modal-header">
            <div className="academic-bodies-modal-header-content">
              <h3>{editingItem ? 'Edit Academic Body Entry' : 'Add New Academic Body Entry'}</h3>
              <p className="academic-bodies-modal-subtitle">Manage academic and administrative body memberships</p>
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
          <div className="academic-bodies-modal-body">
            <div className="academic-bodies-form-group">
              <label className="academic-bodies-required">Member Of*</label>
              <input
                type="text"
                value={formData.memberOf}
                onChange={(e) => handleInputChange('memberOf', e.target.value)}
                placeholder="Enter Member Of"
                className={errors.memberOf ? 'academic-bodies-error' : ''}
              />
              {errors.memberOf && <span className="academic-bodies-error-message">{errors.memberOf}</span>}
            </div>

            <div className="academic-bodies-form-group">
              <label className="academic-bodies-required">Institution*</label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => handleInputChange('institution', e.target.value)}
                placeholder="Enter Institution"
                className={errors.institution ? 'academic-bodies-error' : ''}
              />
              {errors.institution && <span className="academic-bodies-error-message">{errors.institution}</span>}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="academic-bodies-modal-footer">
            <button
              type="button"
              className="academic-bodies-btn academic-bodies-btn-secondary"
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

export default AcademicBodiesModal;
