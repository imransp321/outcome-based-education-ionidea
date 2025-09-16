-- Create academic_bodies table
CREATE TABLE IF NOT EXISTS academic_bodies (
  id SERIAL PRIMARY KEY,
  member_of VARCHAR(255) NOT NULL,
  institution VARCHAR(255) NOT NULL,
  description TEXT,
  upload_file VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_academic_bodies_member_of ON academic_bodies(member_of);
CREATE INDEX IF NOT EXISTS idx_academic_bodies_institution ON academic_bodies(institution);
CREATE INDEX IF NOT EXISTS idx_academic_bodies_created_at ON academic_bodies(created_at);

-- Insert sample data
INSERT INTO academic_bodies (member_of, institution, description, upload_file) VALUES
('Board of Studies - Computer Science', 'University of Technology', 'Member of Board of Studies for Computer Science curriculum development', 'board_membership_certificate.pdf'),
('Academic Council', 'State University', 'Active member of Academic Council for policy decisions', 'academic_council_certificate.pdf'),
('Research Committee', 'National Institute of Technology', 'Committee member for research evaluation and funding decisions', 'research_committee_certificate.pdf')
ON CONFLICT DO NOTHING;
