-- Create courses_completed table
CREATE TABLE IF NOT EXISTS courses_completed (
    id SERIAL PRIMARY KEY,
    course_title VARCHAR(500) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration VARCHAR(100) NOT NULL,
    platform VARCHAR(200) NOT NULL,
    upload_certificate VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO courses_completed (
    course_title, start_date, end_date, duration, platform, upload_certificate
) VALUES 
(
    'Introduction to Machine Learning',
    '2024-01-15',
    '2024-01-20',
    '5 days',
    'Coursera',
    'ml_course_certificate.pdf'
),
(
    'Data Structures and Algorithms',
    '2024-02-01',
    '2024-02-15',
    '2 weeks',
    'edX',
    'dsa_course_certificate.pdf'
),
(
    'Web Development Fundamentals',
    '2024-03-01',
    '2024-03-10',
    '10 days',
    'Udemy',
    'web_dev_certificate.pdf'
),
(
    'Database Management Systems',
    '2024-04-01',
    '2024-04-14',
    '2 weeks',
    'NPTEL',
    'dbms_course_certificate.pdf'
),
(
    'Artificial Intelligence and Machine Learning',
    '2024-05-01',
    '2024-05-15',
    '2 weeks',
    'SWAYAM MOOCs',
    'ai_ml_course_certificate.pdf'
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_completed_platform ON courses_completed(platform);
CREATE INDEX IF NOT EXISTS idx_courses_completed_start_date ON courses_completed(start_date);
