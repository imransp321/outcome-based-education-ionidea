import React from 'react';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';

const LabExperiments: React.FC = () => {
  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Manage Lab Experiment & TLOs</h1>
        <p>Manage laboratory experiments and their associated Teaching and Learning Outcomes (TLOs)</p>
      </div>

      {/* Grid Container */}
      <div className="grid-container">
        <div className="grid-empty">
          <div className="grid-empty-icon">🧪</div>
          <h3>Lab Experiments Management</h3>
          <p>This feature is under development. You will be able to manage laboratory experiments and their TLOs here.</p>
          <p>Features will include:</p>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <li>Create and manage lab experiments</li>
            <li>Define TLOs for each experiment</li>
            <li>Link experiments to courses</li>
            <li>Track experiment outcomes and assessments</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LabExperiments;
