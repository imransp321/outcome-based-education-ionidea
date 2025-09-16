-- Create technical_talks table
CREATE TABLE IF NOT EXISTS technical_talks (
    id SERIAL PRIMARY KEY,
    topic_of_lecture VARCHAR(500) NOT NULL,
    nationality VARCHAR(20) NOT NULL CHECK (nationality IN ('National', 'International')),
    date DATE NOT NULL,
    institution VARCHAR(300) NOT NULL,
    upload_file VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_technical_talks_topic ON technical_talks(topic_of_lecture);
CREATE INDEX IF NOT EXISTS idx_technical_talks_institution ON technical_talks(institution);
CREATE INDEX IF NOT EXISTS idx_technical_talks_date ON technical_talks(date);
CREATE INDEX IF NOT EXISTS idx_technical_talks_nationality ON technical_talks(nationality);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_technical_talks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_technical_talks_updated_at
    BEFORE UPDATE ON technical_talks
    FOR EACH ROW
    EXECUTE FUNCTION update_technical_talks_updated_at();

-- Insert sample data
INSERT INTO technical_talks (topic_of_lecture, nationality, date, institution) VALUES
('Fundamentals of Curriculum in Engineering Education', 'National', '2018-01-07', 'Ionidea Institute of Technology and Management'),
('Advanced Machine Learning Techniques', 'International', '2023-06-15', 'Stanford University'),
('Sustainable Engineering Practices', 'National', '2022-11-20', 'Indian Institute of Technology Delhi'),
('Blockchain Technology Applications', 'International', '2023-03-10', 'Massachusetts Institute of Technology'),
('Artificial Intelligence in Healthcare', 'National', '2023-09-05', 'All India Institute of Medical Sciences');
