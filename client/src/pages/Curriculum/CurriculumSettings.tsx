import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

interface CurriculumRegulation {
  id: number;
  batch_name: string;
  program_name: string;
  from_year: number;
  to_year: number;
  program_title: string;
  department_name: string;
}

interface Domain {
  id: number;
  domain_code: string;
  domain_name: string;
  domain_description: string;
  domain_type: string;
  credits: number;
  is_active: boolean;
}

interface DeliveryMethod {
  id: number;
  delivery_code: string;
  delivery_name: string;
  delivery_description: string;
  delivery_type: string;
  hours_per_week: number;
  is_active: boolean;
}

interface AssessmentMethod {
  id: number;
  assessment_code: string;
  assessment_name: string;
  assessment_description: string;
  assessment_type: string;
  weight_percentage: number;
  is_active: boolean;
}

interface Student {
  id: number;
  si_no: number;
  school: string;
  pnr_usn: string;
  title: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  college_email: string;
  contact_number: string;
  admission_status: string;
  registered_courses: string;
  is_active: boolean;
}

interface Section {
  id: number;
  section_name: string;
  curriculum_regulation_id: number;
}

interface CurriculumSettingsData {
  domains: Domain[];
  deliveryMethods: DeliveryMethod[];
  assessmentMethods: AssessmentMethod[];
}

