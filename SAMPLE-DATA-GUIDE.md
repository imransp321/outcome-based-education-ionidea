# Sample Data Setup Guide

This guide will help you set up sample data for your Outcome-Based Education (OBE) system.

## Quick Start

### Option 1: Complete Setup (Recommended)
Run this single command to set up everything:

```bash
cd server
npm run setup
```

This will:
- Create all database tables
- Insert default reference data
- Add comprehensive sample data

### Option 2: Step-by-Step Setup

If you prefer to run steps separately:

```bash
cd server

# Step 1: Create tables and default data
npm run migrate

# Step 2: Add sample data
npm run seed
```

## What Gets Created

### 🏢 Organisation Details
- **Nexus Institute of Technology** with complete vision, mission, and mandate

### 🏫 Departments (7)
- Computer Science and Engineering (CSE)
- Information Technology (IT)  
- Electronics and Communication Engineering (ECE)
- Mechanical Engineering (ME)
- Civil Engineering (CE)
- Basic Sciences (BS) - First Year Department
- Mathematics (MATH) - First Year Department

### 📚 Programs (6)
- **B.Tech CSE** - 4 years, Full-Time
- **B.Tech IT** - 4 years, Full-Time
- **B.Tech ECE** - 4 years, Full-Time
- **M.Tech CSE** - 2 years, Full-Time
- **MBA** - 2 years, Part-Time
- **B.Tech ME** - 4 years, Hybrid

### 👥 Faculty Members (12)
- 7 Professors (including all HODs)
- 2 Associate Professors
- 2 Assistant Professors
- 1 Lecturer

### 🎓 BOS Members (8)
- Chairman: Dr. Sarah Johnson (CSE HOD)
- Secretary: Prof. Michael Chen (CSE Assoc Prof)
- 6 Department HODs as members

### 📋 Program Outcomes (15)
- 12 NBA Program Outcomes (PO1-PO12)
- 3 Program Specific Outcomes (PSO1-PSO3)

## Sample Data Features

✅ **Realistic Data**: All data is realistic and follows proper academic structures
✅ **Complete Relationships**: All foreign key relationships are properly maintained
✅ **No Duplicates**: Scripts handle existing data gracefully
✅ **Comprehensive Coverage**: Covers all major entities in the OBE system

## Verification

After running the setup, you can verify the data by:

1. **Starting the server**:
   ```bash
   cd server
   npm start
   ```

2. **Accessing the API endpoints**:
   - `GET /api/config/organisation` - Organisation details
   - `GET /api/config/departments` - All departments
   - `GET /api/config/programs` - All programs
   - `GET /api/config/users` - All faculty members
   - `GET /api/config/bos-members` - BOS members
   - `GET /api/config/program-outcomes` - Program outcomes

3. **Using the frontend** to view the data in the admin panels

## Troubleshooting

### Common Issues

**Database Connection Error**:
- Check your `.env` file in the server directory
- Ensure PostgreSQL is running
- Verify database credentials

**Permission Errors**:
- Make sure the database user has proper permissions
- Check if the database exists

**Duplicate Data**:
- The scripts use `ON CONFLICT DO NOTHING` to handle duplicates
- Safe to run multiple times

### Getting Help

If you encounter issues:

1. Check the console output for specific error messages
2. Verify your database connection
3. Ensure all dependencies are installed (`npm install`)
4. Check the detailed documentation in `server/scripts/README-sample-data.md`

## Next Steps

After setting up the sample data:

1. **Start the server**: `npm start` (in server directory)
2. **Start the client**: `npm start` (in client directory)
3. **Access the application**: Open http://localhost:3000
4. **Login with sample credentials** (if authentication is implemented)
5. **Explore the admin panels** to see the sample data

## File Structure

```
server/scripts/
├── migrate.js              # Database migration
├── seed-sample-data.js     # Sample data seeding
├── setup-database.js       # Complete setup script
└── README-sample-data.md   # Detailed documentation
```

---

**Note**: This sample data is designed for development and testing purposes. For production use, replace with your actual institutional data.
