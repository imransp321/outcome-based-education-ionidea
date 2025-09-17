import React, { useState, useEffect } from 'react';
import ProfileWizard from '../../components/ProfileWizard';
import Grid from '../../components/Grid/Grid';
import '../../styles/pages/Configuration/Grid.css';
import '../../styles/components/grid.css';
import '../../styles/components/modals.css';

interface FacultyProfileData {
  id?: number;
  // Personal Details
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  aadhaarNumber: string;
  presentAddress: string;
  permanentAddress: string;
  website: string;
  dateOfBirth: string;
  bloodGroup: string;
  profilePhoto?: string;

  // Professional Details
  employeeNo: string;
  dateOfJoining: string;
  teachingExperienceYears: string;
  facultyServing: string;
  facultyType: string;
  relievingDate: string;
  industrialExperienceYears: string;
  lastPromotionYear: string;
  remarks: string;
  currentDesignation: string;
  retirementDate: string;
  responsibilities: string;
  totalExperience: string;
  salaryPay: string;

  // Qualification Details
  highestQualification: string;
  specialization: string;
  researchInterest: string;
  skills: string;

  // PhD Details
  universityName: string;
  yearOfRegistration: string;
  supervisor: string;
  topic: string;
  url: string;
  phdDuringAssessmentYear: string;
  phdStatus: string;
  candidatesWithinOrganization: string;
  candidatesOutsideOrganization: string;
}

