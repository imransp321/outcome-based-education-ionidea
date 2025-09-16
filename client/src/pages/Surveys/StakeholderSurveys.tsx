import React from 'react';
import '../../styles/pages/Surveys/StakeholderSurveys.css';

const StakeholderSurveys: React.FC = () => {
  return (
    <div className="stakeholder-surveys-page">
      <div className="stakeholder-surveys-header">
        <h1 className="stakeholder-surveys-title">Stakeholder Surveys</h1>
        <p className="stakeholder-surveys-subtitle">Collect and analyze stakeholder feedback and surveys</p>
      </div>
      <div className="stakeholder-surveys-content">
        <div className="coming-soon">
          <h3>Coming Soon</h3>
          <p>This module is currently under development and will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default StakeholderSurveys;
