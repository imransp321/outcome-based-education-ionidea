# Sample Data for OBE System

This directory contains sample data seeding scripts for the Outcome-Based Education (OBE) system.

## Overview

The sample data includes realistic data for all major entities in the OBE system:

- **Organisation Details**: Complete organisation information
- **Departments**: 7 academic departments with faculty and statistics
- **Programs**: 6 different academic programs (UG, PG, MBA)
- **Users**: 12 faculty members across different departments
- **BOS Members**: 8 Board of Studies members
- **Program Outcomes**: 15 NBA and PSO outcomes

## Sample Data Details

### Organisation Details
- **Society Name**: Nexus Education Society
- **Organisation Name**: Nexus Institute of Technology
- Complete vision, mission, mandate, and description

### Departments (7)
1. **Computer Science and Engineering (CSE)**
   - Chairman: Dr. Sarah Johnson
   - Publications: 45 journals, 12 magazines
   - Collaborations: ACM, IEEE, ISTE

2. **Information Technology (IT)**
   - Chairman: Prof. Michael Chen
   - Publications: 38 journals, 8 magazines
   - Collaborations: IEEE, ACM, CSI

3. **Electronics and Communication Engineering (ECE)**
   - Chairman: Dr. Emily Rodriguez
   - Publications: 52 journals, 15 magazines
   - Collaborations: IEEE, IETE, ISTE

4. **Mechanical Engineering (ME)**
   - Chairman: Prof. David Kumar
   - Publications: 41 journals, 10 magazines
   - Collaborations: ASME, ISTE, SAE

5. **Civil Engineering (CE)**
   - Chairman: Dr. Lisa Anderson
   - Publications: 35 journals, 9 magazines
   - Collaborations: ASCE, ISTE, IStructE

6. **Basic Sciences (BS)** - First Year Department
   - Chairman: Prof. Robert Wilson
   - Publications: 28 journals, 6 magazines
   - Collaborations: ISTE, IAPT

7. **Mathematics (MATH)** - First Year Department
   - Chairman: Dr. Jennifer Lee
   - Publications: 33 journals, 7 magazines
   - Collaborations: ISTE, AMS

### Programs (6)
1. **B.Tech CSE** - 4 years, 160 credits
   - Specializations: Software Engineering, Data Science, Cybersecurity
   - Mode: Full-Time

2. **B.Tech IT** - 4 years, 160 credits
   - Specializations: Web Technologies, Mobile Computing, Cloud Computing
   - Mode: Full-Time

3. **B.Tech ECE** - 4 years, 160 credits
   - Specializations: VLSI Design, Communication Systems, Embedded Systems
   - Mode: Full-Time

4. **M.Tech CSE** - 2 years, 80 credits
   - Specializations: Machine Learning, AI, Data Analytics
   - Mode: Full-Time

5. **MBA** - 2 years, 96 credits
   - Specializations: Technology Management, Digital Marketing, Finance
   - Mode: Part-Time

6. **B.Tech ME** - 4 years, 160 credits
   - Specializations: Robotics, Automation, Industrial Engineering
   - Mode: Hybrid

### Faculty Members (12)
- **Professors**: 7 (including all HODs)
- **Associate Professors**: 2
- **Assistant Professors**: 2
- **Lecturers**: 1

Each faculty member includes:
- Complete contact information
- Qualifications and experience
- Department assignments
- User group memberships

### BOS Members (8)
- **Chairman**: Dr. Sarah Johnson (CSE HOD)
- **Secretary**: Prof. Michael Chen (CSE Assoc Prof)
- **Members**: All department HODs
- **Term**: 2024-2026

### Program Outcomes (15)
- **NBA Outcomes (12)**: PO1-PO12 covering all NBA criteria
- **PSO Outcomes (3)**: Program-specific outcomes for CSE
- **Categories**: Technical, Professional, Critical Thinking

## Usage

### Prerequisites
1. Ensure the database is set up and migrated
2. Make sure all required tables exist
3. Default reference data should be inserted

### Running the Sample Data Seeding

```bash
# Navigate to server directory
cd server

# Run the seeding script
npm run seed

# Or run directly
node scripts/seed-sample-data.js
```

### What the Script Does
1. Checks for existing data to avoid duplicates
2. Seeds organisation details (if none exist)
3. Creates departments with realistic data
4. Adds academic programs with specializations
5. Creates faculty members with complete profiles
6. Assigns BOS members with proper roles
7. Inserts comprehensive program outcomes

### Data Relationships
- Users are linked to departments and faculty types
- BOS members are linked to users and departments
- Programs are linked to program types and modes
- All data follows proper foreign key relationships

## Customization

You can modify the sample data by editing the arrays in `seed-sample-data.js`:

- `departments[]` - Add/modify departments
- `programs[]` - Add/modify programs
- `users[]` - Add/modify faculty members
- `bosMembers[]` - Add/modify BOS members
- `programOutcomes[]` - Add/modify outcomes

## Notes

- All email addresses use the `@nexus.edu` domain
- Phone numbers follow a consistent pattern
- Employee IDs are department-prefixed
- All data includes realistic qualifications and experience
- BOS members are selected from faculty with 'BOS' in their user groups
- Program outcomes follow NBA standards

## Troubleshooting

If you encounter issues:

1. **Duplicate key errors**: The script uses `ON CONFLICT DO NOTHING` to handle duplicates
2. **Foreign key errors**: Ensure migration script has run successfully
3. **Missing reference data**: Run `npm run migrate` first
4. **Database connection**: Check your `.env` file configuration

## File Structure

```
server/scripts/
├── migrate.js              # Database migration script
├── seed-sample-data.js     # Sample data seeding script
└── README-sample-data.md   # This documentation
```
