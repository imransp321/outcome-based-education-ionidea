import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Configuration API endpoints
export const configAPI = {
  // Organisation Details
  organisation: {
    getAll: (params?: any) => axiosInstance.get('/config/organisation', { params }),
    getById: (id: string) => axiosInstance.get(`/config/organisation/${id}`),
    create: (data: any) => axiosInstance.post('/config/organisation', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/organisation/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/organisation/${id}`),
  },

  // Departments
  departments: {
    getAll: (params?: any) => axiosInstance.get('/config/departments', { params }),
    getAllSimple: () => axiosInstance.get('/config/departments/all'),
    getById: (id: string) => axiosInstance.get(`/config/departments/${id}`),
    create: (data: any) => axiosInstance.post('/config/departments', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/departments/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/departments/${id}`),
    getStats: () => axiosInstance.get('/config/departments/stats/overview'),
    // Vision/Mission endpoints
    getVisionMission: (departmentId: number) => axiosInstance.get(`/config/departments/${departmentId}/vision-mission`),
    createVisionMission: (data: any) => axiosInstance.post('/config/departments/vision-mission', data),
    updateVisionMission: (id: string, data: any) => axiosInstance.put(`/config/departments/vision-mission/${id}`, data),
    deleteVisionMission: (id: string) => axiosInstance.delete(`/config/departments/vision-mission/${id}`),
  },

  // Program Types
  programTypes: {
    getAll: (params?: any) => axiosInstance.get('/config/program-types', { params }),
    getAllSimple: () => axiosInstance.get('/config/program-types/all'),
    getById: (id: string) => axiosInstance.get(`/config/program-types/${id}`),
    create: (data: any) => axiosInstance.post('/config/program-types', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/program-types/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/program-types/${id}`),
  },

  // Program Modes
  programModes: {
    getAll: (params?: any) => axiosInstance.get('/config/program-modes', { params }),
    getById: (id: string) => axiosInstance.get(`/config/program-modes/${id}`),
    create: (data: any) => axiosInstance.post('/config/program-modes', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/program-modes/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/program-modes/${id}`),
  },

  // Faculty Types
  facultyTypes: {
    getAll: () => axiosInstance.get('/config/faculty-types'),
    getById: (id: string) => axiosInstance.get(`/config/faculty-types/${id}`),
    create: (data: any) => axiosInstance.post('/config/faculty-types', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/faculty-types/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/faculty-types/${id}`),
  },

  // Programs
  programs: {
    getAll: (params?: any) => axiosInstance.get('/config/programs', { params }),
    getAllSimple: () => axiosInstance.get('/config/programs/all'),
    getById: (id: string) => axiosInstance.get(`/config/programs/${id}`),
    create: (data: any) => axiosInstance.post('/config/programs', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/programs/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/programs/${id}`),
  },

  // Users
  users: {
    getAll: (params?: any) => axiosInstance.get('/config/users', { params }),
    getAllSimple: () => axiosInstance.get('/config/users/all'),
    getById: (id: string) => axiosInstance.get(`/config/users/${id}`),
    create: (data: any) => axiosInstance.post('/config/users', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/users/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/users/${id}`),
    deactivate: (id: string) => axiosInstance.patch(`/config/users/${id}/deactivate`),
  },

  // BOS Members
  bosMembers: {
    getAll: (params?: any) => axiosInstance.get('/config/bos-members', { params }),
    getById: (id: string) => axiosInstance.get(`/config/bos-members/${id}`),
    create: (data: any) => axiosInstance.post('/config/bos-members', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/bos-members/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/bos-members/${id}`),
  },


  // Course Types
  courseTypes: {
    getAll: (params?: any) => axiosInstance.get('/config/course-types', { params }),
    getById: (id: string) => axiosInstance.get(`/config/course-types/${id}`),
    create: (data: any) => axiosInstance.post('/config/course-types', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/course-types/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/course-types/${id}`),
  },

  // Delivery Methods
  deliveryMethods: {
    getAll: (params?: any) => axiosInstance.get('/config/delivery-methods', { params }),
    getById: (id: string) => axiosInstance.get(`/config/delivery-methods/${id}`),
    create: (data: any) => axiosInstance.post('/config/delivery-methods', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/delivery-methods/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/delivery-methods/${id}`),
  },

  // Lab Categories
  labCategories: {
    getAll: (params?: any) => axiosInstance.get('/config/lab-categories', { params }),
    getById: (id: string) => axiosInstance.get(`/config/lab-categories/${id}`),
    create: (data: any) => axiosInstance.post('/config/lab-categories', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/lab-categories/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/lab-categories/${id}`),
  },

  // Bloom's Taxonomy
  blooms: {
    // Domains
    getDomains: (params?: any) => axiosInstance.get('/config/blooms/domains', { params }),
    getDomainById: (id: string) => axiosInstance.get(`/config/blooms/domains/${id}`),
    createDomain: (data: any) => axiosInstance.post('/config/blooms/domains', data),
    updateDomain: (id: string, data: any) => axiosInstance.put(`/config/blooms/domains/${id}`, data),
    deleteDomain: (id: string) => axiosInstance.delete(`/config/blooms/domains/${id}`),
    
    // Levels
    getLevels: (params?: any) => axiosInstance.get('/config/blooms/levels', { params }),
    getLevelById: (id: string) => axiosInstance.get(`/config/blooms/levels/${id}`),
    getLevelsByDomain: (domainId: string) => axiosInstance.get(`/config/blooms/levels/${domainId}`),
    createLevel: (data: any) => axiosInstance.post('/config/blooms/levels', data),
    updateLevel: (id: string, data: any) => axiosInstance.put(`/config/blooms/levels/${id}`, data),
    deleteLevel: (id: string) => axiosInstance.delete(`/config/blooms/levels/${id}`),
  },

  // Weightage
  weightage: {
    getAll: (params?: any) => axiosInstance.get('/config/weightage', { params }),
    getById: (id: string) => axiosInstance.get(`/config/weightage/${id}`),
    create: (data: any) => axiosInstance.post('/config/weightage', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/weightage/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/weightage/${id}`),
  },

  // Curriculum Regulations
  curriculumRegulations: {
    getAll: (params?: any) => axiosInstance.get('/config/curriculum-regulations', { params }),
    getAllSimple: () => axiosInstance.get('/config/curriculum-regulations/all'),
    getById: (id: string) => axiosInstance.get(`/config/curriculum-regulations/${id}`),
    create: (data: any) => axiosInstance.post('/config/curriculum-regulations', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/curriculum-regulations/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/curriculum-regulations/${id}`),
    updatePEOStatus: (id: string, status: string) => axiosInstance.put(`/config/curriculum-regulations/${id}/peo-status`, { peo_creation_status: status }),
    checkPEOStatus: (id: string) => axiosInstance.get(`/config/curriculum-regulations/${id}/peo-status`),
    getStats: () => axiosInstance.get('/config/curriculum-regulations/stats/overview'),
  },

  // PEOs
  peos: {
    getAll: (params?: any) => axiosInstance.get('/config/peos', { params }),
    getById: (id: string) => axiosInstance.get(`/config/peos/${id}`),
    create: (data: any) => axiosInstance.post('/config/peos', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/peos/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/peos/${id}`),
    getCurriculumRegulations: () => axiosInstance.get('/config/peos/curriculum-regulations'),
    getStats: () => axiosInstance.get('/config/peos/stats/overview'),
  },
  // Program Outcomes
  programOutcomes: {
    getAll: (params?: any) => axiosInstance.get('/config/program-outcomes', { params }),
    getById: (id: string) => axiosInstance.get(`/config/program-outcomes/${id}`),
    create: (data: any) => axiosInstance.post('/config/program-outcomes', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/program-outcomes/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/program-outcomes/${id}`),
    getCurriculumRegulations: () => axiosInstance.get('/config/program-outcomes/curriculum-regulations'),
    getStats: () => axiosInstance.get('/config/program-outcomes/stats/overview'),
  },
  // PO to PEO Mapping
  poPEOMapping: {
    getMatrix: (curriculumId: string) => axiosInstance.get(`/config/po-peo-mapping/matrix/${curriculumId}`),
    getCurriculumRegulations: () => axiosInstance.get('/config/po-peo-mapping/curriculum-regulations'),
    createMapping: (data: any) => axiosInstance.post('/config/po-peo-mapping/mapping', data),
    deleteMapping: (curriculumId: string, poId: string, peoId: string) => 
      axiosInstance.delete(`/config/po-peo-mapping/mapping/${curriculumId}/${poId}/${peoId}`),
    getStats: (curriculumId: string) => axiosInstance.get(`/config/po-peo-mapping/stats/${curriculumId}`),
  },
  // Curriculum Settings
  curriculumSettings: {
    getCurriculumRegulations: () => axiosInstance.get('/config/curriculum-settings/curriculum-regulations'),
    getSettings: (curriculumId: string) => axiosInstance.get(`/config/curriculum-settings/settings/${curriculumId}`),
    // Domains
    createDomain: (data: any) => axiosInstance.post('/config/curriculum-settings/domains', data),
    updateDomain: (id: string, data: any) => axiosInstance.put(`/config/curriculum-settings/domains/${id}`, data),
    deleteDomain: (id: string) => axiosInstance.delete(`/config/curriculum-settings/domains/${id}`),
    // Delivery Methods
    createDeliveryMethod: (data: any) => axiosInstance.post('/config/curriculum-settings/delivery-methods', data),
    updateDeliveryMethod: (id: string, data: any) => axiosInstance.put(`/config/curriculum-settings/delivery-methods/${id}`, data),
    deleteDeliveryMethod: (id: string) => axiosInstance.delete(`/config/curriculum-settings/delivery-methods/${id}`),
    // Assessment Methods
    createAssessmentMethod: (data: any) => axiosInstance.post('/config/curriculum-settings/assessment-methods', data),
    updateAssessmentMethod: (id: string, data: any) => axiosInstance.put(`/config/curriculum-settings/assessment-methods/${id}`, data),
    deleteAssessmentMethod: (id: string) => axiosInstance.delete(`/config/curriculum-settings/assessment-methods/${id}`),
  },
  // Courses
  courses: {
    getCurriculumRegulations: () => axiosInstance.get('/config/courses/curriculum-regulations'),
    getTerms: () => axiosInstance.get('/config/courses/terms'),
    getUsers: () => axiosInstance.get('/config/courses/users'),
    getAll: (params?: any) => axiosInstance.get('/config/courses', { params }),
    getById: (id: string) => axiosInstance.get(`/config/courses/${id}`),
    create: (data: any) => axiosInstance.post('/config/courses', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/courses/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/courses/${id}`),
    // Course Assignments
    getAssignments: (courseId: string) => axiosInstance.get(`/config/courses/${courseId}/assignments`),
    createAssignment: (courseId: string, data: any) => axiosInstance.post(`/config/courses/${courseId}/assignments`, data),
    updateAssignment: (assignmentId: string, data: any) => axiosInstance.put(`/config/courses/assignments/${assignmentId}`, data),
    deleteAssignment: (assignmentId: string) => axiosInstance.delete(`/config/courses/assignments/${assignmentId}`),
  },

  // Course Outcomes
  courseOutcomes: {
    getAll: (params?: any) => axiosInstance.get('/config/course-outcomes', { params }),
    getById: (id: string) => axiosInstance.get(`/config/course-outcomes/${id}`),
    create: (data: any) => axiosInstance.post('/config/course-outcomes', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/course-outcomes/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/course-outcomes/${id}`),
    getLookupData: (params?: any) => axiosInstance.get('/config/course-outcomes/lookup/data', { params }),
  },


  // CO-PO Mapping
  coPoMapping: {
    getAll: (params?: any) => axiosInstance.get('/config/co-po-mapping', { params }),
    getById: (id: string) => axiosInstance.get(`/config/co-po-mapping/${id}`),
    create: (data: any) => axiosInstance.post('/config/co-po-mapping', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/co-po-mapping/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/co-po-mapping/${id}`),
  },

  // Term Details
  termDetails: {
    getByCurriculum: (curriculumId: string) => axiosInstance.get(`/config/term-details/${curriculumId}`),
    create: (data: any) => axiosInstance.post('/config/term-details', data),
    createBulk: (data: any) => axiosInstance.post('/config/term-details/bulk', data),
    submitForApproval: (data: any) => axiosInstance.post('/config/term-details/submit-approval', data),
    getApprovals: (curriculumId: string) => axiosInstance.get(`/config/term-details/approvals/${curriculumId}`),
    approve: (approvalId: string, data: any) => axiosInstance.put(`/config/term-details/approve/${approvalId}`, data),
    reject: (approvalId: string, data: any) => axiosInstance.put(`/config/term-details/reject/${approvalId}`, data),
  },

  // Topics
  topics: {
    getAll: (params?: any) => axiosInstance.get('/config/topics', { params }),
    getById: (id: string) => axiosInstance.get(`/config/topics/${id}`),
    create: (data: any) => axiosInstance.post('/config/topics', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/topics/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/topics/${id}`),
    getTLOs: (id: string) => axiosInstance.get(`/config/topics/${id}/tlos`),
  },

  // Awards and Honors
  awardsHonors: {
    getAll: (params?: any) => axiosInstance.get('/faculty/awards-honors', { params }),
    getById: (id: string) => axiosInstance.get(`/faculty/awards-honors/${id}`),
    create: (data: any) => axiosInstance.post('/faculty/awards-honors', data),
    update: (id: string, data: any) => axiosInstance.put(`/faculty/awards-honors/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/faculty/awards-honors/${id}`),
    uploadFile: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return axiosInstance.post('/faculty/awards-honors/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },

  // Faculty Workload
  facultyWorkload: {
    getAll: (params?: any) => axiosInstance.get('/config/faculty-workload', { params }),
    getById: (id: string) => axiosInstance.get(`/config/faculty-workload/${id}`),
    create: (data: any) => axiosInstance.post('/config/faculty-workload', data),
    update: (id: string, data: any) => axiosInstance.put(`/config/faculty-workload/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/config/faculty-workload/${id}`),
  },
  fellowshipScholarship: {
    getAll: (params?: any) => axiosInstance.get('/config/fellowship-scholarship', { params }),
    getById: (id: string) => axiosInstance.get(`/config/fellowship-scholarship/${id}`),
    create: (data: FormData) => axiosInstance.post('/config/fellowship-scholarship', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    update: (id: string, data: FormData) => axiosInstance.put(`/config/fellowship-scholarship/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    delete: (id: string) => axiosInstance.delete(`/config/fellowship-scholarship/${id}`),
  },

  // Academic Bodies
  academicBodies: {
    getAll: (params?: any) => axiosInstance.get('/faculty/academic-bodies', { params }),
    getById: (id: string) => axiosInstance.get(`/faculty/academic-bodies/${id}`),
    create: (data: FormData) => axiosInstance.post('/faculty/academic-bodies', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    update: (id: string, data: FormData) => axiosInstance.put(`/faculty/academic-bodies/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    delete: (id: string) => axiosInstance.delete(`/faculty/academic-bodies/${id}`),
    uploadFile: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return axiosInstance.post('/faculty/academic-bodies/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },

  // Patent Innovation
  patentInnovation: {
    getAll: (params?: any) => axiosInstance.get('/faculty/patent-innovation', { params }),
    getById: (id: string) => axiosInstance.get(`/faculty/patent-innovation/${id}`),
    create: (data: FormData) => axiosInstance.post('/faculty/patent-innovation', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    update: (id: string, data: FormData) => axiosInstance.put(`/faculty/patent-innovation/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    delete: (id: string) => axiosInstance.delete(`/faculty/patent-innovation/${id}`),
    uploadFile: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return axiosInstance.post('/faculty/patent-innovation/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },

  // Professional Bodies
  professionalBodies: {
    getAll: (params?: any) => axiosInstance.get('/faculty/professional-bodies', { params }),
    getById: (id: string) => axiosInstance.get(`/faculty/professional-bodies/${id}`),
    create: (data: FormData) => axiosInstance.post('/faculty/professional-bodies', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    update: (id: string, data: FormData) => axiosInstance.put(`/faculty/professional-bodies/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    delete: (id: string) => axiosInstance.delete(`/faculty/professional-bodies/${id}`),
    uploadFile: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return axiosInstance.post('/faculty/professional-bodies/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },

  // Professional Bodies (Legacy methods for backward compatibility)
  getProfessionalBodies: (page: number = 1, search: string = '') => 
    axiosInstance.get('/faculty/professional-bodies', { params: { page, search } }),
  createProfessionalBody: (data: any) => axiosInstance.post('/faculty/professional-bodies', data),
  updateProfessionalBody: (id: string, data: any) => axiosInstance.put(`/faculty/professional-bodies/${id}`, data),
  deleteProfessionalBody: (id: string) => axiosInstance.delete(`/faculty/professional-bodies/${id}`),

  // Research Projects
  researchProjects: {
    getAll: (params?: any) => axiosInstance.get('/faculty/research-projects', { params }),
    getById: (id: string) => axiosInstance.get(`/faculty/research-projects/${id}`),
    create: (data: FormData) => axiosInstance.post('/faculty/research-projects', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    update: (id: string, data: FormData) => axiosInstance.put(`/faculty/research-projects/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    delete: (id: string) => axiosInstance.delete(`/faculty/research-projects/${id}`),
    uploadFile: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return axiosInstance.post('/faculty/research-projects/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },

  // Research Publications
  researchPublications: {
    getAll: (params?: any) => axiosInstance.get('/faculty/research-publications', { params }),
    getById: (id: string) => axiosInstance.get(`/faculty/research-publications/${id}`),
    create: (data: FormData) => axiosInstance.post('/faculty/research-publications', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    update: (id: string, data: FormData) => axiosInstance.put(`/faculty/research-publications/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    delete: (id: string) => axiosInstance.delete(`/faculty/research-publications/${id}`),
    uploadFile: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return axiosInstance.post('/faculty/research-publications/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },

  // Seminar Training
  seminarTraining: {
    getAll: (params?: any) => axiosInstance.get('/faculty/seminar-training', { params }),
    getById: (id: string) => axiosInstance.get(`/faculty/seminar-training/${id}`),
    create: (data: FormData) => axiosInstance.post('/faculty/seminar-training', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    update: (id: string, data: FormData) => axiosInstance.put(`/faculty/seminar-training/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    delete: (id: string) => axiosInstance.delete(`/faculty/seminar-training/${id}`),
    uploadFile: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return axiosInstance.post('/faculty/seminar-training/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },
};

// Create the main API object
const api = {
  ...configAPI,
  // Add other API modules here as needed
};

export default api;

