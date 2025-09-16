import React from 'react';
import '../../styles/pages/Utilities/BackupRestore.css';

const BackupRestore: React.FC = () => {
  return (
    <div className="backup-restore-page">
      <div className="backup-restore-header">
        <h1 className="backup-restore-title">Backup & Restore</h1>
        <p className="backup-restore-subtitle">Backup and restore system data and configurations</p>
      </div>
      <div className="backup-restore-content">
        <div className="coming-soon">
          <h3>Coming Soon</h3>
          <p>This module is currently under development and will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;
