import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/MessageModal.css';
import '../styles/components/PatentModal.css';

interface PatentData {
  id: number;
  title: string;
  patentNo: string;
  year: string;
  status: string;
  activityType: string;
  abstract: string;
  uploadFile?: string;
}

interface PatentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PatentData) => void;
  editingItem?: PatentData | null;
}

const PatentModal: React.FC<PatentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    title: '',
    patentNo: '',
    year: '',
    status: 'Submitted',
    activityType: '',
    abstract: '',
    uploadFile: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title,
        patentNo: editingItem.patentNo,
        year: editingItem.year,
        status: editingItem.status,
        activityType: editingItem.activityType,
        abstract: editingItem.abstract,
        uploadFile: editingItem.uploadFile || ''
      });
    } else {
      setFormData({
        title: '',
        patentNo: '',
        year: '',
        status: 'Submitted',
        activityType: '',
        abstract: '',
        uploadFile: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.status) newErrors.status = 'Status is required';

    if (formData.year && (isNaN(Number(formData.year)) || formData.year.length !== 4)) {
      newErrors.year = 'Year must be a valid 4-digit year';
    }

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

    const newItem: PatentData = {
      id: editingItem ? editingItem.id : Date.now(),
      title: formData.title,
      patentNo: formData.patentNo,
      year: formData.year,
      status: formData.status,
      activityType: formData.activityType,
      abstract: formData.abstract,
      uploadFile: formData.uploadFile
    };

    onSave(newItem);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      title: '',
      patentNo: '',
      year: '',
      status: 'Submitted',
      activityType: '',
      abstract: '',
      uploadFile: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="patent-modal" onClick={(e) => e.stopPropagation()}>
        <div className="patent-modal-content">
          {/* Modal Header */}
          <div className="patent-modal-header">
            <h3>{editingItem ? 'Edit Patent/Innovation Entry' : 'Add New Patent/Innovation Entry'}</h3>
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
          <div className="patent-modal-body">
            <div className="patent-form-layout">
              {/* Left Column */}
              <div className="patent-form-left">
                <div className="patent-form-group">
                  <label className="patent-required">Title*</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter Patent title"
                    className={errors.title ? 'patent-error' : ''}
                  />
                  {errors.title && <span className="patent-error-message">{errors.title}</span>}
                </div>

                <div className="patent-form-group">
                  <label>Patent/activity No</label>
                  <input
                    type="text"
                    value={formData.patentNo}
                    onChange={(e) => handleInputChange('patentNo', e.target.value)}
                    placeholder="Enter Patent no."
                    className={errors.patentNo ? 'patent-error' : ''}
                  />
                  {errors.patentNo && <span className="patent-error-message">{errors.patentNo}</span>}
                </div>

                <div className="patent-form-group">
                  <label>Activity Type</label>
                  <select
                    value={formData.activityType}
                    onChange={(e) => handleInputChange('activityType', e.target.value)}
                    className={errors.activityType ? 'patent-error' : ''}
                  >
                    <option value="">Select Activity</option>
                    <option value="Patent">Patent</option>
                    <option value="Innovation">Innovation</option>
                    <option value="Development">Development</option>
                    <option value="Research">Research</option>
                    <option value="Technology Transfer">Technology Transfer</option>
                  </select>
                  {errors.activityType && <span className="patent-error-message">{errors.activityType}</span>}
                </div>
              </div>

              {/* Middle Column */}
              <div className="patent-form-middle">
                <div className="patent-form-group">
                  <label className="patent-required">Year*</label>
                  <div className="patent-input-with-icon">
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      placeholder="Select year"
                      className={errors.year ? 'patent-error' : ''}
                      maxLength={4}
                    />
                    <svg className="patent-calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {errors.year && <span className="patent-error-message">{errors.year}</span>}
                </div>

                <div className="patent-form-group">
                  <label className="patent-required">Status*</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={errors.status ? 'patent-error' : ''}
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Granted">Granted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Pending">Pending</option>
                    <option value="Published">Published</option>
                  </select>
                  {errors.status && <span className="patent-error-message">{errors.status}</span>}
                </div>
              </div>

              {/* Right Column - Abstract Editor */}
              <div className="patent-form-right">
                <div className="patent-form-group">
                  <label>Abstract</label>
                  <div className="patent-rich-text-editor">
                    <div className="patent-editor-toolbar">
                      <div className="patent-toolbar-row">
                        <select className="patent-toolbar-select">
                          <option>File</option>
                        </select>
                        <select className="patent-toolbar-select">
                          <option>Edit</option>
                        </select>
                        <select className="patent-toolbar-select">
                          <option>Insert</option>
                        </select>
                        <select className="patent-toolbar-select">
                          <option>View</option>
                        </select>
                        <select className="patent-toolbar-select">
                          <option>Format</option>
                        </select>
                        <select className="patent-toolbar-select">
                          <option>Table</option>
                        </select>
                        <select className="patent-toolbar-select">
                          <option>Tools</option>
                        </select>
                      </div>
                      <div className="patent-toolbar-row">
                        <button className="patent-toolbar-btn" title="Undo">↶</button>
                        <button className="patent-toolbar-btn" title="Redo">↷</button>
                        <select className="patent-toolbar-select">
                          <option>Formats</option>
                        </select>
                        <button className="patent-toolbar-btn" title="Bold"><b>B</b></button>
                        <button className="patent-toolbar-btn" title="Italic"><i>I</i></button>
                        <button className="patent-toolbar-btn" title="Underline"><u>U</u></button>
                        <button className="patent-toolbar-btn" title="Left Align">⫷</button>
                        <button className="patent-toolbar-btn" title="Center Align">⫸</button>
                        <button className="patent-toolbar-btn" title="Right Align">⫸</button>
                        <button className="patent-toolbar-btn" title="Justify">⫸</button>
                        <button className="patent-toolbar-btn" title="Bulleted List">•</button>
                        <button className="patent-toolbar-btn" title="Numbered List">1.</button>
                        <button className="patent-toolbar-btn" title="Indent">⫸</button>
                        <button className="patent-toolbar-btn" title="Outdent">⫷</button>
                        <button className="patent-toolbar-btn" title="Link">🔗</button>
                        <button className="patent-toolbar-btn" title="Image">🖼</button>
                        <button className="patent-toolbar-btn" title="Upload">📤</button>
                      </div>
                      <div className="patent-toolbar-row">
                        <button className="patent-toolbar-btn" title="Bold"><b>B</b></button>
                        <button className="patent-toolbar-btn" title="Italic"><i>I</i></button>
                        <button className="patent-toolbar-btn" title="Underline"><u>U</u></button>
                        <button className="patent-toolbar-btn" title="Strikethrough"><s>S</s></button>
                        <button className="patent-toolbar-btn" title="Subscript">X₂</button>
                        <button className="patent-toolbar-btn" title="Superscript">X²</button>
                        <button className="patent-toolbar-btn" title="Clear Formatting">Clear</button>
                        <button className="patent-toolbar-btn" title="Remove Format">X</button>
                      </div>
                    </div>
                    <textarea
                      value={formData.abstract}
                      onChange={(e) => handleInputChange('abstract', e.target.value)}
                      placeholder="Enter abstract content here..."
                      className="patent-editor-textarea"
                      rows={12}
                    />
                    <div className="patent-editor-footer">
                      <span>p</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="patent-modal-footer">
            <button
              type="button"
              className="patent-btn patent-btn-secondary"
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

export default PatentModal;
