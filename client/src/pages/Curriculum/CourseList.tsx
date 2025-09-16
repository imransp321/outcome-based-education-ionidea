import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';
import '../../styles/pages/Curriculum/CourseList.css';

interface CurriculumRegulation {
  id: number;
  batch_name: string;
  program_name: string;
  department_name: string;
  from_year: number;
  to_year: number;
}

interface Term {
  id: number;
  term_name: string;
  term_number: number;
  description: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
}

interface Course {
  id: number;
  course_code: string;
  course_title: string;
  course_type: string;
  lecture_hours: string | number;
  tutorial_hours: string | number;
  practical_hours: string | number;
  self_study_hours: string | number;
  credits: string | number;
  total_marks: number;
  delivery_mode: string;
  course_owner_name: string | null;
  course_reviewer_name: string | null;
  co_status: string;
}


interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [curriculumRegulations, setCurriculumRegulations] = useState<CurriculumRegulation[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // State for add/edit course modal
  const [showCourseModal, setShowCourseModal] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    course_code: '',
    course_title: '',
    course_type: 'Core',
    lecture_hours: 0,
    tutorial_hours: 0,
    practical_hours: 0,
    self_study_hours: 0,
    credits: 0,
    total_marks: 100,
    delivery_mode: 'Theory',
    course_owner_id: '',
    course_reviewer_id: ''
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Utility functions
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };


  const fetchInitialData = async () => {
    try {
      
      const [curriculumRes, termsRes, usersRes] = await Promise.all([
        configAPI.courses.getCurriculumRegulations(),
        configAPI.courses.getTerms(),
        configAPI.courses.getUsers()
      ]);

      
      
      

      setCurriculumRegulations(curriculumRes.data.data);
      setTerms(termsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (error) {
      
      setMessage({ type: 'error', text: 'Failed to load initial data' });
    }
  };

  const fetchCourses = useCallback(async (curriculumId?: string, termId?: string, search?: string, page?: number, limit?: number) => {
    const curriculum = curriculumId || selectedCurriculum;
    const term = termId || selectedTerm;
    const searchQuery = search !== undefined ? search : searchTerm;
    const currentPage = page !== undefined ? page : pagination.currentPage;
    const pageLimit = limit !== undefined ? limit : pagination.itemsPerPage;

    

    if (!curriculum || !term) {
      
      return;
    }

    setLoading(true);
    try {
      const params = {
        curriculum_id: curriculum,
        term_id: term,
        search: searchQuery,
        page: currentPage,
        limit: pageLimit
      };

      
      const response = await configAPI.courses.getAll(params);
      
      setCourses(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      
      setMessage({ type: 'error', text: 'Failed to fetch courses' });
    } finally {
      setLoading(false);
    }
  }, [selectedCurriculum, selectedTerm, searchTerm, pagination.currentPage, pagination.itemsPerPage]);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Auto-select first curriculum and term when data loads (only on initial load)
  useEffect(() => {
    
    
    if (curriculumRegulations.length > 0 && !selectedCurriculum) {
      // Select curriculum with ID 1 (which has courses) instead of first in array
      const curriculumWithCourses = curriculumRegulations.find(cr => cr.id === 1) || curriculumRegulations[0];
      
      setSelectedCurriculum(curriculumWithCourses.id.toString());
    }
  }, [curriculumRegulations, selectedCurriculum]);

  // Auto-select first term when curriculum is selected and no term is selected
  useEffect(() => {
    if (selectedCurriculum && terms.length > 0 && !selectedTerm) {
      
      setSelectedTerm(terms[0].id.toString());
    }
  }, [selectedCurriculum, terms, selectedTerm]);

  // Fetch courses when filters change
  useEffect(() => {
    if (selectedCurriculum && selectedTerm) {
      fetchCourses();
    }
  }, [selectedCurriculum, selectedTerm, searchTerm, pagination.currentPage, pagination.itemsPerPage, fetchCourses]);

  const handleCurriculumChange = (value: string) => {
    setSelectedCurriculum(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    
    // Clear term selection and courses when curriculum changes
    setSelectedTerm('');
    setCourses([]);
    setLoading(true);
    
    // Auto-select first term if available
    if (value && terms.length > 0) {
      setSelectedTerm(terms[0].id.toString());
    } else {
      setLoading(false);
    }
  };

  const handleTermChange = (value: string) => {
    setSelectedTerm(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchCourses(selectedCurriculum, selectedTerm, searchTerm, 1, pagination.itemsPerPage);
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      course_code: '',
      course_title: '',
      course_type: 'Core',
      lecture_hours: 0,
      tutorial_hours: 0,
      practical_hours: 0,
      self_study_hours: 0,
      credits: 0,
      total_marks: 100,
      delivery_mode: 'Theory',
      course_owner_id: '',
      course_reviewer_id: ''
    });
    setShowCourseModal(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      course_code: course.course_code,
      course_title: course.course_title,
      course_type: course.course_type,
      lecture_hours: typeof course.lecture_hours === 'string' ? parseFloat(course.lecture_hours) : course.lecture_hours,
      tutorial_hours: typeof course.tutorial_hours === 'string' ? parseFloat(course.tutorial_hours) : course.tutorial_hours,
      practical_hours: typeof course.practical_hours === 'string' ? parseFloat(course.practical_hours) : course.practical_hours,
      self_study_hours: typeof course.self_study_hours === 'string' ? parseFloat(course.self_study_hours) : course.self_study_hours,
      credits: typeof course.credits === 'string' ? parseFloat(course.credits) : course.credits,
      total_marks: course.total_marks,
      delivery_mode: course.delivery_mode,
      course_owner_id: '',
      course_reviewer_id: ''
    });
    setShowCourseModal(true);
  };

  // Validate course form
  const validateCourseForm = (): boolean => {
    setValidationErrors({});
    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    // Validate course code
    if (!courseForm.course_code.trim()) {
      errors.course_code = 'Course code is required';
      hasErrors = true;
    } else if (courseForm.course_code.trim().length < 2) {
      errors.course_code = 'Course code must be at least 2 characters long';
      hasErrors = true;
    } else if (courseForm.course_code.trim().length > 20) {
      errors.course_code = 'Course code must not exceed 20 characters';
      hasErrors = true;
    }

    // Validate course title
    if (!courseForm.course_title.trim()) {
      errors.course_title = 'Course title is required';
      hasErrors = true;
    } else if (courseForm.course_title.trim().length < 5) {
      errors.course_title = 'Course title must be at least 5 characters long';
      hasErrors = true;
    } else if (courseForm.course_title.trim().length > 100) {
      errors.course_title = 'Course title must not exceed 100 characters';
      hasErrors = true;
    }

    // Validate numeric fields
    if (courseForm.lecture_hours < 0) {
      errors.lecture_hours = 'Lecture hours cannot be negative';
      hasErrors = true;
    }
    if (courseForm.tutorial_hours < 0) {
      errors.tutorial_hours = 'Tutorial hours cannot be negative';
      hasErrors = true;
    }
    if (courseForm.practical_hours < 0) {
      errors.practical_hours = 'Practical hours cannot be negative';
      hasErrors = true;
    }
    if (courseForm.self_study_hours < 0) {
      errors.self_study_hours = 'Self study hours cannot be negative';
      hasErrors = true;
    }
    if (courseForm.credits <= 0) {
      errors.credits = 'Credits must be greater than 0';
      hasErrors = true;
    }
    if (courseForm.total_marks <= 0) {
      errors.total_marks = 'Total marks must be greater than 0';
      hasErrors = true;
    }

    if (hasErrors) {
      setValidationErrors(errors);
      return false;
    }

    return true;
  };

  const handleSaveCourse = async () => {
    if (!selectedCurriculum || !selectedTerm) {
      setMessage({ type: 'error', text: 'Please select curriculum and term first' });
      return;
    }

    // Validate form before submission
    if (!validateCourseForm()) {
      return;
    }

    try {
      const courseData = {
        ...courseForm,
        curriculum_regulation_id: parseInt(selectedCurriculum),
        term_id: parseInt(selectedTerm),
        course_owner_id: courseForm.course_owner_id ? parseInt(courseForm.course_owner_id) : null,
        course_reviewer_id: courseForm.course_reviewer_id ? parseInt(courseForm.course_reviewer_id) : null
      };

      if (editingCourse) {
        await configAPI.courses.update(editingCourse.id.toString(), courseData);
        setMessage({ type: 'success', text: 'Course updated successfully' });
      } else {
        await configAPI.courses.create(courseData);
        setMessage({ type: 'success', text: 'Course created successfully' });
      }

      setShowCourseModal(false);
      fetchCourses();
    } catch (error) {
      
      setMessage({ type: 'error', text: 'Failed to save course' });
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await configAPI.courses.delete(courseId.toString());
        setMessage({ type: 'success', text: 'Course deleted successfully' });
        fetchCourses();
      } catch (error) {
        
        setMessage({ type: 'error', text: 'Failed to delete course' });
      }
    }
  };

  // Add modal-open class to body when modal is open
  useEffect(() => {
    if (showCourseModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showCourseModal]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };


  

  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Course List</h1>
        <p>Manage courses for different curriculum batches and terms</p>
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

      {/* Filters Section */}
      <div className="curriculum-selection-header">
        <div className="curriculum-selection-container">
          <div className="curriculum-batch-dropdown">
            <label className="business-form-label">Curriculum Batch</label>
            <div className="business-form-input-wrapper">
              <select
                className="business-form-input"
                value={selectedCurriculum}
                onChange={(e) => handleCurriculumChange(e.target.value)}
              >
                <option value="">Select a curriculum batch...</option>
                {curriculumRegulations.map((curriculum) => (
                  <option key={curriculum.id} value={curriculum.id.toString()}>
                    {curriculum.batch_name} - {curriculum.program_name} ({curriculum.from_year}-{curriculum.to_year})
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

          <div className="business-filter-group">
            <label className="business-filter-label">Term</label>
            <div className="business-form-input-wrapper">
              <select
                className="business-form-input"
                value={selectedTerm}
                onChange={(e) => handleTermChange(e.target.value)}
              >
                <option value="">Select Term</option>
                {terms.map((term) => (
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

          <button className="business-btn business-btn-secondary">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Import Courses
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid-container">
        {/* Grid Header */}
        <div className="grid-header">
          <div className="grid-header-actions">
            <button
              type="button"
              className="business-btn business-btn-primary"
              onClick={handleAddCourse}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" >
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add Course
            </button>
          </div>
          <div className="grid-search-container">
            <form onSubmit={handleSearch} className="grid-search-form">
              <div className="grid-search-input-group">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" >
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="grid-search-input"
                />
              </div>
            </form>
          </div>
        </div>
        
        {/* Grid Content */}
        {loading ? (
          <div className="grid-loading">
            <div className="grid-loading-icon">⏳</div>
            <p>Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="grid-empty">
            <div className="grid-empty-icon">📚</div>
            <p>No courses found</p>
            <p>Start by adding your first course for the selected curriculum and term</p>
          </div>
        ) : (
          <div className="grid-table-wrapper">
            <table className="grid-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Title</th>
                  <th>Type</th>
                  <th>L</th>
                  <th>T</th>
                  <th>P</th>
                  <th>SS</th>
                  <th>Credits</th>
                  <th>Marks</th>
                  <th>Owner</th>
                  <th>Reviewer</th>
                  <th>Mode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td><span className="grid-status active">{course.course_code}</span></td>
                    <td>{truncateText(course.course_title, 30)}</td>
                    <td><span className="grid-status active">{course.course_type}</span></td>
                    <td>{course.lecture_hours}</td>
                    <td>{course.tutorial_hours}</td>
                    <td>{course.practical_hours}</td>
                    <td>{course.self_study_hours}</td>
                    <td>{course.credits}</td>
                    <td>{course.total_marks}</td>
                    <td>{course.course_owner_name || '-'}</td>
                    <td>{course.course_reviewer_name || '-'}</td>
                    <td>{course.delivery_mode}</td>
                    <td>
                      <div className="grid-action-btn-container">
                        <button className="grid-action-btn edit" onClick={() => handleEditCourse(course)} title="Edit">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                        <button className="grid-action-btn delete" onClick={() => handleDeleteCourse(course.id)} title="Delete">
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
        {pagination.totalPages > 1 && (
          <div className="grid-footer">
            <div className="grid-pagination">
              <div className="grid-pagination-info">
                <span>
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                  {pagination.totalItems} entries
                </span>
              </div>
              <div className="grid-pagination-controls">
                <button
                  className="business-btn business-btn-sm business-btn-secondary"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </button>
                <div className="grid-pagination-pages">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`business-btn business-btn-sm ${
                        page === pagination.currentPage
                          ? 'business-btn-primary'
                          : 'business-btn-secondary'
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  className="business-btn business-btn-sm business-btn-secondary"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Course Modal */}
      {showCourseModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowCourseModal(false)}>
          <div className="modal book-chapter-modal-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <h3>{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
                <p className="modal-subtitle">Manage course information and curriculum details</p>
              </div>
              <button
                className="modal-header-cancel"
                onClick={() => setShowCourseModal(false)}
                title="Cancel"
              >
                Cancel
              </button>
            </div>

            <div className="modal-body">
              <div className="book-chapter-form-container">
                <div className="book-chapter-form-layout">
                  {/* Left Column */}
                  <div className="book-chapter-form-left">
                    <div className="book-chapter-form-group">
                      <label className="book-chapter-required">Course Code</label>
                      <div className="book-chapter-input-wrapper">
                        <input
                          type="text"
                          value={courseForm.course_code}
                          onChange={(e) => {
                            setCourseForm(prev => ({ ...prev, course_code: e.target.value }));
                            // Clear validation error for this field
                            if (validationErrors.course_code) {
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.course_code;
                                return newErrors;
                              });
                            }
                          }}
                          placeholder="e.g., CSC101"
                          className={`book-chapter-input ${validationErrors.course_code ? 'book-chapter-input-error' : ''}`}
                          required
                        />
                        <div className="book-chapter-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {validationErrors.course_code && (
                        <div className="book-chapter-form-error">{validationErrors.course_code}</div>
                      )}
                    </div>

                    <div className="book-chapter-form-group">
                      <label className="book-chapter-required">Course Title</label>
                      <div className="book-chapter-input-wrapper">
                        <input
                          type="text"
                          value={courseForm.course_title}
                          onChange={(e) => {
                            setCourseForm(prev => ({ ...prev, course_title: e.target.value }));
                            // Clear validation error for this field
                            if (validationErrors.course_title) {
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.course_title;
                                return newErrors;
                              });
                            }
                          }}
                          placeholder="e.g., Programming Fundamentals"
                          className={`book-chapter-input ${validationErrors.course_title ? 'book-chapter-input-error' : ''}`}
                          required
                        />
                        <div className="book-chapter-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {validationErrors.course_title && (
                        <div className="book-chapter-form-error">{validationErrors.course_title}</div>
                      )}
                    </div>

                    <div className="book-chapter-form-group">
                      <label>Course Type</label>
                      <div className="book-chapter-input-wrapper">
                        <select
                          value={courseForm.course_type}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, course_type: e.target.value }))}
                          className="book-chapter-input book-chapter-select"
                        >
                          <option value="Core">Core</option>
                          <option value="Elective-1">Elective-1</option>
                          <option value="Elective-2">Elective-2</option>
                          <option value="Lab">Lab</option>
                          <option value="Project">Project</option>
                        </select>
                        <div className="book-chapter-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="book-chapter-form-group">
                      <label>Delivery Mode</label>
                      <div className="book-chapter-input-wrapper">
                        <select
                          value={courseForm.delivery_mode}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, delivery_mode: e.target.value }))}
                          className="book-chapter-input book-chapter-select"
                        >
                          <option value="Theory">Theory</option>
                          <option value="Practical">Practical</option>
                          <option value="Theory + Practical">Theory + Practical</option>
                        </select>
                        <div className="book-chapter-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="book-chapter-form-group">
                      <label>Lecture Hours</label>
                      <div className="book-chapter-input-wrapper">
                        <input
                          type="number"
                          value={courseForm.lecture_hours}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, lecture_hours: parseFloat(e.target.value) || 0 }))}
                          min="0"
                          step="0.5"
                          className="book-chapter-input"
                        />
                        <div className="book-chapter-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="book-chapter-form-group">
                      <label>Tutorial Hours</label>
                      <div className="book-chapter-input-wrapper">
                        <input
                          type="number"
                          value={courseForm.tutorial_hours}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, tutorial_hours: parseFloat(e.target.value) || 0 }))}
                          min="0"
                          step="0.5"
                          className="book-chapter-input"
                        />
                        <div className="book-chapter-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="book-chapter-form-right">
                    <div className="book-chapter-form-group">
                      <label>Practical Hours</label>
                      <div className="book-chapter-input-wrapper">
                        <input
                          type="number"
                          value={courseForm.practical_hours}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, practical_hours: parseFloat(e.target.value) || 0 }))}
                          min="0"
                          step="0.5"
                          className="book-chapter-input"
                        />
                        <div className="book-chapter-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="book-chapter-form-group">
                      <label>Self Study Hours</label>
                      <div className="book-chapter-input-wrapper">
                        <input
                          type="number"
                          value={courseForm.self_study_hours}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, self_study_hours: parseFloat(e.target.value) || 0 }))}
                          min="0"
                          step="0.5"
                          className="book-chapter-input"
                        />
                        <div className="book-chapter-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="book-chapter-form-group">
                      <label>Credits</label>
                      <div className="book-chapter-input-wrapper">
                        <input
                          type="number"
                          value={courseForm.credits}
                          onChange={(e) => {
                            setCourseForm(prev => ({ ...prev, credits: parseFloat(e.target.value) || 0 }));
                            // Clear validation error for this field
                            if (validationErrors.credits) {
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.credits;
                                return newErrors;
                              });
                            }
                          }}
                          min="0"
                          step="0.5"
                          className={`book-chapter-input ${validationErrors.credits ? 'book-chapter-input-error' : ''}`}
                        />
                        <div className="book-chapter-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {validationErrors.credits && (
                        <div className="book-chapter-form-error">{validationErrors.credits}</div>
                      )}
                    </div>

                    <div className="book-chapter-form-group">
                      <label>Total Marks</label>
                      <div className="book-chapter-input-wrapper">
                        <input
                          type="number"
                          value={courseForm.total_marks}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, total_marks: parseInt(e.target.value) || 100 }))}
                          min="0"
                          className="book-chapter-input"
                        />
                        <div className="book-chapter-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="book-chapter-form-group">
                      <label>Course Owner</label>
                      <div className="book-chapter-input-wrapper">
                        <select
                          value={courseForm.course_owner_id}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, course_owner_id: e.target.value }))}
                          className="book-chapter-input book-chapter-select"
                        >
                          <option value="">Select Owner</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id.toString()}>
                              {user.first_name} {user.last_name} ({user.designation})
                            </option>
                          ))}
                        </select>
                        <div className="book-chapter-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="book-chapter-form-group">
                      <label>Course Reviewer</label>
                      <div className="book-chapter-input-wrapper">
                        <select
                          value={courseForm.course_reviewer_id}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, course_reviewer_id: e.target.value }))}
                          className="book-chapter-input book-chapter-select"
                        >
                          <option value="">Select Reviewer</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id.toString()}>
                              {user.first_name} {user.last_name} ({user.designation})
                            </option>
                          ))}
                        </select>
                        <div className="book-chapter-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="faculty-modal-btn faculty-modal-btn-cancel"
                onClick={() => setShowCourseModal(false)}
              >
                <span className="faculty-modal-btn-icon"></span>
                Cancel
              </button>
              <button
                type="button"
                className="faculty-modal-btn faculty-modal-btn-save"
                onClick={handleSaveCourse}
              >
                <span className="faculty-modal-btn-icon"></span>
                {editingCourse ? 'Update Course' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CourseList;
