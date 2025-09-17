-- Create book_chapters table
CREATE TABLE IF NOT EXISTS book_chapters (
  id SERIAL PRIMARY KEY,
  book_title VARCHAR(255) NOT NULL,
  chapter_title VARCHAR(255) NOT NULL,
  authors TEXT,
  editor VARCHAR(255),
  isbn VARCHAR(50),
  year VARCHAR(4),
  publisher_details TEXT,
  description TEXT,
  upload_file VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_book_chapters_book_title ON book_chapters(book_title);
CREATE INDEX IF NOT EXISTS idx_book_chapters_chapter_title ON book_chapters(chapter_title);
CREATE INDEX IF NOT EXISTS idx_book_chapters_authors ON book_chapters(authors);
CREATE INDEX IF NOT EXISTS idx_book_chapters_year ON book_chapters(year);
CREATE INDEX IF NOT EXISTS idx_book_chapters_created_at ON book_chapters(created_at);

-- Insert sample data
INSERT INTO book_chapters (book_title, chapter_title, authors, editor, isbn, year, publisher_details, description, upload_file) VALUES
('Machine Learning in Practice', 'Deep Learning Applications in Healthcare', 'Dr. John Smith, Dr. Jane Doe', 'Dr. Michael Johnson', '978-0-123456-78-9', '2024', 'Tech Publications Ltd., New York', 'This chapter explores the applications of deep learning techniques in healthcare domain.', 'chapter_draft.pdf'),
('Artificial Intelligence Handbook', 'Natural Language Processing for Medical Records', 'Dr. Sarah Wilson', 'Prof. Robert Davis', '978-0-987654-32-1', '2023', 'Academic Press, London', 'Comprehensive guide to NLP techniques in medical data processing.', 'nlp_chapter.pdf'),
('Data Science Applications', 'Predictive Analytics in Education', 'Dr. Mark Thompson, Dr. Lisa Chen', 'Dr. Ahmed Ali', '978-0-456789-12-3', '2024', 'Educational Tech Publishers, Boston', 'Analysis of predictive modeling techniques in educational systems.', 'predictive_analytics.pdf')
ON CONFLICT DO NOTHING;
