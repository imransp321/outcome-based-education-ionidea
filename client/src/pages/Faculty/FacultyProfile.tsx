import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/components/modals.css';
import '../../styles/components/FacultyProfile.css';

interface FacultyProfileData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  qualification: string;
  experience: string;
  specialization: string;
  bio: string;
}

interface FacultyProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FacultyProfileData) => void;
  editingItem?: FacultyProfileData | null;
}

const FacultyProfile: React.FC<FacultyProfileProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    qualification: '',
    experience: '',
    specialization: '',
    bio: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        firstName: editingItem.firstName,
        lastName: editingItem.lastName,
        email: editingItem.email,
        phone: editingItem.phone,
        department: editingItem.department,
        designation: editingItem.designation,
        qualification: editingItem.qualification,
        experience: editingItem.experience,
        specialization: editingItem.specialization,
        bio: editingItem.bio
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        qualification: '',
        experience: '',
        specialization: '',
        bio: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName) newErrors.firstName = 'First Name is required';
    if (!formData.lastName) newErrors.lastName = 'Last Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.designation) newErrors.designation = 'Designation is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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

    const newItem: FacultyProfileData = {
      id: editingItem ? editingItem.id : Date.now(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      designation: formData.designation,
      qualification: formData.qualification,
      experience: formData.experience,
      specialization: formData.specialization,
      bio: formData.bio
    };

    onSave(newItem);
    onClose();
  };

  // Reset form data
  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      qualification: '',
      experience: '',
      specialization: '',
      bio: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal faculty-profile-modal-enhanced" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <h3>{editingItem ? 'Edit Faculty Profile' : 'Add New Faculty Profile'}</h3>
            <p className="modal-subtitle">Manage faculty personal and professional information</p>
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

        <div className="modal-body">
          <div className="faculty-profile-form-container">
            <div className="faculty-profile-form-layout">
              {/* Left Column */}
              <div className="faculty-profile-form-left">
                <div className="faculty-profile-form-group">
                  <label className="faculty-profile-required">First Name</label>
                  <div className="faculty-profile-input-wrapper">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter First Name"
                      className={`faculty-profile-input ${errors.firstName ? 'faculty-profile-error' : ''}`}
                    />
                    <div className="faculty-profile-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.firstName && <span className="faculty-profile-error-message">{errors.firstName}</span>}
                </div>

                <div className="faculty-profile-form-group">
                  <label className="faculty-profile-required">Last Name</label>
                  <div className="faculty-profile-input-wrapper">
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter Last Name"
                      className={`faculty-profile-input ${errors.lastName ? 'faculty-profile-error' : ''}`}
                    />
                    <div className="faculty-profile-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.lastName && <span className="faculty-profile-error-message">{errors.lastName}</span>}
                </div>

                <div className="faculty-profile-form-group">
                  <label className="faculty-profile-required">Email</label>
                  <div className="faculty-profile-input-wrapper">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter Email Address"
                      className={`faculty-profile-input ${errors.email ? 'faculty-profile-error' : ''}`}
                    />
                    <div className="faculty-profile-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.email && <span className="faculty-profile-error-message">{errors.email}</span>}
                </div>

                <div className="faculty-profile-form-group">
                  <label>Phone</label>
                  <div className="faculty-profile-input-wrapper">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter Phone Number"
                      className={`faculty-profile-input ${errors.phone ? 'faculty-profile-error' : ''}`}
                    />
                    <div className="faculty-profile-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.phone && <span className="faculty-profile-error-message">{errors.phone}</span>}
                </div>

                <div className="faculty-profile-form-group">
                  <label className="faculty-profile-required">Department</label>
                  <div className="faculty-profile-input-wrapper">
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="faculty-profile-input faculty-profile-select"
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                    </select>
                    <div className="faculty-profile-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 21h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5 21V7l8-4v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19 21V11l-6-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.department && <span className="faculty-profile-error-message">{errors.department}</span>}
                </div>

                <div className="faculty-profile-form-group">
                  <label className="faculty-profile-required">Designation</label>
                  <div className="faculty-profile-input-wrapper">
                    <select
                      value={formData.designation}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                      className="faculty-profile-input faculty-profile-select"
                    >
                      <option value="">Select Designation</option>
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Lecturer">Lecturer</option>
                    </select>
                    <div className="faculty-profile-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.designation && <span className="faculty-profile-error-message">{errors.designation}</span>}
                </div>
              </div>

              {/* Right Column */}
              <div className="faculty-profile-form-right">
                <div className="faculty-profile-form-group">
                  <label>Qualification</label>
                  <div className="faculty-profile-input-wrapper">
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) => handleInputChange('qualification', e.target.value)}
                      placeholder="Enter Educational Qualification"
                      className={`faculty-profile-input ${errors.qualification ? 'faculty-profile-error' : ''}`}
                    />
                    <div className="faculty-profile-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.qualification && <span className="faculty-profile-error-message">{errors.qualification}</span>}
                </div>

                <div className="faculty-profile-form-group">
                  <label>Experience (Years)</label>
                  <div className="faculty-profile-input-wrapper">
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      placeholder="Enter Years of Experience"
                      className={`faculty-profile-input ${errors.experience ? 'faculty-profile-error' : ''}`}
                    />
                    <div className="faculty-profile-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.experience && <span className="faculty-profile-error-message">{errors.experience}</span>}
                </div>

                <div className="faculty-profile-form-group">
                  <label>Specialization</label>
                  <div className="faculty-profile-input-wrapper">
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      placeholder="Enter Area of Specialization"
                      className={`faculty-profile-input ${errors.specialization ? 'faculty-profile-error' : ''}`}
                    />
                    <div className="faculty-profile-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.specialization && <span className="faculty-profile-error-message">{errors.specialization}</span>}
                </div>

                <div className="faculty-profile-form-group">
                  <label className="faculty-profile-section-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="faculty-profile-label-icon">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Bio
                  </label>
                  <div className="faculty-profile-textarea-wrapper">
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Enter faculty bio and background information..."
                      rows={4}
                      className={`faculty-profile-textarea ${errors.bio ? 'faculty-profile-error' : ''}`}
                    />
                    <div className="faculty-profile-textarea-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.bio && <span className="faculty-profile-error-message">{errors.bio}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="faculty-profile-btn faculty-profile-btn-secondary"
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
    </div>,
    document.body
  );
};

export default FacultyProfile;
