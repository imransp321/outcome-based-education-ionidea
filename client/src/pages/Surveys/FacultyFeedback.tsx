import React from 'react';
import '../../styles/pages/Surveys/FacultyFeedback.css';

const FacultyFeedback: React.FC = () => {
  return (
    <div className="faculty-feedback-page">
      <div className="faculty-feedback-header">
        <h1 className="faculty-feedback-title">Faculty Feedback</h1>
        <p className="faculty-feedback-subtitle">Collect and analyze faculty feedback and surveys</p>
      </div>
      <div className="faculty-feedback-content">
        <div className="coming-soon">
          <h3>Coming Soon</h3>
          <p>This module is currently under development and will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default FacultyFeedback;
