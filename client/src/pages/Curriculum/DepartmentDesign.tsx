import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import { useMessage } from '../../contexts/MessageContext';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';
import '../../styles/pages/Curriculum/DepartmentDesign.css';

interface Department {
  id: number;
  department_name: string;
}

interface VisionMission {
  id?: number;
  department_id: number;
  department_name?: string;
  mission_statement: string;
  vision_statement: string;
  core_values: string;
  graduate_attributes: string;
  created_at?: string;
  updated_at?: string;
}

const DepartmentDesign: React.FC = () => {
  const { showMessage } = useMessage();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  
  // Safeguard function to ensure selectedDepartmentId is never NaN
  const setSelectedDepartmentIdSafe = (id: number | null) => {
    if (id === null || (typeof id === 'number' && !isNaN(id) && id > 0)) {
      setSelectedDepartmentId(id);
    } else {
      setSelectedDepartmentId(null);
    }
  };
  const [visionMission, setVisionMission] = useState<VisionMission | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    mission_statement: '',
    vision_statement: '',
    core_values: '',
    graduate_attributes: ''
  });

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await configAPI.departments.getAllSimple();
      setDepartments(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch departments:', error);
      showMessage({ 
        type: 'error', 
        title: 'Error', 
        message: `Failed to fetch departments: ${error.response?.data?.message || error.message}` 
      });
    } finally {
      setLoading(false);
    }
  }, []); // Remove showMessage dependency to prevent infinite loop

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Manage modal body class
  useEffect(() => {
    if (showModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showModal]);

  // Monitor selectedDepartmentId for NaN values
  useEffect(() => {
    if (selectedDepartmentId !== null && (isNaN(selectedDepartmentId) || selectedDepartmentId <= 0)) {
      
      setSelectedDepartmentId(null);
    }
  }, [selectedDepartmentId]);

  // Fetch vision/mission when department changes
  useEffect(() => {
    if (selectedDepartmentId && !isNaN(selectedDepartmentId) && selectedDepartmentId > 0) {
      fetchVisionMission(selectedDepartmentId);
    } else {
      setVisionMission(null);
    }
  }, [selectedDepartmentId]);

  const fetchVisionMission = async (departmentId: number) => {
    try {
      setLoading(true);
      const response = await configAPI.departments.getVisionMission(departmentId);
      if (response.data.data) {
        // Ensure department name is included
        const selectedDept = departments.find(d => d.id === departmentId);
        setVisionMission({
          ...response.data.data,
          department_name: selectedDept?.department_name || 'Unknown Department'
        });
      } else {
        setVisionMission(null);
      }
    } catch (error: any) {
      // Set to null for any error
      setVisionMission(null);
      
      // Show error message only for non-404 errors (404 means no data exists)
      if (error.response?.status !== 404) {
        showMessage({ 
          type: 'error', 
          title: 'Error', 
          message: `Failed to fetch vision/mission data: ${error.response?.data?.message || error.message}` 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value === '' || value === 'Select department...' || !value) {
      setSelectedDepartmentIdSafe(null);
    } else {
      const departmentId = parseInt(value, 10);
      setSelectedDepartmentIdSafe(departmentId);
    }
  };

  const handleAddNew = () => {
    if (!selectedDepartmentId) {
      showMessage({ type: 'error', title: 'Error', message: 'Please select a department first' });
      return;
    }
    
    setIsEditMode(false);
    setFormData({
      mission_statement: '',
      vision_statement: '',
      core_values: '',
      graduate_attributes: ''
    });
    setShowModal(true);
  };

  const handleEdit = () => {
    if (!visionMission) return;
    
    
    setIsEditMode(true);
    setFormData({
      mission_statement: visionMission.mission_statement,
      vision_statement: visionMission.vision_statement,
      core_values: visionMission.core_values,
      graduate_attributes: visionMission.graduate_attributes
    });
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDepartmentId) {
      showMessage({ type: 'error', title: 'Error', message: 'Please select a department' });
      return;
    }

    // Basic validation
    if (!formData.mission_statement.trim() || !formData.vision_statement.trim() || 
        !formData.core_values.trim() || !formData.graduate_attributes.trim()) {
      showMessage({ type: 'error', title: 'Validation Error', message: 'Please fill in all required fields' });
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        department_id: selectedDepartmentId,
        ...formData
      };

      let response;
      if (isEditMode && visionMission?.id) {
        response = await configAPI.departments.updateVisionMission(visionMission.id.toString(), submitData);
      } else {
        response = await configAPI.departments.createVisionMission(submitData);
      }
      
      // Update local state with response data
      const updatedVisionMission = {
        ...response.data.data,
        department_name: response.data.data.department_name || selectedDepartment?.department_name
      };
      
      setVisionMission(updatedVisionMission);
      
      if (isEditMode) {
        showMessage({ type: 'success', title: 'Success', message: 'Vision/Mission updated successfully' });
      } else {
        showMessage({ type: 'success', title: 'Success', message: 'Vision/Mission created successfully' });
      }
      
      setShowModal(false);
    } catch (error: any) {
      showMessage({ 
        type: 'error', 
        title: 'Error',
        message: error.response?.data?.message || 'Failed to save vision/mission data' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setIsEditMode(false);
    setFormData({
      mission_statement: '',
      vision_statement: '',
      core_values: '',
      graduate_attributes: ''
    });
  };

  const selectedDepartment = selectedDepartmentId ? departments.find(d => d.id === selectedDepartmentId) : null;

  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Department Design</h1>
        <p>Manage Vision, Mission, Core Values, and Graduate Attributes for Departments</p>
      </div>

      {/* Grid Container */}
      <div className="grid-container">

        {/* Grid Header */}
        <div className="grid-header">
          <div className="grid-header-actions">
            <label htmlFor="department-select" className="business-form-label">
              Department
            </label>
            <div className="business-form-input-wrapper">
              <select
                id="department-select"
                className="business-form-input"
                value={selectedDepartmentId || ''}
                onChange={handleDepartmentChange}
                disabled={loading}
              >
                <option value="">Select department...</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.department_name}
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
          </div>
          <div className="grid-header-spacer"></div>
          {selectedDepartmentId && (
            <div className="grid-header-actions">
              <button
                className="grid-add-button"
                onClick={visionMission ? handleEdit : handleAddNew}
                disabled={loading}
              >
                {visionMission ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/>
                    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {visionMission ? 'Edit Vision & Mission' : 'Add Vision & Mission'}
              </button>
            </div>
          )}
        </div>

        {/* Grid Content */}
        {selectedDepartmentId && (
          <>
            {loading ? (
              <div className="grid-loading">
                <div className="grid-loading-icon">⏳</div>
                <p>Loading department information...</p>
              </div>
            ) : visionMission ? (
              <div className="department-cards-container">
                <div className="department-cards-grid">
                  {/* Vision Card */}
                  <div className="department-card vision-card">
                    <div className="department-card-header">
                      <div className="department-card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <h3 className="department-card-title">Vision Statement</h3>
                    </div>
                    <div className="department-card-content">
                      <p>{visionMission.vision_statement}</p>
                    </div>
                  </div>

                  {/* Mission Card */}
                  <div className="department-card mission-card">
                    <div className="department-card-header">
                      <div className="department-card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" strokeWidth="2"/>
                          <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <h3 className="department-card-title">Mission Statement</h3>
                    </div>
                    <div className="department-card-content">
                      <p>{visionMission.mission_statement}</p>
                    </div>
                  </div>

                  {/* Core Values Card */}
                  <div className="department-card values-card">
                    <div className="department-card-header">
                      <div className="department-card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <h3 className="department-card-title">Core Values</h3>
                    </div>
                    <div className="department-card-content">
                      <ul className="department-card-list">
                        {visionMission.core_values.split('\n').map((value, index) => (
                          <li key={index}>{value.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Graduate Attributes Card */}
                  <div className="department-card attributes-card">
                    <div className="department-card-header">
                      <div className="department-card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2"/>
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <h3 className="department-card-title">Graduate Attributes</h3>
                    </div>
                    <div className="department-card-content">
                      <ul className="department-card-list">
                        {visionMission.graduate_attributes.split('\n').map((attribute, index) => (
                          <li key={index}>{attribute.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="grid-empty">
                <div className="grid-empty-icon">📋</div>
                <p>Vision & Mission Not Set</p>
                <p>The vision, mission, core values, and graduate attributes have not been defined for <strong>{selectedDepartment?.department_name}</strong>.</p>
                <p>As the Head of Department, please set these important statements to guide the department's direction and goals.</p>
              </div>
            )}
          </>
        )}

        {/* Add/Edit Modal */}
        {showModal && createPortal(
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <div className="modal-title">
                  <h2>{isEditMode ? 'Edit' : 'Add'} Vision & Mission</h2>
                  <p>Define the vision, mission, core values, and graduate attributes for {selectedDepartment?.department_name}</p>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={handleCancel}
                  title="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
              <div className="modal-content">
                <form id="department-design-form" onSubmit={handleSubmit} className="business-form">
                  <div className="business-form-section">
                    <h3 className="business-form-section-title">Department Information</h3>
                    <div className="business-form-group">
                      <label className="business-form-label">Department Name</label>
                      <input
                        type="text"
                        className="business-form-input"
                        value={selectedDepartment?.department_name || ''}
                        disabled
                        style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                      />
                    </div>
                  </div>

                  <div className="business-form-section">
                    <h3 className="business-form-section-title">Vision & Mission Statements</h3>
                    <div className="business-form-group">
                      <label htmlFor="vision_statement" className="business-form-label">
                        Vision Statement
                      </label>
                      <div className="business-form-input-wrapper">
                        <textarea
                          id="vision_statement"
                          name="vision_statement"
                          className="business-form-input"
                          value={formData.vision_statement}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Enter the department's vision statement..."
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="mission_statement" className="business-form-label">
                        Mission Statement
                      </label>
                      <div className="business-form-input-wrapper">
                        <textarea
                          id="mission_statement"
                          name="mission_statement"
                          className="business-form-input"
                          value={formData.mission_statement}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Enter the department's mission statement..."
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="business-form-section">
                    <h3 className="business-form-section-title">Core Values & Graduate Attributes</h3>
                    <div className="business-form-group">
                      <label htmlFor="core_values" className="business-form-label">
                        Core Values
                      </label>
                      <div className="business-form-input-wrapper">
                        <textarea
                          id="core_values"
                          name="core_values"
                          className="business-form-input"
                          value={formData.core_values}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Enter the department's core values..."
                          required
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.91.37 4.15 1.02" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="graduate_attributes" className="business-form-label">
                        Graduate Attributes (GAs)
                      </label>
                      <div className="business-form-input-wrapper">
                        <textarea
                          id="graduate_attributes"
                          name="graduate_attributes"
                          className="business-form-input"
                          value={formData.graduate_attributes}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Enter the graduate attributes for this department..."
                          required
                        />
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
                  type="button"
                  className="modal-btn modal-btn-primary"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="modal-spinner"></div>
                      {isEditMode ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 3V8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {isEditMode ? 'Update' : 'Save'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default DepartmentDesign;