const CurriculumSettings: React.FC = () => {
  
  // State
  const [curriculumRegulations, setCurriculumRegulations] = useState<CurriculumRegulation[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState<CurriculumSettingsData>({
    domains: [],
    deliveryMethods: [],
    assessmentMethods: []
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'domains' | 'delivery' | 'assessments' | 'students'>('domains');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Pagination for students
  const [pageSize, setPageSize] = useState(20);
  
  // Modal states
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form states
  const [domainForm, setDomainForm] = useState({
    domain_code: '',
    domain_name: '',
    domain_description: '',
    domain_type: 'Core',
    credits: 0
  });
  
  const [deliveryForm, setDeliveryForm] = useState({
    delivery_code: '',
    delivery_name: '',
    delivery_description: '',
    delivery_type: 'Instructional',
    hours_per_week: 0
  });
  
  const [assessmentForm, setAssessmentForm] = useState({
    assessment_code: '',
    assessment_name: '',
    assessment_description: '',
    assessment_type: 'Formative',
    weight_percentage: 0
  });

  // Fetch curriculum regulations
  const fetchCurriculumRegulations = useCallback(async () => {
    try {
      const response = await configAPI.curriculumSettings.getCurriculumRegulations();
      setCurriculumRegulations(response.data.data);
    } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to fetch curriculum regulations' });
    }
  }, []);

  // Fetch curriculum settings
  const fetchCurriculumSettings = useCallback(async (curriculumId: string) => {
    if (!curriculumId) return;

    setLoading(true);
    try {
      const response = await configAPI.curriculumSettings.getSettings(curriculumId);
      setSettings(response.data.data);
    } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to fetch curriculum settings' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch sections for selected curriculum
  const fetchSections = useCallback(async (curriculumId: string) => {
    if (!curriculumId) return;

    try {
      // Mock data for now - replace with actual API call
      const mockSections: Section[] = [
        { id: 1, section_name: 'A', curriculum_regulation_id: parseInt(curriculumId) },
        { id: 2, section_name: 'B', curriculum_regulation_id: parseInt(curriculumId) },
        { id: 3, section_name: 'C', curriculum_regulation_id: parseInt(curriculumId) }
      ];
      setSections(mockSections);
    } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to fetch sections' });
    }
  }, []);

  // Fetch students for selected curriculum and section
  const fetchStudents = useCallback(async (curriculumId: string, sectionId: string) => {
    if (!curriculumId || !sectionId) return;

    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockStudents: Student[] = [
        {
          id: 1,
          si_no: 1,
          school: 'CSE',
          pnr_usn: '2732131',
          title: 'Mr.',
          first_name: 'MANOHAR',
          middle_name: 'J',
          last_name: '',
          college_email: 'manohar.joshi@ionidea.com',
          contact_number: '',
          admission_status: 'Regular',
          registered_courses: 'View Courses',
          is_active: true
        },
        {
          id: 2,
          si_no: 2,
          school: 'CSE',
          pnr_usn: '2732132',
          title: 'Mr.',
          first_name: 'ADIHANT',
          middle_name: 'D',
          last_name: '',
          college_email: 'adihant.prasad@ionidea.com',
          contact_number: '',
          admission_status: 'Regular',
          registered_courses: 'View Courses',
          is_active: true
        }
      ];
      setStudents(mockStudents);
    } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to fetch students' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle curriculum selection
  const handleCurriculumChange = (curriculumId: string) => {
    setSelectedCurriculum(curriculumId);
    setSelectedSection('');
    setStudents([]);
    if (curriculumId) {
      fetchCurriculumSettings(curriculumId);
      if (viewMode === 'students') {
        fetchSections(curriculumId);
      }
    } else {
      setSettings({ domains: [], deliveryMethods: [], assessmentMethods: [] });
    }
  };

  // Handle section selection
  const handleSectionChange = (sectionId: string) => {
    setSelectedSection(sectionId);
    if (selectedCurriculum && sectionId) {
      fetchStudents(selectedCurriculum, sectionId);
    } else {
      setStudents([]);
    }
  };

  // Student handlers
  const handleBulkImport = () => {
    // TODO: Implement bulk import functionality
    setMessage({ type: 'success', text: 'Bulk import functionality will be implemented' });
  };

  const handleAddStudent = () => {
    // TODO: Implement add student functionality
    setMessage({ type: 'success', text: 'Add student functionality will be implemented' });
  };

  const handleImportFromOtherCurriculum = () => {
    // TODO: Implement import from other curriculum functionality
    setMessage({ type: 'success', text: 'Import from other curriculum functionality will be implemented' });
  };

  const handleEditStudent = (student: Student) => {
    // TODO: Implement edit student functionality
    setMessage({ type: 'success', text: 'Edit student functionality will be implemented' });
  };

  const handleViewStudent = (student: Student) => {
    // TODO: Implement view student functionality
    setMessage({ type: 'success', text: 'View student functionality will be implemented' });
  };

  const handleDeleteStudent = (student: Student) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      // TODO: Implement delete student functionality
      setMessage({ type: 'success', text: 'Delete student functionality will be implemented' });
    }
  };

  const handleViewCourses = (student: Student) => {
    // TODO: Implement view courses functionality
    setMessage({ type: 'success', text: 'View courses functionality will be implemented' });
  };

  // Domain handlers
  const handleAddDomain = () => {
    setEditingItem(null);
    setDomainForm({
      domain_code: '',
      domain_name: '',
      domain_description: '',
      domain_type: 'Core',
      credits: 0
    });
    setShowDomainModal(true);
  };

  const handleEditDomain = (domain: Domain) => {
    setEditingItem(domain);
    setDomainForm({
      domain_code: domain.domain_code,
      domain_name: domain.domain_name,
      domain_description: domain.domain_description,
      domain_type: domain.domain_type,
      credits: domain.credits
    });
    setShowDomainModal(true);
  };

  const handleDeleteDomain = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this domain?')) {
      try {
        await configAPI.curriculumSettings.deleteDomain(id.toString());
        setMessage({ type: 'success', text: 'Domain deleted successfully' });
        if (selectedCurriculum) {
          fetchCurriculumSettings(selectedCurriculum);
        }
      } catch (error: any) {
        
      setMessage({ type: 'error', text: 'Failed to delete domain' });
      }
    }
  };

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCurriculum) {
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...domainForm,
        curriculum_regulation_id: parseInt(selectedCurriculum)
      };

      if (editingItem) {
        await configAPI.curriculumSettings.updateDomain(editingItem.id.toString(), data);
        setMessage({ type: 'success', text: 'Domain updated successfully' });
      } else {
        await configAPI.curriculumSettings.createDomain(data);
        setMessage({ type: 'success', text: 'Domain added successfully' });
      }

      setShowDomainModal(false);
      setEditingItem(null);
      setDomainForm({
        domain_code: '',
        domain_name: '',
        domain_description: '',
        domain_type: 'Core',
        credits: 0
      });
      if (selectedCurriculum) {
        fetchCurriculumSettings(selectedCurriculum);
      }
    } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to save domain' });
    } finally {
      setSaving(false);
    }
  };

  // Delivery method handlers
  const handleAddDeliveryMethod = () => {
    setEditingItem(null);
    setDeliveryForm({
      delivery_code: '',
      delivery_name: '',
      delivery_description: '',
      delivery_type: 'Instructional',
      hours_per_week: 0
    });
    setShowDeliveryModal(true);
  };

  const handleEditDeliveryMethod = (method: DeliveryMethod) => {
    setEditingItem(method);
    setDeliveryForm({
      delivery_code: method.delivery_code,
      delivery_name: method.delivery_name,
      delivery_description: method.delivery_description,
      delivery_type: method.delivery_type,
      hours_per_week: method.hours_per_week
    });
    setShowDeliveryModal(true);
  };

  const handleDeleteDeliveryMethod = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this delivery method?')) {
      try {
        await configAPI.curriculumSettings.deleteDeliveryMethod(id.toString());
        setMessage({ type: 'success', text: 'Delivery method deleted successfully' });
        if (selectedCurriculum) {
          fetchCurriculumSettings(selectedCurriculum);
        }
      } catch (error: any) {
        
      setMessage({ type: 'error', text: 'Failed to delete delivery method' });
      }
    }
  };

  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCurriculum) return;

    setSaving(true);
    try {
      const data = {
        ...deliveryForm,
        curriculum_regulation_id: parseInt(selectedCurriculum)
      };

      if (editingItem) {
        await configAPI.curriculumSettings.updateDeliveryMethod(editingItem.id.toString(), data);
        setMessage({ type: 'success', text: 'Delivery method updated successfully' });
      } else {
        await configAPI.curriculumSettings.createDeliveryMethod(data);
        setMessage({ type: 'success', text: 'Delivery method added successfully' });
      }

      setShowDeliveryModal(false);
      setEditingItem(null);
      setDeliveryForm({
        delivery_code: '',
        delivery_name: '',
        delivery_description: '',
        delivery_type: 'Instructional',
        hours_per_week: 0
      });
      if (selectedCurriculum) {
        fetchCurriculumSettings(selectedCurriculum);
      }
    } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to save delivery method' });
    } finally {
      setSaving(false);
    }
  };

  // Assessment method handlers
  const handleAddAssessmentMethod = () => {
    setEditingItem(null);
    setAssessmentForm({
      assessment_code: '',
      assessment_name: '',
      assessment_description: '',
      assessment_type: 'Formative',
      weight_percentage: 0
    });
    setShowAssessmentModal(true);
  };

  const handleEditAssessmentMethod = (method: AssessmentMethod) => {
    setEditingItem(method);
    setAssessmentForm({
      assessment_code: method.assessment_code,
      assessment_name: method.assessment_name,
      assessment_description: method.assessment_description,
      assessment_type: method.assessment_type,
      weight_percentage: method.weight_percentage
    });
    setShowAssessmentModal(true);
  };

  const handleDeleteAssessmentMethod = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this assessment method?')) {
      try {
        await configAPI.curriculumSettings.deleteAssessmentMethod(id.toString());
        setMessage({ type: 'success', text: 'Assessment method deleted successfully' });
        if (selectedCurriculum) {
          fetchCurriculumSettings(selectedCurriculum);
        }
      } catch (error: any) {
        
      setMessage({ type: 'error', text: 'Failed to delete assessment method' });
      }
    }
  };

  const handleAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCurriculum) return;

    setSaving(true);
    try {
      const data = {
        ...assessmentForm,
        curriculum_regulation_id: parseInt(selectedCurriculum)
      };

      if (editingItem) {
        await configAPI.curriculumSettings.updateAssessmentMethod(editingItem.id.toString(), data);
        setMessage({ type: 'success', text: 'Assessment method updated successfully' });
      } else {
        await configAPI.curriculumSettings.createAssessmentMethod(data);
        setMessage({ type: 'success', text: 'Assessment method added successfully' });
      }

      setShowAssessmentModal(false);
      setEditingItem(null);
      setAssessmentForm({
        assessment_code: '',
        assessment_name: '',
        assessment_description: '',
        assessment_type: 'Formative',
        weight_percentage: 0
      });
      if (selectedCurriculum) {
        fetchCurriculumSettings(selectedCurriculum);
      }
    } catch (error: any) {
      
      setMessage({ type: 'error', text: 'Failed to save assessment method' });
    } finally {
      setSaving(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchCurriculumRegulations();
  }, [fetchCurriculumRegulations]);

  // Add modal-open class to body when modal is open
  useEffect(() => {
    if (showDomainModal || showDeliveryModal || showAssessmentModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showDomainModal, showDeliveryModal, showAssessmentModal]);

  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Curriculum Settings</h1>
        <p>Manage domains, delivery methods, and assessment methods for curriculum batches</p>
      </div>

      {/* Navigation Tabs */}
      <div className="business-navigation-tabs">
        <button
          className={`business-nav-tab ${viewMode === 'domains' ? 'business-nav-tab-active' : 'business-nav-tab-inactive'}`}
          onClick={() => setViewMode('domains')}
        >
          Domains
        </button>
        <button
          className={`business-nav-tab ${viewMode === 'delivery' ? 'business-nav-tab-active' : 'business-nav-tab-inactive'}`}
          onClick={() => setViewMode('delivery')}
        >
          Delivery Methods
        </button>
        <button
          className={`business-nav-tab ${viewMode === 'assessments' ? 'business-nav-tab-active' : 'business-nav-tab-inactive'}`}
          onClick={() => setViewMode('assessments')}
        >
          Assessment Methods
        </button>
        <button
          className={`business-nav-tab ${viewMode === 'students' ? 'business-nav-tab-active' : 'business-nav-tab-inactive'}`}
          onClick={() => {
            setViewMode('students');
            if (selectedCurriculum) {
              fetchSections(selectedCurriculum);
            }
          }}
        >
          Import Student Details
        </button>
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
            <div className="business-alert-text">
              {message.text}
            </div>
            <button
              className="business-alert-close"
              onClick={() => setMessage(null)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" >
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Curriculum Selection Header */}
      <div className="curriculum-selection-header">
        <div className="curriculum-selection-container">
          <div className="curriculum-batch-dropdown">
            <label htmlFor="curriculum-select" className="business-form-label">
              Curriculum Batch
            </label>
            <div className="business-form-input-wrapper">
              <select
                id="curriculum-select"
                value={selectedCurriculum}
                onChange={(e) => handleCurriculumChange(e.target.value)}
                className="business-form-input"
              >
                <option value="">Select a curriculum batch...</option>
                {curriculumRegulations.map((curriculum) => (
                  <option key={curriculum.id} value={curriculum.id.toString()}>
                    {curriculum.batch_name} - {curriculum.program_title} ({curriculum.from_year}-{curriculum.to_year})
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
          
          {/* Section Selection - Only show for students tab */}
          {viewMode === 'students' && selectedCurriculum && (
            <div className="section-dropdown">
              <label htmlFor="section-select" className="business-form-label">
                Section: <span className="required-asterisk">*</span>
              </label>
              <div className="business-form-input-wrapper">
                <select
                  id="section-select"
                  value={selectedSection}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  className="business-form-input"
                >
                  <option value="">Select a section...</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id.toString()}>
                      {section.section_name}
                    </option>
                  ))}
                </select>
                <div className="business-form-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid-container">
        {/* Grid Header - Only show when curriculum is selected */}
        {selectedCurriculum && (
          <div className="grid-header">
            <div className="grid-header-actions">
              <button
                className="grid-add-button"
                onClick={viewMode === 'domains' ? handleAddDomain : viewMode === 'delivery' ? handleAddDeliveryMethod : handleAddAssessmentMethod}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/>
                  <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Add {viewMode === 'domains' ? 'Domain' : viewMode === 'delivery' ? 'Delivery Method' : 'Assessment Method'}
              </button>
            </div>
            <div className="grid-header-spacer"></div>
            <div className="grid-search">
              <div className="grid-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <input
                type="text"
                className="grid-search-input"
                placeholder={`Search ${viewMode === 'domains' ? 'Domains' : viewMode === 'delivery' ? 'Delivery Methods' : 'Assessment Methods'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Grid Content */}
        {selectedCurriculum ? (
          <>
            {/* Student Details Tab */}
            {viewMode === 'students' ? (
              <>
                {/* Student Actions Header */}
                {selectedSection && (
                  <div className="student-actions-header">
                    <div className="student-actions-left">
                      <button className="student-action-btn bulk-import" onClick={handleBulkImport}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="16,2 16,8 22,8" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Bulk Import
                      </button>
                      <button className="student-action-btn add" onClick={handleAddStudent}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/>
                          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Add
                      </button>
                      <button className="student-action-btn import-other" onClick={handleImportFromOtherCurriculum}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
                          <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Import from Other Curriculum
                      </button>
                    </div>
                  </div>
                )}

                {/* Pagination and Search */}
                {selectedSection && (
                  <div className="student-controls">
                    <div className="pagination-controls">
                      <span>Show</span>
                      <select 
                        value={pageSize} 
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="page-size-select"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span>entries</span>
                    </div>
                    <div className="search-controls">
                      <label>Search:</label>
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Students Table */}
                {selectedSection ? (
                  loading ? (
                    <div className="grid-loading">
                      <div className="grid-loading-icon">⏳</div>
                      <p>Loading students...</p>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="grid-empty">
                      <div className="grid-empty-icon">👥</div>
                      <p>No students found for this section</p>
                      <p>Start by adding students or importing from another curriculum</p>
                    </div>
                  ) : (
                    <div className="students-table-wrapper">
                      <table className="students-table">
                        <thead>
                          <tr>
                            <th>
                              <input type="checkbox" />
                            </th>
                            <th>
                              SI No.
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="2"/>
                                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </th>
                            <th>School</th>
                            <th>PNR/USN</th>
                            <th>Title</th>
                            <th>First Name</th>
                            <th>Middle Name</th>
                            <th>Last Name</th>
                            <th>College Email</th>
                            <th>Contact Number</th>
                            <th>Admission Status</th>
                            <th>Registered Courses</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student) => (
                            <tr key={student.id}>
                              <td>
                                <input type="checkbox" />
                              </td>
                              <td>{student.si_no}</td>
                              <td>{student.school}</td>
                              <td>{student.pnr_usn}</td>
                              <td>{student.title}</td>
                              <td>{student.first_name}</td>
                              <td>{student.middle_name}</td>
                              <td>{student.last_name}</td>
                              <td>{student.college_email}</td>
                              <td>{student.contact_number || '-'}</td>
                              <td>
                                <span className="status-badge regular">{student.admission_status}</span>
                              </td>
                              <td>
                                <button 
                                  className="view-courses-btn"
                                  onClick={() => handleViewCourses(student)}
                                >
                                  View Courses
                                </button>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button 
                                    className="action-btn edit"
                                    onClick={() => handleEditStudent(student)}
                                    title="Edit"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                  </button>
                                  <button 
                                    className="action-btn view"
                                    onClick={() => handleViewStudent(student)}
                                    title="View"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                  </button>
                                  <button 
                                    className="action-btn delete"
                                    onClick={() => handleDeleteStudent(student)}
                                    title="Delete"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                      <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  <div className="grid-empty">
                    <div className="grid-empty-icon">📚</div>
                    <p>Please select a section to view students</p>
                  </div>
                )}
              </>
            ) : (
              /* Existing domains, delivery, and assessment content */
              <>
                {loading ? (
                  <div className="grid-loading">
                    <div className="grid-loading-icon">⏳</div>
                    <p>Loading {viewMode === 'domains' ? 'Domains' : viewMode === 'delivery' ? 'Delivery Methods' : 'Assessment Methods'}...</p>
                  </div>
                ) : (viewMode === 'domains' ? settings.domains.length === 0 : viewMode === 'delivery' ? settings.deliveryMethods.length === 0 : settings.assessmentMethods.length === 0) ? (
                  <div className="grid-empty">
                    <div className="grid-empty-icon">🎯</div>
                    <p>No {viewMode === 'domains' ? 'Domains' : viewMode === 'delivery' ? 'Delivery Methods' : 'Assessment Methods'} found</p>
                    <p>Start by adding your first {viewMode === 'domains' ? 'domain' : viewMode === 'delivery' ? 'delivery method' : 'assessment method'} for this curriculum</p>
                  </div>
                ) : (
                  <div className="grid-table-wrapper">
                    <table className="grid-table">
                      <thead>
                        <tr>
                          {viewMode === 'domains' && (
                        <>
                          <th>Domain Code</th>
                          <th>Domain Name</th>
                          <th>Type</th>
                          <th>Credits</th>
                          <th>Description</th>
                        </>
                      )}
                      {viewMode === 'delivery' && (
                        <>
                          <th>Method Code</th>
                          <th>Method Name</th>
                          <th>Type</th>
                          <th>Hours/Week</th>
                          <th>Description</th>
                        </>
                      )}
                      {viewMode === 'assessments' && (
                        <>
                          <th>Assessment Code</th>
                          <th>Assessment Name</th>
                          <th>Type</th>
                          <th>Weight %</th>
                          <th>Description</th>
                        </>
                      )}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewMode === 'domains' && settings.domains.map((domain) => (
                      <tr key={domain.id}>
                        <td><span className="grid-status active">{domain.domain_code}</span></td>
                        <td>{domain.domain_name}</td>
                        <td><span className="grid-status active">{domain.domain_type}</span></td>
                        <td>{domain.credits}</td>
                        <td>{domain.domain_description || '-'}</td>
                        <td>
                          <div className="grid-action-btn-container">
                            <button className="grid-action-btn edit" onClick={() => handleEditDomain(domain)} title="Edit">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </button>
                            <button className="grid-action-btn delete" onClick={() => handleDeleteDomain(domain.id)} title="Delete">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {viewMode === 'delivery' && settings.deliveryMethods.map((method) => (
                      <tr key={method.id}>
                        <td><span className="grid-status active">{method.delivery_code}</span></td>
                        <td>{method.delivery_name}</td>
                        <td><span className="grid-status active">{method.delivery_type}</span></td>
                        <td>{method.hours_per_week}</td>
                        <td>{method.delivery_description || '-'}</td>
                        <td>
                          <div className="grid-action-btn-container">
                            <button className="grid-action-btn edit" onClick={() => handleEditDeliveryMethod(method)} title="Edit">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </button>
                            <button className="grid-action-btn delete" onClick={() => handleDeleteDeliveryMethod(method.id)} title="Delete">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {viewMode === 'assessments' && settings.assessmentMethods.map((method) => (
                      <tr key={method.id}>
                        <td><span className="grid-status active">{method.assessment_code}</span></td>
                        <td>{method.assessment_name}</td>
                        <td><span className="grid-status active">{method.assessment_type}</span></td>
                        <td>{method.weight_percentage}%</td>
                        <td>{method.assessment_description || '-'}</td>
                        <td>
                          <div className="grid-action-btn-container">
                            <button className="grid-action-btn edit" onClick={() => handleEditAssessmentMethod(method)} title="Edit">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </button>
                            <button className="grid-action-btn delete" onClick={() => handleDeleteAssessmentMethod(method.id)} title="Delete">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
              </>
            )}
          </>
        ) : (
          <div className="grid-empty">
            <div className="grid-empty-icon">📚</div>
            <p>Select a Curriculum Batch</p>
            <p>Please select a curriculum batch from the dropdown above to view and manage settings</p>
          </div>
        )}
      </div>

      {/* Domain Modal */}
      {showDomainModal && createPortal(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Domain' : 'Add New Domain'}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowDomainModal(false);
                  setEditingItem(null);
                  setDomainForm({
                    domain_code: '',
                    domain_name: '',
                    domain_description: '',
                    domain_type: 'Core',
                    credits: 0
                  });
                }}
                title="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleDomainSubmit} className="business-form">
                <div className="business-form-grid">
                  <div className="business-form-group">
                    <label htmlFor="domain_code" className="business-form-label">
                      Domain Code
                    </label>
                    <div className="business-form-input-wrapper">
                      <input
                        type="text"
                        id="domain_code"
                        name="domain_code"
                        className="business-form-input"
                        value={domainForm.domain_code}
                        onChange={(e) => setDomainForm({ ...domainForm, domain_code: e.target.value })}
                        required
                        placeholder="Enter domain code"
                      />
                      <div className="business-form-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="business-form-group">
                    <label htmlFor="domain_name" className="business-form-label">
                      Domain Name
                    </label>
                    <div className="business-form-input-wrapper">
                      <input
                        type="text"
                        id="domain_name"
                        name="domain_name"
                        className="business-form-input"
                        value={domainForm.domain_name}
                        onChange={(e) => setDomainForm({ ...domainForm, domain_name: e.target.value })}
                        required
                        placeholder="Enter domain name"
                      />
                      <div className="business-form-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="business-form-group">
                    <label htmlFor="domain_type" className="business-form-label">Domain Type</label>
                    <div className="business-form-input-wrapper">
                      <select
                        id="domain_type"
                        name="domain_type"
                        className="business-form-input"
                        value={domainForm.domain_type}
                        onChange={(e) => setDomainForm({ ...domainForm, domain_type: e.target.value })}
                      >
                        <option value="Core">Core</option>
                        <option value="Elective">Elective</option>
                        <option value="General">General</option>
                        <option value="Professional">Professional</option>
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
                  <div className="business-form-group">
                    <label htmlFor="credits" className="business-form-label">Credits</label>
                    <div className="business-form-input-wrapper">
                      <input
                        type="number"
                        id="credits"
                        name="credits"
                        className="business-form-input"
                        value={domainForm.credits}
                        onChange={(e) => setDomainForm({ ...domainForm, credits: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="20"
                        placeholder="Enter credits"
                      />
                      <div className="business-form-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="business-form-group">
                  <label htmlFor="domain_description" className="business-form-label">Description</label>
                  <div className="business-form-input-wrapper">
                    <textarea
                      id="domain_description"
                      name="domain_description"
                      className="business-form-input"
                      value={domainForm.domain_description}
                      onChange={(e) => setDomainForm({ ...domainForm, domain_description: e.target.value })}
                      rows={3}
                      placeholder="Enter domain description..."
                    />
                    <div className="business-form-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="business-btn business-btn-secondary"
                onClick={() => {
                  setShowDomainModal(false);
                  setEditingItem(null);
                  setDomainForm({
                    domain_code: '',
                    domain_name: '',
                    domain_description: '',
                    domain_type: 'Core',
                    credits: 0
                  });
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="business-btn business-btn-primary"
                disabled={saving}
                onClick={handleDomainSubmit}
              >
                {saving ? (
                  'Saving...'
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 3V8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {editingItem ? 'Update Domain' : 'Add Domain'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delivery Method Modal */}
      {showDeliveryModal && createPortal(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Delivery Method' : 'Add New Delivery Method'}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowDeliveryModal(false);
                  setEditingItem(null);
                  setDeliveryForm({
                    delivery_code: '',
                    delivery_name: '',
                    delivery_description: '',
                    delivery_type: 'Instructional',
                    hours_per_week: 0
                  });
                }}
                title="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleDeliverySubmit} className="business-form">
                <div className="business-form-grid">
                  <div className="business-form-group">
                    <label htmlFor="delivery_code" className="business-form-label">
                      Delivery Code
                    </label>
                    <div className="business-form-input-wrapper">
                      <input
                        type="text"
                        id="delivery_code"
                        name="delivery_code"
                        className="business-form-input"
                        value={deliveryForm.delivery_code}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, delivery_code: e.target.value })}
                        required
                        placeholder="Enter delivery code"
                      />
                      <div className="business-form-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="business-form-group">
                    <label htmlFor="delivery_name" className="business-form-label">
                      Delivery Name
                    </label>
                    <div className="business-form-input-wrapper">
                      <input
                        type="text"
                        id="delivery_name"
                        name="delivery_name"
                        className="business-form-input"
                        value={deliveryForm.delivery_name}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, delivery_name: e.target.value })}
                        required
                        placeholder="Enter delivery name"
                      />
                      <div className="business-form-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="business-form-group">
                    <label htmlFor="delivery_type" className="business-form-label">Delivery Type</label>
                    <div className="business-form-input-wrapper">
                      <select
                        id="delivery_type"
                        name="delivery_type"
                        className="business-form-input"
                        value={deliveryForm.delivery_type}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, delivery_type: e.target.value })}
                      >
                        <option value="Instructional">Instructional</option>
                        <option value="Practical">Practical</option>
                        <option value="Interactive">Interactive</option>
                        <option value="Digital">Digital</option>
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
                  <div className="business-form-group">
                    <label htmlFor="hours_per_week" className="business-form-label">Hours per Week</label>
                    <div className="business-form-input-wrapper">
                      <input
                        type="number"
                        id="hours_per_week"
                        name="hours_per_week"
                        className="business-form-input"
                        value={deliveryForm.hours_per_week}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, hours_per_week: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="40"
                        placeholder="Enter hours per week"
                      />
                      <div className="business-form-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="business-form-group">
                  <label htmlFor="delivery_description" className="business-form-label">Description</label>
                  <div className="business-form-input-wrapper">
                    <textarea
                      id="delivery_description"
                      name="delivery_description"
                      className="business-form-input"
                      value={deliveryForm.delivery_description}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, delivery_description: e.target.value })}
                      rows={3}
                      placeholder="Enter delivery method description..."
                    />
                    <div className="business-form-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="business-btn business-btn-secondary"
                onClick={() => {
                  setShowDeliveryModal(false);
                  setEditingItem(null);
                  setDeliveryForm({
                    delivery_code: '',
                    delivery_name: '',
                    delivery_description: '',
                    delivery_type: 'Instructional',
                    hours_per_week: 0
                  });
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="business-btn business-btn-primary"
                disabled={saving}
                onClick={handleDeliverySubmit}
              >
                {saving ? (
                  'Saving...'
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 3V8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {editingItem ? 'Update Delivery Method' : 'Add Delivery Method'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Assessment Method Modal */}
      {showAssessmentModal && createPortal(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Assessment Method' : 'Add New Assessment Method'}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowAssessmentModal(false);
                  setEditingItem(null);
                  setAssessmentForm({
                    assessment_code: '',
                    assessment_name: '',
                    assessment_description: '',
                    assessment_type: 'Formative',
                    weight_percentage: 0
                  });
                }}
                title="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleAssessmentSubmit} className="business-form">
                <div className="business-form-grid">
                  <div className="business-form-group">
                    <label htmlFor="assessment_code" className="business-form-label">
                      Assessment Code
                    </label>
                    <div className="business-form-input-wrapper">
                      <input
                        type="text"
                        id="assessment_code"
                        name="assessment_code"
                        className="business-form-input"
                        value={assessmentForm.assessment_code}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, assessment_code: e.target.value })}
                        required
                        placeholder="Enter assessment code"
                      />
                      <div className="business-form-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="business-form-group">
                    <label htmlFor="assessment_name" className="business-form-label">
                      Assessment Name
                    </label>
                    <div className="business-form-input-wrapper">
                      <input
                        type="text"
                        id="assessment_name"
                        name="assessment_name"
                        className="business-form-input"
                        value={assessmentForm.assessment_name}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, assessment_name: e.target.value })}
                        required
                        placeholder="Enter assessment name"
                      />
                      <div className="business-form-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="business-form-group">
                    <label htmlFor="assessment_type" className="business-form-label">Assessment Type</label>
                    <div className="business-form-input-wrapper">
                      <select
                        id="assessment_type"
                        name="assessment_type"
                        className="business-form-input"
                        value={assessmentForm.assessment_type}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, assessment_type: e.target.value })}
                      >
                        <option value="Formative">Formative</option>
                        <option value="Summative">Summative</option>
                        <option value="Practical">Practical</option>
                        <option value="Interactive">Interactive</option>
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
                  <div className="business-form-group">
                    <label htmlFor="weight_percentage" className="business-form-label">Weight Percentage</label>
                    <div className="business-form-input-wrapper">
                      <input
                        type="number"
                        id="weight_percentage"
                        name="weight_percentage"
                        className="business-form-input"
                        value={assessmentForm.weight_percentage}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, weight_percentage: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        placeholder="Enter weight percentage"
                      />
                      <div className="business-form-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="business-form-group">
                  <label htmlFor="assessment_description" className="business-form-label">Description</label>
                  <div className="business-form-input-wrapper">
                    <textarea
                      id="assessment_description"
                      name="assessment_description"
                      className="business-form-input"
                      value={assessmentForm.assessment_description}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, assessment_description: e.target.value })}
                      rows={3}
                      placeholder="Enter assessment method description..."
                    />
                    <div className="business-form-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="business-btn business-btn-secondary"
                onClick={() => {
                  setShowAssessmentModal(false);
                  setEditingItem(null);
                  setAssessmentForm({
                    assessment_code: '',
                    assessment_name: '',
                    assessment_description: '',
                    assessment_type: 'Formative',
                    weight_percentage: 0
                  });
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="business-btn business-btn-primary"
                disabled={saving}
                onClick={handleAssessmentSubmit}
              >
                {saving ? (
                  'Saving...'
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 3V8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {editingItem ? 'Update Assessment Method' : 'Add Assessment Method'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CurriculumSettings;
