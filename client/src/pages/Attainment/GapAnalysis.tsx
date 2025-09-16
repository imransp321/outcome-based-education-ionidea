import React from 'react';
import '../../styles/pages/Attainment/GapAnalysis.css';

const GapAnalysis: React.FC = () => {
  return (
    <div className="gap-analysis-page">
      <div className="gap-analysis-header">
        <h1 className="gap-analysis-title">Gap Analysis</h1>
        <p className="gap-analysis-subtitle">Analyze gaps in outcome attainment and performance</p>
      </div>
      <div className="gap-analysis-content">
        <div className="coming-soon">
          <h3>Coming Soon</h3>
          <p>This module is currently under development and will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default GapAnalysis;
