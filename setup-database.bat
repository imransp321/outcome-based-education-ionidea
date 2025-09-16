@echo off
echo === OBE System Database Setup ===
echo.

REM Check if PostgreSQL is installed
echo Checking PostgreSQL installation...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo PostgreSQL not found in PATH
    echo.
    echo Please install PostgreSQL first:
    echo 1. Download from: https://www.postgresql.org/download/windows/
    echo 2. Install with default settings
    echo 3. Remember the postgres user password
    echo 4. Make sure to add PostgreSQL to PATH during installation
    echo.
    echo After installation, restart Command Prompt and run this script again.
    pause
    exit /b 1
)

echo PostgreSQL found!
echo.

REM Create SQL script
echo Creating database and user...
(
echo CREATE DATABASE obe_system;
echo CREATE USER obe_user WITH PASSWORD 'obe_password123';
echo GRANT ALL PRIVILEGES ON DATABASE obe_system TO obe_user;
echo \c obe_system
echo GRANT ALL ON SCHEMA public TO obe_user;
echo GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO obe_user;
echo GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO obe_user;
) > temp_setup.sql

REM Execute SQL script
psql -U postgres -f temp_setup.sql
if %errorlevel% neq 0 (
    echo Database setup failed. Please check the error messages above.
    del temp_setup.sql
    pause
    exit /b 1
)

REM Clean up
del temp_setup.sql

echo Database setup completed successfully!
echo.

REM Create .env file
echo Creating .env file...
(
echo # Database Configuration
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_NAME=obe_system
echo DB_USER=obe_user
echo DB_PASSWORD=obe_password123
echo.
echo # Server Configuration
echo PORT=5000
echo NODE_ENV=development
echo.
echo # JWT Configuration
echo JWT_SECRET=obe_system_jwt_secret_key_%RANDOM%
echo JWT_EXPIRE=7d
echo.
echo # File Upload Configuration
echo UPLOAD_PATH=./uploads
echo MAX_FILE_SIZE=5242880
) > server\.env

echo .env file created!
echo.

REM Install server dependencies
echo Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Failed to install server dependencies
    cd ..
    pause
    exit /b 1
)

REM Run database migration
echo Running database migration...
call npm run migrate
if %errorlevel% neq 0 (
    echo Database migration failed. Please check the error messages above.
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo === Database Setup Complete! ===
echo.
echo Database Details:
echo   Database Name: obe_system
echo   Username: obe_user
echo   Password: obe_password123
echo   Host: localhost
echo   Port: 5432
echo.
echo Next Steps:
echo 1. Install client dependencies: cd client ^&^& npm install
echo 2. Start the backend: cd server ^&^& npm run dev
echo 3. Start the frontend: cd client ^&^& npm start
echo 4. Or run both together: npm run dev
echo.
echo The application will be available at:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:5000
echo.
pause

