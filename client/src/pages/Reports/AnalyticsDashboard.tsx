import React from 'react';
import '../../styles/pages/Reports/AnalyticsDashboard.css';

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="analytics-dashboard-page">
      <div className="analytics-dashboard-header">
        <h1 className="analytics-dashboard-title">Analytics Dashboard</h1>
        <p className="analytics-dashboard-subtitle">Comprehensive analytics and insights dashboard</p>
      </div>
      <div className="analytics-dashboard-content">
        <div className="coming-soon">
          <h3>Coming Soon</h3>
          <p>This module is currently under development and will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
