-- Add TLOs for all topics
-- First, get the topic IDs that were just created
INSERT INTO topic_learning_outcomes (topic_id, tlo_code, tlo_description, assessment_criteria) VALUES
-- TLOs for Topic 1 (Introduction to Data Communication)
((SELECT id FROM topics WHERE topic_title = 'Introduction to Data Communication' AND course_id = 1), 'TLO1.1', 'Understand the fundamentals of data communication and networking concepts', 'Students should be able to explain basic networking concepts and identify different types of networks'),
((SELECT id FROM topics WHERE topic_title = 'Introduction to Data Communication' AND course_id = 1), 'TLO1.2', 'Analyze the OSI and TCP/IP reference models and their layers', 'Students should be able to compare OSI and TCP/IP models and explain the function of each layer'),
((SELECT id FROM topics WHERE topic_title = 'Introduction to Data Communication' AND course_id = 1), 'TLO1.3', 'Evaluate different network topologies and their characteristics', 'Students should be able to design network topologies for given scenarios and analyze their pros and cons'),
((SELECT id FROM topics WHERE topic_title = 'Introduction to Data Communication' AND course_id = 1), 'TLO1.4', 'Apply signal processing concepts in digital communication', 'Students should be able to analyze analog and digital signals and implement encoding techniques'),

-- TLOs for Topic 2 (Data Transmission & Multiplexing)
((SELECT id FROM topics WHERE topic_title = 'Data Transmission & Multiplexing' AND course_id = 1), 'TLO2.1', 'Apply PCM and DM techniques for digital signal processing', 'Students should be able to implement PCM and DM algorithms and solve related problems'),
((SELECT id FROM topics WHERE topic_title = 'Data Transmission & Multiplexing' AND course_id = 1), 'TLO2.2', 'Compare and contrast FDM and TDM multiplexing techniques', 'Students should be able to choose appropriate multiplexing technique for given scenarios'),
((SELECT id FROM topics WHERE topic_title = 'Data Transmission & Multiplexing' AND course_id = 1), 'TLO2.3', 'Design multiplexing systems for efficient data transmission', 'Students should be able to design and implement multiplexing solutions for various applications'),

-- TLOs for Topic 3 (Network Topologies and Protocols)
((SELECT id FROM topics WHERE topic_title = 'Network Topologies and Protocols' AND course_id = 1), 'TLO3.1', 'Compare different network topologies and their applications', 'Students should be able to select appropriate topology for given network requirements'),
((SELECT id FROM topics WHERE topic_title = 'Network Topologies and Protocols' AND course_id = 1), 'TLO3.2', 'Analyze protocol stack concepts and implementation', 'Students should be able to explain protocol layers and their interactions'),
((SELECT id FROM topics WHERE topic_title = 'Network Topologies and Protocols' AND course_id = 1), 'TLO3.3', 'Implement Ethernet protocol and related technologies', 'Students should be able to configure and troubleshoot Ethernet networks'),

-- TLOs for Topic 4 (Error Detection and Correction)
((SELECT id FROM topics WHERE topic_title = 'Error Detection and Correction' AND course_id = 1), 'TLO4.1', 'Implement error detection and correction mechanisms', 'Students should be able to implement checksum, parity, and Hamming code algorithms'),
((SELECT id FROM topics WHERE topic_title = 'Error Detection and Correction' AND course_id = 1), 'TLO4.2', 'Analyze block coding and cyclic coding techniques', 'Students should be able to design error correction codes for specific applications'),
((SELECT id FROM topics WHERE topic_title = 'Error Detection and Correction' AND course_id = 1), 'TLO4.3', 'Design reliable data transmission systems', 'Students should be able to implement comprehensive error handling mechanisms'),

-- TLOs for Topic 5 (Data Link Layer Control)
((SELECT id FROM topics WHERE topic_title = 'Data Link Layer Control' AND course_id = 1), 'TLO5.1', 'Design and implement data link layer protocols', 'Students should be able to implement framing, flow control, and error control mechanisms'),
((SELECT id FROM topics WHERE topic_title = 'Data Link Layer Control' AND course_id = 1), 'TLO5.2', 'Evaluate different medium access control protocols', 'Students should be able to compare CSMA, CSMA/CD, and other MAC protocols'),
((SELECT id FROM topics WHERE topic_title = 'Data Link Layer Control' AND course_id = 1), 'TLO5.3', 'Implement channel access mechanisms', 'Students should be able to design and implement efficient channel access protocols'),

-- TLOs for Topic 6 (Flow Control and Error Recovery)
((SELECT id FROM topics WHERE topic_title = 'Flow Control and Error Recovery' AND course_id = 1), 'TLO6.1', 'Compare flow control protocols and their applications', 'Students should be able to select appropriate flow control mechanism for given scenarios'),
((SELECT id FROM topics WHERE topic_title = 'Flow Control and Error Recovery' AND course_id = 1), 'TLO6.2', 'Implement sliding window algorithms', 'Students should be able to implement and optimize sliding window protocols'),
((SELECT id FROM topics WHERE topic_title = 'Flow Control and Error Recovery' AND course_id = 1), 'TLO6.3', 'Design error recovery mechanisms', 'Students should be able to implement comprehensive error recovery strategies'),

