-- Create fellowship_scholarship table
CREATE TABLE IF NOT EXISTS fellowship_scholarship (
    id SERIAL PRIMARY KEY,
    fellowship_for VARCHAR(255) NOT NULL,
    awarded_by VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    type VARCHAR(50) NOT NULL CHECK (type IN ('Fellowship', 'Scholarship', 'Grant', 'Award')),
    abstract TEXT NOT NULL,
    upload_file VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fellowship_scholarship_type ON fellowship_scholarship(type);
CREATE INDEX IF NOT EXISTS idx_fellowship_scholarship_awarded_by ON fellowship_scholarship(awarded_by);
CREATE INDEX IF NOT EXISTS idx_fellowship_scholarship_dates ON fellowship_scholarship(start_date, end_date);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_fellowship_scholarship_updated_at
    BEFORE UPDATE ON fellowship_scholarship
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
