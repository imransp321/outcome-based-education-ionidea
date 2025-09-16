-- Create faculty_awards_honors table
CREATE TABLE IF NOT EXISTS faculty_awards_honors (
    id SERIAL PRIMARY KEY,
    awarded_name VARCHAR(255) NOT NULL,
    awarded_for TEXT NOT NULL,
    awarded_organization TEXT,
    awarded_year VARCHAR(4) NOT NULL,
    venue TEXT,
    award_details TEXT,
    upload_file VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_faculty_awards_honors_year ON faculty_awards_honors(awarded_year);
CREATE INDEX IF NOT EXISTS idx_faculty_awards_honors_name ON faculty_awards_honors(awarded_name);

-- Add some sample data
INSERT INTO faculty_awards_honors (awarded_name, awarded_for, awarded_organization, awarded_year, venue, award_details) VALUES
('Dr. John Smith', 'Excellence in Teaching', 'University of Technology', '2023', 'New York Convention Center', 'Recognized for outstanding contribution to computer science education'),
('Dr. Jane Doe', 'Best Research Paper', 'International Conference on AI', '2022', 'San Francisco', 'Award for innovative research in machine learning algorithms'),
('Dr. Michael Johnson', 'Faculty of the Year', 'Department of Engineering', '2023', 'Campus Auditorium', 'Recognized for exceptional student mentorship and research guidance'),
('Dr. Sarah Wilson', 'Innovation Award', 'Tech Innovation Summit', '2022', 'Seattle', 'Award for developing breakthrough educational technology solutions'),
('Dr. Robert Brown', 'Lifetime Achievement', 'Educational Excellence Society', '2023', 'Washington DC', 'Honored for 25 years of dedicated service to higher education')
ON CONFLICT DO NOTHING;
