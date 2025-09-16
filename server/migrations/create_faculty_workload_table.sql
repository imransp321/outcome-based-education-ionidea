-- Create faculty_workload table
CREATE TABLE IF NOT EXISTS faculty_workload (
    id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES departments(id),
    curriculum_regulation_id INTEGER NOT NULL REFERENCES curriculum_regulations(id),
    program_type_id INTEGER NOT NULL REFERENCES program_types(id),
    program_id INTEGER NOT NULL REFERENCES programs(id),
    program_category VARCHAR(100) NOT NULL,
    work_type VARCHAR(100) NOT NULL,
    workload_distribution VARCHAR(50) NOT NULL,
    workload_percentage DECIMAL(5,2) NOT NULL CHECK (workload_percentage >= 0 AND workload_percentage <= 100),
    workload_hours INTEGER DEFAULT 0 CHECK (workload_hours >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faculty_workload_department ON faculty_workload(department_id);
CREATE INDEX IF NOT EXISTS idx_faculty_workload_program ON faculty_workload(program_id);
CREATE INDEX IF NOT EXISTS idx_faculty_workload_curriculum ON faculty_workload(curriculum_regulation_id);

-- Add comments
COMMENT ON TABLE faculty_workload IS 'Stores faculty workload distribution across different programs and semesters';
COMMENT ON COLUMN faculty_workload.program_category IS 'Type of program: Core Program, Other Program, Research Program';
COMMENT ON COLUMN faculty_workload.work_type IS 'Type of work: Theory teaching, Practical teaching, Research, Administration';
COMMENT ON COLUMN faculty_workload.workload_distribution IS 'Semester distribution: 1 - Semester, 2 - Semester, etc.';
COMMENT ON COLUMN faculty_workload.workload_percentage IS 'Percentage of total workload (0-100)';
COMMENT ON COLUMN faculty_workload.workload_hours IS 'Total hours allocated for this workload';
