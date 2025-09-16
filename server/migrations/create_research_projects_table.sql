-- Create research_projects table
CREATE TABLE IF NOT EXISTS research_projects (
  id SERIAL PRIMARY KEY,
  project_title VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  team_members TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'On Going',
  collaboration VARCHAR(255),
  sanctioned_date DATE NOT NULL,
  amount_sanctioned DECIMAL(15,2) NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0,
  funding_agency VARCHAR(255) NOT NULL,
  amount_utilized DECIMAL(15,2) NOT NULL DEFAULT 0,
  outcome TEXT,
  upload_file VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_research_projects_project_title ON research_projects(project_title);
CREATE INDEX IF NOT EXISTS idx_research_projects_role ON research_projects(role);
CREATE INDEX IF NOT EXISTS idx_research_projects_status ON research_projects(status);
CREATE INDEX IF NOT EXISTS idx_research_projects_funding_agency ON research_projects(funding_agency);
CREATE INDEX IF NOT EXISTS idx_research_projects_sanctioned_date ON research_projects(sanctioned_date);
CREATE INDEX IF NOT EXISTS idx_research_projects_created_at ON research_projects(created_at);

-- Insert sample data
INSERT INTO research_projects (project_title, role, team_members, status, collaboration, sanctioned_date, amount_sanctioned, duration, funding_agency, amount_utilized, outcome, upload_file) VALUES
('AI-Powered Learning Analytics for Educational Assessment', 'Principal Investigator', 'Dr. John Smith, Dr. Jane Doe, Research Scholar ABC', 'On Going', 'IIT Delhi, University of California', '2023-06-15', 2500000.00, 36, 'Department of Science and Technology', 1200000.00, 'Development of AI algorithms for student performance prediction', 'ai_learning_analytics.pdf'),
('Blockchain-based Academic Credential Verification System', 'Co-Investigator', 'Dr. Michael Johnson, Dr. Sarah Wilson', 'Completed', 'MIT, Stanford University', '2022-01-01', 1800000.00, 24, 'National Science Foundation', 1800000.00, 'Published 5 research papers, 2 patents filed', 'blockchain_credential_system.pdf'),
('Machine Learning for Predictive Maintenance in Industrial Systems', 'Principal Investigator', 'Dr. Robert Brown, Dr. Lisa Davis, Research Scholar XYZ', 'On Going', 'IIT Bombay, University of Tokyo', '2023-03-01', 3200000.00, 48, 'Ministry of Electronics and Information Technology', 800000.00, 'Development of ML models for equipment failure prediction', 'ml_predictive_maintenance.pdf'),
('Sustainable Energy Solutions for Rural Communities', 'Co-Investigator', 'Dr. Maria Garcia, Dr. Ahmed Hassan', 'Completed', 'University of Cambridge, NREL', '2021-08-01', 1500000.00, 30, 'Department of Biotechnology', 1500000.00, 'Implemented solar microgrids in 5 rural villages', 'sustainable_energy_rural.pdf'),
('IoT-based Smart Agriculture Monitoring System', 'Principal Investigator', 'Dr. Priya Sharma, Dr. Rajesh Kumar', 'On Going', 'IIT Kanpur, Wageningen University', '2023-09-01', 2000000.00, 36, 'Indian Council of Agricultural Research', 400000.00, 'Deployed sensor networks in 10 agricultural fields', 'iot_smart_agriculture.pdf')
ON CONFLICT DO NOTHING;
