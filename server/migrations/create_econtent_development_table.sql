-- Create econtent_development table
CREATE TABLE IF NOT EXISTS econtent_development (
    id SERIAL PRIMARY KEY,
    e_content_types VARCHAR(200) NOT NULL,
    name_of_course VARCHAR(500) NOT NULL,
    year VARCHAR(10) NOT NULL,
    upload_file VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO econtent_development (
    e_content_types, name_of_course, year, upload_file
) VALUES 
(
    'SWAYAM MOOCs',
    'Introduction to Machine Learning',
    '2024',
    'ml_course_certificate.pdf'
),
(
    'NPTEL',
    'Data Structures and Algorithms',
    '2023',
    'dsa_nptel_certificate.pdf'
),
(
    'SWAYAM MOOCs',
    'Artificial Intelligence and Machine Learning',
    '2024',
    'ai_ml_course_certificate.pdf'
),
(
    'NPTEL',
    'Database Management Systems',
    '2023',
    'dbms_nptel_certificate.pdf'
),
(
    'SWAYAM MOOCs',
    'Web Development Fundamentals',
    '2024',
    'web_dev_certificate.pdf'
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_econtent_development_year ON econtent_development(year);
CREATE INDEX IF NOT EXISTS idx_econtent_development_types ON econtent_development(e_content_types);
