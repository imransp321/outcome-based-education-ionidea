-- Create patent_innovation table
CREATE TABLE IF NOT EXISTS patent_innovation (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  patent_no VARCHAR(100) NOT NULL,
  year VARCHAR(4) NOT NULL,
  status VARCHAR(50) NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  abstract TEXT,
  upload_file VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_patent_innovation_title ON patent_innovation(title);
CREATE INDEX IF NOT EXISTS idx_patent_innovation_patent_no ON patent_innovation(patent_no);
CREATE INDEX IF NOT EXISTS idx_patent_innovation_year ON patent_innovation(year);
CREATE INDEX IF NOT EXISTS idx_patent_innovation_status ON patent_innovation(status);
CREATE INDEX IF NOT EXISTS idx_patent_innovation_activity_type ON patent_innovation(activity_type);
CREATE INDEX IF NOT EXISTS idx_patent_innovation_created_at ON patent_innovation(created_at);

-- Insert sample data
INSERT INTO patent_innovation (title, patent_no, year, status, activity_type, abstract, upload_file) VALUES
('AI-Powered Educational Assessment System', 'US2024001234A1', '2024', 'Submitted', 'Patent', 'A novel system for automated assessment of student learning outcomes using artificial intelligence algorithms.', 'patent_document.pdf'),
('Blockchain-based Academic Credential Verification', 'IN2024005678A', '2024', 'Granted', 'Innovation', 'Innovative approach to secure and verifiable academic credential management using blockchain technology.', 'innovation_proposal.pdf'),
('Smart Learning Analytics Platform', 'US2024009999A1', '2024', 'Under Review', 'Development', 'Comprehensive platform for analyzing student learning patterns and providing personalized recommendations.', 'development_proposal.pdf')
ON CONFLICT DO NOTHING;
