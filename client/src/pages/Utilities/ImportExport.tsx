import React from 'react';
import '../../styles/pages/Utilities/ImportExport.css';

const ImportExport: React.FC = () => {
  return (
    <div className="import-export-page">
      <div className="import-export-header">
        <h1 className="import-export-title">Data Import/Export</h1>
        <p className="import-export-subtitle">Import and export data across the system</p>
      </div>
      <div className="import-export-content">
        <div className="coming-soon">
          <h3>Coming Soon</h3>
          <p>This module is currently under development and will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
