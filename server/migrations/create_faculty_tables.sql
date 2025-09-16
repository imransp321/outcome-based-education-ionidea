-- Faculty Profile Database Tables
-- Created for OBE System Faculty Management

-- Faculty Personal Details Table
CREATE TABLE IF NOT EXISTS faculty_personal_details (
    id SERIAL PRIMARY KEY,
    faculty_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(10) NOT NULL DEFAULT 'Mr.',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email_id VARCHAR(255) UNIQUE NOT NULL,
    contact_number VARCHAR(15),
    aadhaar_number VARCHAR(12),
    present_address TEXT,
    permanent_address TEXT,
    website VARCHAR(255),
    date_of_birth DATE NOT NULL,
    blood_group VARCHAR(5),
    profile_photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty Professional Details Table
CREATE TABLE IF NOT EXISTS faculty_professional_details (
    id SERIAL PRIMARY KEY,
    faculty_id VARCHAR(50) UNIQUE NOT NULL,
    employee_no VARCHAR(50) UNIQUE,
    faculty_type VARCHAR(50) NOT NULL DEFAULT 'Teaching',
    date_of_joining DATE NOT NULL,
    relieving_date DATE,
    teaching_experience_years DECIMAL(4,2) DEFAULT 0,
    industrial_experience_years DECIMAL(4,2) DEFAULT 0,
    faculty_serving VARCHAR(50) NOT NULL DEFAULT 'Permanent',
    last_promotion DATE,
    current_designation VARCHAR(100) NOT NULL,
    total_experience DECIMAL(4,2) NOT NULL DEFAULT 0,
    salary_pay DECIMAL(10,2) DEFAULT 0,
    responsibilities TEXT,
    remarks TEXT,
    retirement_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty Qualification Details Table
CREATE TABLE IF NOT EXISTS faculty_qualification_details (
    id SERIAL PRIMARY KEY,
    faculty_id VARCHAR(50) NOT NULL,
    highest_qualification VARCHAR(100) NOT NULL,
    specialization TEXT,
    research_interest TEXT,
    skills TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty PhD Details Table
CREATE TABLE IF NOT EXISTS faculty_phd_details (
    id SERIAL PRIMARY KEY,
    faculty_id VARCHAR(50) NOT NULL,
    university_name VARCHAR(255),
    supervisor VARCHAR(255),
    phd_url VARCHAR(500),
    phd_status VARCHAR(50),
    year_of_registration INTEGER,
    phd_topic TEXT,
    phd_during_assessment_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty PhD Guidance Details Table
CREATE TABLE IF NOT EXISTS faculty_phd_guidance (
    id SERIAL PRIMARY KEY,
    faculty_id VARCHAR(50) NOT NULL,
    candidates_within_organization INTEGER DEFAULT 0,
    candidates_outside_organization INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty Designations Lookup Table
CREATE TABLE IF NOT EXISTS faculty_designations (
    id SERIAL PRIMARY KEY,
    designation_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty Types Lookup Table
CREATE TABLE IF NOT EXISTS faculty_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blood Groups Lookup Table
CREATE TABLE IF NOT EXISTS blood_groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(5) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Qualifications Lookup Table
CREATE TABLE IF NOT EXISTS qualifications (
    id SERIAL PRIMARY KEY,
    qualification_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PhD Status Lookup Table
CREATE TABLE IF NOT EXISTS phd_status (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default data for lookup tables
INSERT INTO faculty_designations (designation_name, description) VALUES
('HoD', 'Head of Department'),
('Professor', 'Professor'),
('Associate Professor', 'Associate Professor'),
('Assistant Professor', 'Assistant Professor'),
('Lecturer', 'Lecturer'),
('Senior Lecturer', 'Senior Lecturer'),
('Principal', 'Principal'),
('Vice Principal', 'Vice Principal'),
('Dean', 'Dean'),
('Director', 'Director')
ON CONFLICT (designation_name) DO NOTHING;

INSERT INTO faculty_types (type_name, description) VALUES
('Teaching', 'Teaching Faculty'),
('Non-Teaching', 'Non-Teaching Staff'),
('Administrative', 'Administrative Staff'),
('Technical', 'Technical Staff'),
('Support', 'Support Staff')
ON CONFLICT (type_name) DO NOTHING;

INSERT INTO blood_groups (group_name) VALUES
('A+'), ('A-'), ('B+'), ('B-'), ('AB+'), ('AB-'), ('O+'), ('O-')
ON CONFLICT (group_name) DO NOTHING;

INSERT INTO qualifications (qualification_name, description) VALUES
('Ph.D.', 'Doctor of Philosophy'),
('M.E. / M.Tech.', 'Master of Engineering / Technology'),
('M.Sc.', 'Master of Science'),
('M.A.', 'Master of Arts'),
('M.Com.', 'Master of Commerce'),
('M.B.A.', 'Master of Business Administration'),
('B.E. / B.Tech.', 'Bachelor of Engineering / Technology'),
('B.Sc.', 'Bachelor of Science'),
('B.A.', 'Bachelor of Arts'),
('B.Com.', 'Bachelor of Commerce'),
('Diploma', 'Diploma'),
('Certificate', 'Certificate Course')
ON CONFLICT (qualification_name) DO NOTHING;

INSERT INTO phd_status (status_name, description) VALUES
('Completed', 'PhD Completed'),
('Pursuing', 'PhD Pursuing'),
('Registered', 'PhD Registered'),
('Not Applicable', 'Not Applicable'),
('Submitted', 'Thesis Submitted'),
('Under Review', 'Under Review')
ON CONFLICT (status_name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faculty_personal_faculty_id ON faculty_personal_details(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_professional_faculty_id ON faculty_professional_details(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_qualification_faculty_id ON faculty_qualification_details(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_phd_faculty_id ON faculty_phd_details(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_phd_guidance_faculty_id ON faculty_phd_guidance(faculty_id);

-- Add foreign key constraints
ALTER TABLE faculty_professional_details 
ADD CONSTRAINT fk_faculty_professional_faculty_id 
FOREIGN KEY (faculty_id) REFERENCES faculty_personal_details(faculty_id) ON DELETE CASCADE;

ALTER TABLE faculty_qualification_details 
ADD CONSTRAINT fk_faculty_qualification_faculty_id 
FOREIGN KEY (faculty_id) REFERENCES faculty_personal_details(faculty_id) ON DELETE CASCADE;

ALTER TABLE faculty_phd_details 
ADD CONSTRAINT fk_faculty_phd_faculty_id 
FOREIGN KEY (faculty_id) REFERENCES faculty_personal_details(faculty_id) ON DELETE CASCADE;

ALTER TABLE faculty_phd_guidance 
ADD CONSTRAINT fk_faculty_phd_guidance_faculty_id 
FOREIGN KEY (faculty_id) REFERENCES faculty_personal_details(faculty_id) ON DELETE CASCADE;
