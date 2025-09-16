import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import Grid from '../../components/Grid/Grid';
import UnifiedValidationPopup from '../../components/UnifiedValidationPopup';
import { useUnifiedValidation, commonValidationRules } from '../../hooks/useUnifiedValidation';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';
import '../../styles/components/SharedModal.css';
import '../../styles/components/UnifiedValidationPopup.css';
import '../../styles/components/BookChapterModal.css';

interface FacultyWorkloadData {
  id?: number;
  department_id: number;
  department_name?: string; // For display purposes
  curriculum_regulation_id: number;
  academic_year?: string; // For display purposes (formatted from curriculum batch)
  program_type_id: number;
  program_type_name?: string; // For display purposes
  program_id: number;
  program_name?: string; // For display purposes
  programCategory: string;
  workType: string;
  workloadDistribution: string;
  workloadPercentage: number;
  workloadHours: number;
  created_at?: string;
  updated_at?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface FacultyWorkloadAPIResponse {
  id: number;
  department_id: number;
  department_name: string;
  curriculum_regulation_id: number;
  curriculum_batch: string;
  from_year: number;
  to_year: number;
  program_type_id: number;
  program_type_name: string;
  program_id: number;
  program_name: string;
  program_category: string;
  work_type: string;
  workload_distribution: string;
  workload_percentage: string;
  workload_hours: number;
  created_at: string;
  updated_at: string;
}

const FacultyWorkload: React.FC = () => {
  const [data, setData] = useState<FacultyWorkloadData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAccordion, setShowAccordion] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  const [formData, setFormData] = useState<FacultyWorkloadData>({
    department_id: 0,
    department_name: '',
    curriculum_regulation_id: 0,
    academic_year: '',
    program_type_id: 0,
    program_type_name: '',
    program_id: 0,
    program_name: '',
    programCategory: '',
    workType: '',
    workloadDistribution: '',
    workloadPercentage: 0,
    workloadHours: 0
  });

  const [departments, setDepartments] = useState<{id: number, department_name: string}[]>([]);
  const [programs, setPrograms] = useState<{id: number, title: string}[]>([]);
  const [programTypes, setProgramTypes] = useState<{id: number, program_name: string}[]>([]);
  const [curriculumRegulations, setCurriculumRegulations] = useState<{id: number, curriculum_batch: string, from_year: number, to_year: number, program_name: string, department_name: string}[]>([]);

  // Use unified validation hook
  const {
    validationErrors,
    message,
    setMessage,
    validateForm: validateFormUnified,
    clearFieldError,
    clearAllErrors,
    showSuccessPopup,
    getFieldClassName
  } = useUnifiedValidation();

  // Grid columns configuration
  const gridColumns = [
    { key: 'department_name', title: 'Department', width: '18%' },
    { key: 'academic_year', title: 'Academic Year', width: '12%' },
    { key: 'program_type_name', title: 'Program Type', width: '12%' },
    { key: 'program_name', title: 'Program', width: '23%' },
    { key: 'workType', title: 'Work Type', width: '12%' },
    { key: 'workloadPercentage', title: 'Workload(%)', width: '12%' },
    { key: 'workloadHours', title: 'Workload(Hrs)', width: '11%' }
  ];

