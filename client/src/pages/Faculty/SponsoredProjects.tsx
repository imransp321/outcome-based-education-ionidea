import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Grid from '../../components/Grid/Grid';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';
import '../../styles/components/SharedModal.css';

interface SponsoredProjectsData {
  id?: number;
  projectType: string;
  projectTitle: string;
  yearOfSanction: string;
  principalInvestigator: string;
  coInvestigator: string;
  amount: number;
  status: string;
  duration: number;
  sponsoringOrganization: string;
  collaboratingOrganization: string;
  sanctionedDepartment: string;
  description: string;
  uploadFile?: string;
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

const SponsoredProjects: React.FC = () => {
  const [data, setData] = useState<SponsoredProjectsData[]>([]);
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

  const [formData, setFormData] = useState<SponsoredProjectsData>({
    projectType: 'Sponsored Project',
    projectTitle: '',
    yearOfSanction: '',
    principalInvestigator: '',
    coInvestigator: '',
    amount: 0,
    status: 'On Going',
    duration: 0,
    sponsoringOrganization: '',
    collaboratingOrganization: '',
    sanctionedDepartment: '',
    description: '',
    uploadFile: ''
  });

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [existingFile, setExistingFile] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Grid columns configuration
  const gridColumns = [
    { key: 'projectTitle', title: 'Project Title', width: '30%' },
    { key: 'principalInvestigator', title: 'Principal Investigator', width: '20%' },
    { key: 'sponsoringOrganization', title: 'Sponsoring Organization', width: '20%' },
    { key: 'status', title: 'Status', width: '15%' },
    { key: 'amount', title: 'Amount', width: '15%' }
  ];

  // Utility functions
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Sample data
  const sampleData: SponsoredProjectsData[] = [
    {
      id: 1,
      projectType: 'Sponsored Project',
      projectTitle: 'AI-Powered Learning Analytics for Educational Assessment',
      yearOfSanction: '2023',
      principalInvestigator: 'Dr. John Smith',
      coInvestigator: 'Dr. Jane Doe, Dr. Michael Johnson',
      amount: 2500000,
      status: 'On Going',
      duration: 36,
      sponsoringOrganization: 'Department of Science and Technology',
      collaboratingOrganization: 'IIT Delhi, University of California',
      sanctionedDepartment: 'Computer Science and Engineering',
      description: 'Development of AI algorithms for student performance prediction and learning analytics.',
      uploadFile: 'project_sanction_letter.pdf'
    },
    {
      id: 2,
      projectType: 'Consultancy Work',
      projectTitle: 'Industry 4.0 Implementation for Manufacturing',
      yearOfSanction: '2024',
      principalInvestigator: 'Dr. Sarah Wilson',
      coInvestigator: 'Dr. Robert Brown',
      amount: 500000,
      status: 'Completed',
      duration: 12,
      sponsoringOrganization: 'ABC Manufacturing Ltd.',
      collaboratingOrganization: 'XYZ Technologies',
      sanctionedDepartment: 'Mechanical Engineering',
      description: 'Consultancy project for implementing Industry 4.0 technologies in manufacturing processes.',
      uploadFile: 'consultancy_agreement.pdf'
    }
  ];

  // Fetch data
  const fetchData = async (page = 1, search = '') => {
    setLoading(true);
    try {
      // Simulate API call with sample data
      setTimeout(() => {
        const filteredData = sampleData.filter(item =>
          item.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
          item.principalInvestigator.toLowerCase().includes(search.toLowerCase()) ||
          item.sponsoringOrganization.toLowerCase().includes(search.toLowerCase())
        );
        
        const itemsPerPage = 10;
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        setData(paginatedData);
        setPagination({
          currentPage: page,
          totalPages,
          totalCount: filteredData.length,
          hasNext: page < totalPages,
          hasPrev: page > 1
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch sponsored projects data' });
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'duration' ? Number(value) : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Simulate API call
      setTimeout(() => {
        if (editingId) {
          setData(prev => prev.map(item => 
            item.id === editingId ? { ...formData, id: editingId } : item
          ));
          setMessage({ type: 'success', text: 'Sponsored project updated successfully' });
        } else {
          const newItem = {
            ...formData,
            id: Date.now()
          };
          setData(prev => [newItem, ...prev]);
          setMessage({ type: 'success', text: 'Sponsored project created successfully' });
        }

        setShowAccordion(false);
        setEditingId(null);
        setFormData({
          projectType: 'Sponsored Project',
          projectTitle: '',
          yearOfSanction: '',
          principalInvestigator: '',
          coInvestigator: '',
          amount: 0,
          status: 'On Going',
          duration: 0,
          sponsoringOrganization: '',
          collaboratingOrganization: '',
          sanctionedDepartment: '',
          description: '',
          uploadFile: ''
        });
        setFilePreview(null);
        setExistingFile(null);
        setSaving(false);
        fetchData(pagination.currentPage, searchTerm);
      }, 500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save sponsored project' });
      setSaving(false);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setFormData({
      projectType: 'Sponsored Project',
      projectTitle: '',
      yearOfSanction: '',
      principalInvestigator: '',
      coInvestigator: '',
      amount: 0,
      status: 'On Going',
      duration: 0,
      sponsoringOrganization: '',
      collaboratingOrganization: '',
      sanctionedDepartment: '',
      description: '',
      uploadFile: ''
    });
    setFilePreview(null);
    setExistingFile(null);
    setEditingId(null);
    setShowAccordion(true);
  };

  // Handle edit
  const handleEdit = (item: SponsoredProjectsData) => {
    setFormData({
      projectType: item.projectType,
      projectTitle: item.projectTitle,
      yearOfSanction: item.yearOfSanction,
      principalInvestigator: item.principalInvestigator,
      coInvestigator: item.coInvestigator,
      amount: item.amount,
      status: item.status,
      duration: item.duration,
      sponsoringOrganization: item.sponsoringOrganization,
      collaboratingOrganization: item.collaboratingOrganization,
      sanctionedDepartment: item.sanctionedDepartment,
      description: item.description,
      uploadFile: item.uploadFile || ''
    });
    setExistingFile(item.uploadFile || null);
    setFilePreview(null);
    setEditingId(item.id!);
    setShowAccordion(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this sponsored project entry?')) {
      try {
        setData(prev => prev.filter(item => item.id !== id));
        setMessage({ type: 'success', text: 'Sponsored project deleted successfully' });
        fetchData(pagination.currentPage, searchTerm);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete sponsored project' });
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAccordion(false);
    setEditingId(null);
    setFormData({
      projectType: 'Sponsored Project',
      projectTitle: '',
      yearOfSanction: '',
      principalInvestigator: '',
      coInvestigator: '',
      amount: 0,
      status: 'On Going',
      duration: 0,
      sponsoringOrganization: '',
      collaboratingOrganization: '',
      sanctionedDepartment: '',
      description: '',
      uploadFile: ''
    });
    setFilePreview(null);
    setExistingFile(null);
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

  const handleGridEdit = (item: SponsoredProjectsData) => {
    handleEdit(item);
  };

  const handleGridDelete = (item: SponsoredProjectsData) => {
    if (item.id) {
      handleDelete(item.id);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchTerm);
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilePreview(file.name);
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
      setFilePreview(file.name);
    }
  };

  // Handle delete file
  const handleDeleteFile = () => {
    setFilePreview(null);
    setExistingFile(null);
  };

  // Prepare data for Grid component
  const gridData = data.map(item => ({
    ...item,
    projectTitle: item.projectTitle ? truncateText(item.projectTitle, 40) : '-',
    principalInvestigator: item.principalInvestigator || '-',
    sponsoringOrganization: item.sponsoringOrganization ? truncateText(item.sponsoringOrganization, 30) : '-',
    status: item.status || '-',
    amount: item.amount ? `₹${item.amount.toLocaleString()}` : '-'
  }));

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Sponsored Projects & Consultancy</h1>
        <p>Manage sponsored projects and consultancy work with detailed project information.</p>
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

      {/* Modal */}
      {showAccordion && createPortal(
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal book-chapter-modal-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <h3>{editingId ? 'Edit Sponsored Project' : 'Add New Sponsored Project'}</h3>
                <p className="modal-subtitle">Enter sponsored project details below</p>
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
              <form id="sponsored-project-form" onSubmit={handleSubmit}>
                <div className="book-chapter-form-container">
                  <div className="book-chapter-form-layout">
                    {/* Left Column */}
                    <div className="book-chapter-form-left">
                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Project Type</label>
                        <div className="book-chapter-input-wrapper">
                          <select
                            id="projectType"
                            name="projectType"
                            className="book-chapter-input"
                            value={formData.projectType}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="Sponsored Project">Sponsored Project</option>
                            <option value="Consultancy Work">Consultancy Work</option>
                            <option value="Research Grant">Research Grant</option>
                            <option value="Industry Collaboration">Industry Collaboration</option>
                          </select>
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Project Title</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="projectTitle"
                            name="projectTitle"
                            className="book-chapter-input"
                            value={formData.projectTitle}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter project title"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Principal Investigator</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="principalInvestigator"
                            name="principalInvestigator"
                            className="book-chapter-input"
                            value={formData.principalInvestigator}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter principal investigator name"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="book-chapter-form-group">
                        <label>Co-Investigator(s)</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="coInvestigator"
                            name="coInvestigator"
                            className="book-chapter-input"
                            value={formData.coInvestigator}
                            onChange={handleInputChange}
                            placeholder="Enter co-investigator names"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Sponsoring Organization</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="sponsoringOrganization"
                            name="sponsoringOrganization"
                            className="book-chapter-input"
                            value={formData.sponsoringOrganization}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter sponsoring organization"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="book-chapter-form-right">
                      <div className="book-chapter-form-group">
                        <label>Collaborating Organization</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="collaboratingOrganization"
                            name="collaboratingOrganization"
                            className="book-chapter-input"
                            value={formData.collaboratingOrganization}
                            onChange={handleInputChange}
                            placeholder="Enter collaborating organization"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Year of Sanction</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="text"
                            id="yearOfSanction"
                            name="yearOfSanction"
                            className="book-chapter-input"
                            value={formData.yearOfSanction}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter year of sanction"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Amount (₹)</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="number"
                            id="amount"
                            name="amount"
                            className="book-chapter-input"
                            value={formData.amount}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter project amount"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Status</label>
                        <div className="book-chapter-input-wrapper">
                          <select
                            id="status"
                            name="status"
                            className="book-chapter-input"
                            value={formData.status}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="On Going">On Going</option>
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="book-chapter-form-group">
                        <label className="book-chapter-required">Duration (months)</label>
                        <div className="book-chapter-input-wrapper">
                          <input
                            type="number"
                            id="duration"
                            name="duration"
                            className="book-chapter-input"
                            value={formData.duration}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter duration in months"
                          />
                          <div className="book-chapter-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="book-chapter-form-group book-chapter-form-group-full">
                    <label>Project Description</label>
                    <div className="book-chapter-textarea-wrapper">
                      <textarea
                        id="description"
                        name="description"
                        className="book-chapter-textarea"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Describe the project objectives, methodology, and expected outcomes..."
                      />
                      <div className="book-chapter-textarea-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="book-chapter-form-group book-chapter-form-group-full">
                    <label>Project Documents Upload</label>
                    <div className="book-chapter-upload-area">
                      <div
                        className={`book-chapter-upload-dropzone ${isDragOver ? 'book-chapter-drag-over' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <div className="book-chapter-upload-content">
                          {(filePreview || existingFile) ? (
                            <div className="book-chapter-file-preview">
                              <div className="book-chapter-file-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" >
                                  <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <div className="book-chapter-file-info">
                                <span className="book-chapter-file-name">{filePreview || existingFile}</span>
                                <button
                                  type="button"
                                  className="book-chapter-btn book-chapter-btn-sm book-chapter-btn-danger"
                                  onClick={handleDeleteFile}
                                  title="Delete file"
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
                            <div className="book-chapter-upload-placeholder">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" >
                                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <div className="book-chapter-upload-text">
                                <p className="book-chapter-upload-title">Drop your project documents here</p>
                                <p className="book-chapter-upload-subtitle">Or click to browse</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Hidden File Input */}
                        <input
                          type="file"
                          id="uploadFile"
                          name="uploadFile"
                          className="book-chapter-file-input-hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                        />
                      </div>

                      <div className="book-chapter-upload-info">
                        <p className="book-chapter-upload-hint">
                          Supported formats: PDF, DOC, DOCX, JPG, PNG. Max size: 5MB
                        </p>
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
                form="sponsored-project-form"
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
        addButtonText="Add Sponsored Project"
        searchPlaceholder="Search Sponsored Projects"
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

export default SponsoredProjects;