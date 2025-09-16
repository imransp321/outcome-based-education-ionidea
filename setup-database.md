# PostgreSQL Database Setup Guide

## Step 1: Install PostgreSQL

### Option A: Download from Official Website
1. Go to https://www.postgresql.org/download/windows/
2. Download PostgreSQL installer for Windows
3. Run the installer and follow the setup wizard
4. Remember the password you set for the `postgres` user
5. Make sure to add PostgreSQL to your PATH during installation

### Option B: Using Chocolatey (if you have it installed)
```powershell
choco install postgresql
```

### Option C: Using Scoop (if you have it installed)
```powershell
scoop install postgresql
```

## Step 2: Verify Installation
After installation, open a new PowerShell window and run:
```powershell
psql --version
```

## Step 3: Start PostgreSQL Service
```powershell
# Start PostgreSQL service
net start postgresql-x64-14
# or
net start postgresql-x64-15
# (version number may vary)
```

## Step 4: Create Database and User
1. Open Command Prompt or PowerShell as Administrator
2. Navigate to PostgreSQL bin directory (usually `C:\Program Files\PostgreSQL\14\bin\` or similar)
3. Run the following commands:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE obe_system;

-- Create user
CREATE USER obe_user WITH PASSWORD 'obe_password123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE obe_system TO obe_user;

-- Connect to the new database
\c obe_system

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO obe_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO obe_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO obe_user;

-- Exit psql
\q
```

## Step 5: Update Environment Variables
Create a `.env` file in the `server` directory with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=obe_system
DB_USER=obe_user
DB_PASSWORD=obe_password123

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRE=7d

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## Step 6: Run Database Migration
After setting up the database and environment variables:

```powershell
# Navigate to server directory
cd server

# Install dependencies
npm install

# Run database migration
npm run migrate
```

## Alternative: Using pgAdmin (GUI Method)

If you prefer a graphical interface:

1. Install pgAdmin (usually comes with PostgreSQL)
2. Open pgAdmin and connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name it `obe_system`
5. Right-click on the new database → "Query Tool"
6. Run the user creation SQL from Step 4

## Troubleshooting

### If psql is not recognized:
- Add PostgreSQL bin directory to your PATH
- Or use the full path: `"C:\Program Files\PostgreSQL\14\bin\psql.exe"`

### If connection fails:
- Check if PostgreSQL service is running
- Verify the port (default is 5432)
- Check firewall settings
- Ensure the user has proper permissions

### If migration fails:
- Check database connection in .env file
- Ensure all required tables don't already exist
- Check PostgreSQL logs for errors

