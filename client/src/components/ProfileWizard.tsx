import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PersonalDetailsStep from './ProfileSteps/PersonalDetailsStep';
import ProfessionalDetailsStep from './ProfileSteps/ProfessionalDetailsStep';
import QualificationDetailsStep from './ProfileSteps/QualificationDetailsStep';
import PhdDetailsStep from './ProfileSteps/PhdDetailsStep';
import '../styles/components/ProfileWizard.css';

interface FacultyProfileData {
  // Personal Details
  id?: number;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  aadhaarNumber: string;
  presentAddress: string;
  permanentAddress: string;
  website: string;
  dateOfBirth: string;
  bloodGroup: string;
  profilePhoto?: string;

  // Professional Details
  employeeNo: string;
  dateOfJoining: string;
  teachingExperienceYears: string;
  facultyServing: string;
  facultyType: string;
  relievingDate: string;
  industrialExperienceYears: string;
  lastPromotionYear: string;
  remarks: string;
  currentDesignation: string;
  retirementDate: string;
  responsibilities: string;
  totalExperience: string;
  salaryPay: string;

  // Qualification Details
  highestQualification: string;
  specialization: string;
  researchInterest: string;
  skills: string;

  // PhD Details
  universityName: string;
  yearOfRegistration: string;
  supervisor: string;
  topic: string;
  url: string;
  phdDuringAssessmentYear: string;
  phdStatus: string;
  candidatesWithinOrganization: string;
  candidatesOutsideOrganization: string;
}

interface ProfileWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FacultyProfileData) => void;
  editingItem?: FacultyProfileData | null;
}

const ProfileWizard: React.FC<ProfileWizardProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FacultyProfileData>({
    // Personal Details
    title: 'Mr.',
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    aadhaarNumber: '',
    presentAddress: '',
    permanentAddress: '',
    website: '',
    dateOfBirth: '',
    bloodGroup: '',
    profilePhoto: '',

    // Professional Details
    employeeNo: '',
    dateOfJoining: '',
    teachingExperienceYears: '0',
    facultyServing: 'Permanent',
    facultyType: 'Teaching',
    relievingDate: '',
    industrialExperienceYears: '0',
    lastPromotionYear: '',
    remarks: '',
    currentDesignation: '',
    retirementDate: '',
    responsibilities: '',
    totalExperience: '0',
    salaryPay: '0',

    // Qualification Details
    highestQualification: '',
    specialization: '',
    researchInterest: '',
    skills: '',

    // PhD Details
    universityName: '',
    yearOfRegistration: '',
    supervisor: '',
    topic: '',
    url: '',
    phdDuringAssessmentYear: '',
    phdStatus: '',
    candidatesWithinOrganization: '0',
    candidatesOutsideOrganization: '0'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData(prev => ({
        ...prev,
        ...editingItem
      }));
    } else {
      setFormData({
        title: 'Mr.',
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        aadhaarNumber: '',
        presentAddress: '',
        permanentAddress: '',
        website: '',
        dateOfBirth: '',
        bloodGroup: '',
        profilePhoto: '',
        employeeNo: '',
        dateOfJoining: '',
        teachingExperienceYears: '0',
        facultyServing: 'Permanent',
        facultyType: 'Teaching',
        relievingDate: '',
        industrialExperienceYears: '0',
        lastPromotionYear: '',
        remarks: '',
        currentDesignation: '',
        retirementDate: '',
        responsibilities: '',
        totalExperience: '0',
        salaryPay: '0',
        highestQualification: '',
        specialization: '',
        researchInterest: '',
        skills: '',
        universityName: '',
        yearOfRegistration: '',
        supervisor: '',
        topic: '',
        url: '',
        phdDuringAssessmentYear: '',
        phdStatus: '',
        candidatesWithinOrganization: '0',
        candidatesOutsideOrganization: '0'
      });
    }
    setErrors({});
    setCurrentStep(1);
  }, [editingItem, isOpen]);

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

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1: // Personal Details
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        break;
      case 2: // Professional Details
        if (!formData.employeeNo.trim()) newErrors.employeeNo = 'Employee number is required';
        if (!formData.dateOfJoining.trim()) newErrors.dateOfJoining = 'Date of joining is required';
        if (!formData.currentDesignation.trim()) newErrors.currentDesignation = 'Current designation is required';
        break;
      case 3: // Qualification Details
        if (!formData.highestQualification.trim()) newErrors.highestQualification = 'Highest qualification is required';
        break;
      case 4: // PhD Details
        // PhD details are optional, no validation required
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = (step: number): string => {
    switch (step) {
      case 1: return 'Personal Details';
      case 2: return 'Professional Details';
      case 3: return 'Qualification Details';
      case 4: return 'Ph.D Details';
      default: return '';
    }
  };

  const getStepDescription = (step: number): string => {
    switch (step) {
      case 1: return 'Enter your personal information and contact details';
      case 2: return 'Provide your professional and employment information';
      case 3: return 'Add your educational qualifications and expertise';
      case 4: return 'Include your Ph.D and research guidance details';
      default: return '';
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="profile-wizard-overlay" onClick={onClose}>
      <div className="profile-wizard-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-wizard-header">
          <div className="profile-wizard-header-content">
            <h2>{editingItem ? 'Edit Faculty Profile' : 'Create Faculty Profile'}</h2>
            <p className="profile-wizard-subtitle">{getStepDescription(currentStep)}</p>
          </div>
          <button
            className="profile-wizard-close"
            onClick={onClose}
            title="Close Wizard"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="profile-wizard-progress">
          <div className="profile-wizard-progress-bar">
            <div 
              className="profile-wizard-progress-fill"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="profile-wizard-steps">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
              <div
                key={step}
                className={`profile-wizard-step ${step <= currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
              >
                <div className="profile-wizard-step-number">
                  {step < currentStep ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <span className="profile-wizard-step-title">{getStepTitle(step)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="profile-wizard-content">
          {currentStep === 1 && (
            <PersonalDetailsStep
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
              editingItem={editingItem}
            />
          )}
          {currentStep === 2 && (
            <ProfessionalDetailsStep
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 3 && (
            <QualificationDetailsStep
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 4 && (
            <PhdDetailsStep
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
            />
          )}
        </div>

        {/* Footer */}
        <div className="profile-wizard-footer">
          <div className="profile-wizard-footer-left">
            {currentStep > 1 && (
              <button
                type="button"
                className="profile-wizard-btn profile-wizard-btn-secondary"
                onClick={handlePrevious}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Previous
              </button>
            )}
          </div>
          
          <div className="profile-wizard-footer-right">
            <button
              type="button"
              className="profile-wizard-btn profile-wizard-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                className="profile-wizard-btn profile-wizard-btn-primary"
                onClick={handleNext}
              >
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ) : (
              <button
                type="button"
                className="profile-wizard-btn profile-wizard-btn-primary"
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="profile-wizard-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {editingItem ? 'Update Profile' : 'Create Profile'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProfileWizard;
