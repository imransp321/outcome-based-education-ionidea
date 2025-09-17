-- Create faculty_profiles table for personal details
CREATE TABLE IF NOT EXISTS faculty_profiles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(10),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  contact_number VARCHAR(20),
  aadhaar_number VARCHAR(20),
  present_address TEXT,
  permanent_address TEXT,
  website VARCHAR(255),
  date_of_birth DATE,
  blood_group VARCHAR(10),
  profile_photo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create faculty_professional_details table
CREATE TABLE IF NOT EXISTS faculty_professional_details (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER REFERENCES faculty_profiles(id) ON DELETE CASCADE,
  employee_no VARCHAR(50),
  date_of_joining DATE,
  teaching_experience_years DECIMAL(4,2) DEFAULT 0,
  faculty_serving VARCHAR(50),
  faculty_type VARCHAR(50),
  relieving_date DATE,
  industrial_experience_years DECIMAL(4,2) DEFAULT 0,
  last_promotion_year INTEGER,
  remarks TEXT,
  current_designation VARCHAR(100),
  retirement_date DATE,
  responsibilities TEXT,
  total_experience DECIMAL(5,2) DEFAULT 0,
  salary_pay DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create faculty_qualification_details table
CREATE TABLE IF NOT EXISTS faculty_qualification_details (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER REFERENCES faculty_profiles(id) ON DELETE CASCADE,
  highest_qualification VARCHAR(100),
  specialization TEXT,
  research_interest TEXT,
  skills TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create faculty_phd_details table
CREATE TABLE IF NOT EXISTS faculty_phd_details (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER REFERENCES faculty_profiles(id) ON DELETE CASCADE,
  university_name VARCHAR(255),
  year_of_registration INTEGER,
  supervisor VARCHAR(255),
  topic VARCHAR(500),
  url VARCHAR(500),
  phd_during_assessment_year INTEGER,
  phd_status VARCHAR(50),
  candidates_within_organization INTEGER DEFAULT 0,
  candidates_outside_organization INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faculty_profiles_email ON faculty_profiles(email);
CREATE INDEX IF NOT EXISTS idx_faculty_profiles_first_name ON faculty_profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_faculty_profiles_last_name ON faculty_profiles(last_name);
CREATE INDEX IF NOT EXISTS idx_faculty_professional_details_faculty_id ON faculty_professional_details(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_professional_details_employee_no ON faculty_professional_details(employee_no);
CREATE INDEX IF NOT EXISTS idx_faculty_qualification_details_faculty_id ON faculty_qualification_details(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_phd_details_faculty_id ON faculty_phd_details(faculty_id);

-- Insert sample data
INSERT INTO faculty_profiles (title, first_name, last_name, email, contact_number, aadhaar_number, present_address, permanent_address, website, date_of_birth, blood_group, profile_photo) VALUES
('Mr.', 'John', 'Doe', 'john.doe@university.edu', '+91-9876543210', '123456789012', '123 University Street, City, State', '456 Home Street, Village, State', 'https://johndoe.academia.edu', '1985-05-15', 'O+', 'profile_photo_1.jpg'),
('Dr.', 'Jane', 'Smith', 'jane.smith@university.edu', '+91-9876543211', '123456789013', '789 Faculty Quarters, University Campus', '789 Faculty Quarters, University Campus', 'https://janesmith.researchgate.net', '1980-03-22', 'A+', 'profile_photo_2.jpg')
ON CONFLICT (email) DO NOTHING;

-- Get the faculty IDs for foreign key references
DO $$
DECLARE
    john_id INTEGER;
    jane_id INTEGER;
BEGIN
    SELECT id INTO john_id FROM faculty_profiles WHERE email = 'john.doe@university.edu';
    SELECT id INTO jane_id FROM faculty_profiles WHERE email = 'jane.smith@university.edu';
    
    -- Insert professional details
    INSERT INTO faculty_professional_details (faculty_id, employee_no, date_of_joining, teaching_experience_years, faculty_serving, faculty_type, relieving_date, industrial_experience_years, last_promotion_year, remarks, current_designation, retirement_date, responsibilities, total_experience, salary_pay) VALUES
    (john_id, 'EMP001', '2020-01-15', 5.5, 'Permanent', 'Teaching', NULL, 2.0, 2023, 'Excellent performance in teaching and research', 'Assistant Professor', '2045-01-15', 'Course coordination, research supervision, department administration', 7.5, 75000.00),
    (jane_id, 'EMP002', '2018-06-01', 8.0, 'Permanent', 'Teaching', NULL, 0.0, 2022, 'Outstanding research contributions', 'Professor', '2043-06-01', 'Department head, research guidance, academic planning', 8.0, 120000.00)
    ON CONFLICT DO NOTHING;
    
    -- Insert qualification details
    INSERT INTO faculty_qualification_details (faculty_id, highest_qualification, specialization, research_interest, skills) VALUES
    (john_id, 'Ph.D.', 'Computer Science - Machine Learning', 'Deep Learning, Natural Language Processing, Computer Vision', 'Python, TensorFlow, PyTorch, SQL, Data Analysis'),
    (jane_id, 'Ph.D.', 'Electrical Engineering - Power Systems', 'Renewable Energy, Smart Grids, Power Electronics', 'MATLAB, Simulink, Power System Analysis, Control Systems')
    ON CONFLICT DO NOTHING;
    
    -- Insert PhD details
    INSERT INTO faculty_phd_details (faculty_id, university_name, year_of_registration, supervisor, topic, url, phd_during_assessment_year, phd_status, candidates_within_organization, candidates_outside_organization) VALUES
    (john_id, 'IIT Delhi', 2015, 'Dr. Rajesh Kumar', 'Deep Learning Approaches for Natural Language Understanding', 'https://thesis.johndoe.com', 2019, 'Completed', 3, 1),
    (jane_id, 'IISc Bangalore', 2012, 'Prof. Suresh Patel', 'Smart Grid Technologies for Renewable Energy Integration', 'https://thesis.janesmith.com', 2016, 'Completed', 5, 2)
    ON CONFLICT DO NOTHING;
END $$;
