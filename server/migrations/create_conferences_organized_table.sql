-- Create conferences_organized table
CREATE TABLE IF NOT EXISTS conferences_organized (
  id SERIAL PRIMARY KEY,
  program_title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  event_organizer VARCHAR(255) NOT NULL,
  collaboration TEXT,
  start_date DATE,
  end_date DATE,
  sponsored_by TEXT,
  role VARCHAR(255),
  level VARCHAR(50),
  no_of_participants VARCHAR(10),
  venue TEXT,
  duration_hours VARCHAR(10),
  duration_minutes VARCHAR(10),
  highlights TEXT,
  upload_file VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conferences_organized_program_title ON conferences_organized(program_title);
CREATE INDEX IF NOT EXISTS idx_conferences_organized_type ON conferences_organized(type);
CREATE INDEX IF NOT EXISTS idx_conferences_organized_event_organizer ON conferences_organized(event_organizer);
CREATE INDEX IF NOT EXISTS idx_conferences_organized_level ON conferences_organized(level);
CREATE INDEX IF NOT EXISTS idx_conferences_organized_start_date ON conferences_organized(start_date);
CREATE INDEX IF NOT EXISTS idx_conferences_organized_created_at ON conferences_organized(created_at);

-- Insert sample data
INSERT INTO conferences_organized (program_title, type, event_organizer, collaboration, start_date, end_date, sponsored_by, role, level, no_of_participants, venue, duration_hours, duration_minutes, highlights, upload_file) VALUES
('International Conference on AI and Machine Learning', 'Conference', 'Tech Institute', 'IEEE Computer Society', '2024-06-15', '2024-06-17', 'Ministry of Education, Government of India', 'Organizing Secretary', 'International', '250', 'Convention Center, New Delhi', '48', '0', 'Three-day international conference featuring keynote speakers from leading tech companies and academic institutions.', 'conference_report.pdf'),
('National Workshop on Data Science', 'Workshop', 'Data Science Academy', 'IIT Delhi', '2024-03-10', '2024-03-12', 'Department of Science and Technology', 'Workshop Coordinator', 'National', '150', 'IIT Delhi Campus', '24', '0', 'Hands-on workshop covering advanced data science techniques and machine learning applications.', 'workshop_report.pdf'),
('State Level Seminar on Digital Transformation', 'Seminar', 'State Technical University', 'Government of Maharashtra', '2024-08-20', '2024-08-20', 'Ministry of Electronics and IT', 'Event Director', 'State', '300', 'Mumbai Convention Center', '8', '0', 'One-day seminar focusing on digital transformation in government and private sectors.', 'seminar_report.pdf')
ON CONFLICT DO NOTHING;
