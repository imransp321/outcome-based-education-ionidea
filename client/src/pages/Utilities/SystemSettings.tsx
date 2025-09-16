import React from 'react';
import '../../styles/pages/Utilities/SystemSettings.css';

const SystemSettings: React.FC = () => {
  return (
    <div className="system-settings-page">
      <div className="system-settings-header">
        <h1 className="system-settings-title">System Settings</h1>
        <p className="system-settings-subtitle">Configure system-wide settings and preferences</p>
      </div>
      <div className="system-settings-content">
        <div className="coming-soon">
          <h3>Coming Soon</h3>
          <p>This module is currently under development and will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
