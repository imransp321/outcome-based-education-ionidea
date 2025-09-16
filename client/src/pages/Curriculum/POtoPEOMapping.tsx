import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';
import '../../styles/pages/Curriculum/POtoPEOMapping.css';

interface CurriculumRegulation {
  id: number;
  curriculum_batch: string;
  program_name: string;
  department_name: string;
}

interface PO {
  id: number;
  po_reference: string;
  po_type: string;
  pso_flag: boolean;
}

interface PEO {
  id: number;
  peo_number: string;
  peo_title: string;
  peo_statement?: string;
  peo_description?: string;
}

interface Mapping {
  po_id: number;
  peo_id: number;
  mapping_strength: string;
  mapping_justification?: string;
}

interface MappingMatrix {
  po: PO;
  mappings: {
    peo: PEO;
    mapping: Mapping | null;
  }[];
}

interface MappingStats {
  total_mappings: number;
  strong_mappings: number;
  moderate_mappings: number;
  weak_mappings: number;
  mapped_pos: number;
  mapped_peos: number;
}

const POtoPEOMapping: React.FC = () => {
  const [curriculumRegulations, setCurriculumRegulations] = useState<CurriculumRegulation[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
  const [peos, setPeos] = useState<PEO[]>([]);
  const [mappingMatrix, setMappingMatrix] = useState<MappingMatrix[]>([]);
  const [stats, setStats] = useState<MappingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [selectedPEO, setSelectedPEO] = useState<PEO | null>(null);
  const [mappingStrength, setMappingStrength] = useState<string>('STRONG');
  const [mappingJustification, setMappingJustification] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [hoveredPEO, setHoveredPEO] = useState<PEO | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Fetch curriculum regulations for dropdown
  const fetchCurriculumRegulations = useCallback(async () => {
    try {
      const response = await configAPI.poPEOMapping.getCurriculumRegulations();
      setCurriculumRegulations(response.data.data);
    } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to fetch curriculum regulations' });
      setShowMessageModal(true);
    }
  }, []);

  // Fetch mapping matrix for selected curriculum
  const fetchMappingMatrix = useCallback(async (curriculumId: string) => {
    if (!curriculumId) return;

    setLoading(true);
    try {
      const response = await configAPI.poPEOMapping.getMatrix(curriculumId);
      setPeos(response.data.data.peos);
      setMappingMatrix(response.data.data.matrix);
    } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to fetch mapping matrix' });
      setShowMessageModal(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch mapping statistics
  const fetchStats = useCallback(async (curriculumId: string) => {
    if (!curriculumId) return;

    try {
      const response = await configAPI.poPEOMapping.getStats(curriculumId);
      setStats(response.data.data);
    } catch (error: any) {
      
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchCurriculumRegulations();
  }, [fetchCurriculumRegulations]);

  // Fetch data when curriculum changes
  useEffect(() => {
    if (selectedCurriculum) {
      fetchMappingMatrix(selectedCurriculum);
      fetchStats(selectedCurriculum);
    }
  }, [selectedCurriculum, fetchMappingMatrix, fetchStats]);

  // Handle curriculum change
  const handleCurriculumChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurriculum(e.target.value);
  };

  // Handle mapping cell click
  const handleMappingClick = (po: PO, peo: PEO, existingMapping: Mapping | null) => {
    setSelectedPO(po);
    setSelectedPEO(peo);
    
    if (existingMapping) {
      setMappingStrength(existingMapping.mapping_strength);
      setMappingJustification(existingMapping.mapping_justification || '');
    } else {
      setMappingStrength('STRONG');
      setMappingJustification('');
    }
    
    setShowMappingModal(true);
  };

  // Handle mapping save
  const handleMappingSave = async () => {
    if (!selectedPO || !selectedPEO || !selectedCurriculum) return;

    setSaving(true);
    try {
      await configAPI.poPEOMapping.createMapping({
        curriculum_regulation_id: parseInt(selectedCurriculum),
        po_id: selectedPO.id,
        peo_id: selectedPEO.id,
        mapping_strength: mappingStrength,
        mapping_justification: mappingJustification
      });

      setMessage({ type: 'success', text: 'Mapping saved successfully' });
      setShowMessageModal(true);
      setShowMappingModal(false);
      
      // Refresh data
      fetchMappingMatrix(selectedCurriculum);
      fetchStats(selectedCurriculum);
    } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to save mapping' });
      setShowMessageModal(true);
    } finally {
      setSaving(false);
    }
  };

  // Handle mapping delete
  const handleMappingDelete = async () => {
    if (!selectedPO || !selectedPEO || !selectedCurriculum) return;

    setSaving(true);
    try {
      await configAPI.poPEOMapping.deleteMapping(
        selectedCurriculum,
        selectedPO.id.toString(),
        selectedPEO.id.toString()
      );

      setMessage({ type: 'success', text: 'Mapping deleted successfully' });
      setShowMessageModal(true);
      setShowMappingModal(false);
      
      // Refresh data
      fetchMappingMatrix(selectedCurriculum);
      fetchStats(selectedCurriculum);
    } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to delete mapping' });
      setShowMessageModal(true);
    } finally {
      setSaving(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowMappingModal(false);
    setSelectedPO(null);
    setSelectedPEO(null);
    setMappingStrength('STRONG');
    setMappingJustification('');
  };

  // Handle message modal close
  const handleMessageClose = () => {
    setShowMessageModal(false);
    setMessage(null);
  };

  // Handle PEO hover
  const handlePEOHover = (peo: PEO, event: React.MouseEvent) => {
    setHoveredPEO(peo);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  // Handle PEO hover leave
  const handlePEOLeave = () => {
    setHoveredPEO(null);
  };

  // Get curriculum display name
  const getCurriculumDisplayName = (curriculum: CurriculumRegulation) => {
    return `${curriculum.curriculum_batch} - ${curriculum.program_name} (${curriculum.department_name})`;
  };

  // Get existing mapping for PO-PEO pair
  const getExistingMapping = (poId: number, peoId: number): Mapping | null => {
    const matrixRow = mappingMatrix.find(row => row.po.id === poId);
    if (!matrixRow) return null;
    
    const mappingCell = matrixRow.mappings.find(cell => cell.peo.id === peoId);
    return mappingCell?.mapping || null;
  };

  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>PO to PE Mapping</h1>
        <p>Map Program Outcomes to Program Educational Objectives for curriculum alignment</p>
      </div>

      {/* Business Alert Messages */}
      {message && (
        <div className={`business-alert business-alert-${message.type}`}>
          <div className="business-alert-content">
            <div className="business-alert-icon">
              {message.type === 'success' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" >
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </div>
            <span className="business-alert-text">{message.text}</span>
          </div>
          <button
            className="business-alert-close"
            onClick={() => setMessage(null)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" >
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      )}

      {/* Curriculum Selection Card */}
      <div className="curriculum-selection-card">
        <div className="curriculum-selection-header">
          <div className="curriculum-selection-label">
            <label className="curriculum-selection-label-text">CURRICULUM BATCH</label>
          </div>
          <div className="curriculum-selection-input-container">
            <select
              className="curriculum-selection-input"
              value={selectedCurriculum}
              onChange={handleCurriculumChange}
            >
              <option value="">Select curriculum batch...</option>
              {curriculumRegulations.map((curriculum) => (
                <option key={curriculum.id} value={curriculum.id}>
                  {getCurriculumDisplayName(curriculum)}
                </option>
              ))}
            </select>
            <div className="curriculum-selection-dropdown-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Mapping Matrix */}
      {selectedCurriculum && (
        <div className="business-data-container">
          {loading ? (
            <div className="business-loading-container">
              <div className="business-spinner"></div>
              <p>Loading mapping matrix...</p>
            </div>
          ) : mappingMatrix.length === 0 ? (
            <div className="business-empty-state">
              <div className="business-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" >
                  <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.9.37 4.13 1.02" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>No Mapping Data Found</h3>
              <p>No PO to PEO mappings found for the selected curriculum. Please ensure the curriculum has both Program Outcomes and Program Educational Objectives defined.</p>
            </div>
          ) : (
            <>
              <div className="business-data-header">
                <div className="business-data-actions">
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
                    PO to PEO Mapping Matrix
                  </h2>
                </div>
                {stats && (
                  <div className="business-search-container" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{stats.total_mappings}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{stats.strong_mappings}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Strong</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{stats.moderate_mappings}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Moderate</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{stats.weak_mappings}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Weak</div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '800px' }}>
                  <thead>
                    <tr>
                      <th style={{ background: '#3b82f6', color: 'white', fontWeight: '700', textAlign: 'left', padding: '12px 16px', border: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
                        Program Outcomes (POs)
                      </th>
                      {peos.map((peo) => (
                        <th 
                          key={peo.id} 
                          style={{ 
                            background: hoveredPEO?.id === peo.id ? '#9ca3af' : '#d1d5db', 
                            color: 'white', 
                            fontWeight: '700', 
                            writingMode: 'vertical-rl', 
                            textOrientation: 'mixed', 
                            minWidth: '60px', 
                            height: '120px', 
                            border: '1px solid #e5e7eb', 
                            position: 'sticky', 
                            top: 0, 
                            zIndex: 10,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            transform: hoveredPEO?.id === peo.id ? 'scale(1.02)' : 'scale(1)',
                            boxShadow: hoveredPEO?.id === peo.id ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
                          }}
                          onMouseEnter={(e) => handlePEOHover(peo, e)}
                          onMouseLeave={handlePEOLeave}
                        >
                          <div style={{ transform: 'rotate(180deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{peo.peo_number}</div>
                            <div style={{ fontSize: '10px', fontWeight: '500', opacity: '0.9', textAlign: 'center', lineHeight: '1.2' }}>
                              {peo.peo_title.length > 15 ? peo.peo_title.substring(0, 15) + '...' : peo.peo_title}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mappingMatrix.map((row) => (
                      <tr key={row.po.id} style={{ background: 'white' }}>
                        <td style={{ background: '#f8fafc', fontWeight: '600', color: '#1f2937', textAlign: 'left', padding: '12px 16px', border: '1px solid #e5e7eb', minWidth: '150px' }}>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
                            {row.po.po_reference}
                            {row.po.pso_flag && <span style={{ display: 'inline-block', padding: '2px 6px', background: '#fbbf24', color: '#92400e', borderRadius: '4px', fontSize: '10px', fontWeight: '600', marginLeft: '8px' }}>PSO</span>}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.3' }}>
                            {row.po.po_type.length > 25 ? row.po.po_type.substring(0, 25) + '...' : row.po.po_type}
                          </div>
                        </td>
                        {row.mappings.map((cell) => {
                          const existingMapping = cell.mapping;
                          const strengthClass = existingMapping ? existingMapping.mapping_strength.toLowerCase() : 'empty';
                          const strengthColors = {
                            strong: { bg: '#dcfce7', color: '#166534', border: '#22c55e' },
                            moderate: { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
                            weak: { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' },
                            empty: { bg: '#f9fafb', color: '#9ca3af', border: '#d1d5db' }
                          };
                          const colors = strengthColors[strengthClass as keyof typeof strengthColors] || strengthColors.empty;
                          
                          return (
                            <td
                              key={cell.peo.id}
                              style={{ 
                                position: 'relative', 
                                minWidth: '60px', 
                                minHeight: '50px', 
                                cursor: 'pointer', 
                                transition: 'all 0.2s ease',
                                border: '1px solid #e5e7eb',
                                padding: '8px',
                                textAlign: 'center',
                                verticalAlign: 'middle'
                              }}
                              onClick={() => handleMappingClick(row.po, cell.peo, existingMapping)}
                            >
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%',
                                borderRadius: '6px',
                                fontWeight: '700',
                                fontSize: '14px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                background: colors.bg,
                                color: colors.color,
                                border: existingMapping ? `2px solid ${colors.border}` : `1px dashed ${colors.border}`,
                                minHeight: '32px'
                              }}>
                                {existingMapping ? existingMapping.mapping_strength.charAt(0) : '+'}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mapping Modal */}
      {showMappingModal && selectedPO && selectedPEO && createPortal(
        <div className="business-form-overlay">
          <div className="business-form-container">
            <div className="business-form-header">
              <div className="business-form-title">
                <h2>PO to PEO Mapping</h2>
                <p>Configure mapping between Program Outcome and Program Educational Objective</p>
              </div>
              <button
                type="button"
                className="business-btn-close"
                onClick={handleModalClose}
                title="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" >
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="business-form-content">
              <div className="business-form-section">
                <h3 className="business-form-section-title">Mapping Details</h3>
                <div className="business-form-grid">
                  <div className="business-form-group">
                    <label className="business-form-label">Program Outcome</label>
                    <div className="business-form-input" style={{ background: '#f8fafc', color: '#6b7280' }}>
                      {selectedPO.po_reference} - {selectedPO.po_type}
                    </div>
                  </div>
                  <div className="business-form-group">
                    <label className="business-form-label">Program Educational Objective</label>
                    <div className="business-form-input" style={{ background: '#f8fafc', color: '#6b7280' }}>
                      {selectedPEO.peo_number} - {selectedPEO.peo_title}
                    </div>
                  </div>
                </div>
              </div>

              <div className="business-form-section">
                <h3 className="business-form-section-title">Mapping Configuration</h3>
                <div className="business-form-group">
                  <label className="business-form-label">Mapping Strength</label>
                  <div className="business-form-input-wrapper">
                    <select
                      className="business-form-input"
                      value={mappingStrength}
                      onChange={(e) => setMappingStrength(e.target.value)}
                    >
                      <option value="STRONG">Strong</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="WEAK">Weak</option>
                    </select>
                    <div className="business-form-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.91.37 4.15 1.02" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="business-form-group">
                  <label className="business-form-label">Justification (Optional)</label>
                  <textarea
                    className="business-form-textarea"
                    value={mappingJustification}
                    onChange={(e) => setMappingJustification(e.target.value)}
                    placeholder="Enter justification for this mapping..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="business-form-actions">
                <button
                  type="button"
                  className="business-btn business-btn-secondary"
                  onClick={handleModalClose}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" >
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Cancel
                </button>
                {getExistingMapping(selectedPO.id, selectedPEO.id) && (
                  <button
                    type="button"
                    className="business-btn business-btn-danger"
                    onClick={handleMappingDelete}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="business-spinner"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" >
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  className="business-btn business-btn-primary"
                  onClick={handleMappingSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="business-spinner"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" >
                        <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 3V8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Save Mapping
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Message Modal */}
      {showMessageModal && message && createPortal(
        <div className="business-form-overlay">
          <div className="business-form-container business-form-container-small">
            <div className="business-form-header">
              <div className="business-form-title">
                <h2>{message.type === 'success' ? 'Success' : 'Error'}</h2>
              </div>
              <button
                type="button"
                className="business-btn-close"
                onClick={handleMessageClose}
                title="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" >
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="business-form-content">
              <div className="business-warning">
                <div className="business-warning-icon">
                  {message.type === 'success' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" >
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                      <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </div>
                <div className="business-warning-content">
                  <p>{message.text}</p>
                </div>
              </div>
              <div className="business-form-actions">
                <button
                  type="button"
                  className="business-btn business-btn-primary"
                  onClick={handleMessageClose}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* PEO Tooltip */}
      {hoveredPEO && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%) translateY(-100%)',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 1000,
            maxWidth: '350px',
            pointerEvents: 'none'
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '700', 
              color: '#1f2937',
              marginBottom: '6px'
            }}>
              {hoveredPEO.peo_number}
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '10px'
            }}>
              {hoveredPEO.peo_title}
            </div>
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: '#4b5563', 
            lineHeight: '1.5',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '10px',
            background: '#f8fafc',
            padding: '12px',
            borderRadius: '6px',
            marginTop: '8px'
          }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: '600', 
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '6px'
            }}>
              PEO Statement
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#374151',
              lineHeight: '1.5'
            }}>
              {hoveredPEO.peo_statement || hoveredPEO.peo_description || 'No statement available'}
            </div>
          </div>
          {/* Tooltip Arrow */}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid white'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-7px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '7px solid #e5e7eb'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default POtoPEOMapping;
