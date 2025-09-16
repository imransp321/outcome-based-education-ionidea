import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import { useMessage } from '../../contexts/MessageContext';
import ValidationPopup from '../../components/ValidationPopup';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';
import '../../styles/shared/business.css';

interface CurriculumRegulation {
  id: number;
  curriculum_batch: string;
  program_id: number;
  department_id: number;
  from_year: number;
  to_year: number;
  program_owner_id?: number;
  peo_creation_status: 'Pending' | 'Created';
  curriculum_head_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Program {
  id: number;
  title: string;
  acronym: string;
}

interface Department {
  id: number;
  department_name: string;
  short_name: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Utility function to remove duplicates from programs array
const removeProgramDuplicates = (programs: Program[]): Program[] => {
  const programMap = new Map<number, Program>();
  const nameMap = new Map<string, Program>();
  
  programs.forEach((program: Program) => {
    const nameKey = `${program.acronym}-${program.title}`;
    
    // Check if we already have this program by ID or name
    if (!programMap.has(program.id) && !nameMap.has(nameKey)) {
      programMap.set(program.id, program);
      nameMap.set(nameKey, program);
    }
  });
  
  return Array.from(programMap.values());
};

// Utility function to remove duplicates from departments array
const removeDepartmentDuplicates = (departments: Department[]): Department[] => {
  const departmentMap = new Map<number, Department>();
  const nameMap = new Map<string, Department>();
  
  departments.forEach((department: Department) => {
    const nameKey = `${department.short_name}-${department.department_name}`;
    
    // Check if we already have this department by ID or name
    if (!departmentMap.has(department.id) && !nameMap.has(nameKey)) {
      departmentMap.set(department.id, department);
      nameMap.set(nameKey, department);
    }
  });
  
  return Array.from(departmentMap.values());
};

// Utility function to remove duplicates from users array
const removeUserDuplicates = (users: User[]): User[] => {
  const userMap = new Map<number, User>();
  const nameMap = new Map<string, User>();
  
  users.forEach((user: User) => {
    const nameKey = `${user.first_name}-${user.last_name}`;
    
    // Check if we already have this user by ID or name
    if (!userMap.has(user.id) && !nameMap.has(nameKey)) {
      userMap.set(user.id, user);
      nameMap.set(nameKey, user);
    }
  });
  
  return Array.from(userMap.values());
};

const CurriculumRegulations: React.FC = () => {
  const { showMessage } = useMessage();
  const [curriculumRegulations, setCurriculumRegulations] = useState<CurriculumRegulation[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [programsLoaded, setProgramsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [successProgress, setSuccessProgress] = useState(100);
  const [showFromYearPicker, setShowFromYearPicker] = useState(false);
  const [showToYearPicker, setShowToYearPicker] = useState(false);
  const [fromYearDecade, setFromYearDecade] = useState(2020);
  const [toYearDecade, setToYearDecade] = useState(2020);

  // Auto-dismiss success messages after 3 seconds with progress animation
  useEffect(() => {
    if (message && message.type === 'success') {
      setSuccessProgress(100);
      
      const progressInterval = setInterval(() => {
        setSuccessProgress(prev => {
          const newProgress = prev - (100 / 30); // 30 updates over 3 seconds
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);
      
      const timer = setTimeout(() => {
        setMessage(null);
        setSuccessProgress(100);
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [message]);

  // Close year pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.year-picker-container')) {
        setShowFromYearPicker(false);
        setShowToYearPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Form data
  const [formData, setFormData] = useState({
    curriculum_batch: '',
    program_id: '',
    department_id: '',
    from_year: '',
    to_year: '',
    program_owner_id: '',
    peo_creation_status: 'Pending' as 'Pending' | 'Created',
    curriculum_head_id: ''
  });

  // Fetch data
  const fetchCurriculumRegulations = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm
      };
      const response = await configAPI.curriculumRegulations.getAll(params);
      setCurriculumRegulations(response.data.data || []);
      setPagination(prev => response.data.pagination || prev);
    } catch (error: any) {
      console.error('Error fetching curriculum regulations:', error);
      showMessage({ type: 'error', title: 'Error', message: 'Error fetching curriculum regulations' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]); // Remove showMessage dependency

  const fetchPrograms = useCallback(async () => {
    if (programsLoaded) return; // Prevent multiple calls
    
    try {
      setProgramsLoaded(true);
      const response = await configAPI.programs.getAllSimple();
      const programsData = response.data.data || [];
      
      // Remove duplicates using the program-specific utility function
      const uniquePrograms = removeProgramDuplicates(programsData);
      
      setPrograms(uniquePrograms);
    } catch (error: any) {
      
      setProgramsLoaded(false); // Reset on error to allow retry
    }
  }, [programsLoaded]);

  const fetchDepartments = async () => {
    try {
      const response = await configAPI.departments.getAllSimple();
      const departmentsData = response.data.data || [];
      // Remove duplicates using the department-specific utility function
      const uniqueDepartments = removeDepartmentDuplicates(departmentsData);
      setDepartments(uniqueDepartments);
    } catch (error: any) {
      
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await configAPI.users.getAllSimple();
      const usersData = response.data.data || [];
      // Remove duplicates using the user-specific utility function
      const uniqueUsers = removeUserDuplicates(usersData);
      setUsers(uniqueUsers);
    } catch (error: any) {
      
    }
  };

  useEffect(() => {
    fetchCurriculumRegulations();
  }, [fetchCurriculumRegulations]);

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
    fetchUsers();
  }, [fetchPrograms]);


  // Manage modal body class
  useEffect(() => {
    if (showModal || showDeleteModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showModal, showDeleteModal]);

  // Reset programs loaded state when component unmounts
  useEffect(() => {
    return () => {
      setProgramsLoaded(false);
    };
  }, []);

  // Event handlers
  const handleAddNew = () => {
    setIsEditMode(false);
    setEditingId(null);
    setValidationErrors([]);
    setFieldErrors({});
    setMessage(null);
    setFormData({
      curriculum_batch: '',
      program_id: '',
      department_id: '',
      from_year: '',
      to_year: '',
      program_owner_id: '',
      peo_creation_status: 'Pending',
      curriculum_head_id: ''
    });
    // Refresh programs to ensure we have the latest data
    if (!programsLoaded) {
      fetchPrograms();
    }
    setShowModal(true);
  };

  const handleEdit = (curriculum: CurriculumRegulation) => {
    setIsEditMode(true);
    setEditingId(curriculum.id);
    setValidationErrors([]);
    setFieldErrors({});
    setMessage(null);
    setFormData({
      curriculum_batch: curriculum.curriculum_batch,
      program_id: curriculum.program_id.toString(),
      department_id: curriculum.department_id.toString(),
      from_year: curriculum.from_year.toString(),
      to_year: curriculum.to_year.toString(),
      program_owner_id: curriculum.program_owner_id?.toString() || '',
      peo_creation_status: curriculum.peo_creation_status,
      curriculum_head_id: curriculum.curriculum_head_id?.toString() || ''
    });
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error message and field-specific errors when user starts typing
    if (message && message.type === 'error') {
      setMessage(null);
    }
    
    // Clear field-specific error
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    // Clear any existing messages and validation errors
    setMessage(null);
    setValidationErrors([]);
    setFieldErrors({});

    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    // Check required fields
    if (!formData.curriculum_batch.trim()) {
      errors.curriculum_batch = 'Curriculum batch is required';
      hasErrors = true;
    } else if (formData.curriculum_batch.trim().length < 2) {
      errors.curriculum_batch = 'Curriculum batch must be at least 2 characters long';
      hasErrors = true;
    } else if (formData.curriculum_batch.trim().length > 50) {
      errors.curriculum_batch = 'Curriculum batch must not exceed 50 characters';
      hasErrors = true;
    }

    if (!formData.program_id) {
      errors.program_id = 'Program is required';
      hasErrors = true;
    }

    if (!formData.department_id) {
      errors.department_id = 'Department is required';
      hasErrors = true;
    }

    if (!formData.from_year) {
      errors.from_year = 'From year is required';
      hasErrors = true;
    } else {
      const fromYear = parseInt(formData.from_year);
      if (isNaN(fromYear) || fromYear < 1900 || fromYear > 2100) {
        errors.from_year = 'From year must be between 1900 and 2100';
        hasErrors = true;
      }
    }

    if (!formData.to_year) {
      errors.to_year = 'To year is required';
      hasErrors = true;
    } else {
      const toYear = parseInt(formData.to_year);
      if (isNaN(toYear) || toYear < 1900 || toYear > 2100) {
        errors.to_year = 'To year must be between 1900 and 2100';
        hasErrors = true;
      }
    }

    // Validate year range
    if (formData.from_year && formData.to_year) {
      const fromYear = parseInt(formData.from_year);
      const toYear = parseInt(formData.to_year);
      if (!isNaN(fromYear) && !isNaN(toYear) && fromYear >= toYear) {
        errors.to_year = 'To year must be greater than from year';
        hasErrors = true;
      }
    }

    // Check for duplicate curriculum batch
    const existingBatch = curriculumRegulations.find(
      cr => cr.curriculum_batch.toLowerCase() === formData.curriculum_batch.toLowerCase() &&
            cr.program_id === parseInt(formData.program_id) &&
            cr.department_id === parseInt(formData.department_id) &&
            (!isEditMode || cr.id !== editingId)
    );
    if (existingBatch) {
      errors.curriculum_batch = 'A curriculum regulation already exists for this batch, program, and department';
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(errors);
      // Show first validation error as popup
      const firstError = Object.values(errors)[0];
      setMessage({ type: 'error', text: firstError });
      return false;
    }

    return true;
  };

  // Real-time validation for year fields
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    
    // Clear previous validation errors for year fields
    setValidationErrors(prev => prev.filter(error => 
      !error.includes('year') && !error.includes('Year')
    ));
    
    // Clear field-specific error
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Validate year range
    if (name === 'from_year' && formData.to_year) {
      const toYear = parseInt(formData.to_year);
      if (numValue && toYear && numValue >= toYear) {
        setFieldErrors(prev => ({
          ...prev,
          to_year: 'To year must be greater than from year'
        }));
        setMessage({ 
          type: 'error', 
          text: 'To year must be greater than from year' 
        });
      }
    } else if (name === 'to_year' && formData.from_year) {
      const fromYear = parseInt(formData.from_year);
      if (numValue && fromYear && fromYear >= numValue) {
        setFieldErrors(prev => ({
          ...prev,
          to_year: 'To year must be greater than from year'
        }));
        setMessage({ 
          type: 'error', 
          text: 'To year must be greater than from year' 
        });
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Validate form before submission
    if (!validateForm()) {
      setSaving(false);
      return;
    }
    
    try {
      setSaving(true);
      const data = {
        ...formData,
        program_id: parseInt(formData.program_id),
        department_id: parseInt(formData.department_id),
        from_year: parseInt(formData.from_year),
        to_year: parseInt(formData.to_year),
        program_owner_id: formData.program_owner_id ? parseInt(formData.program_owner_id) : null,
        curriculum_head_id: formData.curriculum_head_id ? parseInt(formData.curriculum_head_id) : null
      };

      if (isEditMode && editingId) {
        await configAPI.curriculumRegulations.update(editingId.toString(), data);
        setMessage({ type: 'success', text: 'Curriculum regulation updated successfully!' });
      } else {
        await configAPI.curriculumRegulations.create(data);
        setMessage({ type: 'success', text: 'Curriculum regulation created successfully!' });
      }

      // Reset form and close modal
      setFormData({
        curriculum_batch: '',
        program_id: '',
        department_id: '',
        from_year: '',
        to_year: '',
        program_owner_id: '',
        peo_creation_status: 'Pending',
        curriculum_head_id: ''
      });
      setValidationErrors([]);
      setShowModal(false);
      setIsEditMode(false);
      setEditingId(null);
      fetchCurriculumRegulations();
    } catch (error: any) {
      
      let errorMessage = 'Failed to save curriculum regulation';
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors.map((err: any) => err.msg).join(', ');
        errorMessage = `Validation errors: ${validationErrors}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setIsEditMode(false);
    setEditingId(null);
    setValidationErrors([]);
    setFieldErrors({});
    setMessage(null);
    setFormData({
      curriculum_batch: '',
      program_id: '',
      department_id: '',
      from_year: '',
      to_year: '',
      program_owner_id: '',
      peo_creation_status: 'Pending',
      curriculum_head_id: ''
    });
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setSaving(true);
      await configAPI.curriculumRegulations.delete(deletingId.toString());
      showMessage({ type: 'success', title: 'Success', message: 'Curriculum regulation deleted successfully' });
      setShowDeleteModal(false);
      setDeletingId(null);
      fetchCurriculumRegulations();
    } catch (error: any) {
      
      showMessage({ type: 'error', title: 'Error', message: 'Error deleting curriculum regulation' });
    } finally {
      setSaving(false);
    }
  };

  const handlePEOStatusClick = async (id: number) => {
    try {
      // First check the actual PEO status
      const statusResponse = await configAPI.curriculumRegulations.checkPEOStatus(id.toString());
      const statusData = statusResponse.data.data;
      
      if (statusData.has_peos) {
        // PEOs exist, show as Created
        if (statusData.current_status !== 'Created') {
          await configAPI.curriculumRegulations.updatePEOStatus(id.toString(), 'Created');
          showMessage({ 
            type: 'success', 
            title: 'PEO Status Updated', 
            message: `PEO status updated to Created (${statusData.peo_count} PEOs found)` 
          });
        } else {
          showMessage({ 
            type: 'info', 
            title: 'PEO Status', 
            message: `PEOs are already created (${statusData.peo_count} PEOs found)` 
          });
        }
      } else {
        // No PEOs exist, show as Pending
        if (statusData.current_status !== 'Pending') {
          await configAPI.curriculumRegulations.updatePEOStatus(id.toString(), 'Pending');
          showMessage({ 
            type: 'warning', 
            title: 'PEO Status Updated', 
            message: 'PEO status updated to Pending (No PEOs found for this curriculum batch)' 
          });
        } else {
          // Status is already Pending - show guidance message
          showMessage({ 
            type: 'info', 
            title: 'PEO Status: Pending', 
            message: 'No PEOs found for this curriculum batch. Please navigate to the "Program Educational Objectives" menu under "Curriculum Design" to create PEOs for this curriculum batch.' 
          });
        }
      }
      
      fetchCurriculumRegulations();
    } catch (error: any) {
      
      showMessage({ type: 'error', title: 'Error', message: 'Error checking PEO status' });
    }
  };



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Helper functions
  const getProgramName = (programId: number) => {
    const program = programs.find(p => p.id === programId);
    return program ? `${program.acronym} - ${program.title}` : 'Unknown Program';
  };


  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
  };


  return (
    <div className="grid-page">

      {/* Success Message Popup */}
      {message && message.type === 'success' && createPortal(
        <div className="modal-overlay">
          <div className="success-popup">
            <div className="success-popup-progress">
              <div 
                className="success-popup-progress-bar"
                style={{ width: `${successProgress}%` }}
              ></div>
            </div>
            <div className="success-popup-content">
              <div className="success-popup-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="success-popup-title">Success!</h3>
              <p className="success-popup-message">{message.text}</p>
              <button
                className="success-popup-button"
                onClick={() => setMessage(null)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Continue
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Error Message Popup */}
      {message && message.type === 'error' && createPortal(
        <div className="modal-overlay">
          <div className="error-popup">
            <div className="error-popup-content">
              <div className="error-popup-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="error-popup-title">Validation Error</h3>
              <p className="error-popup-message">{message.text}</p>
              <button
                className="error-popup-button"
                onClick={() => setMessage(null)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Page Header */}
      <div className="page-header">
        <h1>Curriculum Regulations</h1>
        <p>Manage curriculum batches and PEO creation status</p>
      </div>

      {/* Grid Container */}
      <div className="grid-container">
        {/* Grid Header */}
        <div className="grid-header">
          <div className="grid-header-actions">
            <button
              className="grid-add-button"
              onClick={handleAddNew}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/>
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Add New Curriculum
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
              placeholder="Search curriculum regulations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid Content */}
        {loading ? (
          <div className="grid-loading">
            <div className="grid-loading-icon">⏳</div>
            <p>Loading curriculum regulations...</p>
          </div>
        ) : curriculumRegulations.length === 0 ? (
          <div className="grid-empty">
            <div className="grid-empty-icon">📋</div>
            <p>No curriculum regulations found</p>
            <p>Get started by adding your first curriculum regulation.</p>
          </div>
          ) : (
            <div className="grid-table-wrapper">
              <table className="grid-table">
                <thead>
                  <tr>
                    <th>Curriculum Batch</th>
                    <th>Program</th>
                    <th>Years</th>
                    <th>Program Owner</th>
                    <th>PEO Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {curriculumRegulations.map((curriculum) => (
                    <tr key={curriculum.id}>
                      <td>{curriculum.curriculum_batch}</td>
                      <td>{getProgramName(curriculum.program_id)}</td>
                      <td>{curriculum.from_year} - {curriculum.to_year}</td>
                      <td>{curriculum.program_owner_id ? getUserName(curriculum.program_owner_id) : 'Not Assigned'}</td>
                      <td>
                        <span 
                          className={`grid-status ${curriculum.peo_creation_status.toLowerCase()}`}
                          onClick={() => handlePEOStatusClick(curriculum.id)}
                          style={{ cursor: 'pointer' }}
                          title={
                            curriculum.peo_creation_status === 'Pending' 
                              ? `Click to get guidance on creating PEOs for ${curriculum.curriculum_batch}` 
                              : `Click to check PEO status for ${curriculum.curriculum_batch}`
                          }
                        >
                          {curriculum.peo_creation_status}
                        </span>
                      </td>
                      <td>
                        <div className="grid-action-btn-container">
                          <button
                            className="grid-action-btn edit"
                            onClick={() => handleEdit(curriculum)}
                            title="Edit"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                          <button
                            className="grid-action-btn delete"
                            onClick={() => {
                              setDeletingId(curriculum.id);
                              setShowDeleteModal(true);
                            }}
                            title="Delete"
                          >
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

        {/* Grid Footer */}
        <div className="grid-footer">
          <div className="grid-pagination">
            <button
              className="grid-pagination-btn"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
            >
              Previous
            </button>
            <span className="grid-pagination-info">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              className="grid-pagination-btn"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal - Corporate Design */}
      {showModal && createPortal(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <h2>{isEditMode ? 'Edit' : 'Add New'} Curriculum Regulation</h2>
                <p>Manage curriculum batch details and PEO creation status</p>
              </div>
              <button className="modal-close-btn" onClick={handleCancel}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <form id="curriculum-form" onSubmit={handleSubmit} className="business-form">
                {/* Validation Messages */}
                {validationErrors.length > 0 && (
                  <div className="validation-messages error">
                    <div className="message-title">Please fix the following errors:</div>
                    <ul className="message-list">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Curriculum Information</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="curriculum_batch" className="business-form-label">
                        Curriculum Batch <span className="business-form-required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          id="curriculum_batch"
                          name="curriculum_batch"
                          value={formData.curriculum_batch}
                          onChange={handleInputChange}
                          className={`business-form-input ${fieldErrors.curriculum_batch ? 'is-invalid' : ''}`}
                          placeholder="e.g., B.E in CSE 2018-2022"
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {fieldErrors.curriculum_batch && (
                        <div className="business-form-error">{fieldErrors.curriculum_batch}</div>
                      )}
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="program_id" className="business-form-label">
                        Program <span className="business-form-required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <select
                          id="program_id"
                          name="program_id"
                          value={formData.program_id}
                          onChange={handleInputChange}
                          className={`business-form-input ${fieldErrors.program_id ? 'is-invalid' : ''}`}
                          required
                        >
                          <option value="">Select Program</option>
                          {programs.map(program => (
                            <option key={program.id} value={program.id}>
                              {program.acronym} - {program.title}
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
                      {fieldErrors.program_id && (
                        <div className="business-form-error">{fieldErrors.program_id}</div>
                      )}
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="department_id" className="business-form-label">
                        Department <span className="business-form-required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <select
                          id="department_id"
                          name="department_id"
                          value={formData.department_id}
                          onChange={handleInputChange}
                          className={`business-form-input ${fieldErrors.department_id ? 'is-invalid' : ''}`}
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map(department => (
                            <option key={department.id} value={department.id}>
                              {department.short_name} - {department.department_name}
                            </option>
                          ))}
                        </select>
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 21h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5 21V7l8-4v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 21V11l-6-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {fieldErrors.department_id && (
                        <div className="business-form-error">{fieldErrors.department_id}</div>
                      )}
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="program_owner_id" className="business-form-label">
                        Program Owner
                      </label>
                      <div className="business-form-input-wrapper">
                        <select
                          id="program_owner_id"
                          name="program_owner_id"
                          value={formData.program_owner_id}
                          onChange={handleInputChange}
                          className="business-form-input"
                        >
                          <option value="">Select Program Owner</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.first_name} {user.last_name}
                            </option>
                          ))}
                        </select>
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="from_year" className="business-form-label">
                        From Year <span className="business-form-required">*</span>
                      </label>
                      <div className="year-picker-container">
                        <div className="business-form-input-wrapper">
                          <input
                            type="text"
                            id="from_year"
                            name="from_year"
                            value={formData.from_year || ''}
                            onChange={handleYearChange}
                            className={`business-form-input year-picker-input ${fieldErrors.from_year ? 'is-invalid' : ''}`}
                            placeholder="YYYY"
                            readOnly
                            onClick={() => setShowFromYearPicker(!showFromYearPicker)}
                            required
                          />
                          <div className="business-form-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        <div className="year-picker-icon" onClick={() => setShowFromYearPicker(!showFromYearPicker)}>
                          📅
                        </div>
                        {showFromYearPicker && (
                          <div className="year-picker-dropdown">
                            <div className="year-picker-header">
                              <button 
                                type="button" 
                                className="year-picker-nav" 
                                onClick={() => setFromYearDecade(fromYearDecade - 10)}
                              >
                                ‹‹
                              </button>
                              <span className="year-picker-title">{fromYearDecade}-{fromYearDecade + 9}</span>
                              <button 
                                type="button" 
                                className="year-picker-nav" 
                                onClick={() => setFromYearDecade(fromYearDecade + 10)}
                              >
                                ››
                              </button>
                            </div>
                            <div className="year-picker-grid">
                              {Array.from({ length: 12 }, (_, i) => {
                                const year = fromYearDecade + i;
                                return (
                                  <button
                                    key={year}
                                    type="button"
                                    className={`year-picker-item ${formData.from_year === year.toString() ? 'selected' : ''}`}
                                    onClick={() => {
                                      handleYearChange({ target: { name: 'from_year', value: year.toString() } } as React.ChangeEvent<HTMLInputElement>);
                                      setShowFromYearPicker(false);
                                    }}
                                  >
                                    {year}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      {fieldErrors.from_year && (
                        <div className="business-form-error">{fieldErrors.from_year}</div>
                      )}
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="to_year" className="business-form-label">
                        To Year <span className="business-form-required">*</span>
                      </label>
                      <div className="year-picker-container">
                        <div className="business-form-input-wrapper">
                          <input
                            type="text"
                            id="to_year"
                            name="to_year"
                            value={formData.to_year || ''}
                            onChange={handleYearChange}
                            className={`business-form-input year-picker-input ${fieldErrors.to_year ? 'is-invalid' : ''}`}
                            placeholder="YYYY"
                            readOnly
                            onClick={() => setShowToYearPicker(!showToYearPicker)}
                            required
                          />
                          <div className="business-form-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        <div className="year-picker-icon" onClick={() => setShowToYearPicker(!showToYearPicker)}>
                          📅
                        </div>
                        {showToYearPicker && (
                          <div className="year-picker-dropdown">
                            <div className="year-picker-header">
                              <button 
                                type="button" 
                                className="year-picker-nav" 
                                onClick={() => setToYearDecade(toYearDecade - 10)}
                              >
                                ‹‹
                              </button>
                              <span className="year-picker-title">{toYearDecade}-{toYearDecade + 9}</span>
                              <button 
                                type="button" 
                                className="year-picker-nav" 
                                onClick={() => setToYearDecade(toYearDecade + 10)}
                              >
                                ››
                              </button>
                            </div>
                            <div className="year-picker-grid">
                              {Array.from({ length: 12 }, (_, i) => {
                                const year = toYearDecade + i;
                                return (
                                  <button
                                    key={year}
                                    type="button"
                                    className={`year-picker-item ${formData.to_year === year.toString() ? 'selected' : ''}`}
                                    onClick={() => {
                                      handleYearChange({ target: { name: 'to_year', value: year.toString() } } as React.ChangeEvent<HTMLInputElement>);
                                      setShowToYearPicker(false);
                                    }}
                                  >
                                    {year}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      {fieldErrors.to_year && (
                        <div className="business-form-error">{fieldErrors.to_year}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="business-form-section">
                  <h3 className="business-form-section-title">Status & Assignment</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="peo_creation_status" className="business-form-label">
                        PEO Creation Status
                      </label>
                      <div className="business-form-input-wrapper">
                        <select
                          id="peo_creation_status"
                          name="peo_creation_status"
                          value={formData.peo_creation_status}
                          onChange={handleInputChange}
                          className="business-form-input"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Created">Created</option>
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
                      <label htmlFor="curriculum_head_id" className="business-form-label">
                        Curriculum Head
                      </label>
                      <div className="business-form-input-wrapper">
                        <select
                          id="curriculum_head_id"
                          name="curriculum_head_id"
                          value={formData.curriculum_head_id}
                          onChange={handleInputChange}
                          className="business-form-input"
                        >
                          <option value="">Select Curriculum Head</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.first_name} {user.last_name}
                            </option>
                          ))}
                        </select>
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn modal-btn-secondary"
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
                form="curriculum-form"
                className="modal-btn modal-btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="modal-spinner"></div>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 3V8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {isEditMode ? 'Update Curriculum' : 'Create Curriculum'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal - Corporate Design */}
      {showDeleteModal && createPortal(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <h2>Confirm Delete</h2>
                <p>This action cannot be undone</p>
              </div>
              <button className="modal-close-btn" onClick={handleCancel}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <div className="business-form-section">
                <div className="business-form-group">
                  <div className="business-delete-warning">
                    <svg className="business-warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    <h3>Delete Curriculum Regulation</h3>
                    <p>Are you sure you want to delete this curriculum regulation? This will permanently remove all associated data and cannot be undone.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn modal-btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-primary"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="modal-spinner"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                      <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Delete Curriculum
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

export default CurriculumRegulations;
