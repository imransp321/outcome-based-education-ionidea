import React, { useState } from 'react';
import FacultyProfile from './FacultyProfile';

const FacultyProfilePage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [facultyData, setFacultyData] = useState<any[]>([]);

  const handleSave = (data: any) => {
    console.log('Faculty profile saved:', data);
    // Here you would typically save to your backend
    setFacultyData(prev => [...prev, data]);
    setShowModal(false);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <div className="faculty-profile-page">
      <div className="page-header">
        <h1>Faculty Profile Management</h1>
        <p>Manage faculty personal, professional, and academic information in a comprehensive profile system.</p>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add New Faculty Profile
        </button>
      </div>

      <FacultyProfile
        isOpen={showModal}
        onClose={handleClose}
        onSave={handleSave}
        editingItem={null}
      />
    </div>
  );
};

export default FacultyProfilePage;
