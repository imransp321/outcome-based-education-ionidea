import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import { useMessage } from '../../contexts/MessageContext';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';
import '../../styles/shared/business.css';
import '../../styles/pages/Curriculum/CurriculumTermDetails.css';

interface CurriculumRegulation {
  id: number;
  curriculum_batch: string;
  program_name: string;
  department_name: string;
  from_year: number;
  to_year: number;
}

interface TermDetail {
  id?: number;
  si_no: number;
  term_name: string;
  duration_weeks: number;
  credits: number;
  total_theory_courses: number;
  total_practical_others: number;
  academic_start_year: number;
  academic_end_year: number;
  academic_year: string;
  isNew?: boolean;
  program_owner_first_name?: string;
  program_owner_last_name?: string;
  program_owner_email?: string;
  approval_status?: string;
  submitted_at?: string;
  approved_at?: string;
}

const CurriculumTermDetails: React.FC = () => {
  const { showMessage } = useMessage();
  const [curriculumRegulations, setCurriculumRegulations] = useState<CurriculumRegulation[]>([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('');
  const [termDetails, setTermDetails] = useState<TermDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [programOwner, setProgramOwner] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [isDataSaved, setIsDataSaved] = useState<boolean>(false);

  // Fetch curriculum regulations for dropdown
  const fetchCurriculumRegulations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await configAPI.curriculumRegulations.getAll();
      setCurriculumRegulations(response.data.data || []);
    } catch (error: any) {
      
      showMessage({ 
        type: 'error', 
        title: 'Error', 
        message: 'Error fetching curriculum regulations' 
      });
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  // Debug: Log program owner state changes
  useEffect(() => {
    
  }, [programOwner]);

  // Fetch term details for selected curriculum
  const fetchTermDetails = useCallback(async (curriculumId: string) => {
    if (!curriculumId) {
      setTermDetails([]);
      return;
    }

    try {
      setLoading(true);
      
      // Check if the API endpoint exists before making the call
      if (!configAPI.termDetails || !configAPI.termDetails.getByCurriculum) {
        
        const emptyRow = [{
          si_no: 1,
          term_name: '',
          duration_weeks: 0,
          credits: 0,
          total_theory_courses: 0,
          total_practical_others: 0,
          academic_start_year: new Date().getFullYear(),
          academic_end_year: new Date().getFullYear() + 1,
          academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          isNew: true
        }];
        setTermDetails(emptyRow);
        return;
      }

      const response = await configAPI.termDetails.getByCurriculum(curriculumId);
      const details = response.data?.data || [];
      const curriculumInfo = response.data?.curriculum_info;
      
      // If no term details exist, show empty table with one empty row
      if (details.length === 0) {
        const emptyRow = [{
          si_no: 1,
          term_name: '',
          duration_weeks: 0,
          credits: 0,
          total_theory_courses: 0,
          total_practical_others: 0,
          academic_start_year: new Date().getFullYear(),
          academic_end_year: new Date().getFullYear() + 1,
          academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          isNew: true
        }];
        setTermDetails(emptyRow);
        
        // Extract program owner and approval status from curriculum info
        if (curriculumInfo) {
          if (curriculumInfo.program_owner_first_name && curriculumInfo.program_owner_last_name) {
            const ownerName = `${curriculumInfo.program_owner_first_name} ${curriculumInfo.program_owner_last_name}`;
            
            setProgramOwner({
              name: ownerName,
              email: curriculumInfo.program_owner_email || ''
            });
          } else {
            
            setProgramOwner(null);
          }
          
          setApprovalStatus(curriculumInfo.approval_status || null);
        } else {
          setProgramOwner(null);
          setApprovalStatus(null);
        }
      } else {
        setTermDetails(details);
        
        // Extract program owner and approval status from first row
        const firstRow = details[0];
        
        if (firstRow.program_owner_first_name && firstRow.program_owner_last_name) {
          const ownerName = `${firstRow.program_owner_first_name} ${firstRow.program_owner_last_name}`;
          
          setProgramOwner({
            name: ownerName,
            email: firstRow.program_owner_email || ''
          });
        } else {
          
          setProgramOwner(null);
        }
        
        setApprovalStatus(firstRow.approval_status || null);
        setIsDataSaved(true); // Data exists, so it's saved
      }
    } catch (error: any) {
      
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Unable to fetch term details. The backend service may not be running.';
      
      showMessage({ 
        type: 'error', 
        title: 'Error', 
        message: errorMessage
      });
      
      // Show empty table with one empty row on error
      const emptyRow = [{
        si_no: 1,
        term_name: '',
        duration_weeks: 0,
        credits: 0,
        total_theory_courses: 0,
        total_practical_others: 0,
        academic_start_year: new Date().getFullYear(),
        academic_end_year: new Date().getFullYear() + 1,
        academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        isNew: true
      }];
      setTermDetails(emptyRow);
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  // Handle curriculum selection
  const handleCurriculumChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const curriculumId = e.target.value;
    setSelectedCurriculumId(curriculumId);
    if (curriculumId) {
      fetchTermDetails(curriculumId);
    } else {
      setTermDetails([]);
      setIsDataSaved(false);
      setProgramOwner(null);
      setApprovalStatus(null);
    }
  };


  // Add new row
  const handleAddRow = () => {
    const newSiNo = termDetails.length > 0 ? Math.max(...termDetails.map(t => t.si_no), 0) + 1 : 1;
    const newRow = {
      si_no: newSiNo,
      term_name: '',
      duration_weeks: 0,
      credits: 0,
      total_theory_courses: 0,
      total_practical_others: 0,
      academic_start_year: new Date().getFullYear(),
      academic_end_year: new Date().getFullYear() + 1,
      academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      isNew: true
    };
    setTermDetails(prev => [...prev, newRow]);
    setIsDataSaved(false); // Mark as unsaved when new row is added
  };

  // Remove row
  const handleRemoveRow = (index: number) => {
    if (termDetails.length > 1) {
      setTermDetails(prev => prev.filter((_, i) => i !== index));
      setIsDataSaved(false); // Mark as unsaved when row is removed
    }
  };

  // Handle input change
  const handleInputChange = (index: number, field: keyof TermDetail, value: string | number) => {
    setTermDetails(prev => prev.map((term, i) => {
      if (i === index) {
        const updatedTerm = { ...term, [field]: value, isNew: true };
        
        // Auto-calculate academic year when start or end year changes
        if (field === 'academic_start_year' || field === 'academic_end_year') {
          const startYear = field === 'academic_start_year' ? value : term.academic_start_year;
          const endYear = field === 'academic_end_year' ? value : term.academic_end_year;
          updatedTerm.academic_year = `${startYear}-${endYear}`;
        }
        
        return updatedTerm;
      }
      return term;
    }));
    setIsDataSaved(false); // Mark as unsaved when any input changes
  };

  // Handle term name dropdown change
  const handleTermNameChange = (index: number, value: string) => {
    setTermDetails(prev => prev.map((term, i) => {
      if (i === index) {
        return { ...term, term_name: value, isNew: true };
      }
      return term;
    }));
    setIsDataSaved(false); // Mark as unsaved when term name changes
  };

  // Save term details
  const handleSave = async () => {
    if (!selectedCurriculumId) {
      showMessage({ 
        type: 'warning', 
        title: 'Validation Error', 
        message: 'Please select a curriculum batch' 
      });
      return;
    }

    // Validate that at least one term has data
    const validTerms = termDetails.filter(term => 
      term.term_name && term.duration_weeks > 0 && term.credits > 0 && 
      term.total_theory_courses > 0 && term.total_practical_others > 0 &&
      term.academic_start_year > 0 && term.academic_end_year > 0
    );

    if (validTerms.length === 0) {
      showMessage({ 
        type: 'warning', 
        title: 'Validation Error', 
        message: 'Please fill in at least one term with all required fields (Term Name, Duration, Credits, Theory Courses, Practical/Others, Academic Years)' 
      });
      return;
    }

    try {
      setSubmitting(true);

      // Check if API is available
      if (!configAPI.termDetails || !configAPI.termDetails.createBulk) {
        showMessage({ 
          type: 'error', 
          title: 'Error', 
          message: 'Save functionality is not available. The backend service may not be running.' 
        });
        return;
      }

      // Prepare term details data
      const termDetailsData = validTerms.map(term => ({
        si_no: term.si_no,
        term_name: term.term_name,
        duration_weeks: term.duration_weeks,
        credits: term.credits,
        total_theory_courses: term.total_theory_courses,
        total_practical_others: term.total_practical_others,
        academic_start_year: term.academic_start_year,
        academic_end_year: term.academic_end_year,
        academic_year: term.academic_year
      }));

      // Save term details
      await configAPI.termDetails.createBulk({
        curriculum_regulation_id: parseInt(selectedCurriculumId),
        term_details: termDetailsData,
        created_by: 1 // TODO: Get actual user ID from context
      });

      showMessage({ 
        type: 'success', 
        title: 'Success', 
        message: 'Term details saved successfully' 
      });

      // Mark data as saved
      setIsDataSaved(true);

      // Refresh term details
      fetchTermDetails(selectedCurriculumId);
    } catch (error: any) {
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error saving term details. Please check your connection and try again.';
      showMessage({ 
        type: 'error', 
        title: 'Error', 
        message: errorMessage
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Send for approval
  const handleSendForApproval = async () => {
    if (!selectedCurriculumId) {
      showMessage({ 
        type: 'warning', 
        title: 'Validation Error', 
        message: 'Please select a curriculum batch' 
      });
      return;
    }

    // Check if there are any term details
    if (termDetails.length === 0) {
      showMessage({ 
        type: 'warning', 
        title: 'Validation Error', 
        message: 'Please add term details first before sending for approval' 
      });
      return;
    }

    // Check if data is saved
    if (!isDataSaved) {
      showMessage({ 
        type: 'warning', 
        title: 'Validation Error', 
        message: 'Please save the term details first before sending for approval' 
      });
      return;
    }

    try {
      setSubmitting(true);

      // Check if API is available
      if (!configAPI.termDetails || !configAPI.termDetails.submitForApproval) {
        showMessage({ 
          type: 'error', 
          title: 'Error', 
          message: 'Send for approval functionality is not available. The backend service may not be running.' 
        });
        return;
      }

      // Submit for approval
      await configAPI.termDetails.submitForApproval({
        curriculum_regulation_id: parseInt(selectedCurriculumId),
        submitted_by: 1, // TODO: Get actual user ID from context
        comments: 'Term details submitted for approval'
      });

      showMessage({ 
        type: 'success', 
        title: 'Success', 
        message: 'Term details sent for approval successfully' 
      });

      // Refresh term details
      fetchTermDetails(selectedCurriculumId);
    } catch (error: any) {
      
      
      // Handle already submitted case
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already been submitted')) {
        showMessage({ 
          type: 'warning', 
          title: 'Already Submitted', 
          message: error.response.data.message
        });
        // Refresh to get updated status
        fetchTermDetails(selectedCurriculumId);
      } else {
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Error sending for approval. Please check your connection and try again.';
        showMessage({ 
          type: 'error', 
          title: 'Error', 
          message: errorMessage
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate totals for the summary row
  const calculateTotals = () => {
    const totals = termDetails.reduce((acc, term) => {
      acc.credits += Number(term.credits) || 0;
      acc.totalTheoryCourses += Number(term.total_theory_courses) || 0;
      acc.totalPracticalOthers += Number(term.total_practical_others) || 0;
      return acc;
    }, { credits: 0, totalTheoryCourses: 0, totalPracticalOthers: 0 });
    
    return totals;
  };

  useEffect(() => {
    fetchCurriculumRegulations();
  }, [fetchCurriculumRegulations]);

  return (
    <div className="curriculum-term-details-page">
      <div className="curriculum-term-details-header">
        <h1 className="curriculum-term-details-title">Curriculum Term Details</h1>
        <p className="curriculum-term-details-subtitle">Manage term details for curriculum batches</p>
      </div>

      <div className="curriculum-term-details-content">
        {/* Curriculum Selection Filter */}
        <div className="filter-section">
          <div className="filter-card">
            <div className="filter-group">
              <label className="filter-label">CURRICULUM BATCH</label>
              <div className="business-form-input-wrapper">
                <select
                  className="filter-select"
                  value={selectedCurriculumId}
                  onChange={handleCurriculumChange}
                  disabled={loading}
                >
                  <option value="">Select curriculum batch...</option>
                  {curriculumRegulations.map((curriculum) => (
                    <option key={curriculum.id} value={curriculum.id.toString()}>
                      {curriculum.curriculum_batch} - {curriculum.program_name} ({curriculum.from_year}-{curriculum.to_year})
                    </option>
                  ))}
                </select>
                <div className="business-form-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Term Details Grid */}
        {selectedCurriculumId && (
          <div className="grid-container">
            <div className="grid-header">
              <div className="grid-title-section">
                {/* Always show program owner section for debugging */}
                <div className="program-owner-display" style={{backgroundColor: programOwner ? '#e0f2fe' : '#fef3c7', border: programOwner ? '1px solid #b3e5fc' : '1px solid #fbbf24'}}>
                  <div className="owner-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="owner-info">
                    <span className="owner-label">Program Owner:</span>
                    {programOwner ? (
                      <>
                        <span className="owner-name">{programOwner.name}</span>
                        {programOwner.email && (
                          <span className="owner-email">({programOwner.email})</span>
                        )}
                      </>
                    ) : (
                      <span className="owner-name" style={{color: '#d97706'}}>Not assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid-table-container">
              <table className="grid-table">
                <thead>
                  <tr>
                    <th>SI No.</th>
                    <th>Term Name*</th>
                    <th>Duration (Weeks)*</th>
                    <th>Credits</th>
                    <th>Total Theory Courses*</th>
                    <th>Total Practical / Others*</th>
                    <th>Academic Start Year*</th>
                    <th>Academic End Year*</th>
                    <th>Academic Year*</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {termDetails.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="grid-empty">
                        <div className="grid-empty-icon">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                        <p>No term details found. Select a curriculum batch to get started.</p>
                      </td>
                    </tr>
                  ) : (
                    termDetails.map((term, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="number"
                            value={term.si_no}
                            onChange={(e) => handleInputChange(index, 'si_no', parseInt(e.target.value) || 0)}
                            className="grid-input"
                            min="1"
                          />
                        </td>
                        <td>
                          <select
                            value={term.term_name}
                            onChange={(e) => handleTermNameChange(index, e.target.value)}
                            className="grid-input"
                          >
                            <option value="">Select Semester</option>
                            <option value="1 - Semester">1 - Semester</option>
                            <option value="2 - Semester">2 - Semester</option>
                            <option value="3 - Semester">3 - Semester</option>
                            <option value="4 - Semester">4 - Semester</option>
                            <option value="5 - Semester">5 - Semester</option>
                            <option value="6 - Semester">6 - Semester</option>
                            <option value="7 - Semester">7 - Semester</option>
                            <option value="8 - Semester">8 - Semester</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={term.duration_weeks}
                            onChange={(e) => handleInputChange(index, 'duration_weeks', parseInt(e.target.value) || 0)}
                            className="grid-input"
                            min="1"
                            max="52"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={term.credits}
                            onChange={(e) => handleInputChange(index, 'credits', parseInt(e.target.value) || 0)}
                            className="grid-input"
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={term.total_theory_courses}
                            onChange={(e) => handleInputChange(index, 'total_theory_courses', parseInt(e.target.value) || 0)}
                            className="grid-input"
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={term.total_practical_others}
                            onChange={(e) => handleInputChange(index, 'total_practical_others', parseInt(e.target.value) || 0)}
                            className="grid-input"
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={term.academic_start_year}
                            onChange={(e) => handleInputChange(index, 'academic_start_year', parseInt(e.target.value) || 0)}
                            className="grid-input"
                            min="2000"
                            max="2100"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={term.academic_end_year}
                            onChange={(e) => handleInputChange(index, 'academic_end_year', parseInt(e.target.value) || 0)}
                            className="grid-input"
                            min="2000"
                            max="2100"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={term.academic_year}
                            onChange={(e) => handleInputChange(index, 'academic_year', e.target.value)}
                            className="grid-input"
                            placeholder="e.g., 2024-2025"
                            readOnly
                          />
                        </td>
                        <td>
                          <div className="grid-action-btn-container">
                            <button
                              className="grid-action-btn add"
                              onClick={handleAddRow}
                              title="Add row"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            {termDetails.length > 1 && (
                              <button
                                className="grid-action-btn delete"
                                onClick={() => handleRemoveRow(index)}
                                title="Remove row"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  
                  {/* Total Row - only show if there are term details */}
                  {termDetails.length > 0 && (
                    <tr className="total-row">
                      <td>
                        <strong>Total</strong>
                      </td>
                      <td></td>
                      <td></td>
                      <td>
                        <span className="total-value-tag">{calculateTotals().credits}</span>
                      </td>
                      <td>
                        <span className="total-value-tag">{calculateTotals().totalTheoryCourses}</span>
                      </td>
                      <td>
                        <span className="total-value-tag">{calculateTotals().totalPracticalOthers}</span>
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Program Owner Note and Approval Status */}
            {(programOwner || approvalStatus) && (
              <div className="approval-info-section">
                {programOwner && (
                  <div className="program-owner-note">
                    <div className="note-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="note-content">
                      <strong>Approver:</strong> {programOwner.name}
                      {programOwner.email && <span className="email"> ({programOwner.email})</span>}
                    </div>
                  </div>
                )}
                
                {approvalStatus && (
                  <div className={`approval-status ${approvalStatus.toLowerCase()}`}>
                    <div className="status-icon">
                      {approvalStatus === 'Pending' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      )}
                      {approvalStatus === 'Approved' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      )}
                      {approvalStatus === 'Rejected' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      )}
                    </div>
                    <div className="status-text">
                      <strong>Status:</strong> {approvalStatus}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid-footer">
              <div className="grid-footer-actions">
                <button
                  className="grid-add-button save"
                  onClick={handleSave}
                  disabled={loading || submitting || termDetails.length === 0}
                >
                  {submitting ? (
                    <>
                      <div className="spinner"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 3V8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Save
                    </>
                  )}
                </button>
                <button
                  className="grid-add-button approve"
                  onClick={handleSendForApproval}
                  disabled={loading || submitting || termDetails.length === 0 || !isDataSaved}
                  title={!isDataSaved ? "Please save the data first" : programOwner ? `Approver: ${programOwner.name}` : "Send for Approval"}
                >
                  {submitting ? (
                    <>
                      <div className="spinner"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.9.37 4.13 1.02" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Send for Approval
                      {programOwner && (
                        <span className="approver-note">
                          (Approver: {programOwner.name})
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid-loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurriculumTermDetails; 
