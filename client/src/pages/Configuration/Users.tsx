import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import Grid from '../../components/Grid/Grid';
import ValidationPopup from '../../components/ValidationPopup';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

interface User {
  id: number;
  faculty_type_id: number;
  department_id: number;
  aadhar_number?: string;
  title?: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number?: string;
  department_designation?: string;
  user_group?: string;
  highest_qualification?: string;
  experience_years: number;
  is_active: boolean;
  faculty_type_name?: string;
  department_name?: string;
  created_at: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAccordion, setShowAccordion] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  const [formData, setFormData] = useState({
    faculty_type_id: '',
    department_id: '',
    aadhar_number: '',
    title: '',
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    department_designation: '',
    user_group: '',
    highest_qualification: '',
    experience_years: 0,
    is_active: true
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [successProgress, setSuccessProgress] = useState(100);

  // Grid columns configuration
  const gridColumns = [
    { key: 'first_name', title: 'Name', width: '25%' },
    { key: 'email', title: 'Email', width: '25%' },
    { key: 'department_name', title: 'Department', width: '20%' },
    { key: 'faculty_type_name', title: 'Type', width: '15%' },
    { key: 'status', title: 'Status', width: '15%' }
  ];

  // Utility functions
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Fetch users
  const fetchUsers = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await configAPI.users.getAll({ page, search });
        setUsers(response.data.data);
        setPagination(response.data.pagination);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch users' });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error message and field-specific validation errors when user starts typing
    if (message && message.type === 'error') {
      setMessage(null);
    }

    // Clear field-specific validation error
    if (validationErrors[name]) {
      setValidationErrors(prev => {
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
    setValidationErrors({});

    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    // Check required fields
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
      hasErrors = true;
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
      hasErrors = true;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
        hasErrors = true;
    } else {
      // Check for duplicate email (only for new users or when email is changed)
      const isEmailChanged = editingId ? 
        users.find(u => u.id === editingId)?.email !== formData.email : true;
      
      if (isEmailChanged && users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
        errors.email = 'This email address is already in use';
        hasErrors = true;
      }
    }

    if (!formData.faculty_type_id) {
      errors.faculty_type_id = 'Faculty type is required';
      hasErrors = true;
    }

    if (!formData.department_id) {
      errors.department_id = 'Department is required';
      hasErrors = true;
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        faculty_type_id: parseInt(formData.faculty_type_id),
        department_id: parseInt(formData.department_id),
        aadhar_number: formData.aadhar_number.trim() || null,
        title: formData.title.trim() || null,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        contact_number: formData.contact_number.trim() || null,
        department_designation: formData.department_designation.trim() || null,
        user_group: formData.user_group.trim() || null,
        highest_qualification: formData.highest_qualification.trim() || null,
        experience_years: parseInt(formData.experience_years.toString()) || 0,
        is_active: formData.is_active
      };

      if (editingId) {
        await configAPI.users.update(editingId.toString(), submitData);
        setMessage({ type: 'success', text: 'User updated successfully!' });
      } else {
        await configAPI.users.create(submitData);
        setMessage({ type: 'success', text: 'User created successfully!' });
      }
      
      await fetchUsers(pagination.currentPage, searchTerm);
      setShowAccordion(false);
      setEditingId(null);
      setFormData({
        faculty_type_id: '',
        department_id: '',
        aadhar_number: '',
        title: '',
        first_name: '',
        last_name: '',
        email: '',
        contact_number: '',
        department_designation: '',
        user_group: '',
        highest_qualification: '',
        experience_years: 0,
        is_active: true
      });
    } catch (error: any) {
      console.error('Error saving user:', error);
      let errorMessage = 'Failed to save user';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        errorMessage = error.response.data.errors[0].msg;
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setFormData({
      faculty_type_id: '',
      department_id: '',
      aadhar_number: '',
      title: '',
      first_name: '',
      last_name: '',
      email: '',
      contact_number: '',
      department_designation: '',
      user_group: '',
      highest_qualification: '',
      experience_years: 0,
      is_active: true
    });
    setEditingId(null);
    setValidationErrors({});
    setMessage(null);
    setShowAccordion(true);
  };

  // Handle edit
  const handleEdit = (user: User) => {
    setFormData({
      faculty_type_id: user.faculty_type_id ? user.faculty_type_id.toString() : '',
      department_id: user.department_id ? user.department_id.toString() : '',
      aadhar_number: user.aadhar_number || '',
      title: user.title || '',
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      contact_number: user.contact_number || '',
      department_designation: user.department_designation || '',
      user_group: user.user_group || '',
      highest_qualification: user.highest_qualification || '',
      experience_years: user.experience_years || 0,
      is_active: user.is_active
    });
    setEditingId(user.id);
    setValidationErrors({});
    setMessage(null);
    setShowAccordion(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await configAPI.users.delete(id.toString());
        setMessage({ type: 'success', text: 'User deleted successfully!' });
        fetchUsers(pagination.currentPage, searchTerm);
    } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete user' });
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAccordion(false);
    setEditingId(null);
    setFormData({
      faculty_type_id: '',
      department_id: '',
      aadhar_number: '',
      title: '',
      first_name: '',
      last_name: '',
      email: '',
      contact_number: '',
      department_designation: '',
      user_group: '',
      highest_qualification: '',
      experience_years: 0,
      is_active: true
    });
    setValidationErrors({});
    setMessage(null);
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
    fetchUsers(1, query);
  };

  const handleGridAdd = () => {
    handleAddNew();
  };

  const handleGridEdit = (user: User) => {
    handleEdit(user);
  };

  const handleGridDelete = (user: User) => {
    if (user.id) {
      handleDelete(user.id);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchUsers(page, searchTerm);
  };

  // Prepare data for Grid component
  const gridData = users.map(user => ({
    ...user,
    first_name: `${user.first_name} ${user.last_name}`,
    status: user.is_active ? 'Active' : 'Inactive'
  }));

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

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

  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Users</h1>
        <p>Manage system users and their access permissions.</p>
      </div>

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

      {/* Modal */}
      {showAccordion && createPortal(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <h2>{editingId ? 'Edit User' : 'Add New User'}</h2>
                <p>Enter user details below</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCancel}
                title="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <div className="modal-content">
              <form id="user-form" onSubmit={handleSubmit} className="business-form">
                {/* Basic Information Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Basic information</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="first_name" className="business-form-label">
                        First Name <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          className="business-form-input"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter first name"
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="last_name" className="business-form-label">
                        Last Name <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          className="business-form-input"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter last name"
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="email" className="business-form-label">
                        Email <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="business-form-input"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter email address"
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="contact_number" className="business-form-label">Contact Number</label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="tel"
                          id="contact_number"
                          name="contact_number"
                          className="business-form-input"
                          value={formData.contact_number}
                          onChange={handleInputChange}
                          placeholder="Enter contact number"
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                        </div>
                      </div>
                    </div>

                {/* Professional Information Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Professional information</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="faculty_type_id" className="business-form-label">
                        Faculty Type <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <select
                          id="faculty_type_id"
                          name="faculty_type_id"
                          className="business-form-input"
                          value={formData.faculty_type_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select faculty type</option>
                          <option value="1">Teaching</option>
                          <option value="2">Administrative</option>
                        </select>
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="department_id" className="business-form-label">
                        Department <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                        <select
                          id="department_id"
                          name="department_id"
                          className="business-form-input"
                          value={formData.department_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select department</option>
                          <option value="1">Computer Science</option>
                          <option value="2">Information Technology</option>
                          <option value="3">Electronics</option>
                        </select>
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="department_designation" className="business-form-label">Designation</label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          id="department_designation"
                          name="department_designation"
                          className="business-form-input"
                          value={formData.department_designation}
                          onChange={handleInputChange}
                          placeholder="Enter designation"
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="user_group" className="business-form-label">User Group</label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          id="user_group"
                          name="user_group"
                          className="business-form-input"
                          value={formData.user_group}
                          onChange={handleInputChange}
                          placeholder="Enter user group"
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                        </div>
                      </div>
                    </div>

                {/* Additional Information Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Additional information</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="aadhar_number" className="business-form-label">Aadhar Number</label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          id="aadhar_number"
                          name="aadhar_number"
                          className="business-form-input"
                          value={formData.aadhar_number}
                          onChange={handleInputChange}
                          placeholder="Enter Aadhar number"
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="highest_qualification" className="business-form-label">Highest Qualification</label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="text"
                          id="highest_qualification"
                          name="highest_qualification"
                          className="business-form-input"
                          value={formData.highest_qualification}
                          onChange={handleInputChange}
                          placeholder="Enter highest qualification"
                        />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="experience_years" className="business-form-label">Experience (Years)</label>
                      <div className="business-form-input-wrapper">
                        <input
                          type="number"
                          id="experience_years"
                          name="experience_years"
                          className="business-form-input"
                          value={formData.experience_years}
                          onChange={handleInputChange}
                          placeholder="Enter years of experience"
                          min="0"
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
                      <label htmlFor="is_active" className="business-form-label">Status</label>
                      <div className="business-form-checkbox">
                        <input
                          type="checkbox"
                          id="is_active"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="is_active">Active User</label>
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
                form="user-form"
                className="modal-btn modal-btn-primary"
                disabled={saving}
                onClick={handleSubmit}
              >
                {saving ? (
                  <>
                    <div className="modal-spinner"></div>
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
        addButtonText="Add User"
        searchPlaceholder="Search Users"
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
    </div>
  );
};

export default Users;