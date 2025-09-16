import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/MessageModal.css';
import '../styles/components/SponsoredProjectsModal.css';

interface SponsoredProjectsData {
  id: number;
  projectType: string;
  projectTitle: string;
  yearOfSanction: string;
  principalInvestigator: string;
  coInvestigator: string;
  amount: number;
  status: string;
  duration: number;
  sponsoringOrganization: string;
  collaboratingOrganization: string;
  sanctionedDepartment: string;
  description: string;
  uploadFile?: string;
}

interface SponsoredProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SponsoredProjectsData) => void;
  editingItem?: SponsoredProjectsData | null;
}

const SponsoredProjectsModal: React.FC<SponsoredProjectsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    projectType: 'Sponsored Project',
    projectTitle: '',
    yearOfSanction: '',
    principalInvestigator: '',
    coInvestigator: '',
    amount: '',
    status: 'On Going',
    duration: '',
    sponsoringOrganization: '',
    collaboratingOrganization: '',
    sanctionedDepartment: '',
    description: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        projectType: editingItem.projectType,
        projectTitle: editingItem.projectTitle,
        yearOfSanction: editingItem.yearOfSanction,
        principalInvestigator: editingItem.principalInvestigator,
        coInvestigator: editingItem.coInvestigator,
        amount: editingItem.amount.toString(),
        status: editingItem.status,
        duration: editingItem.duration.toString(),
        sponsoringOrganization: editingItem.sponsoringOrganization,
        collaboratingOrganization: editingItem.collaboratingOrganization,
        sanctionedDepartment: editingItem.sanctionedDepartment,
        description: editingItem.description
      });
    } else {
      setFormData({
        projectType: 'Sponsored Project',
        projectTitle: '',
        yearOfSanction: '',
        principalInvestigator: '',
        coInvestigator: '',
        amount: '',
        status: 'On Going',
        duration: '',
        sponsoringOrganization: '',
        collaboratingOrganization: '',
        sanctionedDepartment: '',
        description: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.projectType) newErrors.projectType = 'Project Type is required';
    if (!formData.projectTitle) newErrors.projectTitle = 'Project Title is required';
    if (!formData.yearOfSanction) newErrors.yearOfSanction = 'Year of sanction is required';
    if (!formData.principalInvestigator) newErrors.principalInvestigator = 'Principal Investigator is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.duration) newErrors.duration = 'Duration is required';

    if (formData.amount && isNaN(Number(formData.amount))) {
      newErrors.amount = 'Amount must be a valid number';
    }

    if (formData.duration && isNaN(Number(formData.duration))) {
      newErrors.duration = 'Duration must be a valid number';
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

    const newItem: SponsoredProjectsData = {
      id: editingItem ? editingItem.id : Date.now(),
      projectType: formData.projectType,
      projectTitle: formData.projectTitle,
      yearOfSanction: formData.yearOfSanction,
      principalInvestigator: formData.principalInvestigator,
      coInvestigator: formData.coInvestigator,
      amount: parseFloat(formData.amount) || 0,
      status: formData.status,
      duration: parseInt(formData.duration) || 0,
      sponsoringOrganization: formData.sponsoringOrganization,
      collaboratingOrganization: formData.collaboratingOrganization,
      sanctionedDepartment: formData.sanctionedDepartment,
      description: formData.description
    };

    onSave(newItem);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      projectType: 'Sponsored Project',
      projectTitle: '',
      yearOfSanction: '',
      principalInvestigator: '',
      coInvestigator: '',
      amount: '',
      status: 'On Going',
      duration: '',
      sponsoringOrganization: '',
      collaboratingOrganization: '',
      sanctionedDepartment: '',
      description: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="sponsored-projects-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sponsored-projects-modal-content">
          {/* Modal Header */}
          <div className="sponsored-projects-modal-header">
            <h3>{editingItem ? 'Edit Sponsored Project' : 'Add New Sponsored Project'}</h3>
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
          <div className="sponsored-projects-modal-body">
            <div className="sponsored-projects-form-layout">
              {/* Left Column */}
              <div className="sponsored-projects-form-left">
                <div className="sponsored-projects-form-group">
                  <label className="sponsored-projects-required">Project Type*</label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => handleInputChange('projectType', e.target.value)}
                    className={errors.projectType ? 'sponsored-projects-error' : ''}
                  >
                    <option value="Sponsored Project">Sponsored Project</option>
                    <option value="Consultancy Work">Consultancy Work</option>
                    <option value="Research Project">Research Project</option>
                    <option value="Development Project">Development Project</option>
                  </select>
                  {errors.projectType && <span className="sponsored-projects-error-message">{errors.projectType}</span>}
                </div>

                <div className="sponsored-projects-form-group">
                  <label className="sponsored-projects-required">Project Title*</label>
                  <input
                    type="text"
                    value={formData.projectTitle}
                    onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                    placeholder="Enter Project Title"
                    className={errors.projectTitle ? 'sponsored-projects-error' : ''}
                  />
                  {errors.projectTitle && <span className="sponsored-projects-error-message">{errors.projectTitle}</span>}
                </div>

                <div className="sponsored-projects-form-group">
                  <label className="sponsored-projects-required">Year of sanction*</label>
                  <div className="sponsored-projects-input-with-icon">
                    <input
                      type="text"
                      value={formData.yearOfSanction}
                      onChange={(e) => handleInputChange('yearOfSanction', e.target.value)}
                      placeholder="Select year"
                      className={errors.yearOfSanction ? 'sponsored-projects-error' : ''}
                      maxLength={4}
                    />
                    <svg className="sponsored-projects-calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {errors.yearOfSanction && <span className="sponsored-projects-error-message">{errors.yearOfSanction}</span>}
                </div>

                <div className="sponsored-projects-form-group">
                  <label className="sponsored-projects-required">Principal Investigator*</label>
                  <input
                    type="text"
                    value={formData.principalInvestigator}
                    onChange={(e) => handleInputChange('principalInvestigator', e.target.value)}
                    placeholder="Enter Principal Investigator"
                    className={errors.principalInvestigator ? 'sponsored-projects-error' : ''}
                  />
                  {errors.principalInvestigator && <span className="sponsored-projects-error-message">{errors.principalInvestigator}</span>}
                </div>

                <div className="sponsored-projects-form-group">
                  <label>Co-Investigator</label>
                  <textarea
                    value={formData.coInvestigator}
                    onChange={(e) => handleInputChange('coInvestigator', e.target.value)}
                    placeholder="Enter Co-Principal Investigator(s)"
                    rows={3}
                    className={errors.coInvestigator ? 'sponsored-projects-error' : ''}
                  />
                  {errors.coInvestigator && <span className="sponsored-projects-error-message">{errors.coInvestigator}</span>}
                </div>

                <div className="sponsored-projects-form-group">
                  <label>Amount (in ₹)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="Enter Amount"
                    className={errors.amount ? 'sponsored-projects-error' : ''}
                    min="0"
                    step="0.01"
                  />
                  {errors.amount && <span className="sponsored-projects-error-message">{errors.amount}</span>}
                </div>
              </div>

              {/* Right Column */}
              <div className="sponsored-projects-form-right">
                <div className="sponsored-projects-form-group">
                  <label className="sponsored-projects-required">Status*</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={errors.status ? 'sponsored-projects-error' : ''}
                  >
                    <option value="On Going">On Going</option>
                    <option value="Completed">Completed</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                  {errors.status && <span className="sponsored-projects-error-message">{errors.status}</span>}
                </div>

                <div className="sponsored-projects-form-group">
                  <label className="sponsored-projects-required">Duration (in months)*</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="Enter duration in month(s)"
                    className={errors.duration ? 'sponsored-projects-error' : ''}
                    min="1"
                  />
                  {errors.duration && <span className="sponsored-projects-error-message">{errors.duration}</span>}
                </div>

                <div className="sponsored-projects-form-group">
                  <label>Sponsoring Organization</label>
                  <textarea
                    value={formData.sponsoringOrganization}
                    onChange={(e) => handleInputChange('sponsoringOrganization', e.target.value)}
                    placeholder="Enter Sponsoring Organization"
                    rows={3}
                    className={errors.sponsoringOrganization ? 'sponsored-projects-error' : ''}
                  />
                  {errors.sponsoringOrganization && <span className="sponsored-projects-error-message">{errors.sponsoringOrganization}</span>}
                </div>

                <div className="sponsored-projects-form-group">
                  <label>Collaborating Organization</label>
                  <textarea
                    value={formData.collaboratingOrganization}
                    onChange={(e) => handleInputChange('collaboratingOrganization', e.target.value)}
                    placeholder="Enter Collaborating Organization"
                    rows={3}
                    className={errors.collaboratingOrganization ? 'sponsored-projects-error' : ''}
                  />
                  {errors.collaboratingOrganization && <span className="sponsored-projects-error-message">{errors.collaboratingOrganization}</span>}
                </div>

                <div className="sponsored-projects-form-group">
                  <label>Sanctioned Department</label>
                  <input
                    type="text"
                    value={formData.sanctionedDepartment}
                    onChange={(e) => handleInputChange('sanctionedDepartment', e.target.value)}
                    placeholder="Enter Sanctioned Department"
                    className={errors.sanctionedDepartment ? 'sponsored-projects-error' : ''}
                  />
                  {errors.sanctionedDepartment && <span className="sponsored-projects-error-message">{errors.sanctionedDepartment}</span>}
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="sponsored-projects-description-section">
              <div className="sponsored-projects-form-group">
                <label>Description</label>
                <div className="sponsored-projects-rich-text-editor">
                  <div className="sponsored-projects-editor-toolbar">
                    <div className="sponsored-projects-toolbar-row">
                      <select className="sponsored-projects-toolbar-select">
                        <option>File</option>
                      </select>
                      <select className="sponsored-projects-toolbar-select">
                        <option>Edit</option>
                      </select>
                      <select className="sponsored-projects-toolbar-select">
                        <option>Insert</option>
                      </select>
                      <select className="sponsored-projects-toolbar-select">
                        <option>View</option>
                      </select>
                      <select className="sponsored-projects-toolbar-select">
                        <option>Format</option>
                      </select>
                      <select className="sponsored-projects-toolbar-select">
                        <option>Table</option>
                      </select>
                      <select className="sponsored-projects-toolbar-select">
                        <option>Tools</option>
                      </select>
                    </div>
                    <div className="sponsored-projects-toolbar-row">
                      <button className="sponsored-projects-toolbar-btn" title="Undo">↶</button>
                      <button className="sponsored-projects-toolbar-btn" title="Redo">↷</button>
                      <select className="sponsored-projects-toolbar-select">
                        <option>Formats</option>
                      </select>
                      <button className="sponsored-projects-toolbar-btn" title="Bold"><b>B</b></button>
                      <button className="sponsored-projects-toolbar-btn" title="Italic"><i>I</i></button>
                      <button className="sponsored-projects-toolbar-btn" title="Underline"><u>U</u></button>
                      <button className="sponsored-projects-toolbar-btn" title="Strikethrough"><s>S</s></button>
                      <button className="sponsored-projects-toolbar-btn" title="Left Align">⫷</button>
                      <button className="sponsored-projects-toolbar-btn" title="Center Align">⫸</button>
                      <button className="sponsored-projects-toolbar-btn" title="Right Align">⫸</button>
                      <button className="sponsored-projects-toolbar-btn" title="Justify">⫸</button>
                      <button className="sponsored-projects-toolbar-btn" title="Bulleted List">•</button>
                      <button className="sponsored-projects-toolbar-btn" title="Numbered List">1.</button>
                      <button className="sponsored-projects-toolbar-btn" title="Indent">⫸</button>
                      <button className="sponsored-projects-toolbar-btn" title="Outdent">⫷</button>
                      <button className="sponsored-projects-toolbar-btn" title="Link">🔗</button>
                      <button className="sponsored-projects-toolbar-btn" title="Image">🖼</button>
                      <button className="sponsored-projects-toolbar-btn" title="Upload">📤</button>
                    </div>
                    <div className="sponsored-projects-toolbar-row">
                      <button className="sponsored-projects-toolbar-btn" title="Subscript">x₂</button>
                      <button className="sponsored-projects-toolbar-btn" title="Superscript">x²</button>
                      <button className="sponsored-projects-toolbar-btn" title="Clear Formatting">Clear</button>
                      <button className="sponsored-projects-toolbar-btn" title="Remove Format">X</button>
                      <button className="sponsored-projects-toolbar-btn" title="Remove">X</button>
                    </div>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter project description here..."
                    className="sponsored-projects-editor-textarea"
                    rows={8}
                  />
                  <div className="sponsored-projects-editor-footer">
                    <span>P</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="sponsored-projects-modal-footer">
            <button
              type="button"
              className="sponsored-projects-btn sponsored-projects-btn-secondary"
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

export default SponsoredProjectsModal;
