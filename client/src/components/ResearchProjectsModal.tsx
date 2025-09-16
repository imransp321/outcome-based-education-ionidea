import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/MessageModal.css';
import '../styles/components/ResearchProjectsModal.css';

interface ResearchProjectsData {
  id: number;
  projectTitle: string;
  role: string;
  teamMembers: string;
  status: string;
  collaboration: string;
  sanctionedDate: string;
  amountSanctioned: number;
  duration: number;
  fundingAgency: string;
  amountUtilized: number;
  outcome: string;
  uploadFile?: string;
}

interface ResearchProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ResearchProjectsData) => void;
  editingItem?: ResearchProjectsData | null;
}

const ResearchProjectsModal: React.FC<ResearchProjectsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    projectTitle: '',
    role: 'Principal Investigator',
    teamMembers: '',
    status: 'On Going',
    collaboration: '',
    sanctionedDate: '',
    amountSanctioned: '',
    duration: '',
    fundingAgency: '',
    amountUtilized: '',
    outcome: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        projectTitle: editingItem.projectTitle,
        role: editingItem.role,
        teamMembers: editingItem.teamMembers,
        status: editingItem.status,
        collaboration: editingItem.collaboration,
        sanctionedDate: editingItem.sanctionedDate,
        amountSanctioned: editingItem.amountSanctioned.toString(),
        duration: editingItem.duration.toString(),
        fundingAgency: editingItem.fundingAgency,
        amountUtilized: editingItem.amountUtilized.toString(),
        outcome: editingItem.outcome
      });
    } else {
      setFormData({
        projectTitle: '',
        role: 'Principal Investigator',
        teamMembers: '',
        status: 'On Going',
        collaboration: '',
        sanctionedDate: '',
        amountSanctioned: '',
        duration: '',
        fundingAgency: '',
        amountUtilized: '',
        outcome: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.projectTitle) newErrors.projectTitle = 'Project Title is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.sanctionedDate) newErrors.sanctionedDate = 'Sanctioned Date is required';

    if (formData.amountSanctioned && isNaN(Number(formData.amountSanctioned))) {
      newErrors.amountSanctioned = 'Amount must be a valid number';
    }

    if (formData.duration && isNaN(Number(formData.duration))) {
      newErrors.duration = 'Duration must be a valid number';
    }

    if (formData.amountUtilized && isNaN(Number(formData.amountUtilized))) {
      newErrors.amountUtilized = 'Amount Utilized must be a valid number';
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

    const newItem: ResearchProjectsData = {
      id: editingItem ? editingItem.id : Date.now(),
      projectTitle: formData.projectTitle,
      role: formData.role,
      teamMembers: formData.teamMembers,
      status: formData.status,
      collaboration: formData.collaboration,
      sanctionedDate: formData.sanctionedDate,
      amountSanctioned: parseFloat(formData.amountSanctioned) || 0,
      duration: parseInt(formData.duration) || 0,
      fundingAgency: formData.fundingAgency,
      amountUtilized: parseFloat(formData.amountUtilized) || 0,
      outcome: formData.outcome
    };

    onSave(newItem);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      projectTitle: '',
      role: 'Principal Investigator',
      teamMembers: '',
      status: 'On Going',
      collaboration: '',
      sanctionedDate: '',
      amountSanctioned: '',
      duration: '',
      fundingAgency: '',
      amountUtilized: '',
      outcome: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="research-projects-modal" onClick={(e) => e.stopPropagation()}>
        <div className="research-projects-modal-content">
          {/* Modal Header */}
          <div className="research-projects-modal-header">
            <h3>{editingItem ? 'Edit Research Project' : 'Add New Research Project'}</h3>
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
          <div className="research-projects-modal-body">
            <div className="research-projects-form-layout">
              {/* Left Column */}
              <div className="research-projects-form-left">
                <div className="research-projects-form-group">
                  <label className="research-projects-required">Project Title*</label>
                  <input
                    type="text"
                    value={formData.projectTitle}
                    onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                    placeholder="Enter Project Title"
                    className={errors.projectTitle ? 'research-projects-error' : ''}
                  />
                  {errors.projectTitle && <span className="research-projects-error-message">{errors.projectTitle}</span>}
                </div>

                <div className="research-projects-form-group">
                  <label className="research-projects-required">Role*</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className={errors.role ? 'research-projects-error' : ''}
                  >
                    <option value="Principal Investigator">Principal Investigator</option>
                    <option value="Co-Investigator">Co-Investigator</option>
                    <option value="Research Associate">Research Associate</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Consultant">Consultant</option>
                  </select>
                  {errors.role && <span className="research-projects-error-message">{errors.role}</span>}
                </div>

                <div className="research-projects-form-group">
                  <label>Team Member(s)</label>
                  <textarea
                    value={formData.teamMembers}
                    onChange={(e) => handleInputChange('teamMembers', e.target.value)}
                    placeholder="Enter Team Member(s)"
                    rows={3}
                    className={errors.teamMembers ? 'research-projects-error' : ''}
                  />
                  {errors.teamMembers && <span className="research-projects-error-message">{errors.teamMembers}</span>}
                </div>

                <div className="research-projects-form-group">
                  <label className="research-projects-required">Status*</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={errors.status ? 'research-projects-error' : ''}
                  >
                    <option value="On Going">On Going</option>
                    <option value="Completed">Completed</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                  {errors.status && <span className="research-projects-error-message">{errors.status}</span>}
                </div>

                <div className="research-projects-form-group">
                  <label>Collaboration</label>
                  <textarea
                    value={formData.collaboration}
                    onChange={(e) => handleInputChange('collaboration', e.target.value)}
                    placeholder="Enter Collaboration"
                    rows={3}
                    className={errors.collaboration ? 'research-projects-error' : ''}
                  />
                  {errors.collaboration && <span className="research-projects-error-message">{errors.collaboration}</span>}
                </div>
              </div>

              {/* Right Column */}
              <div className="research-projects-form-right">
                <div className="research-projects-form-group">
                  <label className="research-projects-required">Sanctioned Date*</label>
                  <div className="research-projects-input-with-icon">
                    <input
                      type="date"
                      value={formData.sanctionedDate}
                      onChange={(e) => handleInputChange('sanctionedDate', e.target.value)}
                      className={errors.sanctionedDate ? 'research-projects-error' : ''}
                    />
                    <svg className="research-projects-calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {errors.sanctionedDate && <span className="research-projects-error-message">{errors.sanctionedDate}</span>}
                </div>

                <div className="research-projects-form-group">
                  <label>Quantum of Amount Sanctioned (in ₹)</label>
                  <input
                    type="number"
                    value={formData.amountSanctioned}
                    onChange={(e) => handleInputChange('amountSanctioned', e.target.value)}
                    placeholder="Enter Amount"
                    className={errors.amountSanctioned ? 'research-projects-error' : ''}
                    min="0"
                    step="0.01"
                  />
                  {errors.amountSanctioned && <span className="research-projects-error-message">{errors.amountSanctioned}</span>}
                </div>

                <div className="research-projects-form-group">
                  <label>Duration (in months)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="Enter Duration"
                    className={errors.duration ? 'research-projects-error' : ''}
                    min="1"
                  />
                  {errors.duration && <span className="research-projects-error-message">{errors.duration}</span>}
                </div>

                <div className="research-projects-form-group">
                  <label>Funding Agency</label>
                  <textarea
                    value={formData.fundingAgency}
                    onChange={(e) => handleInputChange('fundingAgency', e.target.value)}
                    placeholder="Enter Funding Agency"
                    rows={3}
                    className={errors.fundingAgency ? 'research-projects-error' : ''}
                  />
                  {errors.fundingAgency && <span className="research-projects-error-message">{errors.fundingAgency}</span>}
                </div>

                <div className="research-projects-form-group">
                  <label>Amount Utilized</label>
                  <input
                    type="number"
                    value={formData.amountUtilized}
                    onChange={(e) => handleInputChange('amountUtilized', e.target.value)}
                    placeholder="Enter Amount Utilized"
                    className={errors.amountUtilized ? 'research-projects-error' : ''}
                    min="0"
                    step="0.01"
                  />
                  {errors.amountUtilized && <span className="research-projects-error-message">{errors.amountUtilized}</span>}
                </div>

                <div className="research-projects-form-group">
                  <label>Outcome of project</label>
                  <textarea
                    value={formData.outcome}
                    onChange={(e) => handleInputChange('outcome', e.target.value)}
                    placeholder="Enter Outcome of project"
                    rows={3}
                    className={errors.outcome ? 'research-projects-error' : ''}
                  />
                  {errors.outcome && <span className="research-projects-error-message">{errors.outcome}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="research-projects-modal-footer">
            <button
              type="button"
              className="research-projects-btn research-projects-btn-secondary"
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

export default ResearchProjectsModal;
