-- Create CO-PO Mapping table
CREATE TABLE IF NOT EXISTS co_po_mapping (
    id SERIAL PRIMARY KEY,
    co_id INTEGER NOT NULL REFERENCES course_outcomes(id) ON DELETE CASCADE,
    po_id INTEGER NOT NULL REFERENCES program_outcomes(id) ON DELETE CASCADE,
    mapping_strength INTEGER NOT NULL CHECK (mapping_strength >= 1 AND mapping_strength <= 3),
    contribution_pi TEXT,
    justification TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(co_id, po_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_co_po_mapping_co_id ON co_po_mapping(co_id);
CREATE INDEX IF NOT EXISTS idx_co_po_mapping_po_id ON co_po_mapping(po_id);

-- Add some sample mapping data
INSERT INTO co_po_mapping (co_id, po_id, mapping_strength, contribution_pi, justification) VALUES
(1, 15, 1, 'High', 'CO1 directly addresses engineering knowledge requirements'),
(2, 24, 1, 'Medium', 'CO2 contributes to communication skills through technical analysis'),
(3, 16, 2, 'High', 'CO3 strongly supports problem analysis and solution design'),
(4, 16, 2, 'High', 'CO4 enhances problem analysis through protocol understanding'),
(5, 17, 1, 'Medium', 'CO5 contributes to design and development processes')
ON CONFLICT (co_id, po_id) DO NOTHING;
