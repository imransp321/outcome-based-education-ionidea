import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import BookChapterTextEditor from './BookChapterTextEditor';
import '../styles/components/modals.css';
import '../styles/components/SharedModal.css';

interface ConsultancyTestingData {
  id: number;
  projectTitle: string;
  projectCode: string;
  client: string;
  role: string;
  commencementYear: string;
  completionYear: string;
  status: string;
  coConsultants: string;
  revenueEarned: number;
  abstract: string;
  uploadFile?: string;
}

interface ConsultancyTestingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ConsultancyTestingData) => void;
  editingItem?: ConsultancyTestingData | null;
}

const ConsultancyTestingModal: React.FC<ConsultancyTestingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectCode: '',
    client: '',
    role: '',
    commencementYear: '',
    completionYear: '',
    status: 'On Going',
    coConsultants: '',
    revenueEarned: '',
    abstract: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        projectTitle: editingItem.projectTitle,
        projectCode: editingItem.projectCode,
        client: editingItem.client,
        role: editingItem.role,
        commencementYear: editingItem.commencementYear,
        completionYear: editingItem.completionYear,
        status: editingItem.status,
        coConsultants: editingItem.coConsultants,
        revenueEarned: editingItem.revenueEarned.toString(),
        abstract: editingItem.abstract
      });
    } else {
      setFormData({
        projectTitle: '',
        projectCode: '',
        client: '',
        role: '',
        commencementYear: '',
        completionYear: '',
        status: 'On Going',
        coConsultants: '',
        revenueEarned: '',
        abstract: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.projectTitle) newErrors.projectTitle = 'Project Title is required';
    if (!formData.client) newErrors.client = 'Client is required';
    if (!formData.commencementYear) newErrors.commencementYear = 'Commencement Year is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.role) newErrors.role = 'Your Role is required';

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
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const newItem: ConsultancyTestingData = {
      id: editingItem?.id || Date.now(),
      projectTitle: formData.projectTitle,
      projectCode: formData.projectCode,
      client: formData.client,
      role: formData.role,
      commencementYear: formData.commencementYear,
      completionYear: formData.completionYear,
      status: formData.status,
      coConsultants: formData.coConsultants,
      revenueEarned: parseFloat(formData.revenueEarned) || 0,
      abstract: formData.abstract
    };

    onSave(newItem);
    onClose();
  };

  const closeModal = () => {
    setFormData({
      projectTitle: '',
      projectCode: '',
      client: '',
      role: '',
      commencementYear: '',
      completionYear: '',
      status: 'On Going',
      coConsultants: '',
      revenueEarned: '',
      abstract: ''
    });
    setErrors({});
    onClose();
  };

  // Reset form data
  const handleReset = () => {
    setFormData({
      projectTitle: '',
      projectCode: '',
      client: '',
      role: '',
      commencementYear: '',
      completionYear: '',
      status: 'On Going',
      coConsultants: '',
      revenueEarned: '',
      abstract: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal book-chapter-modal-enhanced" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <h3>{editingItem ? 'Edit Consultancy Project' : 'Add New Consultancy Project'}</h3>
            <p className="modal-subtitle">Manage consultancy and testing project records</p>
          </div>
          <button
            className="message-modal-close"
            onClick={closeModal}
            title="Close Modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="book-chapter-form-container">
            <div className="book-chapter-form-layout">
              {/* Left Column */}
              <div className="book-chapter-form-left">
                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Project Title</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.projectTitle}
                      onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                      placeholder="Enter Project Title"
                      className={`book-chapter-input ${errors.projectTitle ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.projectTitle && <span className="book-chapter-error-message">{errors.projectTitle}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>Project Code</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.projectCode}
                      onChange={(e) => handleInputChange('projectCode', e.target.value)}
                      placeholder="Enter Project Code"
                      className={`book-chapter-input ${errors.projectCode ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.projectCode && <span className="book-chapter-error-message">{errors.projectCode}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Client</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.client}
                      onChange={(e) => handleInputChange('client', e.target.value)}
                      placeholder="Enter Client's name"
                      className={`book-chapter-input ${errors.client ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.client && <span className="book-chapter-error-message">{errors.client}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>Revenue earned(in ₹)</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.revenueEarned}
                      onChange={(e) => handleInputChange('revenueEarned', e.target.value)}
                      placeholder="Enter Amount"
                      className={`book-chapter-input ${errors.revenueEarned ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.revenueEarned && <span className="book-chapter-error-message">{errors.revenueEarned}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Role</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      placeholder="Enter Your Role"
                      className={`book-chapter-input ${errors.role ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.role && <span className="book-chapter-error-message">{errors.role}</span>}
                </div>

              </div>

              {/* Right Column - Additional Fields and Description Editor */}
              <div className="book-chapter-form-right">
                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Commencement Year</label>
                  <div className="book-chapter-input-wrapper">
                    <select
                      value={formData.commencementYear}
                      onChange={(e) => handleInputChange('commencementYear', e.target.value)}
                      className="book-chapter-input book-chapter-select"
                    >
                      <option value="">Select year</option>
                      {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </select>
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.commencementYear && <span className="book-chapter-error-message">{errors.commencementYear}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>Completion Year</label>
                  <div className="book-chapter-input-wrapper">
                    <select
                      value={formData.completionYear}
                      onChange={(e) => handleInputChange('completionYear', e.target.value)}
                      className="book-chapter-input book-chapter-select"
                    >
                      <option value="">Select year</option>
                      {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </select>
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.completionYear && <span className="book-chapter-error-message">{errors.completionYear}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Status</label>
                  <div className="book-chapter-input-wrapper">
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="book-chapter-input book-chapter-select"
                    >
                      <option value="On Going">On Going</option>
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.status && <span className="book-chapter-error-message">{errors.status}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Your Role</label>
                  <div className="book-chapter-input-wrapper">
                    <select
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="book-chapter-input book-chapter-select"
                    >
                      <option value="">Select Role</option>
                      <option value="Lead Consultant">Lead Consultant</option>
                      <option value="Senior Consultant">Senior Consultant</option>
                      <option value="Consultant">Consultant</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="Technical Lead">Technical Lead</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Developer">Developer</option>
                      <option value="Analyst">Analyst</option>
                    </select>
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.role && <span className="book-chapter-error-message">{errors.role}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>Co-consultant(s)</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.coConsultants}
                      onChange={(e) => handleInputChange('coConsultants', e.target.value)}
                      placeholder="Enter consultant's name"
                      className={`book-chapter-input ${errors.coConsultants ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.coConsultants && <span className="book-chapter-error-message">{errors.coConsultants}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label className="book-chapter-section-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="book-chapter-label-icon">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Abstract
                  </label>
                  <BookChapterTextEditor
                    value={formData.abstract}
                    onChange={(value) => handleInputChange('abstract', value)}
                    placeholder="Enter project abstract and details here..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="book-chapter-btn book-chapter-btn-secondary"
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
            onClick={closeModal}
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
    </div>,
    document.body
  );
};

export default ConsultancyTestingModal;
