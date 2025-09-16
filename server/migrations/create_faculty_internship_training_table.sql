-- Create faculty_internship_training table
CREATE TABLE IF NOT EXISTS faculty_internship_training (
    id SERIAL PRIMARY KEY,
    name_of_internship VARCHAR(500) NOT NULL,
    company_and_place VARCHAR(300) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    year VARCHAR(10) NOT NULL,
    outcome TEXT,
    upload_file VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO faculty_internship_training (
    name_of_internship, company_and_place, duration, year, outcome, upload_file
) VALUES 
(
    'Machine Learning Internship',
    'Google India, Bangalore',
    '3 months',
    '2024',
    'Gained hands-on experience in developing ML models for recommendation systems. Worked on data preprocessing, model training, and deployment using TensorFlow and Python.',
    'google_internship_certificate.pdf'
),
(
    'Cloud Computing Training',
    'Microsoft Azure, Mumbai',
    '6 weeks',
    '2023',
    'Completed comprehensive training on Azure cloud services including virtual machines, storage, and networking. Obtained Azure Fundamentals certification.',
    'azure_training_certificate.pdf'
),
(
    'Industry Collaboration - IoT Research',
    'TCS Innovation Labs, Pune',
    '4 months',
    '2023',
    'Collaborated on IoT-based smart city solutions. Developed prototype for environmental monitoring system using sensors and cloud analytics.',
    'tcs_collaboration_report.pdf'
),
(
    'Data Science Workshop',
    'IBM India, Delhi',
    '2 weeks',
    '2024',
    'Intensive workshop on advanced data science techniques including big data analytics, machine learning algorithms, and data visualization tools.',
    'ibm_workshop_certificate.pdf'
),
(
    'Software Development Internship',
    'Infosys, Hyderabad',
    '2 months',
    '2023',
    'Worked on enterprise software development using Java and Spring framework. Contributed to development of customer relationship management system.',
    'infosys_internship_certificate.pdf'
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_faculty_internship_training_year ON faculty_internship_training(year);
CREATE INDEX IF NOT EXISTS idx_faculty_internship_training_company ON faculty_internship_training(company_and_place);