-- TLOs for Topic 7 (Network Layer)
((SELECT id FROM topics WHERE topic_title = 'Network Layer' AND course_id = 1), 'TLO7.1', 'Design routing algorithms for network layer', 'Students should be able to implement and analyze different routing algorithms'),
((SELECT id FROM topics WHERE topic_title = 'Network Layer' AND course_id = 1), 'TLO7.2', 'Implement congestion control mechanisms', 'Students should be able to design and implement congestion control algorithms'),
((SELECT id FROM topics WHERE topic_title = 'Network Layer' AND course_id = 1), 'TLO7.3', 'Design IP addressing schemes and subnetting', 'Students should be able to design and implement IP addressing solutions'),
((SELECT id FROM topics WHERE topic_title = 'Network Layer' AND course_id = 1), 'TLO7.4', 'Implement internetworking solutions', 'Students should be able to design and implement inter-network connectivity'),

-- TLOs for Topic 8 (Transport Layer)
((SELECT id FROM topics WHERE topic_title = 'Transport Layer' AND course_id = 1), 'TLO8.1', 'Compare and contrast TCP and UDP protocols', 'Students should be able to choose appropriate transport protocol for given applications'),
((SELECT id FROM topics WHERE topic_title = 'Transport Layer' AND course_id = 1), 'TLO8.2', 'Design transport layer services and protocols', 'Students should be able to implement transport layer functionality'),
((SELECT id FROM topics WHERE topic_title = 'Transport Layer' AND course_id = 1), 'TLO8.3', 'Implement connection management mechanisms', 'Students should be able to design and implement connection establishment and termination'),
((SELECT id FROM topics WHERE topic_title = 'Transport Layer' AND course_id = 1), 'TLO8.4', 'Design flow control and congestion control', 'Students should be able to implement comprehensive transport layer control mechanisms'),

-- TLOs for Topic 9 (Application Layer Protocols)
((SELECT id FROM topics WHERE topic_title = 'Application Layer Protocols' AND course_id = 1), 'TLO9.1', 'Implement application layer protocols', 'Students should be able to implement HTTP, FTP, SMTP, and DNS protocols'),
((SELECT id FROM topics WHERE topic_title = 'Application Layer Protocols' AND course_id = 1), 'TLO9.2', 'Design web services and distributed applications', 'Students should be able to design and implement web-based applications'),
((SELECT id FROM topics WHERE topic_title = 'Application Layer Protocols' AND course_id = 1), 'TLO9.3', 'Analyze email systems and messaging protocols', 'Students should be able to implement and troubleshoot email systems'),

-- TLOs for Topic 10 (Network Security Fundamentals)
((SELECT id FROM topics WHERE topic_title = 'Network Security Fundamentals' AND course_id = 1), 'TLO10.1', 'Identify and analyze security threats', 'Students should be able to assess network security vulnerabilities and threats'),
((SELECT id FROM topics WHERE topic_title = 'Network Security Fundamentals' AND course_id = 1), 'TLO10.2', 'Implement encryption and decryption algorithms', 'Students should be able to implement symmetric and asymmetric encryption systems'),
((SELECT id FROM topics WHERE topic_title = 'Network Security Fundamentals' AND course_id = 1), 'TLO10.3', 'Design secure communication systems', 'Students should be able to implement comprehensive security solutions'),
((SELECT id FROM topics WHERE topic_title = 'Network Security Fundamentals' AND course_id = 1), 'TLO10.4', 'Implement digital signatures and PKI', 'Students should be able to design and implement public key infrastructure'),

-- TLOs for Topic 11 (Wireless Networks)
((SELECT id FROM topics WHERE topic_title = 'Wireless Networks' AND course_id = 1), 'TLO11.1', 'Explain wireless communication principles', 'Students should be able to analyze wireless signal propagation and characteristics'),
((SELECT id FROM topics WHERE topic_title = 'Wireless Networks' AND course_id = 1), 'TLO11.2', 'Compare wireless standards and technologies', 'Students should be able to select appropriate wireless technology for given applications'),
((SELECT id FROM topics WHERE topic_title = 'Wireless Networks' AND course_id = 1), 'TLO11.3', 'Implement wireless security measures', 'Students should be able to design and implement secure wireless networks'),
((SELECT id FROM topics WHERE topic_title = 'Wireless Networks' AND course_id = 1), 'TLO11.4', 'Design mobile communication systems', 'Students should be able to design and implement mobile network solutions'),

