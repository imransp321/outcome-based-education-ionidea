# Outcome-Based Education (OBE) System

A comprehensive educational technology solution designed to help institutions implement, manage, and continuously improve student learning outcomes based on predefined competencies and skills.

## 🚀 Features

### Configuration Module
- **Organisation Details**: Manage institutional identity and governance information
- **Department Management**: Handle academic departments with chairman details and publications
- **Program Management**: Configure program types, modes, and comprehensive program details
- **User Management**: Manage faculty and staff with qualifications and experience
- **BOS Members**: Board of Studies composition and management
- **Program Outcomes**: Define and manage Program Outcomes (POs)
- **Course Types**: Categorize courses within curriculum
- **Delivery Methods**: Define teaching methodologies with Bloom's Level integration
- **Lab Categories**: Laboratory classification system
- **Bloom's Taxonomy**: Implement Bloom's Taxonomy framework
- **Map Level Weightage**: Define assessment weightings

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **RESTful API** architecture
- **JWT** authentication
- **Multer** for file uploads
- **Express Validator** for input validation

### Frontend
- **React 19** with TypeScript
- **Custom CSS** styling (no external UI libraries)
- **React Router** for navigation
- **Axios** for API communication
- **Responsive design** for mobile and desktop

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd outcome-based-education-system
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Database Setup

#### Create PostgreSQL Database
```sql
CREATE DATABASE obe_system;
CREATE USER obe_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE obe_system TO obe_user;
```

#### Configure Environment Variables
Create a `.env` file in the `server` directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=obe_system
DB_USER=obe_user
DB_PASSWORD=your_password

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

#### Run Database Migration
```bash
cd server
npm run migrate
```

### 4. Start the Application

#### Development Mode (Both Frontend and Backend)
```bash
# From root directory
npm run dev
```

#### Or Start Separately

**Backend Server:**
```bash
cd server
npm run dev
```

**Frontend Development Server:**
```bash
cd client
npm start
```

## 📁 Project Structure

```
outcome-based-education-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.tsx
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   ├── routes/            # API routes
│   ├── scripts/           # Database migration scripts
│   └── index.js
├── package.json           # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Configuration APIs

#### Organisation Details
- `GET /api/config/organisation` - Get organisation details
- `POST /api/config/organisation` - Create organisation details
- `PUT /api/config/organisation/:id` - Update organisation details
- `DELETE /api/config/organisation/:id` - Delete organisation details

#### Departments
- `GET /api/config/departments` - Get all departments (with pagination)
- `GET /api/config/departments/:id` - Get department by ID
- `POST /api/config/departments` - Create new department
- `PUT /api/config/departments/:id` - Update department
- `DELETE /api/config/departments/:id` - Delete department
- `GET /api/config/departments/stats/overview` - Get department statistics

#### Program Types
- `GET /api/config/program-types` - Get all program types
- `POST /api/config/program-types` - Create program type
- `PUT /api/config/program-types/:id` - Update program type
- `DELETE /api/config/program-types/:id` - Delete program type

#### And many more...

## 🎨 Frontend Features

### Custom Styling
- Modern, responsive design
- Custom CSS with CSS Grid and Flexbox
- Gradient backgrounds and smooth animations
- Mobile-first responsive design
- Custom form components and data tables

### Key Components
- **Layout**: Sidebar navigation with collapsible menu
- **Dashboard**: Statistics cards and quick actions
- **Data Tables**: Sortable, searchable tables with pagination
- **Forms**: Comprehensive form handling with validation
- **Modals**: Reusable modal components for CRUD operations

## 🗄️ Database Schema

The system includes comprehensive database tables for:
- Organisation details and settings
- Department management
- Program types and modes
- User and faculty management
- Program outcomes and course types
- Bloom's taxonomy levels
- Assessment weightages

## 🔒 Security Features

- Input validation and sanitization
- SQL injection prevention
- File upload security
- CORS configuration
- Rate limiting
- JWT token authentication

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

### Environment Variables for Production
Make sure to set appropriate environment variables for production:
- Database credentials
- JWT secrets
- File upload paths
- CORS origins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- Additional modules (Curriculum Design, Reports, Assessment Planning, Attainment Analysis, Surveys)
- Advanced analytics and reporting
- Integration with external systems
- Mobile application
- Real-time notifications
- Advanced user roles and permissions

---

**Note**: This is a comprehensive OBE system implementation focusing on the Configuration module. Additional modules can be built following the same architecture and patterns established in this implementation.

