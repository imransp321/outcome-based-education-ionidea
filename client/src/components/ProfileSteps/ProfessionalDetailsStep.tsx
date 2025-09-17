import React from 'react';

interface ProfessionalDetailsStepProps {
  formData: any;
  errors: { [key: string]: string };
  onInputChange: (field: string, value: string) => void;
}

const ProfessionalDetailsStep: React.FC<ProfessionalDetailsStepProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  return (
    <div className="professional-details-step">
      <h3 className="section-title">Professional Details</h3>
      
      <div className="form-row">
        {/* Left Column */}
        <div className="form-column">
          <div className="form-group">
            <label className="form-label">Employee No</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={formData.employeeNo}
                onChange={(e) => onInputChange('employeeNo', e.target.value)}
                placeholder="Enter Employee No."
                className={`form-input ${errors.employeeNo ? 'error' : ''}`}
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.employeeNo && <span className="error-message">{errors.employeeNo}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Date of Joining</label>
            <div className="input-wrapper">
              <input
                type="date"
                value={formData.dateOfJoining}
                onChange={(e) => onInputChange('dateOfJoining', e.target.value)}
                className={`form-input ${errors.dateOfJoining ? 'error' : ''}`}
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.dateOfJoining && <span className="error-message">{errors.dateOfJoining}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Teaching Experience (In Years)</label>
            <div className="input-wrapper">
              <input
                type="number"
                value={formData.teachingExperienceYears}
                onChange={(e) => onInputChange('teachingExperienceYears', e.target.value)}
                placeholder="0"
                className={`form-input ${errors.teachingExperienceYears ? 'error' : ''}`}
                min="0"
                step="0.1"
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            {errors.teachingExperienceYears && <span className="error-message">{errors.teachingExperienceYears}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Faculty Serving</label>
            <div className="input-wrapper">
              <select
                value={formData.facultyServing}
                onChange={(e) => onInputChange('facultyServing', e.target.value)}
                className={`form-input ${errors.facultyServing ? 'error' : ''}`}
              >
                <option value="Permanent">Permanent</option>
                <option value="Temporary">Temporary</option>
                <option value="Contract">Contract</option>
                <option value="Visiting">Visiting</option>
              </select>
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.facultyServing && <span className="error-message">{errors.facultyServing}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Remarks</label>
            <div className="textarea-wrapper">
              <textarea
                value={formData.remarks}
                onChange={(e) => onInputChange('remarks', e.target.value)}
                placeholder="Enter Remarks"
                rows={3}
                className={`form-textarea ${errors.remarks ? 'error' : ''}`}
              />
              <div className="textarea-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.remarks && <span className="error-message">{errors.remarks}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Current Designation</label>
            <div className="input-wrapper">
              <select
                value={formData.currentDesignation}
                onChange={(e) => onInputChange('currentDesignation', e.target.value)}
                className={`form-input ${errors.currentDesignation ? 'error' : ''}`}
              >
                <option value="">Select Designation</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
                <option value="HoD">Head of Department</option>
                <option value="Dean">Dean</option>
                <option value="Director">Director</option>
              </select>
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="form-link">
              <a href="#" className="link">Manage Designation List</a>
            </div>
            {errors.currentDesignation && <span className="error-message">{errors.currentDesignation}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Retirement Date</label>
            <div className="input-wrapper">
              <input
                type="date"
                value={formData.retirementDate}
                onChange={(e) => onInputChange('retirementDate', e.target.value)}
                className={`form-input ${errors.retirementDate ? 'error' : ''}`}
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.retirementDate && <span className="error-message">{errors.retirementDate}</span>}
          </div>
        </div>

        {/* Right Column */}
        <div className="form-column">
          <div className="form-group">
            <label className="form-label required">Faculty Type</label>
            <div className="input-wrapper">
              <select
                value={formData.facultyType}
                onChange={(e) => onInputChange('facultyType', e.target.value)}
                className={`form-input ${errors.facultyType ? 'error' : ''}`}
              >
                <option value="Teaching">Teaching</option>
                <option value="Research">Research</option>
                <option value="Administrative">Administrative</option>
                <option value="Technical">Technical</option>
              </select>
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.facultyType && <span className="error-message">{errors.facultyType}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Relieving Date</label>
            <div className="input-wrapper">
              <input
                type="date"
                value={formData.relievingDate}
                onChange={(e) => onInputChange('relievingDate', e.target.value)}
                className={`form-input ${errors.relievingDate ? 'error' : ''}`}
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.relievingDate && <span className="error-message">{errors.relievingDate}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Industrial Experience (In Years)</label>
            <div className="input-wrapper">
              <input
                type="number"
                value={formData.industrialExperienceYears}
                onChange={(e) => onInputChange('industrialExperienceYears', e.target.value)}
                placeholder="0"
                className={`form-input ${errors.industrialExperienceYears ? 'error' : ''}`}
                min="0"
                step="0.1"
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            {errors.industrialExperienceYears && <span className="error-message">{errors.industrialExperienceYears}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Last Promotion</label>
            <div className="input-wrapper">
              <input
                type="number"
                value={formData.lastPromotionYear}
                onChange={(e) => onInputChange('lastPromotionYear', e.target.value)}
                placeholder="1970"
                className={`form-input ${errors.lastPromotionYear ? 'error' : ''}`}
                min="1900"
                max="2100"
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.lastPromotionYear && <span className="error-message">{errors.lastPromotionYear}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Responsibilities</label>
            <div className="textarea-wrapper">
              <textarea
                value={formData.responsibilities}
                onChange={(e) => onInputChange('responsibilities', e.target.value)}
                placeholder="Enter Responsibilities"
                rows={3}
                className={`form-textarea ${errors.responsibilities ? 'error' : ''}`}
              />
              <div className="textarea-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.responsibilities && <span className="error-message">{errors.responsibilities}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Total Experience</label>
            <div className="input-wrapper">
              <input
                type="number"
                value={formData.totalExperience}
                onChange={(e) => onInputChange('totalExperience', e.target.value)}
                placeholder="0.00"
                className={`form-input ${errors.totalExperience ? 'error' : ''}`}
                min="0"
                step="0.01"
              />
              <div className="input-icon success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.totalExperience && <span className="error-message">{errors.totalExperience}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Salary Pay (in ₹)</label>
            <div className="input-wrapper">
              <input
                type="number"
                value={formData.salaryPay}
                onChange={(e) => onInputChange('salaryPay', e.target.value)}
                placeholder="0.00"
                className={`form-input ${errors.salaryPay ? 'error' : ''}`}
                min="0"
                step="0.01"
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.salaryPay && <span className="error-message">{errors.salaryPay}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDetailsStep;
