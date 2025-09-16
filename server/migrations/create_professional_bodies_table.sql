-- Create professional_bodies table
CREATE TABLE IF NOT EXISTS professional_bodies (
  id SERIAL PRIMARY KEY,
  organization_name VARCHAR(255) NOT NULL,
  membership_type VARCHAR(100) NOT NULL,
  membership_no VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  upload_file VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_professional_bodies_organization_name ON professional_bodies(organization_name);
CREATE INDEX IF NOT EXISTS idx_professional_bodies_membership_type ON professional_bodies(membership_type);
CREATE INDEX IF NOT EXISTS idx_professional_bodies_membership_no ON professional_bodies(membership_no);
CREATE INDEX IF NOT EXISTS idx_professional_bodies_date ON professional_bodies(date);
CREATE INDEX IF NOT EXISTS idx_professional_bodies_created_at ON professional_bodies(created_at);

-- Insert sample data
INSERT INTO professional_bodies (organization_name, membership_type, membership_no, date, description, upload_file) VALUES
('IEEE Computer Society', 'Life Time', 'IEEE123456', '2023-01-15', 'Professional membership in IEEE Computer Society for advancing computing technology.', 'ieee_membership.pdf'),
('Association for Computing Machinery', 'Annual', 'ACM789012', '2023-06-01', 'ACM membership for computer science professionals and researchers.', 'acm_certificate.pdf'),
('Project Management Institute', 'Professional', 'PMI345678', '2023-03-20', 'PMI membership for project management professionals and certification holders.', 'pmi_certificate.pdf'),
('International Association of Software Architects', 'Associate', 'IASA901234', '2023-09-10', 'IASA membership for software architecture professionals and practitioners.', 'iasa_membership.pdf'),
('Society of Software Engineers', 'Student', 'SSE567890', '2023-08-05', 'Student membership in Society of Software Engineers for academic and professional development.', 'sse_student_cert.pdf')
ON CONFLICT DO NOTHING;
