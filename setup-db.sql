-- OBE System Database Setup Script
-- This script creates the database, user, and grants necessary permissions

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

