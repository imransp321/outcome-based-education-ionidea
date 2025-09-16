import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import { useMessage } from '../../contexts/MessageContext';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';
import '../../styles/shared/pagination.css';
import '../../styles/pages/Curriculum/TopicsAndTLOs.css';
import '../../styles/shared/business.css';

interface Curriculum {
  id: number;
  curriculum_batch: string;
  program_title: string;
  from_year: number;
  to_year: number;
}

interface Course {
  id: number;
  course_code: string;
  course_title: string;
}

interface Term {
  id: number;
  term_name: string;
}

interface Topic {
  id: number;
  topic_title: string;
  topic_content: string;
  topic_hours: number;
  delivery_methods: string;
  textbooks: string;
  assessment_questions: string;
  unit_id?: number;
  course_code: string;
  course_title: string;
  curriculum_batch: string;
  program_title: string;
  term_name: string;
}

const TopicsAndTLOs: React.FC = () => {
  const { showMessage } = useMessage();
  
  // State for dropdowns
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  // State for topics
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // State for form
  const [topicForm, setTopicForm] = useState({
    unit_id: '',
    topic_title: '',
    topic_content: '',
    topic_hours: 0,
    delivery_methods: '',
    textbooks: '',
    assessment_questions: ''
  });

  // Unit options
  const unitOptions = [
    { value: '1', label: 'Unit 1' },
    { value: '2', label: 'Unit 2' },
    { value: '3', label: 'Unit 3' },
    { value: '4', label: 'Unit 4' },
    { value: '5', label: 'Unit 5' },
    { value: '6', label: 'Unit 6' }
  ];

  const fetchCurriculums = useCallback(async () => {
    try {
      const response = await configAPI.curriculumRegulations.getAll();
      setCurriculums(response.data.data || []);
    } catch (error) {
      console.error('Failed to load curriculums:', error);
      showMessage({
        type: 'error',
        title: 'Error',
        message: 'Failed to load curriculums'
      });
    }
  }, []); // Remove showMessage dependency

  const fetchCourses = useCallback(async () => {
    try {
      const response = await configAPI.courses.getAll({
        curriculum_id: selectedCurriculum,
        term_id: selectedTerm
      });
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Failed to load courses:', error);
      showMessage({
        type: 'error',
        title: 'Error',
        message: 'Failed to load courses'
      });
    }
  }, [selectedCurriculum, selectedTerm]); // Remove showMessage dependency

  const fetchTerms = useCallback(async () => {
    try {
      const response = await configAPI.courses.getTerms();
      setTerms(response.data.data || []);
    } catch (error) {
      console.error('Failed to load terms:', error);
      showMessage({
        type: 'error',
        title: 'Error',
        message: 'Failed to load terms'
      });
    }
  }, []); // Remove showMessage dependency

  // Load initial data
  useEffect(() => {
    fetchCurriculums();
    fetchTerms();
  }, [fetchCurriculums, fetchTerms]);

  // Load courses when curriculum and term are selected
  useEffect(() => {
    if (selectedCurriculum && selectedTerm) {
      fetchCourses();
    }
  }, [selectedCurriculum, selectedTerm, fetchCourses]);

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await configAPI.topics.getAll({
        curriculum_id: selectedCurriculum,
        course_id: selectedCourse,
        term_id: selectedTerm,
        unit_id: selectedUnit,
        page: pagination.page,
        limit: pagination.limit
      });
      setTopics(response.data.data || []);
      setPagination(prev => response.data.pagination || prev);
    } catch (error) {
      
      showMessage({
        type: 'error',
        title: 'Error',
        message: 'Failed to load topics'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedCurriculum, selectedCourse, selectedTerm, selectedUnit, pagination.page, pagination.limit, showMessage]);

  // Load topics when course is selected
  useEffect(() => {
    if (selectedCourse && selectedCurriculum && selectedTerm) {
      fetchTopics();
    }
  }, [selectedCourse, selectedCurriculum, selectedTerm, fetchTopics]);

  const handleCurriculumChange = (curriculumId: string) => {
    setSelectedCurriculum(curriculumId);
    setSelectedCourse('');
    setSelectedTerm('');
    setSelectedUnit('');
    setTopics([]);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedUnit('');
    setTopics([]);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTermChange = (termId: string) => {
    setSelectedTerm(termId);
    setSelectedCourse('');
    setSelectedUnit('');
    setTopics([]);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleUnitChange = (unitId: string) => {
    setSelectedUnit(unitId);
    setPagination(prev => ({ ...prev, page: 1 }));
    if (selectedCourse && selectedCurriculum && selectedTerm) {
      fetchTopics();
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  const renderDeliveryMethods = (deliveryMethods: string) => {
    if (!deliveryMethods) return <span className="delivery-method-tag empty">No methods</span>;
    
    const methods = deliveryMethods.split(',').map(method => method.trim()).filter(method => method);
    
    return (
      <div className="delivery-methods-container">
        {methods.map((method, index) => {
          let tagClass = 'delivery-method-tag';
          const methodLower = method.toLowerCase();
          
          if (methodLower.includes('class room') || methodLower.includes('classroom')) {
            tagClass += ' class-room';
          } else if (methodLower.includes('laboratory') || methodLower.includes('lab')) {
            tagClass += ' laboratory';
          } else if (methodLower.includes('case study') || methodLower.includes('case-study')) {
            tagClass += ' case-study';
          } else if (methodLower.includes('workshop')) {
            tagClass += ' workshop';
          } else if (methodLower.includes('tutorial')) {
            tagClass += ' tutorial';
          }
          
          return (
            <span key={index} className={tagClass}>
              {method}
            </span>
          );
        })}
      </div>
    );
  };

  const handleAddTopic = () => {
    setTopicForm({
      unit_id: '',
      topic_title: '',
      topic_content: '',
      topic_hours: 0,
      delivery_methods: '',
      textbooks: '',
      assessment_questions: ''
    });
    setShowAddModal(true);
  };

  const handleEditTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setTopicForm({
      unit_id: topic.unit_id?.toString() || '',
      topic_title: topic.topic_title,
      topic_content: topic.topic_content || '',
      topic_hours: topic.topic_hours,
      delivery_methods: topic.delivery_methods || '',
      textbooks: topic.textbooks || '',
      assessment_questions: topic.assessment_questions || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setShowDeleteModal(true);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      
      if (!selectedCourse || !selectedCurriculum || !selectedTerm) {
        showMessage({
          type: 'error',
          title: 'Error',
          message: 'Please select curriculum, term, and course first'
        });
        return;
      }

      // Form validation
      if (!topicForm.topic_title.trim()) {
        showMessage({
          type: 'error',
          title: 'Validation Error',
          message: 'Topic title is required'
        });
        return;
      }

      if (!topicForm.unit_id) {
        showMessage({
          type: 'error',
          title: 'Validation Error',
          message: 'Please select a unit'
        });
        return;
      }

      if (topicForm.topic_hours <= 0) {
        showMessage({
          type: 'error',
          title: 'Validation Error',
          message: 'Topic hours must be greater than 0'
        });
        return;
      }

      const data = {
        ...topicForm,
        course_id: parseInt(selectedCourse),
        curriculum_id: parseInt(selectedCurriculum),
        term_id: parseInt(selectedTerm),
        unit_id: parseInt(topicForm.unit_id)
      };

      if (showAddModal) {
        await configAPI.topics.create(data);
        showMessage({
          type: 'success',
          title: 'Success',
          message: 'Topic created successfully'
        });
      } else {
        await configAPI.topics.update(selectedTopic!.id.toString(), data);
        showMessage({
          type: 'success',
          title: 'Success',
          message: 'Topic updated successfully'
        });
      }

      setShowAddModal(false);
      setShowEditModal(false);
      fetchTopics();
    } catch (error) {
      
      showMessage({
        type: 'error',
        title: 'Error',
        message: 'Error saving topic'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      await configAPI.topics.delete(selectedTopic!.id.toString());
      showMessage({
        type: 'success',
        title: 'Success',
        message: 'Topic deleted successfully'
      });
      setShowDeleteModal(false);
      setSelectedTopic(null);
      fetchTopics();
    } catch (error) {
      
      showMessage({
        type: 'error',
        title: 'Error',
        message: 'Error deleting topic'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (submitting) return;
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedTopic(null);
    setTopicForm({
      unit_id: '',
      topic_title: '',
      topic_content: '',
      topic_hours: 0,
      delivery_methods: '',
      textbooks: '',
      assessment_questions: ''
    });
  };

  return (
    <div className="grid-page">
      <div className="page-header">
        <h1>Manage Topics and TLOs</h1>
        <p>Based on your Course, you can add the number of Topics in your course</p>
      </div>

      {/* Clean Filter Card */}
      <div className="filter-card">
        <div className="filter-row">
          <div className="filter-group">
            <label>Curriculum</label>
            <select 
              value={selectedCurriculum} 
              onChange={(e) => handleCurriculumChange(e.target.value)}
              className="filter-select"
            >
              <option value="">Select curriculum...</option>
              {curriculums.map(curriculum => (
                <option key={curriculum.id} value={curriculum.id}>
                  {curriculum.curriculum_batch} - {curriculum.program_title}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Term</label>
            <select 
              value={selectedTerm} 
              onChange={(e) => handleTermChange(e.target.value)}
              className="filter-select"
              disabled={!selectedCurriculum}
            >
              <option value="">Select term...</option>
              {terms.map(term => (
                <option key={term.id} value={term.id}>
                  {term.term_name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Course</label>
            <select 
              value={selectedCourse} 
              onChange={(e) => handleCourseChange(e.target.value)}
              className="filter-select"
              disabled={!selectedCurriculum || !selectedTerm}
            >
              <option value="">Select course...</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.course_code} - {course.course_title}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Topic Units</label>
            <select 
              value={selectedUnit} 
              onChange={(e) => handleUnitChange(e.target.value)}
              className="filter-select"
              disabled={!selectedCourse}
            >
              <option value="">All units</option>
              {unitOptions.map(unit => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid-container">
        <div className="grid-header">
          <div className="grid-header-actions">
            <button 
              className="grid-add-button"
              onClick={handleAddTopic}
              disabled={!selectedCourse}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Add Topic
            </button>
          </div>
          <div className="grid-search">
            <input 
              type="text" 
              placeholder="Search topics..." 
              className="grid-search-input"
            />
            <svg className="grid-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        <div className="grid-table-wrapper">
          {loading ? (
            <div className="grid-loading">
              <div className="grid-loading-spinner"></div>
              <span>Loading topics...</span>
            </div>
          ) : topics.length === 0 ? (
            <div className="grid-empty">
              <div className="grid-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>No topics found</h3>
              <p>Select a curriculum, term, and course to view topics</p>
            </div>
          ) : (
            <table className="grid-table">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Topic Title</th>
                  <th>Duration (Hours)</th>
                  <th>Delivery Methods</th>
                  <th>Textbooks</th>
                  <th>Assessment Questions</th>
                  <th className="grid-actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => (
                  <tr key={topic.id}>
                    <td>Unit {topic.unit_id}</td>
                    <td>
                      <div className="topic-title">
                        <strong>{topic.topic_title}</strong>
                        {topic.topic_content && (
                          <div className="topic-content">{topic.topic_content}</div>
                        )}
                      </div>
                    </td>
                    <td>{topic.topic_hours}</td>
                    <td>{renderDeliveryMethods(topic.delivery_methods)}</td>
                    <td>
                      <div className="topic-textbooks">
                        {topic.textbooks || 'No textbooks specified'}
                      </div>
                    </td>
                    <td>
                      <div className="topic-assessment">
                        {topic.assessment_questions || 'No questions specified'}
                      </div>
                    </td>
                    <td className="grid-actions">
                      <button 
                        className="grid-action-btn"
                        onClick={() => handleEditTopic(topic)}
                        title="Edit topic"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button 
                        className="grid-action-btn"
                        onClick={() => handleDeleteTopic(topic)}
                        title="Delete topic"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {topics.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              {loading ? (
                <div className="pagination-loading">
                  <div className="pagination-loading-spinner"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                `Showing ${((pagination.page - 1) * pagination.limit) + 1} to ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} topics`
              )}
            </div>
            <div className="pagination-controls">
              <div className="pagination-size">
                <label>Show:</label>
                <select 
                  value={pagination.limit} 
                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                  className="pagination-select"
                  disabled={loading}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select>
                <span>per page</span>
              </div>
                
              <div className="pagination-nav">
                <button 
                  className="pagination-btn"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1 || loading}
                  title="First page"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M11 19L4 12L11 5M20 19L13 12L20 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                <button 
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  title="Previous page"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                <div className="pagination-pages">
                  {(() => {
                    const pages = [];
                    const startPage = Math.max(1, pagination.page - 2);
                    const endPage = Math.min(pagination.pages, pagination.page + 2);
                    
                    if (startPage > 1) {
                      pages.push(
                        <button 
                          key={1}
                          className="pagination-btn"
                          onClick={() => handlePageChange(1)}
                          disabled={loading}
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
                          className={`pagination-btn ${i === pagination.page ? 'active' : ''}`}
                          onClick={() => handlePageChange(i)}
                          disabled={loading}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    if (endPage < pagination.pages) {
                      if (endPage < pagination.pages - 1) {
                        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
                      }
                      pages.push(
                        <button 
                          key={pagination.pages}
                          className="pagination-btn"
                          onClick={() => handlePageChange(pagination.pages)}
                          disabled={loading}
                        >
                          {pagination.pages}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                </div>
                
                <button 
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || loading}
                  title="Next page"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                <button 
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.pages)}
                  disabled={pagination.page === pagination.pages || loading}
                  title="Last page"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M13 5L20 12L13 19M4 5L11 12L4 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Topic Modal */}
      {(showAddModal || showEditModal) && createPortal(
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h2>{showAddModal ? 'Add Topic' : 'Edit Topic'}</h2>
              </div>
              <button className="modal-close-btn" onClick={handleModalClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Unit *</label>
                <select 
                  value={topicForm.unit_id} 
                  onChange={(e) => setTopicForm(prev => ({ ...prev, unit_id: e.target.value }))}
                  className="form-control"
                >
                  {unitOptions.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Topic Title *</label>
                <input 
                  type="text"
                  value={topicForm.topic_title}
                  onChange={(e) => setTopicForm(prev => ({ ...prev, topic_title: e.target.value }))}
                  className="form-control"
                  placeholder="Enter topic title"
                />
              </div>

              <div className="form-group">
                <label>Topic Content</label>
                <textarea 
                  value={topicForm.topic_content}
                  onChange={(e) => setTopicForm(prev => ({ ...prev, topic_content: e.target.value }))}
                  className="form-control"
                  rows={4}
                  placeholder="Enter topic content details"
                />
              </div>

              <div className="form-group">
                <label>Duration to Delivery (Hours) *</label>
                <input 
                  type="number"
                  value={topicForm.topic_hours}
                  onChange={(e) => setTopicForm(prev => ({ ...prev, topic_hours: parseInt(e.target.value) || 0 }))}
                  className="form-control"
                  min="0"
                  placeholder="Enter hours"
                />
              </div>

              <div className="form-group">
                <label>Delivery Method</label>
                <input 
                  type="text"
                  value={topicForm.delivery_methods}
                  onChange={(e) => setTopicForm(prev => ({ ...prev, delivery_methods: e.target.value }))}
                  className="form-control"
                  placeholder="e.g., Case Study, Class Room Delivery"
                />
              </div>

              <div className="form-group">
                <label>Add Textbooks</label>
                <textarea 
                  value={topicForm.textbooks}
                  onChange={(e) => setTopicForm(prev => ({ ...prev, textbooks: e.target.value }))}
                  className="form-control"
                  rows={3}
                  placeholder="Enter textbook details"
                />
              </div>

              <div className="form-group">
                <label>Define Assessment Questions</label>
                <textarea 
                  value={topicForm.assessment_questions}
                  onChange={(e) => setTopicForm(prev => ({ ...prev, assessment_questions: e.target.value }))}
                  className="form-control"
                  rows={3}
                  placeholder="Enter assessment questions"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-btn modal-btn-secondary" onClick={handleModalClose}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Cancel
              </button>
              <button 
                className="modal-btn modal-btn-primary" 
                onClick={handleSubmit}
                disabled={submitting}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {submitting ? 'Saving...' : (showAddModal ? 'Create Topic' : 'Update Topic')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h2>Delete Topic</h2>
              </div>
              <button className="modal-close-btn" onClick={handleModalClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to delete this topic?</p>
              <div className="delete-topic-info">
                <strong>{selectedTopic?.topic_title}</strong>
                <span>Unit {selectedTopic?.unit_id}</span>
              </div>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>

            <div className="modal-footer">
              <button className="modal-btn modal-btn-secondary" onClick={handleModalClose}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Cancel
              </button>
              <button 
                className="modal-btn modal-btn-primary" 
                onClick={handleDeleteConfirm} 
                disabled={submitting}
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {submitting ? 'Deleting...' : 'Delete Topic'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TopicsAndTLOs;
