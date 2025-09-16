-- Users Table Creation Script
-- Created for OBE System User Management

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    faculty_type_id INTEGER NOT NULL,
    department_id INTEGER NOT NULL,
    aadhar_number VARCHAR(12),
    title VARCHAR(10),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contact_number VARCHAR(10),
    department_designation VARCHAR(100),
    user_group VARCHAR(50),
    highest_qualification VARCHAR(100),
    experience_years INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_users_faculty_type 
        FOREIGN KEY (faculty_type_id) REFERENCES faculty_types(id) ON DELETE RESTRICT,
    CONSTRAINT fk_users_department 
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_faculty_type ON users(faculty_type_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Add unique constraint for aadhar_number if provided
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_aadhar_unique ON users(aadhar_number) WHERE aadhar_number IS NOT NULL;

-- Add check constraints
ALTER TABLE users ADD CONSTRAINT chk_users_experience_years CHECK (experience_years >= 0);
ALTER TABLE users ADD CONSTRAINT chk_users_contact_number CHECK (contact_number IS NULL OR LENGTH(contact_number) = 10);
ALTER TABLE users ADD CONSTRAINT chk_users_aadhar_number CHECK (aadhar_number IS NULL OR LENGTH(aadhar_number) = 12);
