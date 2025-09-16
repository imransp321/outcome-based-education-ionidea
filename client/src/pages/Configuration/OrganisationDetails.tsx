import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { configAPI } from '../../services/api';
import Grid from '../../components/Grid/Grid';
import ValidationPopup from '../../components/ValidationPopup';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

// Utility function to get the correct base URL for static files
const getStaticBaseUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace('/api', '');
};

interface OrganisationData {
  id?: number;
  society_name: string;
  organisation_name: string;
  description?: string;
  mission: string;
  vision: string;
  mandate?: string;
  logo_url?: string;
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

const OrganisationDetails: React.FC = () => {
  const [organisations, setOrganisations] = useState<OrganisationData[]>([]);
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

  const [formData, setFormData] = useState<OrganisationData>({
    society_name: '',
    organisation_name: '',
    description: '',
    mission: '',
    vision: '',
    mandate: '',
    logo_url: ''
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [existingLogo, setExistingLogo] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [successProgress, setSuccessProgress] = useState(100);
  const [logoLoading, setLogoLoading] = useState(false);
  const [currentOrganisationId, setCurrentOrganisationId] = useState<number | null>(null);
  const [logoCache, setLogoCache] = useState<{[key: number]: string}>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const logoImageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Grid columns configuration
  const gridColumns = [
    { key: 'organisation_name', title: 'Organisation', width: '30%' },
    { key: 'society_name', title: 'Society', width: '25%' },
    { key: 'description', title: 'Description', width: '25%' },
    { key: 'mission', title: 'Mission', width: '20%' }
  ];

  // Utility functions
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };


  // Fetch organisations
  const fetchOrganisations = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await configAPI.organisation.getAll({ page, search });
      setOrganisations(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch organisations' });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    if (!formData.society_name.trim()) {
      errors.society_name = 'Society name is required';
      hasErrors = true;
    } else if (formData.society_name.trim().length < 2) {
      errors.society_name = 'Society name must be at least 2 characters long';
      hasErrors = true;
    }

    if (!formData.organisation_name.trim()) {
      errors.organisation_name = 'Organisation name is required';
      hasErrors = true;
    } else if (formData.organisation_name.trim().length < 2) {
      errors.organisation_name = 'Organisation name must be at least 2 characters long';
      hasErrors = true;
    }

    if (!formData.mission.trim()) {
      errors.mission = 'Mission is required';
      hasErrors = true;
    } else if (formData.mission.trim().length < 10) {
      errors.mission = 'Mission must be at least 10 characters long';
      hasErrors = true;
    }

    if (!formData.vision.trim()) {
      errors.vision = 'Vision is required';
      hasErrors = true;
    } else if (formData.vision.trim().length < 10) {
      errors.vision = 'Vision must be at least 10 characters long';
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
    console.log('Form submitted!');
    
    // Validate form before submission
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, starting save process');
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('society_name', formData.society_name.trim());
      formDataToSend.append('organisation_name', formData.organisation_name.trim());
      formDataToSend.append('description', formData.description?.trim() || '');
      formDataToSend.append('mission', formData.mission.trim());
      formDataToSend.append('vision', formData.vision.trim());
      formDataToSend.append('mandate', formData.mandate?.trim() || '');

      // Handle logo data
      console.log('Form submission - selectedFile:', selectedFile);
      console.log('Form submission - logoPreview:', logoPreview);
      console.log('Form submission - editingId:', editingId);
      
      if (selectedFile) {
        // New logo file selected - send it
        console.log('Sending new logo file:', selectedFile.name);
        formDataToSend.append('logo', selectedFile, selectedFile.name);
      } else if (editingId && !logoPreview && !existingLogo) {
        // For updates with deleted logo (no file selected and no existing logo), send delete flag
        console.log('Sending delete logo flag');
        formDataToSend.append('delete_logo', 'true');
      }
      // If editingId && existing logo, backend will keep existing logo by default

      if (editingId) {
        console.log('Sending update request with FormData:');
        console.log('FormData keys:', Array.from(formDataToSend.keys()));
        console.log('Has logo file:', formDataToSend.has('logo'));
        console.log('Has delete_logo:', formDataToSend.has('delete_logo'));
        
        // Send FormData with proper headers
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/config/organisation/${editingId}`, {
          method: 'PUT',
          body: formDataToSend,
          // Don't set Content-Type, let browser set it for FormData
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Update response:', result);
        setMessage({ type: 'success', text: 'Organisation updated successfully' });
      } else {
        // Send FormData with proper headers for create
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/config/organisation`, {
          method: 'POST',
          body: formDataToSend,
          // Don't set Content-Type, let browser set it for FormData
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Create response:', result);
        setMessage({ type: 'success', text: 'Organisation created successfully' });
      }

      // Refresh the data from database after update
      await fetchOrganisations(pagination.currentPage, searchTerm);
      
      setShowAccordion(false);
      setEditingId(null);
      setCurrentOrganisationId(null);
      setFormData({
        society_name: '',
        organisation_name: '',
        description: '',
        mission: '',
        vision: '',
        mandate: '',
        logo_url: ''
      });
      setLogoPreview(null);
      setExistingLogo(null);
      setSelectedFile(null);
      setLogoLoading(false);
      // Clear logo cache to prevent stale data
      setLogoCache({});
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save organisation' });
    } finally {
      setSaving(false);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setFormData({
      society_name: '',
      organisation_name: '',
      description: '',
      mission: '',
      vision: '',
      mandate: '',
      logo_url: ''
    });
    setLogoPreview(null);
    setExistingLogo(null);
    setSelectedFile(null);
    setLogoLoading(false);
    setEditingId(null);
    setCurrentOrganisationId(null);
    setValidationErrors({});
    setMessage(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowAccordion(true);
  };

  // Handle edit
  const handleEdit = (org: OrganisationData) => {
    console.log('Edit organisation:', org);
    console.log('Logo URL from database:', org.logo_url);
    
    setFormData({
      society_name: org.society_name,
      organisation_name: org.organisation_name,
      description: org.description || '',
      mission: org.mission,
      vision: org.vision,
      mandate: org.mandate || '',
      logo_url: org.logo_url || ''
    });
    
    // Store current organisation ID for reference
    setCurrentOrganisationId(org.id!);
    
    // Set existing logo URL
    if (org.logo_url) {
      const logoUrl = org.logo_url.startsWith('/') 
        ? `${getStaticBaseUrl()}${org.logo_url}`
        : `${getStaticBaseUrl()}/uploads/logos/${org.logo_url}`;
      console.log('Setting existing logo URL:', logoUrl);
      setExistingLogo(logoUrl);
    } else {
      console.log('No logo URL, clearing existing logo');
      setExistingLogo(null);
      // Clear logo cache for this organisation if no logo
      setLogoCache(prev => {
        const newCache = { ...prev };
        delete newCache[org.id!];
        return newCache;
      });
    }
    
    setLogoPreview(null);
    setSelectedFile(null);
    setLogoLoading(false);
    setEditingId(org.id!);
    setValidationErrors({});
    setMessage(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowAccordion(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this organisation?')) {
      try {
        await configAPI.organisation.delete(id.toString());
        setMessage({ type: 'success', text: 'Organisation deleted successfully' });
        fetchOrganisations(pagination.currentPage, searchTerm);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete organisation' });
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
      setShowAccordion(false);
      setEditingId(null);
      setCurrentOrganisationId(null);
      setFormData({
        society_name: '',
        organisation_name: '',
        description: '',
        mission: '',
        vision: '',
        mandate: '',
        logo_url: ''
      });
      setLogoPreview(null);
      setExistingLogo(null);
      setLogoLoading(false);
      setValidationErrors({});
      setMessage(null);
      // Clear logo cache to prevent stale data
      setLogoCache({});
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
    fetchOrganisations(1, query);
  };

  const handleGridAdd = () => {
    handleAddNew();
  };

  const handleGridEdit = (org: OrganisationData) => {
    handleEdit(org);
  };

  const handleGridDelete = (org: OrganisationData) => {
    if (org.id) {
      handleDelete(org.id);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchOrganisations(page, searchTerm);
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileChange called, event:', e);
    const file = e.target.files?.[0];
    console.log('File selected:', file);
    console.log('File details:', file ? {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    } : 'No file');
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file' });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        return;
      }
      
      // Store the file
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
        console.log('Logo preview created');
      };
      reader.readAsDataURL(file);
      
      // Clear any existing logo state
      setExistingLogo(null);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please drop an image file' });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        return;
      }
      
      // Store the file
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
        console.log('Logo preview created from drop');
      };
      reader.readAsDataURL(file);
      
      // Clear any existing logo state
      setExistingLogo(null);
    }
  };

  // Handle delete logo
  const handleDeleteLogo = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to parent upload area
    console.log('Delete logo clicked');
    
    // Clear all logo-related state
    setLogoPreview(null);
    setExistingLogo(null);
    setSelectedFile(null);
    setLogoLoading(false);
    
    // Clear logo cache for current organisation
    if (currentOrganisationId) {
      setLogoCache(prev => {
        const newCache = { ...prev };
        delete newCache[currentOrganisationId];
        console.log('Cleared logo cache for organisation:', currentOrganisationId);
        return newCache;
      });
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      console.log('File input reset');
    }
    
    console.log('Logo deleted successfully');
  };

  // Prepare data for Grid component
  const gridData = organisations.map(org => ({
    ...org,
    organisation_name: org.organisation_name || (org as any).organisation_name,
    society_name: org.society_name,
    description: org.description ? truncateText(org.description, 60) : '-',
    mission: org.mission ? truncateText(org.mission, 50) : '-'
  }));

  // Load data on component mount
  useEffect(() => {
    fetchOrganisations();
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
        <h1>Organisation Details</h1>
        <p>Manage organisation information, mission, vision, and mandate details.</p>
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
                <h2>{editingId ? 'Edit Organisation' : 'Add New Organisation'}</h2>
                <p>Enter organisation details below</p>
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
              <form id="organisation-form" onSubmit={handleSubmit} className="business-form">
                {/* Basic Information Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Basic information</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="society_name" className="business-form-label">
                        Society name <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                      <input
                        type="text"
                        id="society_name"
                        name="society_name"
                        className="business-form-input"
                        value={formData.society_name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter society name"
                      />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 21h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5 21V7l8-4v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 21V11l-6-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="organisation_name" className="business-form-label">
                        Organisation name <span className="required">*</span>
                      </label>
                      <div className="business-form-input-wrapper">
                      <input
                        type="text"
                        id="organisation_name"
                        name="organisation_name"
                        className="business-form-input"
                        value={formData.organisation_name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter organisation name"
                      />
                        <div className="business-form-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 21h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5 21V7l8-4v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 21V11l-6-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="business-form-group business-form-group-full">
                    <label htmlFor="description" className="business-form-label">Description</label>
                    <div className="business-form-textarea-wrapper">
                    <textarea
                      id="description"
                      name="description"
                      className="business-form-textarea"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Brief description of the organisation..."
                    />
                      <div className="business-form-textarea-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mission, Vision, Mandate Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Mission, vision & mandate</h3>
                  <div className="business-form-grid">
                    <div className="business-form-group">
                      <label htmlFor="mission" className="business-form-label">
                        Mission <span className="required">*</span>
                      </label>
                      <div className="business-form-textarea-wrapper">
                      <textarea
                        id="mission"
                        name="mission"
                        className="business-form-textarea"
                        value={formData.mission}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Organisation's mission statement..."
                        required
                      />
                        <div className="business-form-textarea-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="vision" className="business-form-label">
                        Vision <span className="required">*</span>
                      </label>
                      <div className="business-form-textarea-wrapper">
                      <textarea
                        id="vision"
                        name="vision"
                        className="business-form-textarea"
                        value={formData.vision}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Organisation's vision statement..."
                        required
                      />
                        <div className="business-form-textarea-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="business-form-group">
                      <label htmlFor="mandate" className="business-form-label">Mandate</label>
                      <div className="business-form-textarea-wrapper">
                      <textarea
                        id="mandate"
                        name="mandate"
                        className="business-form-textarea"
                        value={formData.mandate}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Organisation's mandate..."
                      />
                        <div className="business-form-textarea-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logo Section */}
                <div className="business-form-section">
                  <h3 className="business-form-section-title">Organisation logo</h3>
                  <div className="business-form-group">
                    <label htmlFor="logo" className="business-form-label">Logo upload</label>

                    {/* Drag and Drop Area */}
                    <div
                      className={`logo-upload-area ${isDragOver ? 'drag-over' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => {
                        console.log('Upload area clicked, fileInputRef:', fileInputRef.current);
                        fileInputRef.current?.click();
                      }}
                    >
                      <div className="upload-content">
                        {(logoPreview || existingLogo) ? (
                          <div className="logo-preview-container">
                            {logoLoading && (
                              <div className="logo-loading">
                                <div className="logo-loading-spinner"></div>
                                <p>Loading logo...</p>
                              </div>
                            )}
                            <img
                              ref={logoImageRef}
                              src={logoPreview || existingLogo || ''}
                              alt="Logo preview"
                              className="logo-preview"
                              crossOrigin="anonymous"
                              style={{ display: logoLoading ? 'none' : 'block' }}
                              onLoadStart={() => setLogoLoading(true)}
                              onError={() => {
                                setLogoLoading(false);
                                setExistingLogo(null);
                                setMessage({ type: 'error', text: 'Failed to load logo image. Please try uploading again.' });
                              }}
                              onLoad={() => {
                                setLogoLoading(false);
                                
                                // Cache the successful logo URL for this organisation
                                if (currentOrganisationId && logoImageRef.current?.src) {
                                  const imageSrc = logoImageRef.current.src;
                                  setLogoCache(prev => ({
                                    ...prev,
                                    [currentOrganisationId]: imageSrc
                                  }));
                                }
                              }}
                            />
                            <div className="logo-overlay">
                              <button
                                type="button"
                                className="business-btn business-btn-sm business-btn-danger"
                                onClick={handleDeleteLogo}
                                title="Delete logo"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" >
                                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="upload-placeholder">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" >
                              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div className="upload-text">
                              <p className="upload-title">Drop your logo here</p>
                              <p className="upload-subtitle">Or click to browse</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="logo"
                        name="logo"
                        className="file-input-hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>

                    <div className="upload-info">
                      <p className="upload-hint">
                        Supported formats: JPG, PNG, GIF, SVG. Max size: 5MB
                      </p>
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
                form="organisation-form"
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
        addButtonText="Add Organisation Details"
        searchPlaceholder="Search Organisation Details"
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

export default OrganisationDetails;
