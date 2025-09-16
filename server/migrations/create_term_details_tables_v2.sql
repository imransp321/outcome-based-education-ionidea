-- Drop existing tables if they exist
DROP TABLE IF EXISTS term_details_approval CASCADE;
DROP TABLE IF EXISTS curriculum_term_details CASCADE;

-- Create curriculum_term_details table with the correct structure
CREATE TABLE curriculum_term_details (
    id SERIAL PRIMARY KEY,
    curriculum_regulation_id INT NOT NULL REFERENCES curriculum_regulations(id) ON DELETE CASCADE,
    si_no INT NOT NULL,
    term_name VARCHAR(255) NOT NULL,
    duration_weeks INT NOT NULL,
    credits INT DEFAULT 0,
    total_theory_courses INT DEFAULT 0,
    total_practical_others INT DEFAULT 0,
    academic_start_year INT NOT NULL,
    academic_end_year INT NOT NULL,
    academic_year VARCHAR(50) NOT NULL,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE (curriculum_regulation_id, si_no)
);

-- Create term_details_approval table
CREATE TABLE term_details_approval (
    id SERIAL PRIMARY KEY,
    curriculum_regulation_id INT NOT NULL REFERENCES curriculum_regulations(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected
    submitted_by INT REFERENCES users(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_by INT REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_curriculum_term_details_updated_at
BEFORE UPDATE ON curriculum_term_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add sample data for testing
INSERT INTO curriculum_term_details (
    curriculum_regulation_id, si_no, term_name, duration_weeks, credits, 
    total_theory_courses, total_practical_others, academic_start_year, 
    academic_end_year, academic_year, created_by
) VALUES
(1, 1, '1 - Semester', 15, 20, 8, 4, 2023, 2024, '2023-2024', 1),
(1, 2, '2 - Semester', 15, 20, 8, 4, 2024, 2025, '2024-2025', 1),
(2, 1, '1 - Semester', 15, 20, 8, 4, 2023, 2024, '2023-2024', 1),
(2, 2, '2 - Semester', 15, 20, 8, 4, 2024, 2025, '2024-2025', 1);

INSERT INTO term_details_approval (curriculum_regulation_id, status, submitted_by, comments) VALUES
(1, 'Pending', 1, 'Initial submission for Term Details'),
(2, 'Approved', 1, 'Approved term details');
