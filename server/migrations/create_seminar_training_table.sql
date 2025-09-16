-- Create seminar_training table
CREATE TABLE IF NOT EXISTS seminar_training (
    id SERIAL PRIMARY KEY,
    program_title VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL,
    event_organizer VARCHAR(200) NOT NULL,
    venue VARCHAR(300) NOT NULL,
    level VARCHAR(50) NOT NULL,
    role VARCHAR(100) NOT NULL,
    invited_deputed VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    highlights TEXT,
    upload_file VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO seminar_training (
    program_title, type, event_organizer, venue, level, role, invited_deputed,
    start_date, end_date, highlights, upload_file
) VALUES 
(
    'Advanced Machine Learning Workshop',
    'Workshop',
    'IEEE Computer Society',
    'IIT Delhi, New Delhi',
    'National',
    'Participant',
    'Invited',
    '2024-01-15',
    '2024-01-17',
    'Comprehensive workshop covering deep learning algorithms, neural networks, and practical applications in industry.',
    'workshop_certificate.pdf'
),
(
    'Faculty Development Program on Outcome-Based Education',
    'Training',
    'AICTE',
    'NIT Trichy, Tamil Nadu',
    'National',
    'Participant',
    'Deputed',
    '2024-02-20',
    '2024-02-22',
    'Intensive training program on OBE implementation, assessment methods, and curriculum design.',
    'fdp_certificate.pdf'
),
(
    'International Conference on Educational Technology',
    'Conference',
    'IEEE Education Society',
    'Singapore',
    'International',
    'Speaker',
    'Invited',
    '2024-03-10',
    '2024-03-12',
    'Presented research paper on AI in education and attended keynote sessions by leading experts.',
    'conference_certificate.pdf'
),
(
    'Blockchain Technology Workshop',
    'Workshop',
    'IBM India',
    'Bangalore, Karnataka',
    'National',
    'Participant',
    'Deputed',
    '2024-04-05',
    '2024-04-07',
    'Hands-on workshop on blockchain development, smart contracts, and decentralized applications.',
    'blockchain_workshop.pdf'
),
(
    'Research Methodology Training',
    'Training',
    'UGC',
    'Delhi University, New Delhi',
    'National',
    'Participant',
    'Invited',
    '2024-05-15',
    '2024-05-17',
    'Comprehensive training on research design, data analysis, and academic writing.',
    'research_methodology.pdf'
);
