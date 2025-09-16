-- Create curriculum_term_details table
CREATE TABLE IF NOT EXISTS curriculum_term_details (
    id SERIAL PRIMARY KEY,
    curriculum_regulation_id INT NOT NULL REFERENCES curriculum_regulations(id) ON DELETE CASCADE,
    term_number INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_weeks INT NOT NULL,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE (curriculum_regulation_id, term_number)
);

-- Create term_details_approval table
CREATE TABLE IF NOT EXISTS term_details_approval (
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

DROP TRIGGER IF EXISTS update_curriculum_term_details_updated_at ON curriculum_term_details;
CREATE TRIGGER update_curriculum_term_details_updated_at
BEFORE UPDATE ON curriculum_term_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add sample data for testing
INSERT INTO curriculum_term_details (curriculum_regulation_id, term_number, start_date, end_date, duration_weeks, created_by) VALUES
(1, 1, '2023-09-01', '2023-12-15', 15, 1),
(1, 2, '2024-01-08', '2024-04-20', 15, 1),
(2, 1, '2023-09-01', '2023-12-15', 15, 1),
(2, 2, '2024-01-08', '2024-04-20', 15, 1);

INSERT INTO term_details_approval (curriculum_regulation_id, status, submitted_by, comments) VALUES
(1, 'Pending', 1, 'Initial submission for Term Details'),
(2, 'Approved', 1, 'Approved term details');
