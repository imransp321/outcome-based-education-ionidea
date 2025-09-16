import React from 'react';
import '../../styles/pages/Reports/AcademicReports.css';

const AcademicReports: React.FC = () => {
  return (
    <div className="academic-reports-page">
      <div className="academic-reports-header">
        <h1 className="academic-reports-title">Academic Reports</h1>
        <p className="academic-reports-subtitle">Generate and view academic performance reports</p>
      </div>
      <div className="academic-reports-content">
        <div className="coming-soon">
          <h3>Coming Soon</h3>
          <p>This module is currently under development and will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default AcademicReports;
