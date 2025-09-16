import React, { useState } from 'react';
import Grid from '../../components/Grid/Grid';
import '../../styles/pages/Configuration/Grid.css';

const GridPage: React.FC = () => {
  const [data, setData] = useState([
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com', 
      status: 'active', 
      department: 'IT',
      role: 'Developer',
      lastLogin: '2024-01-15',
      created: '2023-06-01'
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      status: 'inactive', 
      department: 'HR',
      role: 'Manager',
      lastLogin: '2024-01-10',
      created: '2023-05-15'
    },
    { 
      id: 3, 
      name: 'Bob Johnson', 
      email: 'bob@example.com', 
      status: 'pending', 
      department: 'Finance',
      role: 'Analyst',
      lastLogin: '2024-01-12',
      created: '2023-07-20'
    },
    { 
      id: 4, 
      name: 'Alice Brown', 
      email: 'alice@example.com', 
      status: 'active', 
      department: 'Marketing',
      role: 'Specialist',
      lastLogin: '2024-01-14',
      created: '2023-08-10'
    },
    { 
      id: 5, 
      name: 'Charlie Wilson', 
      email: 'charlie@example.com', 
      status: 'active', 
      department: 'IT',
      role: 'Designer',
      lastLogin: '2024-01-13',
      created: '2023-09-05'
    }
  ]);

  const [filteredData, setFilteredData] = useState(data);

  const columns = [
    { key: 'id', title: 'ID', width: '80px' },
    { key: 'name', title: 'Name', width: '200px' },
    { key: 'email', title: 'Email', width: '250px' },
    { key: 'department', title: 'Department', width: '150px' },
    { key: 'role', title: 'Role', width: '150px' },
    { 
      key: 'status', 
      title: 'Status', 
      width: '120px',
      render: (value: string) => (
        <span className={`grid-status ${value}`}>
          {value}
        </span>
      )
    },
    { key: 'lastLogin', title: 'Last Login', width: '120px' },
    { key: 'created', title: 'Created', width: '120px' },
  ];

  const handleAdd = () => {
    
    // Add your add logic here
    alert('Add new user functionality would be implemented here');
  };

  const handleEdit = (row: any) => {
    
    // Add your edit logic here
    alert(`Edit user: ${row.name}`);
  };

  const handleDelete = (row: any) => {
    
    // Add your delete logic here
    if (window.confirm(`Are you sure you want to delete ${row.name}?`)) {
      setData(data.filter(item => item.id !== row.id));
      setFilteredData(filteredData.filter(item => item.id !== row.id));
    }
  };

  const handleView = (row: any) => {
    
    // Add your view logic here
    alert(`View user details: ${row.name}`);
  };

  const handleSearch = (query: string) => {
    
    if (query.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.email.toLowerCase().includes(query.toLowerCase()) ||
        item.department.toLowerCase().includes(query.toLowerCase()) ||
        item.role.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  return (
    <div className="grid-page">
      <div className="page-header">
        <h1>Grid Component Demo</h1>
        <p>This page demonstrates the common grid component with search, add, edit, delete, and view functionality.</p>
      </div>
      
      <Grid
        title="Users Management"
        columns={columns}
        data={filteredData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onSearch={handleSearch}
        searchable={true}
        emptyMessage="No users found"
      />
    </div>
  );
};

export default GridPage;
