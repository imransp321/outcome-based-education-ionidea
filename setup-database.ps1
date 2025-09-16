# OBE System Database Setup Script
# This script helps set up the PostgreSQL database for the OBE system

Write-Host "=== OBE System Database Setup ===" -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $psqlVersion = & psql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ PostgreSQL found: $psqlVersion" -ForegroundColor Green
    } else {
        throw "PostgreSQL not found"
    }
} catch {
    Write-Host "✗ PostgreSQL not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    Write-Host "2. Install with default settings" -ForegroundColor Cyan
    Write-Host "3. Remember the postgres user password" -ForegroundColor Cyan
    Write-Host "4. Make sure to add PostgreSQL to PATH during installation" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Setting up database..." -ForegroundColor Yellow

# Database configuration
$DB_NAME = "obe_system"
$DB_USER = "obe_user"
$DB_PASSWORD = "obe_password123"

Write-Host "Creating database: $DB_NAME" -ForegroundColor Cyan
Write-Host "Creating user: $DB_USER" -ForegroundColor Cyan
Write-Host ""

# Create SQL script
$sqlScript = @"
-- Create database
CREATE DATABASE $DB_NAME;

-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Connect to the new database
\c $DB_NAME

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
"@

# Write SQL script to temporary file
$tempSqlFile = "temp_setup.sql"
$sqlScript | Out-File -FilePath $tempSqlFile -Encoding UTF8

try {
    # Execute SQL script
    Write-Host "Executing database setup..." -ForegroundColor Yellow
    & psql -U postgres -f $tempSqlFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database setup completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Database setup failed. Please check the error messages above." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error executing database setup: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clean up temporary file
    if (Test-Path $tempSqlFile) {
        Remove-Item $tempSqlFile
    }
}

Write-Host ""
Write-Host "Creating .env file..." -ForegroundColor Yellow

# Create .env file
$envContent = @"
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=obe_system_jwt_secret_key_$(Get-Random)
JWT_EXPIRE=7d

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
"@

$envFile = "server\.env"
$envContent | Out-File -FilePath $envFile -Encoding UTF8

Write-Host "✓ .env file created at: $envFile" -ForegroundColor Green

Write-Host ""
Write-Host "Installing server dependencies..." -ForegroundColor Yellow

# Install server dependencies
Set-Location server
try {
    & npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Server dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install server dependencies" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error installing server dependencies: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Running database migration..." -ForegroundColor Yellow

# Run database migration
try {
    & npm run migrate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database migration completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Database migration failed. Please check the error messages above." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error running database migration: $_" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "=== Database Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Database Details:" -ForegroundColor Cyan
Write-Host "  Database Name: $DB_NAME" -ForegroundColor White
Write-Host "  Username: $DB_USER" -ForegroundColor White
Write-Host "  Password: $DB_PASSWORD" -ForegroundColor White
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: 5432" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Install client dependencies: cd client && npm install" -ForegroundColor White
Write-Host "2. Start the backend: cd server && npm run dev" -ForegroundColor White
Write-Host "3. Start the frontend: cd client && npm start" -ForegroundColor White
Write-Host "4. Or run both together: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "The application will be available at:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend API: http://localhost:5000" -ForegroundColor White

