import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/MessageModal.css';
import '../styles/components/ProfessionalBodiesModal.css';

interface ProfessionalBodiesData {
  id: number;
  organizationName: string;
  membershipType: string;
  membershipNo: string;
  date: string;
  description: string;
  uploadFile?: string;
}

interface ProfessionalBodiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProfessionalBodiesData) => void;
  editingItem?: ProfessionalBodiesData | null;
}

const ProfessionalBodiesModal: React.FC<ProfessionalBodiesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    organizationName: '',
    membershipType: 'Life Time',
    membershipNo: '',
    date: '',
    description: '',
    uploadFile: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        organizationName: editingItem.organizationName,
        membershipType: editingItem.membershipType,
        membershipNo: editingItem.membershipNo,
        date: editingItem.date,
        description: editingItem.description,
        uploadFile: editingItem.uploadFile || ''
      });
    } else {
      setFormData({
        organizationName: '',
        membershipType: 'Life Time',
        membershipNo: '',
        date: '',
        description: '',
        uploadFile: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.organizationName) newErrors.organizationName = 'Organization Name is required';
    if (!formData.membershipType) newErrors.membershipType = 'Membership Type is required';
    if (!formData.membershipNo) newErrors.membershipNo = 'Membership No. is required';
    if (!formData.date) newErrors.date = 'Date is required';

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

    const newItem: ProfessionalBodiesData = {
      id: editingItem ? editingItem.id : Date.now(),
      organizationName: formData.organizationName,
      membershipType: formData.membershipType,
      membershipNo: formData.membershipNo,
      date: formData.date,
      description: formData.description,
      uploadFile: formData.uploadFile
    };

    onSave(newItem);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      organizationName: '',
      membershipType: 'Life Time',
      membershipNo: '',
      date: '',
      description: '',
      uploadFile: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="professional-bodies-modal" onClick={(e) => e.stopPropagation()}>
        <div className="professional-bodies-modal-content">
          {/* Modal Header */}
          <div className="professional-bodies-modal-header">
            <h3>{editingItem ? 'Edit Professional Body Entry' : 'Add New Professional Body Entry'}</h3>
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
          <div className="professional-bodies-modal-body">
            <div className="professional-bodies-form-layout">
              {/* Left Column */}
              <div className="professional-bodies-form-left">
                <div className="professional-bodies-form-group">
                  <label className="professional-bodies-required">Organization Name*</label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    placeholder="Enter Organization Name"
                    className={errors.organizationName ? 'professional-bodies-error' : ''}
                  />
                  {errors.organizationName && <span className="professional-bodies-error-message">{errors.organizationName}</span>}
                </div>

                <div className="professional-bodies-form-group">
                  <label className="professional-bodies-required">Membership Type*</label>
                  <select
                    value={formData.membershipType}
                    onChange={(e) => handleInputChange('membershipType', e.target.value)}
                    className={errors.membershipType ? 'professional-bodies-error' : ''}
                  >
                    <option value="Life Time">Life Time</option>
                    <option value="Annual">Annual</option>
                    <option value="Student">Student</option>
                    <option value="Associate">Associate</option>
                    <option value="Fellow">Fellow</option>
                    <option value="Honorary">Honorary</option>
                  </select>
                  {errors.membershipType && <span className="professional-bodies-error-message">{errors.membershipType}</span>}
                </div>

                <div className="professional-bodies-form-group">
                  <label className="professional-bodies-required">Membership No.*</label>
                  <input
                    type="text"
                    value={formData.membershipNo}
                    onChange={(e) => handleInputChange('membershipNo', e.target.value)}
                    placeholder="Enter Membership No."
                    className={errors.membershipNo ? 'professional-bodies-error' : ''}
                  />
                  {errors.membershipNo && <span className="professional-bodies-error-message">{errors.membershipNo}</span>}
                </div>

                <div className="professional-bodies-form-group">
                  <label className="professional-bodies-required">Date*</label>
                  <div className="professional-bodies-input-with-icon">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className={errors.date ? 'professional-bodies-error' : ''}
                    />
                    <svg className="professional-bodies-calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {errors.date && <span className="professional-bodies-error-message">{errors.date}</span>}
                </div>
              </div>

              {/* Right Column - Description Editor */}
              <div className="professional-bodies-form-right">
                <div className="professional-bodies-form-group">
                  <label>Description</label>
                  <div className="professional-bodies-rich-text-editor">
                    <div className="professional-bodies-editor-toolbar">
                      <div className="professional-bodies-toolbar-row">
                        <select className="professional-bodies-toolbar-select">
                          <option>File</option>
                        </select>
                        <select className="professional-bodies-toolbar-select">
                          <option>Edit</option>
                        </select>
                        <select className="professional-bodies-toolbar-select">
                          <option>Insert</option>
                        </select>
                        <select className="professional-bodies-toolbar-select">
                          <option>View</option>
                        </select>
                        <select className="professional-bodies-toolbar-select">
                          <option>Format</option>
                        </select>
                        <select className="professional-bodies-toolbar-select">
                          <option>Table</option>
                        </select>
                        <select className="professional-bodies-toolbar-select">
                          <option>Tools</option>
                        </select>
                      </div>
                      <div className="professional-bodies-toolbar-row">
                        <button className="professional-bodies-toolbar-btn" title="Undo">↶</button>
                        <button className="professional-bodies-toolbar-btn" title="Redo">↷</button>
                        <select className="professional-bodies-toolbar-select">
                          <option>Formats</option>
                        </select>
                        <button className="professional-bodies-toolbar-btn" title="Bold"><b>B</b></button>
                        <button className="professional-bodies-toolbar-btn" title="Italic"><i>I</i></button>
                        <button className="professional-bodies-toolbar-btn" title="Underline"><u>U</u></button>
                        <button className="professional-bodies-toolbar-btn" title="Left Align">⫷</button>
                        <button className="professional-bodies-toolbar-btn" title="Center Align">⫸</button>
                        <button className="professional-bodies-toolbar-btn" title="Right Align">⫸</button>
                        <button className="professional-bodies-toolbar-btn" title="Justify">⫸</button>
                        <button className="professional-bodies-toolbar-btn" title="Bulleted List">•</button>
                        <button className="professional-bodies-toolbar-btn" title="Numbered List">1.</button>
                        <button className="professional-bodies-toolbar-btn" title="Indent">⫸</button>
                        <button className="professional-bodies-toolbar-btn" title="Outdent">⫷</button>
                        <button className="professional-bodies-toolbar-btn" title="Link">🔗</button>
                        <button className="professional-bodies-toolbar-btn" title="Image">🖼</button>
                        <button className="professional-bodies-toolbar-btn" title="Upload">📤</button>
                      </div>
                      <div className="professional-bodies-toolbar-row">
                        <button className="professional-bodies-toolbar-btn" title="Bold"><b>B</b></button>
                        <button className="professional-bodies-toolbar-btn" title="Italic"><i>I</i></button>
                        <button className="professional-bodies-toolbar-btn" title="Underline"><u>U</u></button>
                        <button className="professional-bodies-toolbar-btn" title="Subscript">X₂</button>
                        <button className="professional-bodies-toolbar-btn" title="Superscript">X²</button>
                      </div>
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter description here..."
                      className="professional-bodies-editor-textarea"
                      rows={12}
                    />
                    <div className="professional-bodies-editor-footer">
                      <span>P</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="professional-bodies-modal-footer">
            <button
              type="button"
              className="professional-bodies-btn professional-bodies-btn-secondary"
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

export default ProfessionalBodiesModal;