const FacultyProfilePage: React.FC = () => {
  const [data, setData] = useState<FacultyProfileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [editingItem, setEditingItem] = useState<FacultyProfileData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  const sampleData: FacultyProfileData[] = [
    {
      id: 1,
      title: 'Dr.',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@university.edu',
      contactNumber: '+91-9876543210',
      aadhaarNumber: '123456789012',
      presentAddress: '123 University Street, City, State',
      permanentAddress: '456 Home Street, Village, State',
      website: 'https://johndoe.academia.edu',
      dateOfBirth: '1985-05-15',
      bloodGroup: 'O+',
      profilePhoto: 'profile_photo_1.jpg',
      employeeNo: 'EMP001',
      dateOfJoining: '2020-01-15',
      teachingExperienceYears: '5.5',
      facultyServing: 'Permanent',
      facultyType: 'Teaching',
      relievingDate: '',
      industrialExperienceYears: '2.0',
      lastPromotionYear: '2023',
      remarks: 'Excellent performance in teaching and research',
      currentDesignation: 'Assistant Professor',
      retirementDate: '2045-01-15',
      responsibilities: 'Course coordination, research supervision, department administration',
      totalExperience: '7.5',
      salaryPay: '75000',
      highestQualification: 'Ph.D.',
      specialization: 'Computer Science - Machine Learning',
      researchInterest: 'Deep Learning, Natural Language Processing, Computer Vision',
      skills: 'Python, TensorFlow, PyTorch, SQL, Data Analysis',
      universityName: 'IIT Delhi',
      yearOfRegistration: '2015',
      supervisor: 'Dr. Rajesh Kumar',
      topic: 'Deep Learning Approaches for Natural Language Understanding',
      url: 'https://thesis.johndoe.com',
      phdDuringAssessmentYear: '2019',
      phdStatus: 'Completed',
      candidatesWithinOrganization: '3',
      candidatesOutsideOrganization: '1'
    },
    {
      id: 2,
      title: 'Dr.',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@university.edu',
      contactNumber: '+91-9876543211',
      aadhaarNumber: '123456789013',
      presentAddress: '789 Faculty Quarters, University Campus',
      permanentAddress: '789 Faculty Quarters, University Campus',
      website: 'https://janesmith.researchgate.net',
      dateOfBirth: '1980-03-22',
      bloodGroup: 'A+',
      profilePhoto: 'profile_photo_2.jpg',
      employeeNo: 'EMP002',
      dateOfJoining: '2018-06-01',
      teachingExperienceYears: '8.0',
      facultyServing: 'Permanent',
      facultyType: 'Teaching',
      relievingDate: '',
      industrialExperienceYears: '0',
      lastPromotionYear: '2022',
      remarks: 'Outstanding research contributions',
      currentDesignation: 'Professor',
      retirementDate: '2043-06-01',
      responsibilities: 'Department head, research guidance, academic planning',
      totalExperience: '8.0',
      salaryPay: '120000',
      highestQualification: 'Ph.D.',
      specialization: 'Electrical Engineering - Power Systems',
      researchInterest: 'Renewable Energy, Smart Grids, Power Electronics',
      skills: 'MATLAB, Simulink, Power System Analysis, Control Systems',
      universityName: 'IISc Bangalore',
      yearOfRegistration: '2012',
      supervisor: 'Prof. Suresh Patel',
      topic: 'Smart Grid Technologies for Renewable Energy Integration',
      url: 'https://thesis.janesmith.com',
      phdDuringAssessmentYear: '2016',
      phdStatus: 'Completed',
      candidatesWithinOrganization: '5',
      candidatesOutsideOrganization: '2'
    }
  ];

  useEffect(() => {
    setData(sampleData);
  }, []);

  const columns = [
    {
      key: 'profilePhoto',
      title: 'Photo',
      width: '8%',
      render: (value: string, row: FacultyProfileData) => (
        <div className="profile-photo-cell">
          {row.profilePhoto ? (
            <img 
              src={`/uploads/faculty-profiles/${row.profilePhoto}`} 
              alt="Profile" 
              className="profile-photo-thumb"
            />
          ) : (
            <div className="profile-photo-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'firstName',
      title: 'Name',
      width: '20%',
      render: (value: string, row: FacultyProfileData) => (
        <div>
          <div style={{ fontWeight: '600', color: '#1f2937' }}>{row.firstName} {row.lastName}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{row.email}</div>
        </div>
      )
    },
    {
      key: 'currentDesignation',
      title: 'Designation',
      width: '15%'
    },
    {
      key: 'facultyType',
      title: 'Type',
      width: '10%'
    },
    {
      key: 'totalExperience',
      title: 'Experience',
      width: '10%',
      render: (value: string) => `${value} years`
    },
    {
      key: 'highestQualification',
      title: 'Qualification',
      width: '15%'
    },
    {
      key: 'specialization',
      title: 'Specialization',
      width: '22%',
      render: (value: string) => (
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {value.length > 50 ? `${value.substring(0, 50)}...` : value}
        </div>
      )
    }
  ];

  const handleSave = async (profileData: any) => {
    try {
      setLoading(true);
      
      // Here you would make API calls to save the data
      console.log('Saving faculty profile:', profileData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingItem) {
        setData(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...profileData } : item));
      } else {
        const newProfile: FacultyProfileData = {
          id: Date.now(),
          ...profileData
        };
        setData(prev => [...prev, newProfile]);
      }
      
      setShowWizard(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
    setEditingItem(null);
  };

  const handleEdit = (item: FacultyProfileData) => {
    setEditingItem(item);
    setShowWizard(true);
  };

  const handleDelete = (item: FacultyProfileData) => {
    if (window.confirm('Are you sure you want to delete this faculty profile?')) {
      setData(prev => prev.filter(dataItem => dataItem.id !== item.id));
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowWizard(true);
  };

  // Filter data based on search query
  const filteredData = data.filter(item =>
    item.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.currentDesignation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="grid-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Faculty Profile Management</h1>
        <p>Manage faculty personal, professional, and academic information in a comprehensive profile system.</p>
      </div>

      {/* Grid Component */}
      <Grid
        columns={columns}
        data={paginatedData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSearch={handleSearch}
        searchable={true}
        loading={loading}
        addButtonText="Add Faculty Profile"
        searchPlaceholder="Search faculty profiles..."
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-controls">
            <button
              className="pagination-btn pagination-btn-secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Previous
            </button>
            
            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-btn ${page === currentPage ? 'pagination-btn-primary' : 'pagination-btn-secondary'}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            
        <button 
              className="pagination-btn pagination-btn-secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
        >
              Next
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
        </button>
      </div>
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
          </div>
        </div>
      )}

      {/* Profile Wizard */}
      <ProfileWizard
        isOpen={showWizard}
        onClose={handleCloseWizard}
        onSave={handleSave}
        editingItem={editingItem}
      />
    </div>
  );
};

export default FacultyProfilePage;
