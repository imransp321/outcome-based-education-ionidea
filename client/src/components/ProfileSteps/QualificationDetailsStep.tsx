import React from 'react';

interface QualificationDetailsStepProps {
  formData: any;
  errors: { [key: string]: string };
  onInputChange: (field: string, value: string) => void;
}

const QualificationDetailsStep: React.FC<QualificationDetailsStepProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  return (
    <div className="qualification-details-step">
      <h3 className="section-title">Qualification Details</h3>
      
      <div className="form-row">
        <div className="form-column">
          <div className="form-group">
            <label className="form-label required">Highest Qualification</label>
            <div className="input-wrapper">
              <select
                value={formData.highestQualification}
                onChange={(e) => onInputChange('highestQualification', e.target.value)}
                className={`form-input ${errors.highestQualification ? 'error' : ''}`}
              >
                <option value="">Select Highest Qualification</option>
                <option value="Ph.D.">Ph.D.</option>
                <option value="M.E. / M.Tech.">M.E. / M.Tech.</option>
                <option value="M.S.">M.S.</option>
                <option value="M.Sc.">M.Sc.</option>
                <option value="M.A.">M.A.</option>
                <option value="M.B.A.">M.B.A.</option>
                <option value="M.C.A.">M.C.A.</option>
                <option value="B.E. / B.Tech.">B.E. / B.Tech.</option>
                <option value="B.Sc.">B.Sc.</option>
                <option value="B.A.">B.A.</option>
                <option value="B.C.A.">B.C.A.</option>
                <option value="Diploma">Diploma</option>
                <option value="Other">Other</option>
              </select>
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.highestQualification && <span className="error-message">{errors.highestQualification}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Specialization</label>
            <div className="textarea-wrapper">
              <textarea
                value={formData.specialization}
                onChange={(e) => onInputChange('specialization', e.target.value)}
                placeholder="Enter Specialization"
                rows={3}
                className={`form-textarea ${errors.specialization ? 'error' : ''}`}
              />
              <div className="textarea-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.specialization && <span className="error-message">{errors.specialization}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Research Interest</label>
            <div className="textarea-wrapper">
              <textarea
                value={formData.researchInterest}
                onChange={(e) => onInputChange('researchInterest', e.target.value)}
                placeholder="Enter Research Interest"
                rows={3}
                className={`form-textarea ${errors.researchInterest ? 'error' : ''}`}
              />
              <div className="textarea-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.researchInterest && <span className="error-message">{errors.researchInterest}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Skills</label>
            <div className="textarea-wrapper">
              <textarea
                value={formData.skills}
                onChange={(e) => onInputChange('skills', e.target.value)}
                placeholder="Enter Skills"
                rows={3}
                className={`form-textarea ${errors.skills ? 'error' : ''}`}
              />
              <div className="textarea-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.skills && <span className="error-message">{errors.skills}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualificationDetailsStep;
