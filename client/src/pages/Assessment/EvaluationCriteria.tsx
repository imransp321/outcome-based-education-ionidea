import React from 'react';
import '../../styles/pages/Assessment/EvaluationCriteria.css';

const EvaluationCriteria: React.FC = () => {
  return (
    <div className="evaluation-criteria-page">
      <div className="evaluation-criteria-header">
        <h1 className="evaluation-criteria-title">Evaluation Criteria</h1>
        <p className="evaluation-criteria-subtitle">Define and manage evaluation criteria and standards</p>
      </div>
      <div className="evaluation-criteria-content">
        <div className="coming-soon">
          <h3>Coming Soon</h3>
          <p>This module is currently under development and will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default EvaluationCriteria;
