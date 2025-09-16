import React from 'react';
import '../../styles/pages/Surveys/StudentFeedback.css';

const StudentFeedback: React.FC = () => {
  return (
    <div className="student-feedback-page">
      <div className="student-feedback-header">
        <h1 className="student-feedback-title">Student Feedback</h1>
        <p className="student-feedback-subtitle">Collect and analyze student feedback and surveys</p>
      </div>
      <div className="student-feedback-content">
        <div className="coming-soon">
          <h3>Coming Soon</h3>
          <p>This module is currently under development and will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedback;
