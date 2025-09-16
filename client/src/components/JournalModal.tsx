import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/MessageModal.css';
import '../styles/components/JournalModal.css';

interface JournalData {
  id: number;
  position: string;
  journalName: string;
}

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: JournalData) => void;
  editingItem?: JournalData | null;
}

const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    position: '',
    journalName: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        position: editingItem.position,
        journalName: editingItem.journalName
      });
    } else {
      setFormData({
        position: '',
        journalName: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.position) newErrors.position = 'Position is required';
    if (!formData.journalName) newErrors.journalName = 'Journal Name is required';

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

    const newItem: JournalData = {
      id: editingItem ? editingItem.id : Date.now(),
      position: formData.position,
      journalName: formData.journalName
    };

    onSave(newItem);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      position: '',
      journalName: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="journal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="journal-modal-content">
          {/* Modal Header */}
          <div className="journal-modal-header">
            <div className="journal-modal-header-content">
              <h3>{editingItem ? 'Edit Journal Editorial Entry' : 'Add New Journal Editorial Entry'}</h3>
              <p className="journal-modal-subtitle">Manage journal editorial board membership and responsibilities</p>
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
          <div className="journal-modal-body">
            <div className="journal-form-group">
              <label className="journal-required">Position*</label>
              <select
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className={errors.position ? 'journal-error' : ''}
              >
                <option value="">Select Position</option>
                <option value="Editor">Editor</option>
                <option value="Member">Member</option>
                <option value="Associate Editor">Associate Editor</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Guest Editor">Guest Editor</option>
              </select>
              {errors.position && <span className="journal-error-message">{errors.position}</span>}
            </div>

            <div className="journal-form-group">
              <label className="journal-required">Journal Name*</label>
              <input
                type="text"
                value={formData.journalName}
                onChange={(e) => handleInputChange('journalName', e.target.value)}
                placeholder="Enter Journal Name"
                className={errors.journalName ? 'journal-error' : ''}
              />
              {errors.journalName && <span className="journal-error-message">{errors.journalName}</span>}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="journal-modal-footer">
            <button
              type="button"
              className="journal-btn journal-btn-secondary"
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

export default JournalModal;