-- TLOs for Topic 12 (Network Management)
((SELECT id FROM topics WHERE topic_title = 'Network Management' AND course_id = 1), 'TLO12.1', 'Implement network management protocols', 'Students should be able to implement SNMP and other management protocols'),
((SELECT id FROM topics WHERE topic_title = 'Network Management' AND course_id = 1), 'TLO12.2', 'Design network monitoring systems', 'Students should be able to design and implement comprehensive monitoring solutions'),
((SELECT id FROM topics WHERE topic_title = 'Network Management' AND course_id = 1), 'TLO12.3', 'Analyze network performance and optimization', 'Students should be able to identify performance bottlenecks and implement optimization strategies'),

-- TLOs for Topic 13 (Advanced Networking Concepts)
((SELECT id FROM topics WHERE topic_title = 'Advanced Networking Concepts' AND course_id = 1), 'TLO13.1', 'Implement Software Defined Networking concepts', 'Students should be able to design and implement SDN solutions'),
((SELECT id FROM topics WHERE topic_title = 'Advanced Networking Concepts' AND course_id = 1), 'TLO13.2', 'Analyze Network Function Virtualization', 'Students should be able to implement NFV-based network services'),
((SELECT id FROM topics WHERE topic_title = 'Advanced Networking Concepts' AND course_id = 1), 'TLO13.3', 'Design cloud networking solutions', 'Students should be able to implement cloud-based network architectures'),
((SELECT id FROM topics WHERE topic_title = 'Advanced Networking Concepts' AND course_id = 1), 'TLO13.4', 'Implement IoT network protocols', 'Students should be able to design and implement IoT communication systems'),

-- TLOs for Topic 14 (Network Performance Optimization)
((SELECT id FROM topics WHERE topic_title = 'Network Performance Optimization' AND course_id = 1), 'TLO14.1', 'Implement Quality of Service mechanisms', 'Students should be able to design and implement QoS solutions'),
((SELECT id FROM topics WHERE topic_title = 'Network Performance Optimization' AND course_id = 1), 'TLO14.2', 'Design traffic engineering solutions', 'Students should be able to implement traffic optimization strategies'),
((SELECT id FROM topics WHERE topic_title = 'Network Performance Optimization' AND course_id = 1), 'TLO14.3', 'Optimize network performance', 'Students should be able to analyze and improve network efficiency'),

-- TLOs for Topic 15 (Emerging Technologies)
((SELECT id FROM topics WHERE topic_title = 'Emerging Technologies' AND course_id = 1), 'TLO15.1', 'Explore blockchain applications in networking', 'Students should be able to analyze blockchain-based network solutions'),
((SELECT id FROM topics WHERE topic_title = 'Emerging Technologies' AND course_id = 1), 'TLO15.2', 'Implement AI/ML in network management', 'Students should be able to design AI-powered network systems'),
((SELECT id FROM topics WHERE topic_title = 'Emerging Technologies' AND course_id = 1), 'TLO15.3', 'Design future network architectures', 'Students should be able to conceptualize next-generation network designs'),

-- TLOs for Topic 16 (Network Design and Implementation)
((SELECT id FROM topics WHERE topic_title = 'Network Design and Implementation' AND course_id = 1), 'TLO16.1', 'Design enterprise network architectures', 'Students should be able to design comprehensive enterprise network solutions'),
((SELECT id FROM topics WHERE topic_title = 'Network Design and Implementation' AND course_id = 1), 'TLO16.2', 'Plan network capacity and scalability', 'Students should be able to design scalable network architectures'),
((SELECT id FROM topics WHERE topic_title = 'Network Design and Implementation' AND course_id = 1), 'TLO16.3', 'Implement redundancy and fault tolerance', 'Students should be able to design highly available network systems'),

-- TLOs for Topic 17 (Network Testing and Troubleshooting)
((SELECT id FROM topics WHERE topic_title = 'Network Testing and Troubleshooting' AND course_id = 1), 'TLO17.1', 'Use network testing and diagnostic tools', 'Students should be able to effectively use network testing tools'),
((SELECT id FROM topics WHERE topic_title = 'Network Testing and Troubleshooting' AND course_id = 1), 'TLO17.2', 'Perform comprehensive network testing', 'Students should be able to conduct thorough network performance testing'),
((SELECT id FROM topics WHERE topic_title = 'Network Testing and Troubleshooting' AND course_id = 1), 'TLO17.3', 'Resolve complex network problems', 'Students should be able to troubleshoot and resolve network issues'),

-- TLOs for Topic 18 (Project Work and Case Studies)
((SELECT id FROM topics WHERE topic_title = 'Project Work and Case Studies' AND course_id = 1), 'TLO18.1', 'Complete real-world network projects', 'Students should be able to successfully complete industry-level network projects'),
((SELECT id FROM topics WHERE topic_title = 'Project Work and Case Studies' AND course_id = 1), 'TLO18.2', 'Analyze industry case studies', 'Students should be able to analyze and learn from real-world network implementations'),
((SELECT id FROM topics WHERE topic_title = 'Project Work and Case Studies' AND course_id = 1), 'TLO18.3', 'Apply professional best practices', 'Students should be able to apply industry best practices in network design and implementation');
