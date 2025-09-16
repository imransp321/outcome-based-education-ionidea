-- Create Topics table
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    curriculum_id INTEGER NOT NULL REFERENCES curriculum_regulations(id) ON DELETE CASCADE,
    term_id INTEGER NOT NULL,
    unit_id INTEGER,
    topic_title VARCHAR(255) NOT NULL,
    topic_content TEXT,
    topic_hours INTEGER NOT NULL DEFAULT 0,
    delivery_methods TEXT,
    textbooks TEXT,
    assessment_questions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create TLOs (Topic Learning Outcomes) table
CREATE TABLE IF NOT EXISTS topic_learning_outcomes (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    tlo_code VARCHAR(50) NOT NULL,
    tlo_description TEXT NOT NULL,
    assessment_criteria TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create TLO to CO Mapping table
CREATE TABLE IF NOT EXISTS tlo_co_mapping (
    id SERIAL PRIMARY KEY,
    tlo_id INTEGER NOT NULL REFERENCES topic_learning_outcomes(id) ON DELETE CASCADE,
    co_id INTEGER NOT NULL REFERENCES course_outcomes(id) ON DELETE CASCADE,
    mapping_strength INTEGER NOT NULL CHECK (mapping_strength >= 1 AND mapping_strength <= 3),
    justification TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tlo_id, co_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_topics_course_id ON topics(course_id);
CREATE INDEX IF NOT EXISTS idx_topics_curriculum_id ON topics(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_tlos_topic_id ON topic_learning_outcomes(topic_id);
CREATE INDEX IF NOT EXISTS idx_tlo_co_mapping_tlo_id ON tlo_co_mapping(tlo_id);
CREATE INDEX IF NOT EXISTS idx_tlo_co_mapping_co_id ON tlo_co_mapping(co_id);

-- Add sample data for topics
INSERT INTO topics (course_id, curriculum_id, term_id, unit_id, topic_title, topic_content, topic_hours, delivery_methods, textbooks, assessment_questions) VALUES
(1, 1, 5, 1, 'Introduction', '1. Introduction to Data communication 2. Introduction to Data communication (Contd...) 3. Topology, 4. Network models, 5. OSI and TCP/IP Layers. 6. Addressing, Data and Signal Fundamentals, 7. Analog and Digital Signals, 8. Digital Encoding Techniques', 8, 'Case Study, Class Room Delivery', 'Data Communications and Networking by Behrouz A. Forouzan', '1. Explain the OSI model layers and their functions. 2. Compare analog and digital signals. 3. Describe different network topologies.'),
(1, 1, 5, 1, 'Data Transmission & Multiplexing', '9. PCM, 10. DM, 11. Multiplexing 12. FDM, 13. Time Division Multiplexing 14. Time Division Multiplexing(cont.)', 6, 'Case Study, Class Room Delivery', 'Data Communications and Networking by Behrouz A. Forouzan', '1. Explain PCM and DM techniques. 2. Compare FDM and TDM. 3. Solve problems on multiplexing.'),
(1, 1, 5, 2, 'Error Detection and Correction', '15. Introduction 16 Block Coding (Contd.) 17. Linear Block Codes. 18 Cyclic codes (Contd...) 19 Cyclic codes (Contd.) 20 Checksum', 6, 'Case Study, Class Room Delivery', 'Data Communications and Networking by Behrouz A. Forouzan', '1. Explain error detection methods. 2. Implement checksum algorithm. 3. Analyze block coding techniques.'),
(1, 1, 5, 2, 'Data Link Layer control', '21. Framing, Flow and error control, 22. Protocols, 23 Noiseless Channels, 24. Noisy Channels, 25. CSMA, 26. CSMA/CD', 8, 'Case Study, Class Room Delivery', 'Data Communications and Networking by Behrouz A. Forouzan', '1. Explain framing techniques. 2. Compare different protocols. 3. Analyze CSMA/CD mechanism.'),
(1, 1, 5, 3, 'Network Layer', '27. Network Layer Design Issues, 28. Routing Algorithms, 29. Congestion Control, 30. Internetworking', 10, 'Case Study, Class Room Delivery, Laboratory', 'Computer Networks by Andrew S. Tanenbaum', '1. Explain routing algorithms. 2. Analyze congestion control methods. 3. Design network layer protocols.'),
(1, 1, 5, 3, 'Transport Layer', '31. Transport Service, 32. Elements of Transport Protocols, 33. TCP, 34. UDP', 8, 'Case Study, Class Room Delivery, Laboratory', 'Computer Networks by Andrew S. Tanenbaum', '1. Compare TCP and UDP. 2. Explain transport layer services. 3. Analyze protocol elements.');

-- Add sample TLOs for the first topic
INSERT INTO topic_learning_outcomes (topic_id, tlo_code, tlo_description, assessment_criteria) VALUES
(1, 'TLO1.1', 'Understand the fundamentals of data communication and networking concepts', 'Students should be able to explain basic networking concepts and identify different types of networks'),
(1, 'TLO1.2', 'Analyze the OSI and TCP/IP reference models and their layers', 'Students should be able to compare OSI and TCP/IP models and explain the function of each layer'),
(1, 'TLO1.3', 'Evaluate different network topologies and their characteristics', 'Students should be able to design network topologies for given scenarios and analyze their pros and cons'),
(2, 'TLO2.1', 'Apply PCM and DM techniques for digital signal processing', 'Students should be able to implement PCM and DM algorithms and solve related problems'),
(2, 'TLO2.2', 'Compare and contrast FDM and TDM multiplexing techniques', 'Students should be able to choose appropriate multiplexing technique for given scenarios'),
(3, 'TLO3.1', 'Implement error detection and correction mechanisms', 'Students should be able to implement checksum, parity, and Hamming code algorithms'),
(3, 'TLO3.2', 'Analyze block coding and cyclic coding techniques', 'Students should be able to design error correction codes for specific applications'),
(4, 'TLO4.1', 'Design and implement data link layer protocols', 'Students should be able to implement framing, flow control, and error control mechanisms'),
(4, 'TLO4.2', 'Evaluate different medium access control protocols', 'Students should be able to compare CSMA, CSMA/CD, and other MAC protocols'),
(5, 'TLO5.1', 'Design routing algorithms for network layer', 'Students should be able to implement and analyze different routing algorithms'),
(5, 'TLO5.2', 'Implement congestion control mechanisms', 'Students should be able to design and implement congestion control algorithms'),
(6, 'TLO6.1', 'Compare and contrast TCP and UDP protocols', 'Students should be able to choose appropriate transport protocol for given applications'),
(6, 'TLO6.2', 'Design transport layer services and protocols', 'Students should be able to implement transport layer functionality');
