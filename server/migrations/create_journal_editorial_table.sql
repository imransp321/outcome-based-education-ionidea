-- Create journal_editorial table
CREATE TABLE IF NOT EXISTS journal_editorial (
  id SERIAL PRIMARY KEY,
  position VARCHAR(100) NOT NULL,
  journal_name VARCHAR(255) NOT NULL,
  description TEXT,
  upload_file VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_journal_editorial_position ON journal_editorial(position);
CREATE INDEX IF NOT EXISTS idx_journal_editorial_journal_name ON journal_editorial(journal_name);
CREATE INDEX IF NOT EXISTS idx_journal_editorial_created_at ON journal_editorial(created_at);

-- Insert sample data
INSERT INTO journal_editorial (position, journal_name, description, upload_file) VALUES
('Editor', 'Journal of Computer Science and Engineering', 'Editorial board member for peer review and publication decisions', 'editor_certificate.pdf'),
('Member', 'International Journal of Artificial Intelligence', 'Editorial board member for AI research publications', 'member_certificate.pdf'),
('Editor', 'IEEE Transactions on Software Engineering', 'Editorial board member for software engineering research', 'ieee_editor_certificate.pdf')
ON CONFLICT DO NOTHING;
