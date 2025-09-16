import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/MessageModal.css';
import '../styles/components/SeminarTrainingModal.css';

interface SeminarTrainingData {
  id: number;
  programTitle: string;
  type: string;
  eventOrganizer: string;
  venue: string;
  level: string;
  role: string;
  invitedDeputed: string;
  startDate: string;
  endDate: string;
  highlights: string;
  uploadFile?: string;
}

interface SeminarTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SeminarTrainingData) => void;
  editingItem?: SeminarTrainingData | null;
}

const SeminarTrainingModal: React.FC<SeminarTrainingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    programTitle: '',
    type: '',
    eventOrganizer: '',
    venue: '',
    level: 'State',
    role: '',
    invitedDeputed: 'Invited',
    startDate: '',
    endDate: '',
    highlights: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        programTitle: editingItem.programTitle,
        type: editingItem.type,
        eventOrganizer: editingItem.eventOrganizer,
        venue: editingItem.venue,
        level: editingItem.level,
        role: editingItem.role,
        invitedDeputed: editingItem.invitedDeputed,
        startDate: editingItem.startDate,
        endDate: editingItem.endDate,
        highlights: editingItem.highlights
      });
    } else {
      setFormData({
        programTitle: '',
        type: '',
        eventOrganizer: '',
        venue: '',
        level: 'State',
        role: '',
        invitedDeputed: 'Invited',
        startDate: '',
        endDate: '',
        highlights: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.programTitle) newErrors.programTitle = 'Program Title is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.level) newErrors.level = 'Level is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.invitedDeputed) newErrors.invitedDeputed = 'Invited/Deputed is required';
    if (!formData.startDate) newErrors.startDate = 'Start Date is required';

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

    const newItem: SeminarTrainingData = {
      id: editingItem ? editingItem.id : Date.now(),
      programTitle: formData.programTitle,
      type: formData.type,
      eventOrganizer: formData.eventOrganizer,
      venue: formData.venue,
      level: formData.level,
      role: formData.role,
      invitedDeputed: formData.invitedDeputed,
      startDate: formData.startDate,
      endDate: formData.endDate,
      highlights: formData.highlights
    };

    onSave(newItem);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      programTitle: '',
      type: '',
      eventOrganizer: '',
      venue: '',
      level: 'State',
      role: '',
      invitedDeputed: 'Invited',
      startDate: '',
      endDate: '',
      highlights: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="seminar-training-modal" onClick={(e) => e.stopPropagation()}>
        <div className="seminar-training-modal-content">
          {/* Modal Header */}
          <div className="seminar-training-modal-header">
            <div className="seminar-training-modal-header-content">
              <h3>{editingItem ? 'Edit Seminar/Training Entry' : 'Add New Seminar/Training Entry'}</h3>
              <p className="seminar-training-modal-subtitle">Manage seminar, training and workshop attendance records</p>
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
          <div className="seminar-training-modal-body">
            <div className="seminar-training-form-layout">
              {/* Left Column */}
              <div className="seminar-training-form-left">
                <div className="seminar-training-form-group">
                  <label className="seminar-training-required">Program Title*</label>
                  <input
                    type="text"
                    value={formData.programTitle}
                    onChange={(e) => handleInputChange('programTitle', e.target.value)}
                    placeholder="Enter Title"
                    className={errors.programTitle ? 'seminar-training-error' : ''}
                  />
                  {errors.programTitle && <span className="seminar-training-error-message">{errors.programTitle}</span>}
                </div>

                <div className="seminar-training-form-group">
                  <label className="seminar-training-required">Type*</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className={errors.type ? 'seminar-training-error' : ''}
                  >
                    <option value="">Select Type</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Training">Training</option>
                    <option value="Development">Development</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Conference">Conference</option>
                    <option value="Symposium">Symposium</option>
                  </select>
                  {errors.type && <span className="seminar-training-error-message">{errors.type}</span>}
                </div>

                <div className="seminar-training-form-group">
                  <label>Event Organizer</label>
                  <input
                    type="text"
                    value={formData.eventOrganizer}
                    onChange={(e) => handleInputChange('eventOrganizer', e.target.value)}
                    placeholder="Enter Event Organizer"
                    className={errors.eventOrganizer ? 'seminar-training-error' : ''}
                  />
                  {errors.eventOrganizer && <span className="seminar-training-error-message">{errors.eventOrganizer}</span>}
                </div>

                <div className="seminar-training-form-group">
                  <label>Venue</label>
                  <textarea
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    placeholder="Enter Venue"
                    rows={3}
                    className={errors.venue ? 'seminar-training-error' : ''}
                  />
                  {errors.venue && <span className="seminar-training-error-message">{errors.venue}</span>}
                </div>
              </div>

              {/* Middle Column */}
              <div className="seminar-training-form-middle">
                <div className="seminar-training-form-group">
                  <label className="seminar-training-required">Select Level*</label>
                  <select
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    className={errors.level ? 'seminar-training-error' : ''}
                  >
                    <option value="State">State</option>
                    <option value="National">National</option>
                    <option value="International">International</option>
                    <option value="Regional">Regional</option>
                    <option value="Local">Local</option>
                  </select>
                  {errors.level && <span className="seminar-training-error-message">{errors.level}</span>}
                </div>

                <div className="seminar-training-form-group">
                  <label className="seminar-training-required">Your Role*</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className={errors.role ? 'seminar-training-error' : ''}
                  >
                    <option value="">Select Role</option>
                    <option value="Participant">Participant</option>
                    <option value="Resource Person">Resource Person</option>
                    <option value="Speaker">Speaker</option>
                    <option value="Organizer">Organizer</option>
                    <option value="Coordinator">Coordinator</option>
                    <option value="Chair">Chair</option>
                    <option value="Keynote Speaker">Keynote Speaker</option>
                  </select>
                  {errors.role && <span className="seminar-training-error-message">{errors.role}</span>}
                </div>

                <div className="seminar-training-form-group">
                  <label className="seminar-training-required">Invited/Deputed*</label>
                  <select
                    value={formData.invitedDeputed}
                    onChange={(e) => handleInputChange('invitedDeputed', e.target.value)}
                    className={errors.invitedDeputed ? 'seminar-training-error' : ''}
                  >
                    <option value="Invited">Invited</option>
                    <option value="Deputed">Deputed</option>
                    <option value="Self">Self</option>
                  </select>
                  {errors.invitedDeputed && <span className="seminar-training-error-message">{errors.invitedDeputed}</span>}
                </div>

                <div className="seminar-training-form-group">
                  <label className="seminar-training-required">Date*</label>
                  <div className="seminar-training-date-group">
                    <div className="seminar-training-date-field">
                      <label>Start Date</label>
                      <div className="seminar-training-input-with-icon">
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          className={errors.startDate ? 'seminar-training-error' : ''}
                        />
                        <svg className="seminar-training-calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {errors.startDate && <span className="seminar-training-error-message">{errors.startDate}</span>}
                    </div>
                    <div className="seminar-training-date-field">
                      <label>End Date</label>
                      <div className="seminar-training-input-with-icon">
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                        />
                        <svg className="seminar-training-calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Highlights Editor */}
              <div className="seminar-training-form-right">
                <div className="seminar-training-form-group">
                  <label>Highlights</label>
                  <div className="seminar-training-rich-text-editor">
                    <div className="seminar-training-editor-toolbar">
                      <div className="seminar-training-toolbar-row">
                        <select className="seminar-training-toolbar-select">
                          <option>File</option>
                        </select>
                        <select className="seminar-training-toolbar-select">
                          <option>Edit</option>
                        </select>
                        <select className="seminar-training-toolbar-select">
                          <option>Insert</option>
                        </select>
                        <select className="seminar-training-toolbar-select">
                          <option>View</option>
                        </select>
                        <select className="seminar-training-toolbar-select">
                          <option>Format</option>
                        </select>
                        <select className="seminar-training-toolbar-select">
                          <option>Table</option>
                        </select>
                        <select className="seminar-training-toolbar-select">
                          <option>Tools</option>
                        </select>
                      </div>
                      <div className="seminar-training-toolbar-row">
                        <button className="seminar-training-toolbar-btn" title="Undo">↶</button>
                        <button className="seminar-training-toolbar-btn" title="Redo">↷</button>
                        <select className="seminar-training-toolbar-select">
                          <option>Formats</option>
                        </select>
                        <button className="seminar-training-toolbar-btn" title="Bold"><b>B</b></button>
                        <button className="seminar-training-toolbar-btn" title="Italic"><i>I</i></button>
                        <button className="seminar-training-toolbar-btn" title="Underline"><u>U</u></button>
                        <button className="seminar-training-toolbar-btn" title="Left Align">⫷</button>
                        <button className="seminar-training-toolbar-btn" title="Center Align">⫸</button>
                        <button className="seminar-training-toolbar-btn" title="Right Align">⫸</button>
                        <button className="seminar-training-toolbar-btn" title="Justify">⫸</button>
                        <button className="seminar-training-toolbar-btn" title="Bulleted List">•</button>
                        <button className="seminar-training-toolbar-btn" title="Numbered List">1.</button>
                        <button className="seminar-training-toolbar-btn" title="Indent">⫸</button>
                        <button className="seminar-training-toolbar-btn" title="Outdent">⫷</button>
                        <button className="seminar-training-toolbar-btn" title="Link">🔗</button>
                        <button className="seminar-training-toolbar-btn" title="Image">🖼</button>
                        <button className="seminar-training-toolbar-btn" title="Upload">📤</button>
                      </div>
                      <div className="seminar-training-toolbar-row">
                        <button className="seminar-training-toolbar-btn" title="Subscript">x₂</button>
                        <button className="seminar-training-toolbar-btn" title="Superscript">x²</button>
                        <button className="seminar-training-toolbar-btn" title="Clear Formatting">Clear</button>
                      </div>
                    </div>
                    <textarea
                      value={formData.highlights}
                      onChange={(e) => handleInputChange('highlights', e.target.value)}
                      placeholder="Enter highlights here..."
                      className="seminar-training-editor-textarea"
                      rows={12}
                    />
                    <div className="seminar-training-editor-footer">
                      <span>p</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="seminar-training-modal-footer">
            <button
              type="button"
              className="seminar-training-btn seminar-training-btn-secondary"
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

export default SeminarTrainingModal;
