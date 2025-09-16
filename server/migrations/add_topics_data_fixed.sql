-- Add comprehensive sample data for topics to match the reference image
-- This includes more topics with detailed content, delivery methods, textbooks, and assessment questions

-- Clear existing sample data first
DELETE FROM topic_learning_outcomes WHERE topic_id IN (SELECT id FROM topics WHERE course_id = 1);
DELETE FROM topics WHERE course_id = 1;

-- Insert comprehensive topics data for Data Communication course
INSERT INTO topics (course_id, curriculum_id, term_id, unit_id, topic_title, topic_content, topic_hours, delivery_methods, textbooks, assessment_questions) VALUES

-- Unit I Topics
(1, 1, 5, 1, 'Introduction to Data Communication', 
'1. Introduction to Data communication 2. Introduction to Data communication (Contd...) 3. Topology, 4. Network models, 5. OSI and TCP/IP Layers. 6. Addressing, Data and Signal Fundamentals, 7. Analog and Digital Signals, 8. Digital Encoding Techniques', 
8, 'Case Study, Class Room Delivery', 
'Data Communications and Networking by Behrouz A. Forouzan, Computer Networks by Andrew S. Tanenbaum', 
'1. Explain the OSI model layers and their functions. 2. Compare analog and digital signals. 3. Describe different network topologies. 4. Analyze addressing schemes in networks.'),

(1, 1, 5, 1, 'Data Transmission & Multiplexing', 
'9. PCM, 10. DM, 11. Multiplexing 12. FDM, 13. Time Division Multiplexing 14. Time Division Multiplexing(cont.)', 
6, 'Case Study, Class Room Delivery', 
'Data Communications and Networking by Behrouz A. Forouzan, Digital Communications by John G. Proakis', 
'1. Explain PCM and DM techniques. 2. Compare FDM and TDM. 3. Solve problems on multiplexing. 4. Design multiplexing systems for given scenarios.'),

(1, 1, 5, 1, 'Network Topologies and Protocols', 
'15. Bus Topology, 16. Star Topology, 17. Ring Topology, 18. Mesh Topology, 19. Protocol Stack, 20. Ethernet Protocol', 
4, 'Class Room Delivery, Laboratory', 
'Computer Networks by Andrew S. Tanenbaum, Data Communications and Networking by Behrouz A. Forouzan', 
'1. Compare different network topologies. 2. Explain protocol stack concepts. 3. Analyze Ethernet protocol operation. 4. Design network topology for given requirements.'),

-- Unit II Topics
(1, 1, 5, 2, 'Error Detection and Correction', 
'21. Introduction 22. Block Coding (Contd.) 23. Linear Block Codes. 24. Cyclic codes (Contd...) 25. Cyclic codes (Contd.) 26. Checksum', 
6, 'Case Study, Class Room Delivery', 
'Data Communications and Networking by Behrouz A. Forouzan, Error Control Coding by Shu Lin', 
'1. Explain error detection methods. 2. Implement checksum algorithm. 3. Analyze block coding techniques. 4. Design error correction codes.'),

(1, 1, 5, 2, 'Data Link Layer Control', 
'27. Framing, Flow and error control, 28. Protocols, 29. Noiseless Channels, 30. Noisy Channels, 31. CSMA, 32. CSMA/CD', 
8, 'Case Study, Class Room Delivery', 
'Data Communications and Networking by Behrouz A. Forouzan, Computer Networks by Andrew S. Tanenbaum', 
'1. Explain framing techniques. 2. Compare different protocols. 3. Analyze CSMA/CD mechanism. 4. Design data link protocols.'),

(1, 1, 5, 2, 'Flow Control and Error Recovery', 
'33. Stop-and-Wait Protocol, 34. Go-Back-N Protocol, 35. Selective Repeat Protocol, 36. Sliding Window Protocol, 37. Error Recovery Mechanisms', 
6, 'Class Room Delivery, Laboratory', 
'Computer Networks by Andrew S. Tanenbaum, Data Communications and Networking by Behrouz A. Forouzan', 
'1. Compare flow control protocols. 2. Implement sliding window algorithm. 3. Analyze error recovery mechanisms. 4. Design reliable data transfer protocols.'),

-- Unit III Topics
(1, 1, 5, 3, 'Network Layer', 
'38. Network Layer Design Issues, 39. Routing Algorithms, 40. Congestion Control, 41. Internetworking, 42. IP Addressing, 43. Subnetting', 
10, 'Case Study, Class Room Delivery, Laboratory', 
'Computer Networks by Andrew S. Tanenbaum, TCP/IP Illustrated by W. Richard Stevens', 
'1. Explain routing algorithms. 2. Analyze congestion control methods. 3. Design network layer protocols. 4. Implement IP addressing schemes.'),

(1, 1, 5, 3, 'Transport Layer', 
'44. Transport Service, 45. Elements of Transport Protocols, 46. TCP, 47. UDP, 48. Connection Management, 49. Flow Control', 
8, 'Case Study, Class Room Delivery, Laboratory', 
'Computer Networks by Andrew S. Tanenbaum, TCP/IP Illustrated by W. Richard Stevens', 
'1. Compare TCP and UDP. 2. Explain transport layer services. 3. Analyze protocol elements. 4. Design transport layer mechanisms.'),

