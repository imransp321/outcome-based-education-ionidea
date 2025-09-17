import React from 'react';

interface PhdDetailsStepProps {
  formData: any;
  errors: { [key: string]: string };
  onInputChange: (field: string, value: string) => void;
}

const PhdDetailsStep: React.FC<PhdDetailsStepProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  return (
    <div className="phd-details-step">
      <h3 className="section-title">Ph.D Details</h3>
      
      <div className="form-row">
        <div className="form-column">
          <div className="form-group">
            <label className="form-label">Name of University</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={formData.universityName}
                onChange={(e) => onInputChange('universityName', e.target.value)}
                placeholder="Enter Name of University"
                className={`form-input ${errors.universityName ? 'error' : ''}`}
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.universityName && <span className="error-message">{errors.universityName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Year of Registration</label>
            <div className="input-wrapper">
              <input
                type="number"
                value={formData.yearOfRegistration}
                onChange={(e) => onInputChange('yearOfRegistration', e.target.value)}
                placeholder="Select year"
                className={`form-input ${errors.yearOfRegistration ? 'error' : ''}`}
                min="1900"
                max="2100"
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.yearOfRegistration && <span className="error-message">{errors.yearOfRegistration}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Supervisor(s)</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={formData.supervisor}
                onChange={(e) => onInputChange('supervisor', e.target.value)}
                placeholder="Enter Supervisor(s)"
                className={`form-input ${errors.supervisor ? 'error' : ''}`}
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.supervisor && <span className="error-message">{errors.supervisor}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Topic on Ph.D</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => onInputChange('topic', e.target.value)}
                placeholder="Enter Topic on Ph.D"
                className={`form-input ${errors.topic ? 'error' : ''}`}
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.topic && <span className="error-message">{errors.topic}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">URL</label>
            <div className="input-wrapper">
              <input
                type="url"
                value={formData.url}
                onChange={(e) => onInputChange('url', e.target.value)}
                placeholder="Enter URL"
                className={`form-input ${errors.url ? 'error' : ''}`}
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.url && <span className="error-message">{errors.url}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Ph.D during assessment year</label>
            <div className="input-wrapper">
              <input
                type="number"
                value={formData.phdDuringAssessmentYear}
                onChange={(e) => onInputChange('phdDuringAssessmentYear', e.target.value)}
                placeholder="Select year"
                className={`form-input ${errors.phdDuringAssessmentYear ? 'error' : ''}`}
                min="1900"
                max="2100"
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.phdDuringAssessmentYear && <span className="error-message">{errors.phdDuringAssessmentYear}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Ph.D Status</label>
            <div className="input-wrapper">
              <select
                value={formData.phdStatus}
                onChange={(e) => onInputChange('phdStatus', e.target.value)}
                className={`form-input ${errors.phdStatus ? 'error' : ''}`}
              >
                <option value="">Select Status</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Defended">Defended</option>
                <option value="Not Started">Not Started</option>
              </select>
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.phdStatus && <span className="error-message">{errors.phdStatus}</span>}
          </div>
        </div>

        <div className="form-column">
          <h4 className="subsection-title">Ph.D Guidance Details</h4>
          
          <div className="form-group">
            <label className="form-label">Candidate(s) within organization</label>
            <div className="input-wrapper">
              <input
                type="number"
                value={formData.candidatesWithinOrganization}
                onChange={(e) => onInputChange('candidatesWithinOrganization', e.target.value)}
                placeholder="0"
                className={`form-input ${errors.candidatesWithinOrganization ? 'error' : ''}`}
                min="0"
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.candidatesWithinOrganization && <span className="error-message">{errors.candidatesWithinOrganization}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Candidate(s) outside organization</label>
            <div className="input-wrapper">
              <input
                type="number"
                value={formData.candidatesOutsideOrganization}
                onChange={(e) => onInputChange('candidatesOutsideOrganization', e.target.value)}
                placeholder="0"
                className={`form-input ${errors.candidatesOutsideOrganization ? 'error' : ''}`}
                min="0"
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.candidatesOutsideOrganization && <span className="error-message">{errors.candidatesOutsideOrganization}</span>}
          </div>

          <div className="form-group">
            <div className="form-link">
              <a href="#" className="link">Add PhD guidance details</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhdDetailsStep;
