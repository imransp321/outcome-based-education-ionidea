import React from 'react';
import '../../styles/pages/Assessment/RubricDesign.css';

const RubricDesign: React.FC = () => {
  return (
    <div className="rubric-design-page">
      <div className="rubric-design-header">
        <h1 className="rubric-design-title">Rubric Design</h1>
        <p className="rubric-design-subtitle">Create and manage assessment rubrics</p>
      </div>
      <div className="rubric-design-content">
        <div className="coming-soon">
          <h3>Coming Soon</h3>
          <p>This module is currently under development and will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default RubricDesign;
