import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import '../../styles/pages/Curriculum/CourseOutcomes.css';
import '../../styles/components/modals.css';
import '../../styles/shared/pagination.css';
import '../../styles/shared/business.css';

interface CourseOutcome {
  id: number;
  co_code: string;
  course_outcome: string;
  curriculum_id: number;
  term_id: number;
  course_id: number;
  faculty_id: number;
  batch_name: string;
  program_title: string;
  from_year: number;
  to_year: number;
  term_name: string;
  course_name: string;
  first_name: string;
  last_name: string;
  department_name: string;
  blooms_levels: string;
  delivery_methods: string;
  created_at: string;
  updated_at: string;
}

interface CurriculumRegulation {
  id: number;
  curriculum_batch: string;
  program_name: string;
  from_year: number;
  to_year: number;
  department_name: string;
}

interface Term {
  id: number;
  term_name: string;
}

interface Course {
  id: number;
  course_title: string;
  course_code: string;
  department_name?: string;
}

interface BloomsLevel {
  id: number;
  level_name: string;
  action_verbs: string;
}

interface DeliveryMethod {
  id: number;
  method_name: string;
}

const CourseOutcomes: React.FC = () => {
  // State management
  const [courseOutcomes, setCourseOutcomes] = useState<CourseOutcome[]>([]);
  const [curriculumRegulations, setCurriculumRegulations] = useState<CurriculumRegulation[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [bloomsLevels, setBloomsLevels] = useState<BloomsLevel[]>([]);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  
  // Selection states
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    co_code: '',
    course_outcome: '',
    blooms_level_ids: [] as number[],
    delivery_method_ids: [] as number[]
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
    limit: 20
  });

  // Fetch curriculum regulations
  const fetchCurriculumRegulations = async () => {
    try {
      const response = await configAPI.curriculumRegulations.getAllSimple();
      const data = response.data?.data || response.data || [];
      setCurriculumRegulations(Array.isArray(data) ? data : []);
    } catch (error) {
      
      setCurriculumRegulations([]);
    }
  };

  // Fetch terms
  const fetchTerms = async () => {
    try {
      const response = await configAPI.courses.getTerms();
      const data = response.data?.data || response.data || [];
      setTerms(Array.isArray(data) ? data : []);
    } catch (error) {
      
      setTerms([]);
    }
  };

  // Fetch lookup data
  const fetchLookupData = useCallback(async () => {
    try {
      const params: any = {};
      if (selectedCurriculum) params.curriculum_id = selectedCurriculum;
      if (selectedTerm) params.term_id = selectedTerm;
      
      // Fetch courses based on curriculum and term
      const coursesResponse = await configAPI.courses.getAll(params);
      const coursesData = coursesResponse.data?.data || coursesResponse.data || [];
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      
      // Fetch Bloom's levels and delivery methods
      try {
        const lookupResponse = await configAPI.courseOutcomes.getLookupData();
        const lookupData = lookupResponse.data?.data || lookupResponse.data || {};
        
        
        
        setBloomsLevels(Array.isArray(lookupData.blooms_levels) ? lookupData.blooms_levels : []);
        setDeliveryMethods(Array.isArray(lookupData.delivery_methods) ? lookupData.delivery_methods : []);
      } catch (lookupError) {
        
        // Fallback: try to fetch from individual endpoints
        try {
          const bloomsResponse = await configAPI.blooms.getLevels();
          const bloomsData = bloomsResponse.data?.data || bloomsResponse.data || [];
          setBloomsLevels(Array.isArray(bloomsData) ? bloomsData : []);
          
          const deliveryResponse = await configAPI.deliveryMethods.getAll();
          const deliveryData = deliveryResponse.data?.data || deliveryResponse.data || [];
          setDeliveryMethods(Array.isArray(deliveryData) ? deliveryData : []);
        } catch (fallbackError) {
          
          setBloomsLevels([]);
          setDeliveryMethods([]);
        }
      }
    } catch (error) {
      
    }
  }, [selectedCurriculum, selectedTerm]);

  // Fetch course outcomes
  const fetchCourseOutcomes = useCallback(async () => {
    if (!selectedCurriculum || !selectedTerm || !selectedCourse) return;
    
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        curriculum_id: selectedCurriculum,
        term_id: selectedTerm,
        course_id: selectedCourse
      };
      
      const response = await configAPI.courseOutcomes.getAll(params);
      const data = response.data?.data || response.data || [];
      const paginationData = response.data?.pagination || response.data?.pagination || {};
      
      setCourseOutcomes(Array.isArray(data) ? data : []);
      setPagination(prev => ({
        ...prev,
        ...paginationData,
        currentPage: paginationData.currentPage || 1,
        totalPages: paginationData.totalPages || 1,
        totalCount: paginationData.totalCount || 0,
        hasNext: paginationData.hasNext || false,
        hasPrev: paginationData.hasPrev || false
      }));
    } catch (error) {
      
      setMessage({ type: 'error', text: 'Error fetching course outcomes' });
    } finally {
      setLoading(false);
    }
  }, [selectedCurriculum, selectedTerm, selectedCourse, pagination.currentPage, pagination.limit, searchTerm, setMessage]);

  // Handle curriculum change
  const handleCurriculumChange = (curriculumId: string) => {
    setSelectedCurriculum(curriculumId);
    setSelectedTerm('');
    setSelectedCourse('');
    setCourseOutcomes([]);
  };

  // Handle term change
  const handleTermChange = (termId: string) => {
    setSelectedTerm(termId);
    setSelectedCourse('');
    setCourseOutcomes([]);
  };

  // Handle course change
  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchCourseOutcomes();
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Handle add/edit modal
  const handleAdd = () => {
    // Reset form data
    setFormData({
      co_code: '',
      course_outcome: '',
      blooms_level_ids: [],
      delivery_method_ids: []
    });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEdit = async (id: number) => {
    const courseOutcome = courseOutcomes.find(co => co.id === id);
    if (courseOutcome) {
      try {
        // Fetch the full course outcome details including Bloom's levels and delivery methods
        const response = await configAPI.courseOutcomes.getById(id.toString());
        const fullData = response.data?.data || response.data || courseOutcome;
        
        setFormData({
          co_code: fullData.co_code || courseOutcome.co_code,
          course_outcome: fullData.course_outcome || courseOutcome.course_outcome,
          blooms_level_ids: fullData.blooms_level_ids || [],
          delivery_method_ids: fullData.delivery_method_ids || []
        });
        setEditingId(id);
        setShowModal(true);
      } catch (error) {
        
        // Fallback to basic data
        setFormData({
          co_code: courseOutcome.co_code,
          course_outcome: courseOutcome.course_outcome,
          blooms_level_ids: [],
          delivery_method_ids: []
        });
        setEditingId(id);
        setShowModal(true);
      }
    }
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  // Validate form data
  const validateForm = (): boolean => {
    // Clear any existing messages and validation errors
    setMessage(null);
    setValidationErrors({});

    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    // Check if curriculum, term, and course are selected
    if (!selectedCurriculum || !selectedTerm || !selectedCourse) {
      setMessage({ type: 'error', text: 'Please select curriculum, term, and course' });
      return false;
    }

    // Validate CO Code
    if (!formData.co_code.trim()) {
      errors.co_code = 'CO Code is required';
      hasErrors = true;
    } else if (!/^CO\d+$/i.test(formData.co_code.trim())) {
      errors.co_code = 'CO Code must be in format CO1, CO2, CO3, etc.';
      hasErrors = true;
    }

    // Validate Course Outcome
    if (!formData.course_outcome.trim()) {
      errors.course_outcome = 'Course Outcome description is required';
      hasErrors = true;
    } else if (formData.course_outcome.trim().length < 10) {
      errors.course_outcome = 'Course Outcome must be at least 10 characters long';
      hasErrors = true;
    } else if (formData.course_outcome.trim().length > 500) {
      errors.course_outcome = 'Course Outcome must not exceed 500 characters';
      hasErrors = true;
    }

    // Validate Bloom's levels (optional but if provided, should be valid)
    if (formData.blooms_level_ids.length > 0) {
      const invalidLevels = formData.blooms_level_ids.filter(id => 
        !bloomsLevels.some(level => level.id === id)
      );
      if (invalidLevels.length > 0) {
        errors.blooms_level_ids = 'Invalid Bloom\'s level selected';
        hasErrors = true;
      }
    }

    // Validate delivery methods (optional but if provided, should be valid)
    if (formData.delivery_method_ids.length > 0) {
      const invalidMethods = formData.delivery_method_ids.filter(id => 
        !deliveryMethods.some(method => method.id === id)
      );
      if (invalidMethods.length > 0) {
        errors.delivery_method_ids = 'Invalid delivery method selected';
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setValidationErrors(errors);
      // Show first validation error as popup
      const firstError = Object.values(errors)[0];
      setMessage({ type: 'error', text: firstError });
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      const data = {
        ...formData,
        curriculum_id: parseInt(selectedCurriculum),
        term_id: parseInt(selectedTerm),
        course_id: parseInt(selectedCourse),
        faculty_id: 1 // TODO: Get from auth context
      };

      

      if (editingId) {
        await configAPI.courseOutcomes.update(editingId.toString(), data);
        setMessage({ type: 'success', text: 'Course outcome updated successfully' });
      } else {
        await configAPI.courseOutcomes.create(data);
        setMessage({ type: 'success', text: 'Course outcome created successfully' });
      }

      // Close modal and reset form
      setShowModal(false);
      setFormData({
        co_code: '',
        course_outcome: '',
        blooms_level_ids: [],
        delivery_method_ids: []
      });
      setEditingId(null);
      
      // Refresh the course outcomes list
      await fetchCourseOutcomes();
    } catch (error: any) {
      
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error saving course outcome' 
      });
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      
      await configAPI.courseOutcomes.delete(deletingId.toString());
      setMessage({ type: 'success', text: 'Course outcome deleted successfully' });
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setDeletingId(null);
      
      // Refresh the course outcomes list
      await fetchCourseOutcomes();
    } catch (error: any) {
      
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error deleting course outcome' 
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle multi-select changes
  const handleBloomsLevelChange = (levelId: number) => {
    setFormData(prev => ({
      ...prev,
      blooms_level_ids: prev.blooms_level_ids.includes(levelId)
        ? prev.blooms_level_ids.filter(id => id !== levelId)
        : [...prev.blooms_level_ids, levelId]
    }));
  };

  const handleDeliveryMethodChange = (methodId: number) => {
    setFormData(prev => ({
      ...prev,
      delivery_method_ids: prev.delivery_method_ids.includes(methodId)
        ? prev.delivery_method_ids.filter(id => id !== methodId)
        : [...prev.delivery_method_ids, methodId]
    }));
  };

  // Effects
  useEffect(() => {
    fetchCurriculumRegulations();
    fetchTerms();
  }, []);

  useEffect(() => {
    if (selectedCurriculum && selectedTerm) {
      
      fetchLookupData();
    }
  }, [selectedCurriculum, selectedTerm, fetchLookupData]);


  useEffect(() => {
    if (selectedCurriculum && selectedTerm && selectedCourse) {
      fetchCourseOutcomes();
    }
  }, [selectedCurriculum, selectedTerm, selectedCourse, pagination.currentPage, searchTerm, fetchCourseOutcomes]);

  // Modal management
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

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    setFormData({
      co_code: '',
      course_outcome: '',
      blooms_level_ids: [],
      delivery_method_ids: []
    });
    setEditingId(null);
  };

  // Handle delete modal close
  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setDeletingId(null);
  };

  // Get curriculum display name
  const getCurriculumDisplayName = (curriculum: CurriculumRegulation) => {
    return `${curriculum.curriculum_batch} - ${curriculum.program_name} (${curriculum.from_year}-${curriculum.to_year})`;
  };

  return (
    <div className="course-outcomes-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Course Outcomes (COs) List</h1>
        <p>Manage Course Outcomes for curriculum batches and courses</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`business-alert business-alert-${message.type}`}>
          <span className="business-alert-text">{message.text}</span>
          <button
            className="business-alert-close"
            onClick={() => setMessage(null)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      )}

      {/* Selection Filters */}
      <div className="curriculum-selection-header">
        <div className="curriculum-selection-container">
          <div className="curriculum-batch-dropdown">
            <label className="business-form-label">Curriculum</label>
            <div className="business-form-input-wrapper">
              <select
                className="business-form-input"
                value={selectedCurriculum}
                onChange={(e) => handleCurriculumChange(e.target.value)}
              >
                <option value="">Select curriculum...</option>
                {Array.isArray(curriculumRegulations) && curriculumRegulations.map((curriculum) => (
                  <option key={curriculum.id} value={curriculum.id.toString()}>
                    {getCurriculumDisplayName(curriculum)}
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

          <div className="curriculum-batch-dropdown">
            <label className="business-form-label">Term</label>
            <div className="business-form-input-wrapper">
              <select
                className="business-form-input"
                value={selectedTerm}
                onChange={(e) => handleTermChange(e.target.value)}
                disabled={!selectedCurriculum}
              >
                <option value="">Select term...</option>
                {Array.isArray(terms) && terms.map((term) => (
                  <option key={term.id} value={term.id.toString()}>
                    {term.term_name}
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

          <div className="curriculum-batch-dropdown">
            <label className="business-form-label">Course</label>
            <div className="business-form-input-wrapper">
              <select
                className="business-form-input"
                value={selectedCourse}
                onChange={(e) => handleCourseChange(e.target.value)}
                disabled={!selectedTerm}
              >
                <option value="">Select course...</option>
                {Array.isArray(courses) && courses.map((course) => (
                  <option key={course.id} value={course.id.toString()}>
                    {course.course_code} - {course.course_title}
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
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid-container">
        {/* Grid Header - Only show when course is selected */}
        {selectedCourse && (
          <div className="grid-header">
            <div className="grid-header-spacer"></div>
            <div className="grid-header-actions">
              <div className="grid-search-container">
                <form className="grid-search-form" onSubmit={handleSearch}>
                  <div className="grid-search-input-group">
                    <input
                      type="text"
                      className="grid-search-input"
                      placeholder="Search course outcomes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="grid-search-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
              <button
                className="grid-add-button"
                onClick={handleAdd}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Add Course Outcome
              </button>
            </div>
          </div>
        )}

        {/* Grid Content */}
        {!selectedCourse ? (
          <div className="grid-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h3>Select Curriculum, Term, and Course</h3>
            <p>Please select a curriculum, term, and course to view course outcomes</p>
          </div>
        ) : loading ? (
          <div className="grid-loading">
            <div className="grid-loading-spinner"></div>
            <p>Loading course outcomes...</p>
          </div>
        ) : courseOutcomes.length === 0 ? (
          <div className="grid-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h3>No Course Outcomes Found</h3>
            <p>No course outcomes found for the selected course. Click "Add Course Outcome" to create one.</p>
          </div>
        ) : (
          <>
            {/* Data Grid */}
            <div className="grid-table-wrapper">
              <table className="grid-table">
                <thead>
                  <tr>
                    <th>CO Code</th>
                    <th>Course Outcome (CO)</th>
                    <th>Bloom's Level</th>
                    <th>Delivery Methods</th>
                    <th className="grid-actions-header" style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(courseOutcomes) && courseOutcomes.map((courseOutcome) => (
                    <tr key={courseOutcome.id}>
                      <td>
                        <span className="grid-cell-text font-semibold">
                          {courseOutcome.co_code}
                        </span>
                      </td>
                      <td>
                        <span className="grid-cell-text">
                          {courseOutcome.course_outcome}
                        </span>
                      </td>
                      <td>
                        <div className="blooms-levels-display">
                          {courseOutcome.blooms_levels ? (
                            courseOutcome.blooms_levels.split(', ').map((level, index) => (
                              <span key={index} className="blooms-level-tag">
                                {level.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="no-data-text">Not specified</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="delivery-methods-display">
                          {courseOutcome.delivery_methods ? (
                            courseOutcome.delivery_methods.split(', ').map((method, index) => (
                              <span key={index} className="delivery-method-tag">
                                {method.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="no-data-text">Not specified</span>
                          )}
                        </div>
                      </td>
                      <td className="grid-actions">
                        <div className="grid-action-btn-container">
                          <button
                            className="grid-action-btn edit"
                            onClick={() => handleEdit(courseOutcome.id)}
                            title="Edit Course Outcome"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                          <button
                            className="grid-action-btn delete"
                            onClick={() => handleDelete(courseOutcome.id)}
                            title="Delete Course Outcome"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke="currentColor" strokeWidth="2"/>
                              <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2"/>
                              <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                {pagination.totalCount} entries
              </div>
              {pagination.totalPages > 1 && (
                <div className="pagination-controls">
                  <div className="pagination-nav">
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.currentPage === 1}
                      title="First page"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 19L4 12L11 5M20 19L13 12L20 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      title="Previous page"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    
                    <div className="pagination-pages">
                      {(() => {
                        const pages = [];
                        const startPage = Math.max(1, pagination.currentPage - 2);
                        const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);
                        
                        if (startPage > 1) {
                          pages.push(
                            <button 
                              key={1}
                              className="pagination-btn"
                              onClick={() => handlePageChange(1)}
                            >
                              1
                            </button>
                          );
                          if (startPage > 2) {
                            pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
                          }
                        }
                        
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button 
                              key={i}
                              className={`pagination-btn ${i === pagination.currentPage ? 'active' : ''}`}
                              onClick={() => handlePageChange(i)}
                            >
                              {i}
                            </button>
                          );
                        }
                        
                        if (endPage < pagination.totalPages) {
                          if (endPage < pagination.totalPages - 1) {
                            pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
                          }
                          pages.push(
                            <button 
                              key={pagination.totalPages}
                              className="pagination-btn"
                              onClick={() => handlePageChange(pagination.totalPages)}
                            >
                              {pagination.totalPages}
                            </button>
                          );
                        }
                        
                        return pages;
                      })()}
                    </div>
                    
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                      title="Next page"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      title="Last page"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M13 5L20 12L13 19M4 5L11 12L4 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && createPortal(
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h2>{editingId ? 'Edit Course Outcome' : 'Add Course Outcome'}</h2>
                <p>{editingId ? 'Update the course outcome details' : 'Create a new course outcome for the selected course'}</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={handleModalClose}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <div className="business-form">
                <div className="business-form-group">
                  <label className="business-form-label">CO Code</label>
                  <div className="business-form-input-wrapper">
                    <input
                      type="text"
                      name="co_code"
                      className={`business-form-input ${validationErrors.co_code ? 'business-form-input-error' : ''}`}
                      value={formData.co_code}
                      onChange={handleInputChange}
                      placeholder="e.g., CO1, CO2, CO3"
                      required
                    />
                    <div className="business-form-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {validationErrors.co_code && (
                    <div className="business-form-error">{validationErrors.co_code}</div>
                  )}
                </div>

                <div className="business-form-group">
                  <label className="business-form-label">Course Outcome</label>
                  <div className="business-form-input-wrapper">
                    <textarea
                      name="course_outcome"
                      className={`business-form-input ${validationErrors.course_outcome ? 'business-form-input-error' : ''}`}
                      value={formData.course_outcome}
                      onChange={handleInputChange}
                      placeholder="Describe the course outcome..."
                      rows={4}
                      required
                    />
                    <div className="business-form-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {validationErrors.course_outcome && (
                    <div className="business-form-error">{validationErrors.course_outcome}</div>
                  )}
                </div>

                <div className="business-form-group">
                  <label className="business-form-label">Bloom's Levels</label>
                  <div className="business-checkbox-group">
                    {Array.isArray(bloomsLevels) && bloomsLevels.length > 0 ? (
                      bloomsLevels.map((level) => (
                        <label key={level.id} className="business-checkbox-item">
                          <input
                            type="checkbox"
                            checked={formData.blooms_level_ids.includes(level.id)}
                            onChange={() => handleBloomsLevelChange(level.id)}
                          />
                          <span className="business-checkbox-label">
                            {level.level_name} ({level.action_verbs})
                          </span>
                        </label>
                      ))
                    ) : (
                      <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
                        No Bloom's levels available
                      </div>
                    )}
                  </div>
                  {validationErrors.blooms_level_ids && (
                    <div className="business-form-error">{validationErrors.blooms_level_ids}</div>
                  )}
                </div>

                <div className="business-form-group">
                  <label className="business-form-label">Delivery Methods</label>
                  <div className="business-checkbox-group">
                    {Array.isArray(deliveryMethods) && deliveryMethods.length > 0 ? (
                      deliveryMethods.map((method) => (
                        <label key={method.id} className="business-checkbox-item">
                          <input
                            type="checkbox"
                            checked={formData.delivery_method_ids.includes(method.id)}
                            onChange={() => handleDeliveryMethodChange(method.id)}
                          />
                          <span className="business-checkbox-label">
                            {method.method_name}
                          </span>
                        </label>
                      ))
                    ) : (
                      <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
                        No delivery methods available
                      </div>
                    )}
                  </div>
                  {validationErrors.delivery_method_ids && (
                    <div className="business-form-error">{validationErrors.delivery_method_ids}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn modal-btn-secondary"
                onClick={handleModalClose}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-primary"
                onClick={handleSubmit}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 3V8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {editingId ? 'Update' : 'Create'} Course Outcome
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div className="modal-overlay" onClick={handleDeleteModalClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h2>Delete Course Outcome</h2>
                <p>This action cannot be undone</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={handleDeleteModalClose}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: '#dc2626', flexShrink: 0 }}>
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <p style={{ margin: 0, fontWeight: '500', color: '#991b1b', fontFamily: 'Calibri, Candara, Segoe, Segoe UI, Optima, Arial, sans-serif' }}>
                    Are you sure you want to delete this course outcome?
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#7f1d1d', fontFamily: 'Calibri, Candara, Segoe, Segoe UI, Optima, Arial, sans-serif' }}>
                    This action cannot be undone and will permanently remove the course outcome from the system.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn modal-btn-secondary"
                onClick={handleDeleteModalClose}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn"
                onClick={handleDeleteConfirm}
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                  e.currentTarget.style.borderColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.borderColor = '#dc2626';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2"/>
                  <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Delete Course Outcome
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CourseOutcomes;
