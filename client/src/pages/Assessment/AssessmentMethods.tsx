import React from 'react';
import '../../styles/pages/Assessment/AssessmentMethods.css';

const AssessmentMethods: React.FC = () => {
  return (
    <div className="assessment-methods-page">
      <div className="assessment-methods-header">
        <h1 className="assessment-methods-title">Assessment Methods</h1>
        <p className="assessment-methods-subtitle">Design and manage assessment methods and strategies</p>
      </div>
      <div className="assessment-methods-content">
        <div className="coming-soon">
          <h3>Coming Soon</h3>
          <p>This module is currently under development and will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentMethods;