  // Utility functions
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Sample data
  const sampleData: FacultyWorkloadData[] = [
    {
      id: 1,
      department_id: 1,
      department_name: 'Computer Science & Engineering',
      curriculum_regulation_id: 1,
      academic_year: '2018-2019',
      program_type_id: 1,
      program_type_name: 'Undergraduate',
      program_id: 1,
      program_name: 'Bachelor of Engineering in Computer Science',
      programCategory: 'Other Program',
      workType: 'Theory teaching',
      workloadDistribution: '2 - Semester',
      workloadPercentage: 20.00,
      workloadHours: 0
    },
    {
      id: 2,
      department_id: 2,
      department_name: 'Aeronautical Engineering',
      curriculum_regulation_id: 2,
      academic_year: '2019-2020',
      program_type_id: 1,
      program_type_name: 'Undergraduate',
      program_id: 2,
      program_name: 'Bachelor of Engineering in Aeronautical Engineering',
      programCategory: 'Core Program',
      workType: 'Practical teaching',
      workloadDistribution: '1 - Semester',
      workloadPercentage: 15.50,
      workloadHours: 120
    },
    {
      id: 3,
      department_id: 3,
      department_name: 'Mechanical Engineering',
      curriculum_regulation_id: 3,
      academic_year: '2020-2021',
      program_type_id: 2,
      program_type_name: 'Postgraduate',
      program_id: 3,
      program_name: 'Master of Technology in Mechanical Engineering',
      programCategory: 'Research Program',
      workType: 'Research',
      workloadDistribution: '3 - Semester',
      workloadPercentage: 25.00,
      workloadHours: 200
    }
  ];

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await configAPI.departments.getAllSimple();
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setDepartments([]);
    }
  };

  // Fetch programs
  const fetchPrograms = async () => {
    try {
      const response = await configAPI.programs.getAllSimple();
      setPrograms(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
      setPrograms([]);
    }
  };

  // Fetch program types
  const fetchProgramTypes = async () => {
    try {
      const response = await configAPI.programTypes.getAllSimple();
      setProgramTypes(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch program types:', error);
      setProgramTypes([]);
    }
  };

  // Fetch curriculum regulations
  const fetchCurriculumRegulations = async () => {
    try {
      const response = await configAPI.curriculumRegulations.getAllSimple();
      setCurriculumRegulations(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch curriculum regulations:', error);
      setCurriculumRegulations([]);
    }
  };

  // Fetch data
  const fetchData = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await configAPI.facultyWorkload.getAll({
        page,
        limit: 10,
        search
      });
      
      const workloadData = response.data.data.map((item: FacultyWorkloadAPIResponse) => ({
        id: item.id,
        department_id: item.department_id,
        department_name: item.department_name,
        curriculum_regulation_id: item.curriculum_regulation_id,
        academic_year: item.from_year && item.to_year ? `${item.from_year}-${item.to_year}` : '',
        program_type_id: item.program_type_id,
        program_type_name: item.program_type_name,
        program_id: item.program_id,
        program_name: item.program_name,
        programCategory: item.program_category,
        workType: item.work_type,
        workloadDistribution: item.workload_distribution,
        workloadPercentage: parseFloat(item.workload_percentage),
        workloadHours: item.workload_hours || 0,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setData(workloadData);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch faculty workload data:', error);
      setMessage({ type: 'error', text: 'Failed to fetch faculty workload data' });
      setLoading(false);
    }
  };

  // Define validation rules
  const validationRules = {
    department_id: [commonValidationRules.required('Department is required')],
    curriculum_regulation_id: [commonValidationRules.required('Academic year is required')],
    program_type_id: [commonValidationRules.required('Program type is required')],
    program_id: [commonValidationRules.required('Program is required')],
    programCategory: [commonValidationRules.required('Program category is required')],
    workType: [commonValidationRules.required('Work type is required')],
    workloadDistribution: [commonValidationRules.required('Workload distribution is required')],
    workloadPercentage: [commonValidationRules.percentage('Workload percentage must be between 0 and 100')],
    workloadHours: [commonValidationRules.hours(2000, 'Workload hours cannot exceed 2000 hours')]
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'department_id') {
      const departmentId = Number(value);
      const selectedDepartment = departments.find(dept => dept.id === departmentId);
      setFormData(prev => ({
        ...prev,
        department_id: departmentId,
        department_name: selectedDepartment?.department_name || ''
      }));
    } else if (name === 'program_id') {
      const programId = Number(value);
      const selectedProgram = programs.find(prog => prog.id === programId);
      setFormData(prev => ({
        ...prev,
        program_id: programId,
        program_name: selectedProgram?.title || ''
      }));
    } else if (name === 'program_type_id') {
      const programTypeId = Number(value);
      const selectedProgramType = programTypes.find(type => type.id === programTypeId);
      setFormData(prev => ({
        ...prev,
        program_type_id: programTypeId,
        program_type_name: selectedProgramType?.program_name || ''
      }));
    } else if (name === 'curriculum_regulation_id') {
      const curriculumId = Number(value);
      const selectedCurriculum = curriculumRegulations.find(cur => cur.id === curriculumId);
      setFormData(prev => ({
        ...prev,
        curriculum_regulation_id: curriculumId,
        academic_year: selectedCurriculum ? `${selectedCurriculum.from_year}-${selectedCurriculum.to_year}` : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'workloadPercentage' || name === 'workloadHours' ? Number(value) : value
      }));
    }

    // Clear error message and field-specific validation errors when user starts typing
    if (message && message.type === 'error') {
      setMessage(null);
    }
    
    // Clear field-specific validation error
    clearFieldError(name);
  };

  // Validate form data using unified validation
  const validateForm = (): boolean => {
    return validateFormUnified(formData, validationRules);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        department_id: formData.department_id,
        curriculum_regulation_id: formData.curriculum_regulation_id,
        program_type_id: formData.program_type_id,
        program_id: formData.program_id,
        program_category: formData.programCategory,
        work_type: formData.workType,
        workload_distribution: formData.workloadDistribution,
        workload_percentage: formData.workloadPercentage,
        workload_hours: formData.workloadHours
      };

      if (editingId) {
        await configAPI.facultyWorkload.update(editingId.toString(), payload);
        showSuccessPopup('Faculty workload updated successfully');
      } else {
        await configAPI.facultyWorkload.create(payload);
        showSuccessPopup('Faculty workload created successfully');
      }

      setShowAccordion(false);
      setEditingId(null);
      setFormData({
        department_id: 0,
        department_name: '',
        curriculum_regulation_id: 0,
        academic_year: '',
        program_type_id: 0,
        program_type_name: '',
        program_id: 0,
        program_name: '',
        programCategory: '',
        workType: '',
        workloadDistribution: '',
        workloadPercentage: 0,
        workloadHours: 0
      });
      setSaving(false);
      fetchData(pagination.currentPage, searchTerm);
    } catch (error) {
      console.error('Failed to save faculty workload:', error);
      setMessage({ type: 'error', text: 'Failed to save faculty workload' });
      setSaving(false);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setFormData({
      department_id: 0,
      department_name: '',
      curriculum_regulation_id: 0,
      academic_year: '',
      program_type_id: 0,
      program_type_name: '',
      program_id: 0,
      program_name: '',
      programCategory: '',
      workType: '',
      workloadDistribution: '',
      workloadPercentage: 0,
      workloadHours: 0
    });
    setEditingId(null);
    clearAllErrors();
    setShowAccordion(true);
  };

  // Handle edit
  const handleEdit = (item: FacultyWorkloadData) => {
    setFormData({
      department_id: item.department_id,
      department_name: item.department_name || '',
      curriculum_regulation_id: item.curriculum_regulation_id,
      academic_year: item.academic_year || '',
      program_type_id: item.program_type_id,
      program_type_name: item.program_type_name || '',
      program_id: item.program_id,
      program_name: item.program_name || '',
      programCategory: item.programCategory,
      workType: item.workType,
      workloadDistribution: item.workloadDistribution,
      workloadPercentage: item.workloadPercentage,
      workloadHours: item.workloadHours
    });
    setEditingId(item.id!);
    clearAllErrors();
    setShowAccordion(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this workload entry?')) {
      try {
        await configAPI.facultyWorkload.delete(id.toString());
        setMessage({ type: 'success', text: 'Faculty workload deleted successfully' });
        fetchData(pagination.currentPage, searchTerm);
      } catch (error) {
        console.error('Failed to delete faculty workload:', error);
        setMessage({ type: 'error', text: 'Failed to delete faculty workload' });
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAccordion(false);
    setEditingId(null);
    setFormData({
      department_id: 0,
      department_name: '',
      curriculum_regulation_id: 0,
      academic_year: '',
      program_type_id: 0,
      program_type_name: '',
      program_id: 0,
      program_name: '',
      programCategory: '',
      workType: '',
      workloadDistribution: '',
      workloadPercentage: 0,
      workloadHours: 0
    });
    clearAllErrors();
  };

  // Manage body class when modal is open
  useEffect(() => {
    if (showAccordion) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showAccordion]);

  // Grid handlers
  const handleGridSearch = (query: string) => {
    setSearchTerm(query);
    fetchData(1, query);
  };

  const handleGridAdd = () => {
    handleAddNew();
  };

  const handleGridEdit = (item: FacultyWorkloadData) => {
    handleEdit(item);
  };

  const handleGridDelete = (item: FacultyWorkloadData) => {
    if (item.id) {
      handleDelete(item.id);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchTerm);
  };

  // Prepare data for Grid component
  const gridData = data.map(item => ({
    ...item,
    department_name: item.department_name ? truncateText(item.department_name, 30) : '-',
    program_type_name: item.program_type_name || '-',
    program_name: item.program_name ? truncateText(item.program_name, 40) : '-',
    academic_year: item.academic_year || '-',
    workType: item.workType || '-',
    workloadPercentage: item.workloadPercentage ? item.workloadPercentage.toFixed(2) : '-',
    workloadHours: item.workloadHours ? item.workloadHours.toString() : '-'
  }));

  // Load data on component mount
  useEffect(() => {
    fetchData();
    fetchDepartments();
    fetchPrograms();
    fetchProgramTypes();
    fetchCurriculumRegulations();
  }, []);


  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Faculty Workload</h1>
        <p>Manage faculty workload distribution across different programs and semesters.</p>
      </div>

      {/* Unified Validation Popup */}
      <UnifiedValidationPopup
        isOpen={!!message}
        type={message?.type || 'error'}
        message={message?.text || ''}
        onClose={() => setMessage(null)}
        onTryAgain={() => setMessage(null)}
        showProgress={message?.type === 'success'}
        autoClose={message?.type === 'success'}
        autoCloseDelay={3000}
      />

      {/* Grid Component */}
      <Grid
        columns={gridColumns}
        data={gridData}
        onAdd={handleGridAdd}
        onEdit={handleGridEdit}
        onDelete={handleGridDelete}
        onSearch={handleGridSearch}
        searchable={true}
        loading={loading}
        addButtonText="Add Workload"
        searchPlaceholder="Search Faculty Workload"
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-controls">
            <button
              className="pagination-btn pagination-btn-secondary"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Previous
            </button>
            
            <div className="pagination-pages">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-btn ${page === pagination.currentPage ? 'pagination-btn-primary' : 'pagination-btn-secondary'}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              className="pagination-btn pagination-btn-secondary"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              Next
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="pagination-info">
            Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalCount)} of {pagination.totalCount} entries
          </div>
        </div>
      )}

      {/* Modal */}
      {showAccordion && createPortal(
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal book-chapter-modal-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <h3>{editingId ? 'Edit Faculty Workload' : 'Add New Faculty Workload'}</h3>
                <p className="modal-subtitle">Enter faculty workload details below</p>
              </div>
              <button
                type="button"
                className="message-modal-close"
                onClick={handleCancel}
                title="Close Modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <form id="faculty-workload-form" onSubmit={handleSubmit}>
                <div className="book-chapter-form-container">
                  <div className="book-chapter-form-layout">
                    {/* Left Column */}
                    <div className="book-chapter-form-left">
                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Department</label>
                        <div className="book-chapter-input-wrapper">
                          <select
                            id="department_id"
                            name="department_id"
                            className={getFieldClassName('department_id', 'book-chapter-input')}
                            value={formData.department_id}
                            onChange={handleInputChange}
                            required
                          >
                            <option value={0}>Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.department_name}
                              </option>
                            ))}
                          </select>
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M3 21h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M5 21V7l8-4v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M19 21V11l-6-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.department_id && (
                          <div className="book-chapter-error-message">
                            <span className="error-text">{validationErrors.department_id}</span>
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Academic Year</label>
                        <div className="book-chapter-input-wrapper">
                          <select
                            id="curriculum_regulation_id"
                            name="curriculum_regulation_id"
                            className={getFieldClassName('curriculum_regulation_id', 'book-chapter-input')}
                            value={formData.curriculum_regulation_id}
                            onChange={handleInputChange}
                            required
                          >
                            <option value={0}>Select Academic Year</option>
                            {curriculumRegulations.map((curriculum) => (
                              <option key={curriculum.id} value={curriculum.id}>
                                {curriculum.curriculum_batch} ({curriculum.from_year}-{curriculum.to_year})
                              </option>
                            ))}
                          </select>
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.curriculum_regulation_id && (
                          <div className="book-chapter-error-message">
                            <span className="error-text">{validationErrors.curriculum_regulation_id}</span>
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Program Type</label>
                        <div className="book-chapter-input-wrapper">
                          <select
                            id="program_type_id"
                            name="program_type_id"
                            className={getFieldClassName('program_type_id', 'book-chapter-input')}
                            value={formData.program_type_id}
                            onChange={handleInputChange}
                            required
                          >
                            <option value={0}>Select Program Type</option>
                            {programTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.program_name}
                              </option>
                            ))}
                          </select>
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.program_type_id && (
                          <div className="book-chapter-error-message">
                            <span className="error-text">{validationErrors.program_type_id}</span>
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Program</label>
                        <div className="book-chapter-input-wrapper">
                          <select
                            id="program_id"
                            name="program_id"
                            className={getFieldClassName('program_id', 'book-chapter-input')}
                            value={formData.program_id}
                            onChange={handleInputChange}
                            required
                          >
                            <option value={0}>Select Program</option>
                            {programs.map((prog) => (
                              <option key={prog.id} value={prog.id}>
                                {prog.title}
                              </option>
                            ))}
                          </select>
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.program_id && (
                          <div className="book-chapter-error-message">
                            <span className="error-text">{validationErrors.program_id}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="book-chapter-form-right">
                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Program Category</label>
                        <div className="book-chapter-input-wrapper">
                          <select
                            id="programCategory"
                            name="programCategory"
                            className={getFieldClassName('programCategory', 'book-chapter-input')}
                            value={formData.programCategory}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Program Category</option>
                            <option value="Core Program">Core Program</option>
                            <option value="Other Program">Other Program</option>
                            <option value="Research Program">Research Program</option>
                          </select>
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.programCategory && (
                          <div className="book-chapter-error-message">
                            <span className="error-text">{validationErrors.programCategory}</span>
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Work Type</label>
                        <div className="book-chapter-input-wrapper">
                          <select
                            id="workType"
                            name="workType"
                            className={getFieldClassName('workType', 'book-chapter-input')}
                            value={formData.workType}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Work Type</option>
                            <option value="Theory teaching">Theory teaching</option>
                            <option value="Practical teaching">Practical teaching</option>
                            <option value="Research">Research</option>
                            <option value="Administration">Administration</option>
                          </select>
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.workType && (
                          <div className="book-chapter-error-message">
                            <span className="error-text">{validationErrors.workType}</span>
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Workload Distribution</label>
                        <div className="book-chapter-input-wrapper">
                          <select
                            id="workloadDistribution"
                            name="workloadDistribution"
                            className={getFieldClassName('workloadDistribution', 'book-chapter-input')}
                            value={formData.workloadDistribution}
                            onChange={handleInputChange}
                            required
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
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.workloadDistribution && (
                          <div className="book-chapter-error-message">
                            <span className="error-text">{validationErrors.workloadDistribution}</span>
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Workload Percentage</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="number"
                            id="workloadPercentage"
                            name="workloadPercentage"
                            className={getFieldClassName('workloadPercentage', 'book-chapter-input')}
                            value={formData.workloadPercentage}
                            onChange={handleInputChange}
                            required
                            step="0.01"
                            placeholder="Enter percentage"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.workloadPercentage && (
                          <div className="book-chapter-error-message">
                            <span className="error-text">{validationErrors.workloadPercentage}</span>
                          </div>
                        )}
                      </div>

                      <div className="book-chapter-form-group">
                        <label>Workload Hours</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="number"
                            id="workloadHours"
                            name="workloadHours"
                            className={getFieldClassName('workloadHours', 'book-chapter-input')}
                            value={formData.workloadHours}
                            onChange={handleInputChange}
                            placeholder="Enter hours"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {validationErrors.workloadHours && (
                          <div className="book-chapter-error-message">
                            <span className="error-text">{validationErrors.workloadHours}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="book-chapter-btn book-chapter-btn-secondary"
                onClick={handleCancel}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                form="faculty-workload-form"
                className="book-chapter-btn book-chapter-btn-primary"
                disabled={saving}
                onClick={handleSubmit}
              >
                {saving ? (
                  <>
                    <div className="book-chapter-spinner"></div>
                    {editingId ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 3V8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {editingId ? 'Update' : 'Save'}
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

export default FacultyWorkload;