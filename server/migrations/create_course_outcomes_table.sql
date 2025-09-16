-- Create course_outcomes table
CREATE TABLE IF NOT EXISTS course_outcomes (
    id SERIAL PRIMARY KEY,
    co_code VARCHAR(10) NOT NULL,
    course_outcome TEXT NOT NULL,
    curriculum_id INTEGER NOT NULL REFERENCES curriculum_regulations(id) ON DELETE CASCADE,
    term_id INTEGER NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    faculty_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(co_code, curriculum_id, term_id, course_id)
);

-- Create course_outcome_blooms_mapping table for many-to-many relationship
CREATE TABLE IF NOT EXISTS course_outcome_blooms_mapping (
    id SERIAL PRIMARY KEY,
    course_outcome_id INTEGER NOT NULL REFERENCES course_outcomes(id) ON DELETE CASCADE,
    blooms_level_id INTEGER NOT NULL REFERENCES blooms_levels(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_outcome_id, blooms_level_id)
);

-- Create course_outcome_delivery_methods_mapping table for many-to-many relationship
CREATE TABLE IF NOT EXISTS course_outcome_delivery_methods_mapping (
    id SERIAL PRIMARY KEY,
    course_outcome_id INTEGER NOT NULL REFERENCES course_outcomes(id) ON DELETE CASCADE,
    delivery_method_id INTEGER NOT NULL REFERENCES delivery_methods(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_outcome_id, delivery_method_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_outcomes_curriculum ON course_outcomes(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_course_outcomes_term ON course_outcomes(term_id);
CREATE INDEX IF NOT EXISTS idx_course_outcomes_course ON course_outcomes(course_id);
CREATE INDEX IF NOT EXISTS idx_course_outcomes_faculty ON course_outcomes(faculty_id);
CREATE INDEX IF NOT EXISTS idx_course_outcome_blooms_mapping_co ON course_outcome_blooms_mapping(course_outcome_id);
CREATE INDEX IF NOT EXISTS idx_course_outcome_delivery_mapping_co ON course_outcome_delivery_methods_mapping(course_outcome_id);

-- Add sample data
INSERT INTO course_outcomes (co_code, course_outcome, curriculum_id, term_id, course_id, faculty_id) VALUES
('CO1', 'Identify the major elements of data communication and computer network', 1, 1, 1, 1),
('CO2', 'Distinguish between the different data transmission techniques like line coding and block coding', 1, 1, 1, 1),
('CO3', 'Choose optimized solution for managing varying data traffic using tdm, fdm and wdm', 1, 1, 1, 1),
('CO4', 'Discuss different link control protocols and devices used at data link layer', 1, 1, 1, 1),
('CO5', 'Analyze the components, processes involved in addressing and routing the data', 1, 1, 1, 1);

-- Add sample Bloom's level mappings
INSERT INTO course_outcome_blooms_mapping (course_outcome_id, blooms_level_id) VALUES
(1, 1), -- CO1 -> L1-Remembering
(2, 1), -- CO2 -> L1-Remembering
(2, 2), -- CO2 -> L2-Understanding
(3, 2), -- CO3 -> L2-Understanding
(3, 3), -- CO3 -> L3-Applying
(4, 1), -- CO4 -> L1-Remembering
(4, 2), -- CO4 -> L2-Understanding
(5, 4); -- CO5 -> L4-Analyzing

-- Add sample delivery method mappings
INSERT INTO course_outcome_delivery_methods_mapping (course_outcome_id, delivery_method_id) VALUES
(1, 1), -- CO1 -> Brain Storming
(2, 2), -- CO2 -> Case Study
(2, 3), -- CO2 -> Class Room Delivery
(3, 1), -- CO3 -> Brain Storming
(3, 2), -- CO3 -> Case Study
(3, 3), -- CO3 -> Class Room Delivery
(3, 4), -- CO3 -> Demonstration
(4, 2), -- CO4 -> Case Study
(4, 4), -- CO4 -> Demonstration
(5, 2), -- CO5 -> Case Study
(5, 4); -- CO5 -> Demonstration
