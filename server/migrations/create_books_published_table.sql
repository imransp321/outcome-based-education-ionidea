-- Create books_published table
CREATE TABLE IF NOT EXISTS books_published (
  id SERIAL PRIMARY KEY,
  book_title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  co_authors TEXT,
  isbn VARCHAR(50),
  languages TEXT,
  publisher VARCHAR(255),
  published_year VARCHAR(4),
  book_no VARCHAR(50),
  copyright_year VARCHAR(4),
  no_of_chapters VARCHAR(10),
  type VARCHAR(50),
  published_in TEXT,
  about_book TEXT,
  upload_file VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_published_book_title ON books_published(book_title);
CREATE INDEX IF NOT EXISTS idx_books_published_author ON books_published(author);
CREATE INDEX IF NOT EXISTS idx_books_published_publisher ON books_published(publisher);
CREATE INDEX IF NOT EXISTS idx_books_published_published_year ON books_published(published_year);
CREATE INDEX IF NOT EXISTS idx_books_published_type ON books_published(type);
CREATE INDEX IF NOT EXISTS idx_books_published_created_at ON books_published(created_at);

-- Insert sample data
INSERT INTO books_published (book_title, author, co_authors, isbn, languages, publisher, published_year, book_no, copyright_year, no_of_chapters, type, published_in, about_book, upload_file) VALUES
('Advanced Machine Learning Techniques', 'Dr. John Smith', 'Dr. Jane Doe, Dr. Michael Johnson', '978-0-123456-78-9', 'English, Hindi', 'Tech Publications Ltd.', '2024', 'BK-001', '2024', '12', 'Text Book', 'India', 'Comprehensive guide to advanced machine learning techniques and applications.', 'book_cover.pdf'),
('Data Structures and Algorithms', 'Dr. Sarah Wilson', 'Dr. Robert Davis', '978-0-987654-32-1', 'English', 'Academic Press', '2023', 'BK-002', '2023', '15', 'Reference Book', 'United States', 'Complete reference for data structures and algorithms with practical implementations.', 'dsa_book.pdf'),
('Artificial Intelligence in Healthcare', 'Dr. Mark Thompson', 'Dr. Lisa Chen, Dr. Ahmed Ali', '978-0-456789-12-3', 'English, Spanish', 'Medical Tech Publishers', '2024', 'BK-003', '2024', '10', 'Research Book', 'United Kingdom', 'Research-based book on AI applications in healthcare and medical diagnosis.', 'ai_healthcare.pdf')
ON CONFLICT DO NOTHING;
