import React from 'react';
import '../../styles/pages/Reports/AssessmentReports.css';

const AssessmentReports: React.FC = () => {
  return (
    <div className="assessment-reports-page">
      <div className="assessment-reports-header">
        <h1 className="assessment-reports-title">Assessment Reports</h1>
        <p className="assessment-reports-subtitle">Generate and view assessment performance reports</p>
      </div>
      <div className="assessment-reports-content">
        <div className="coming-soon">
          <h3>Coming Soon</h3>
          <p>This module is currently under development and will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentReports;