(1, 1, 5, 3, 'Application Layer Protocols', 
'50. HTTP Protocol, 51. FTP Protocol, 52. SMTP Protocol, 53. DNS Protocol, 54. Web Services, 55. Email Systems', 
6, 'Class Room Delivery, Laboratory, Project Work', 
'Computer Networks by Andrew S. Tanenbaum, Web Technologies by Uttam K. Roy', 
'1. Explain application layer protocols. 2. Implement web services. 3. Analyze email systems. 4. Design distributed applications.'),

-- Unit IV Topics
(1, 1, 5, 4, 'Network Security Fundamentals', 
'56. Security Threats, 57. Cryptography Basics, 58. Symmetric Encryption, 59. Asymmetric Encryption, 60. Digital Signatures, 61. Public Key Infrastructure', 
8, 'Case Study, Class Room Delivery, Laboratory', 
'Network Security Essentials by William Stallings, Cryptography and Network Security by William Stallings', 
'1. Identify security threats. 2. Implement encryption algorithms. 3. Design secure communication systems. 4. Analyze PKI systems.'),

(1, 1, 5, 4, 'Wireless Networks', 
'62. Wireless Communication Basics, 63. WiFi Standards, 64. Bluetooth Technology, 65. Cellular Networks, 66. Mobile IP, 67. Wireless Security', 
6, 'Class Room Delivery, Laboratory, Field Study', 
'Wireless Communications by Andrea Goldsmith, Mobile Communications by Jochen Schiller', 
'1. Explain wireless communication principles. 2. Compare wireless standards. 3. Implement wireless security measures. 4. Design mobile communication systems.'),

(1, 1, 5, 4, 'Network Management', 
'68. Network Management Concepts, 69. SNMP Protocol, 70. Network Monitoring, 71. Performance Analysis, 72. Fault Management, 73. Configuration Management', 
4, 'Class Room Delivery, Laboratory', 
'Network Management by Mani Subramanian, SNMP by William Stallings', 
'1. Explain network management concepts. 2. Implement SNMP protocols. 3. Analyze network performance. 4. Design network monitoring systems.'),

-- Unit V Topics
(1, 1, 5, 5, 'Advanced Networking Concepts', 
'74. Software Defined Networking, 75. Network Function Virtualization, 76. Cloud Networking, 77. Edge Computing, 78. IoT Networks, 79. 5G Networks', 
8, 'Case Study, Class Room Delivery, Research Work', 
'Software Defined Networks by Paul Goransson, Cloud Computing by Rajkumar Buyya', 
'1. Explain SDN concepts. 2. Analyze NFV technologies. 3. Design cloud networking solutions. 4. Implement IoT network protocols.'),

(1, 1, 5, 5, 'Network Performance Optimization', 
'80. Quality of Service, 81. Traffic Engineering, 82. Load Balancing, 83. Caching Strategies, 84. Bandwidth Management, 85. Latency Optimization', 
6, 'Class Room Delivery, Laboratory, Project Work', 
'Network Performance by Raj Jain, Quality of Service by Zheng Wang', 
'1. Implement QoS mechanisms. 2. Design traffic engineering solutions. 3. Optimize network performance. 4. Analyze bandwidth utilization.'),

(1, 1, 5, 5, 'Emerging Technologies', 
'86. Blockchain in Networking, 87. AI/ML in Networks, 88. Quantum Networking, 89. 6G Vision, 90. Network Automation, 91. Zero Trust Architecture', 
4, 'Class Room Delivery, Research Work, Seminar', 
'Blockchain Technology by Melanie Swan, AI in Networks by Mohammad A. Alshehri', 
'1. Explore emerging technologies. 2. Analyze AI applications in networking. 3. Design future network architectures. 4. Implement network automation.'),

-- Unit VI Topics
(1, 1, 5, 6, 'Network Design and Implementation', 
'92. Network Design Principles, 93. Capacity Planning, 94. Redundancy Design, 95. Scalability Considerations, 96. Cost Analysis, 97. Implementation Planning', 
8, 'Class Room Delivery, Laboratory, Project Work', 
'Network Design by Priscilla Oppenheimer, Enterprise Network Design by Diane Teare', 
'1. Design enterprise networks. 2. Plan network capacity. 3. Implement redundancy strategies. 4. Analyze cost-benefit scenarios.'),

(1, 1, 5, 6, 'Network Testing and Troubleshooting', 
'98. Network Testing Tools, 99. Performance Testing, 100. Security Testing, 101. Troubleshooting Methodologies, 102. Network Diagnostics, 103. Problem Resolution', 
6, 'Laboratory, Field Work, Case Study', 
'Network Troubleshooting by Kevin Dooley, Network Testing by Robert Graham', 
'1. Use network testing tools. 2. Perform performance testing. 3. Conduct security assessments. 4. Resolve network problems.'),

(1, 1, 5, 6, 'Project Work and Case Studies', 
'104. Real-world Network Projects, 105. Industry Case Studies, 106. Best Practices, 107. Lessons Learned, 108. Future Trends, 109. Professional Development', 
4, 'Project Work, Industry Visit, Seminar', 
'Various Industry Reports, IEEE Papers, ACM Publications', 
'1. Complete network projects. 2. Analyze industry cases. 3. Apply best practices. 4. Plan professional development.');
