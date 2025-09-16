import React from 'react';
import '../styles/pages/Dashboard/Dashboard.css';

const Dashboard: React.FC = () => {

  return (
    <div className="dashboard">
      {/* Greeting and Main Title */}
      <div className="dashboard-header">
        <p className="dashboard-greeting">Welcome back, Admin</p>
        <h1 className="dashboard-title">Outcome-Based Education System</h1>
      </div>

      {/* Quick Actions - Twilio Style */}
      <div className="quick-actions">
        <div className="action-card">
          <div className="action-icon">📊</div>
          <div className="action-content">
            <h3>View Reports</h3>
            <p>Access comprehensive analytics and reports</p>
          </div>
          <button className="btn btn-primary btn-sm">View</button>
        </div>
        <div className="action-card">
          <div className="action-icon">⚙️</div>
          <div className="action-content">
            <h3>Configure System</h3>
            <p>Manage departments, programs, and settings</p>
          </div>
          <button className="btn btn-secondary btn-sm">Configure</button>
        </div>
        <div className="action-card">
          <div className="action-icon">👥</div>
          <div className="action-content">
            <h3>Manage Users</h3>
            <p>Add and manage faculty and staff accounts</p>
          </div>
          <button className="btn btn-secondary btn-sm">Manage</button>
        </div>
        <div className="action-card">
          <div className="action-icon">📈</div>
          <div className="action-content">
            <h3>Analytics</h3>
            <p>Track outcomes and performance metrics</p>
          </div>
          <button className="btn btn-secondary btn-sm">Analyze</button>
        </div>
      </div>


      {/* System Overview */}
      <div className="card">
        <div className="card-header">
          <h3>System Overview</h3>
        </div>
        <div className="card-body">
          <div className="overview-grid">
            <div className="overview-item">
              <h4>Key Features</h4>
              <ul>
                <li>📊 Comprehensive Reporting</li>
                <li>🎯 Outcome Tracking</li>
                <li>📈 Analytics Dashboard</li>
                <li>👥 Multi-user Support</li>
                <li>🔒 Role-based Access</li>
                <li>📱 Responsive Design</li>
              </ul>
            </div>
            <div className="overview-item">
              <h4>System Capabilities</h4>
              <ul>
                <li>🏛️ Department Management</li>
                <li>📚 Program Configuration</li>
                <li>👥 User Management</li>
                <li>🎯 Assessment Planning</li>
                <li>🧠 Bloom's Taxonomy</li>
                <li>📊 Data Analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
