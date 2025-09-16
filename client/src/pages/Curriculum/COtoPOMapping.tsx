import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import { useMessage } from '../../contexts/MessageContext';
import '../../styles/pages/Curriculum/COtoPOMapping.css';

interface Curriculum {
  id: number;
  curriculum_batch: string;
  program_title: string;
  from_year: number;
  to_year: number;
}

interface Term {
  id: number;
  term_name: string;
}

interface Course {
  id: number;
  course_code: string;
  course_title: string;
}

interface CourseOutcome {
  id: number;
  co_code: string;
  course_outcome: string;
}

interface ProgramOutcome {
  id: number;
  po_reference: string;
  po_statement: string;
  po_type: string;
  pso_flag: boolean;
}

interface MappingData {
  id: number;
  co_id: number;
  po_id: number;
  mapping_strength: number;
  contribution_pi: string;
  justification: string;
}

const COtoPOMapping: React.FC = () => {
  const { showMessage } = useMessage();
  
  // State for dropdowns
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  // State for mapping data
  const [courseOutcomes, setCourseOutcomes] = useState<CourseOutcome[]>([]);
  const [programOutcomes, setProgramOutcomes] = useState<ProgramOutcome[]>([]);
  const [mappingData, setMappingData] = useState<MappingData[]>([]);
  const [loading, setLoading] = useState(false);

  // State for modals
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedCO, setSelectedCO] = useState<CourseOutcome | null>(null);
  const [selectedPO, setSelectedPO] = useState<ProgramOutcome | null>(null);
  const [mappingForm, setMappingForm] = useState({
    mapping_strength: 1,
    contribution_pi: '',
    justification: ''
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // State for tooltips
  const [hoveredPO, setHoveredPO] = useState<ProgramOutcome | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Load initial data
  useEffect(() => {
    fetchCurriculums();
    fetchTerms();
    fetchProgramOutcomes();
  }, []);

  const fetchCurriculums = useCallback(async () => {
    try {
      const response = await configAPI.curriculumRegulations.getAll();
      setCurriculums(response.data.data || []);
    } catch (error) {
      
    }
  }, []);

  const fetchTerms = useCallback(async () => {
    try {
      const response = await configAPI.courses.getTerms();
      setTerms(response.data.data || []);
    } catch (error) {
      
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await configAPI.courses.getAll({
        curriculum_id: selectedCurriculum,
        term_id: selectedTerm
      });
      setCourses(response.data.data || []);
    } catch (error) {
      
    }
  }, [selectedCurriculum, selectedTerm]);

  const fetchCourseOutcomes = useCallback(async () => {
    try {
      const response = await configAPI.courseOutcomes.getAll({
        curriculum_id: selectedCurriculum,
        term_id: selectedTerm,
        course_id: selectedCourse
      });
      const outcomes = response.data.data || [];
      setCourseOutcomes(outcomes);
    } catch (error) {
      
    }
  }, [selectedCurriculum, selectedTerm, selectedCourse]);

  const fetchProgramOutcomes = useCallback(async () => {
    try {
      const response = await configAPI.programOutcomes.getAll();
      const outcomes = response.data.data || [];
      
      // Sort POs by their reference number (PO1, PO2, PO3, etc.)
      const sortedOutcomes = outcomes.sort((a: ProgramOutcome, b: ProgramOutcome) => {
        const aNum = parseInt(a.po_reference.replace(/\D/g, ''));
        const bNum = parseInt(b.po_reference.replace(/\D/g, ''));
        return aNum - bNum;
      });
      
      setProgramOutcomes(sortedOutcomes);
    } catch (error) {
      
    }
  }, []);

  const fetchMappingData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await configAPI.coPoMapping.getAll({
        curriculum_id: selectedCurriculum,
        term_id: selectedTerm,
        course_id: selectedCourse
      });
      const mappings = response.data.data || [];
      setMappingData(mappings);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  }, [selectedCurriculum, selectedTerm, selectedCourse]);

  // Load courses when curriculum and term are selected
  useEffect(() => {
    if (selectedCurriculum && selectedTerm) {
      fetchCourses();
    }
  }, [selectedCurriculum, selectedTerm, fetchCourses]);

  // Load mapping data when course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchCourseOutcomes();
      fetchMappingData();
    }
  }, [selectedCourse, fetchCourseOutcomes, fetchMappingData]);

  const handleCurriculumChange = (curriculumId: string) => {
    setSelectedCurriculum(curriculumId);
    setSelectedTerm('');
    setSelectedCourse('');
    setCourses([]);
    setCourseOutcomes([]);
    setMappingData([]);
  };

  const handleTermChange = (termId: string) => {
    setSelectedTerm(termId);
    setSelectedCourse('');
    setCourseOutcomes([]);
    setMappingData([]);
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  const getMappingStrength = (coId: number, poId: number): number => {
    const mapping = mappingData.find(m => m.co_id === coId && m.po_id === poId);
    return mapping?.mapping_strength || 0;
  };

  const getContributionPI = (coId: number, poId: number): string => {
    const mapping = mappingData.find(m => m.co_id === coId && m.po_id === poId);
    return mapping?.contribution_pi || '';
  };

  const getMappingId = (coId: number, poId: number): number | null => {
    const mapping = mappingData.find(m => m.co_id === coId && m.po_id === poId);
    return mapping ? mapping.id : null;
  };

  const handleMappingClick = (co: CourseOutcome, po: ProgramOutcome) => {
    setSelectedCO(co);
    setSelectedPO(po);
    
    const existingMapping = mappingData.find(m => m.co_id === co.id && m.po_id === po.id);
    setMappingForm({
      mapping_strength: existingMapping?.mapping_strength || 1,
      contribution_pi: existingMapping?.contribution_pi || '',
      justification: existingMapping?.justification || ''
    });
    
    setShowMappingModal(true);
  };

  // Validate mapping form
  const validateMappingForm = (): boolean => {
    setValidationErrors({});
    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    // Validate contribution_pi
    if (!mappingForm.contribution_pi.trim()) {
      errors.contribution_pi = 'Contribution & PI is required';
      hasErrors = true;
    } else if (mappingForm.contribution_pi.trim().length < 5) {
      errors.contribution_pi = 'Contribution & PI must be at least 5 characters long';
      hasErrors = true;
    } else if (mappingForm.contribution_pi.trim().length > 200) {
      errors.contribution_pi = 'Contribution & PI must not exceed 200 characters';
      hasErrors = true;
    }

    // Validate justification
    if (!mappingForm.justification.trim()) {
      errors.justification = 'Justification is required';
      hasErrors = true;
    } else if (mappingForm.justification.trim().length < 10) {
      errors.justification = 'Justification must be at least 10 characters long';
      hasErrors = true;
    } else if (mappingForm.justification.trim().length > 500) {
      errors.justification = 'Justification must not exceed 500 characters';
      hasErrors = true;
    }

    // Validate mapping strength
    if (mappingForm.mapping_strength < 1 || mappingForm.mapping_strength > 3) {
      errors.mapping_strength = 'Mapping strength must be between 1 and 3';
      hasErrors = true;
    }

    if (hasErrors) {
      setValidationErrors(errors);
      return false;
    }

    return true;
  };

  const handleMappingSubmit = async () => {
    try {
      if (!selectedCO || !selectedPO) return;

      // Validate form before submission
      if (!validateMappingForm()) {
        return;
      }

      const mappingId = getMappingId(selectedCO.id, selectedPO.id);
      
      if (mappingId) {
        // Update existing mapping
        await configAPI.coPoMapping.update(mappingId.toString(), {
          mapping_strength: mappingForm.mapping_strength,
          contribution_pi: mappingForm.contribution_pi,
          justification: mappingForm.justification
        });
      } else {
        // Create new mapping
        await configAPI.coPoMapping.create({
          co_id: selectedCO.id,
          po_id: selectedPO.id,
          mapping_strength: mappingForm.mapping_strength,
          contribution_pi: mappingForm.contribution_pi,
          justification: mappingForm.justification
        });
      }
      
      showMessage({
        type: 'success',
        title: 'Success',
        message: 'Mapping saved successfully'
      });
      setShowMappingModal(false);
      fetchMappingData();
    } catch (error) {
      
      showMessage({
        type: 'error',
        title: 'Error',
        message: 'Error saving mapping'
      });
    }
  };

  const handleMappingModalClose = () => {
    setShowMappingModal(false);
    setSelectedCO(null);
    setSelectedPO(null);
    setMappingForm({
      mapping_strength: 1,
      contribution_pi: '',
      justification: ''
    });
    setValidationErrors({});
  };

  // Handle PO hover
  const handlePOHover = (po: ProgramOutcome, event: React.MouseEvent) => {
    setHoveredPO(po);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  // Handle PO hover leave
  const handlePOLeave = () => {
    setHoveredPO(null);
  };

  const getStrengthColor = (strength: number): string => {
    switch (strength) {
      case 1: return '#ff6b6b'; // Light red
      case 2: return '#ffd93d'; // Yellow
      case 3: return '#6bcf7f'; // Green
      default: return '#e5e7eb'; // Gray
    }
  };


  return (
    <div className="co-po-mapping-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Mapping between Course Outcomes (COs) and Program Outcomes (POs) Course wise</h1>
        <div className="page-actions">
          <button className="action-btn artifacts-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
              <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Artifacts
          </button>
          <button className="action-btn guidelines-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Guidelines
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-container">
          <div className="filter-group">
            <label className="filter-label">Curriculum</label>
            <select
              className="filter-select"
              value={selectedCurriculum}
              onChange={(e) => handleCurriculumChange(e.target.value)}
            >
              <option value="">Select curriculum...</option>
              {curriculums.map((curriculum) => (
                <option key={curriculum.id} value={curriculum.id.toString()}>
                  {curriculum.curriculum_batch}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Term</label>
            <select
              className="filter-select"
              value={selectedTerm}
              onChange={(e) => handleTermChange(e.target.value)}
              disabled={!selectedCurriculum}
            >
              <option value="">Select term...</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id.toString()}>
                  {term.term_name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Course</label>
            <select
              className="filter-select"
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
              disabled={!selectedTerm}
            >
              <option value="">Select course...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id.toString()}>
                  {course.course_code} - {course.course_title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mapping Status */}
        {selectedCourse && (
          <div className="mapping-status">
            <span className="status-label">COs to POs Mapping Current Status:</span>
            <span className="status-value">Reviewed</span>
          </div>
        )}
      </div>



      {/* Mapping Matrix */}
      {selectedCourse && courseOutcomes.length > 0 && programOutcomes.length > 0 && (
        <div className="mapping-matrix-container">
          <div className="matrix-table-wrapper">
            <table className="mapping-matrix-table">
              <thead>
                <tr>
                  <th className="co-header">Course Name - Course Outcomes / Program Outcomes</th>
                  {programOutcomes.map((po) => (
                    <th 
                      key={po.id} 
                      className="po-header" 
                      onMouseEnter={(e) => handlePOHover(po, e)}
                      onMouseLeave={handlePOLeave}
                    >
                      {po.po_reference}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Course Name Row */}
                <tr className="course-name-row">
                  <td className="course-name-cell">
                    <div className="course-title">
                      {courses.find(c => c.id.toString() === selectedCourse)?.course_title}
                    </div>
                  </td>
                  {programOutcomes.map((po) => (
                    <td key={po.id} className="empty-cell"></td>
                  ))}
                </tr>

                {/* Course Outcomes Rows */}
                {courseOutcomes.map((co) => (
                  <tr key={co.id} className="co-row">
                    <td className="co-cell">
                      <div className="co-content">
                        <div className="co-code">{co.co_code}</div>
                        <div className="co-description">{co.course_outcome}</div>
                      </div>
                    </td>
                    {programOutcomes.map((po) => {
                      const strength = getMappingStrength(co.id, po.id);
                      
                      return (
                        <td key={po.id} className="mapping-cell">
                          {strength > 0 ? (
                            <div className="mapping-content">
                              <div 
                                className="strength-indicator"
                                style={{ backgroundColor: getStrengthColor(strength) }}
                              >
                                {strength}
                              </div>
                              <div className="mapping-details">
                                <div className="contribution-pi">C & PI</div>
                                <button 
                                  className="justify-btn"
                                  onClick={() => handleMappingClick(co, po)}
                                >
                                  Justify
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              className="add-mapping-btn"
                              onClick={() => handleMappingClick(co, po)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedCourse && (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <h3>Select Course to View Mapping</h3>
          <p>Please select a curriculum, term, and course to view the CO to PO mapping matrix</p>
        </div>
      )}

      {/* No Course Outcomes State */}
      {selectedCourse && courseOutcomes.length === 0 && !loading && (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <h3>No Course Outcomes Found</h3>
          <p>No course outcomes found for the selected course. Please check if course outcomes are defined for this course.</p>
        </div>
      )}

      {/* No Program Outcomes State */}
      {selectedCourse && courseOutcomes.length > 0 && programOutcomes.length === 0 && !loading && (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <h3>No Program Outcomes Found</h3>
          <p>No program outcomes found. Please check the configuration.</p>
        </div>
      )}

      {/* Mapping Modal */}
      {showMappingModal && createPortal(
        <div className="modal-overlay" onClick={handleMappingModalClose}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>CO to PO Mapping</h3>
              <button className="modal-close" onClick={handleMappingModalClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-content">
              <div className="mapping-info">
                <div className="info-item">
                  <label>Course Outcome:</label>
                  <span>{selectedCO?.co_code}: {selectedCO?.course_outcome}</span>
                </div>
                <div className="info-item">
                  <label>Program Outcome:</label>
                  <span>{selectedPO?.po_reference}: {selectedPO?.po_statement}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mapping Strength</label>
                <select
                  className="form-select"
                  value={mappingForm.mapping_strength}
                  onChange={(e) => setMappingForm(prev => ({
                    ...prev,
                    mapping_strength: parseInt(e.target.value)
                  }))}
                >
                  <option value={1}>1 - Low</option>
                  <option value={2}>2 - Medium</option>
                  <option value={3}>3 - High</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Contribution & PI</label>
                <input
                  type="text"
                  className={`form-input ${validationErrors.contribution_pi ? 'form-input-error' : ''}`}
                  value={mappingForm.contribution_pi}
                  onChange={(e) => {
                    setMappingForm(prev => ({
                      ...prev,
                      contribution_pi: e.target.value
                    }));
                    // Clear validation error for this field
                    if (validationErrors.contribution_pi) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.contribution_pi;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder="Enter contribution and performance indicator"
                />
                {validationErrors.contribution_pi && (
                  <div className="form-error">{validationErrors.contribution_pi}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Justification</label>
                <textarea
                  className={`form-textarea ${validationErrors.justification ? 'form-input-error' : ''}`}
                  value={mappingForm.justification}
                  onChange={(e) => {
                    setMappingForm(prev => ({
                      ...prev,
                      justification: e.target.value
                    }));
                    // Clear validation error for this field
                    if (validationErrors.justification) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.justification;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder="Enter justification for this mapping"
                  rows={4}
                />
                {validationErrors.justification && (
                  <div className="form-error">{validationErrors.justification}</div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleMappingModalClose}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleMappingSubmit}>
                Save Mapping
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* PO Tooltip */}
      {hoveredPO && (
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
              {hoveredPO.po_reference}
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '10px'
            }}>
              {hoveredPO.po_type}
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
              PO Statement
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#374151',
              lineHeight: '1.5'
            }}>
              {hoveredPO.po_statement || 'No statement available'}
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
              borderTop: '6px solid #e5e7eb'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default COtoPOMapping;
