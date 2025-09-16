-- Create sponsored_projects table
CREATE TABLE IF NOT EXISTS sponsored_projects (
  id SERIAL PRIMARY KEY,
  project_type VARCHAR(100) NOT NULL DEFAULT 'Sponsored Project',
  project_title VARCHAR(500) NOT NULL,
  year_of_sanction VARCHAR(4) NOT NULL,
  principal_investigator VARCHAR(255) NOT NULL,
  co_investigator TEXT,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'On Going',
  duration INTEGER NOT NULL DEFAULT 0,
  sponsoring_organization VARCHAR(255) NOT NULL,
  collaborating_organization TEXT,
  sanctioned_department VARCHAR(255) NOT NULL,
  description TEXT,
  upload_file VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sponsored_projects_project_title ON sponsored_projects(project_title);
CREATE INDEX IF NOT EXISTS idx_sponsored_projects_principal_investigator ON sponsored_projects(principal_investigator);
CREATE INDEX IF NOT EXISTS idx_sponsored_projects_sponsoring_organization ON sponsored_projects(sponsoring_organization);
CREATE INDEX IF NOT EXISTS idx_sponsored_projects_status ON sponsored_projects(status);
CREATE INDEX IF NOT EXISTS idx_sponsored_projects_year_of_sanction ON sponsored_projects(year_of_sanction);
CREATE INDEX IF NOT EXISTS idx_sponsored_projects_project_type ON sponsored_projects(project_type);
CREATE INDEX IF NOT EXISTS idx_sponsored_projects_sanctioned_department ON sponsored_projects(sanctioned_department);
CREATE INDEX IF NOT EXISTS idx_sponsored_projects_created_at ON sponsored_projects(created_at);

-- Insert sample data
INSERT INTO sponsored_projects (
  project_type, project_title, year_of_sanction, principal_investigator, 
  co_investigator, amount, status, duration, sponsoring_organization, 
  collaborating_organization, sanctioned_department, description, upload_file
) VALUES 
(
  'Sponsored Project',
  'AI-Powered Learning Analytics for Educational Assessment',
  '2023',
  'Dr. John Smith',
  'Dr. Jane Doe, Dr. Michael Johnson',
  2500000.00,
  'On Going',
  36,
  'Department of Science and Technology',
  'IIT Delhi, University of California',
  'Computer Science and Engineering',
  'Development of AI algorithms for student performance prediction and learning analytics.',
  'project_sanction_letter.pdf'
),
(
  'Consultancy Work',
  'Industry 4.0 Implementation for Manufacturing',
  '2024',
  'Dr. Sarah Wilson',
  'Dr. Robert Brown',
  500000.00,
  'Completed',
  12,
  'ABC Manufacturing Ltd.',
  'XYZ Technologies',
  'Mechanical Engineering',
  'Consultancy project for implementing Industry 4.0 technologies in manufacturing processes.',
  'consultancy_agreement.pdf'
),
(
  'Research Grant',
  'Blockchain-based Academic Credential Verification System',
  '2022',
  'Dr. Michael Johnson',
  'Dr. Lisa Davis, Dr. Ahmed Hassan',
  1800000.00,
  'Completed',
  24,
  'National Science Foundation',
  'MIT, Stanford University',
  'Information Technology',
  'Development of secure and verifiable academic credential management using blockchain technology.',
  'research_grant_proposal.pdf'
),
(
  'Industry Collaboration',
  'IoT-based Smart Agriculture Monitoring System',
  '2023',
  'Dr. Priya Sharma',
  'Dr. Rajesh Kumar, Dr. Maria Garcia',
  2000000.00,
  'On Going',
  36,
  'Indian Council of Agricultural Research',
  'IIT Kanpur, Wageningen University',
  'Agricultural Engineering',
  'Implementation of sensor networks and data analytics for precision agriculture.',
  'iot_agriculture_proposal.pdf'
),
(
  'Sponsored Project',
  'Machine Learning for Predictive Maintenance in Industrial Systems',
  '2023',
  'Dr. Robert Brown',
  'Dr. Sarah Wilson, Dr. John Smith',
  3200000.00,
  'On Going',
  48,
  'Ministry of Electronics and Information Technology',
  'IIT Bombay, University of Tokyo',
  'Mechanical Engineering',
  'Development of ML models for equipment failure prediction and maintenance optimization.',
  'ml_predictive_maintenance.pdf'
)
ON CONFLICT DO NOTHING;
