-- Alter Users Table to Add Missing Columns
-- This script adds the new columns required by the frontend

-- Add missing columns to users table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'aadhar_number') THEN
        ALTER TABLE users ADD COLUMN aadhar_number VARCHAR(12);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'title') THEN
        ALTER TABLE users ADD COLUMN title VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'contact_number') THEN
        ALTER TABLE users ADD COLUMN contact_number VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'department_designation') THEN
        ALTER TABLE users ADD COLUMN department_designation VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'user_group') THEN
        ALTER TABLE users ADD COLUMN user_group VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'highest_qualification') THEN
        ALTER TABLE users ADD COLUMN highest_qualification VARCHAR(100);
    END IF;
END $$;

-- Rename existing columns to match frontend expectations
-- Note: We'll keep both old and new columns for now to avoid breaking existing data
-- ALTER TABLE users RENAME COLUMN phone TO contact_number;
-- ALTER TABLE users RENAME COLUMN qualification TO highest_qualification;
-- ALTER TABLE users RENAME COLUMN designation TO department_designation;
-- ALTER TABLE users RENAME COLUMN user_groups TO user_group;

-- Add unique constraint for aadhar_number if provided
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_aadhar_unique') THEN
        CREATE UNIQUE INDEX idx_users_aadhar_unique ON users(aadhar_number) WHERE aadhar_number IS NOT NULL;
    END IF;
END $$;

-- Add check constraints
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_users_experience_years') THEN
        ALTER TABLE users ADD CONSTRAINT chk_users_experience_years CHECK (experience_years >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_users_contact_number') THEN
        ALTER TABLE users ADD CONSTRAINT chk_users_contact_number CHECK (contact_number IS NULL OR LENGTH(contact_number) = 10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_users_aadhar_number') THEN
        ALTER TABLE users ADD CONSTRAINT chk_users_aadhar_number CHECK (aadhar_number IS NULL OR LENGTH(aadhar_number) = 12);
    END IF;
END $$;
