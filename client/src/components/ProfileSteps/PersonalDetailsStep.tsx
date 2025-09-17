import React, { useRef } from 'react';

interface PersonalDetailsStepProps {
  formData: any;
  errors: { [key: string]: string };
  onInputChange: (field: string, value: string) => void;
  editingItem?: any;
}

const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({
  formData,
  errors,
  onInputChange,
  editingItem
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Here you would typically upload the file to the server
      // For now, we'll just store the file name
      onInputChange('profilePhoto', file.name);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="personal-details-step">
      {/* Profile Photo Section */}
      <div className="profile-photo-section">
        <label className="profile-photo-label">Upload your profile photo:</label>
        <div className="profile-photo-container" onClick={handlePhotoClick}>
          <div className="profile-photo-placeholder">
            {formData.profilePhoto ? (
              <img 
                src={`/uploads/faculty-profiles/${formData.profilePhoto}`} 
                alt="Profile" 
                className="profile-photo-image"
              />
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <button type="button" className="profile-photo-change-btn">
            Change profile
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Employee Details Section */}
      <div className="employee-details-section">
        <h3 className="section-title">Employee Details</h3>
        
        <div className="form-row">
          {/* Left Column */}
          <div className="form-column">
            <div className="form-group">
              <label className="form-label required">Title</label>
              <div className="input-wrapper">
                <select
                  value={formData.title}
                  onChange={(e) => onInputChange('title', e.target.value)}
                  className={`form-input ${errors.title ? 'error' : ''}`}
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                </select>
                <div className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Last Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => onInputChange('lastName', e.target.value)}
                  placeholder="Enter Last Name"
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                />
                <div className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => onInputChange('contactNumber', e.target.value)}
                  placeholder="Enter Contact Number"
                  className={`form-input ${errors.contactNumber ? 'error' : ''}`}
                />
                <div className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {errors.contactNumber && <span className="error-message">{errors.contactNumber}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Present Address</label>
              <div className="textarea-wrapper">
                <textarea
                  value={formData.presentAddress}
                  onChange={(e) => onInputChange('presentAddress', e.target.value)}
                  placeholder="Enter Present Address"
                  rows={3}
                  className={`form-textarea ${errors.presentAddress ? 'error' : ''}`}
                />
                <div className="textarea-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {errors.presentAddress && <span className="error-message">{errors.presentAddress}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Website</label>
              <div className="input-wrapper">
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => onInputChange('website', e.target.value)}
                  placeholder="Enter Website"
                  className={`form-input ${errors.website ? 'error' : ''}`}
                />
                <div className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {errors.website && <span className="error-message">{errors.website}</span>}
            </div>
          </div>

          {/* Right Column */}
          <div className="form-column">
            <div className="form-group">
              <label className="form-label required">First Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => onInputChange('firstName', e.target.value)}
                  placeholder="Enter First Name"
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                />
                <div className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Email Id</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => onInputChange('email', e.target.value)}
                  placeholder="Enter Email Address"
                  className={`form-input ${errors.email ? 'error' : ''} ${editingItem ? 'readonly' : ''}`}
                  readOnly={!!editingItem}
                />
                <div className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Aadhaar Number</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => onInputChange('aadhaarNumber', e.target.value)}
                  placeholder="Enter Aadhaar Number"
                  className={`form-input ${errors.aadhaarNumber ? 'error' : ''}`}
                />
                <div className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {errors.aadhaarNumber && <span className="error-message">{errors.aadhaarNumber}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Permanent Address</label>
              <div className="textarea-wrapper">
                <textarea
                  value={formData.permanentAddress}
                  onChange={(e) => onInputChange('permanentAddress', e.target.value)}
                  placeholder="Enter Permanent Address"
                  rows={3}
                  className={`form-textarea ${errors.permanentAddress ? 'error' : ''}`}
                />
                <div className="textarea-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {errors.permanentAddress && <span className="error-message">{errors.permanentAddress}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Date of Birth</label>
              <div className="input-wrapper">
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => onInputChange('dateOfBirth', e.target.value)}
                  className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                />
                <div className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <div className="input-wrapper">
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => onInputChange('bloodGroup', e.target.value)}
                  className={`form-input ${errors.bloodGroup ? 'error' : ''}`}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                <div className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {errors.bloodGroup && <span className="error-message">{errors.bloodGroup}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsStep;
