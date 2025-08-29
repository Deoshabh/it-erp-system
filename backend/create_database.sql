-- Create the ERP system database
CREATE DATABASE erp_system;

-- Create a test database for testing
CREATE DATABASE erp_system_test;

-- Create a user for the application
CREATE USER erp_user WITH ENCRYPTED PASSWORD 'erp_password';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE erp_system TO erp_user;
GRANT ALL PRIVILEGES ON DATABASE erp_system_test TO erp_user;

-- Connect to the main database and enable UUID extension
\c erp_system;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Connect to the test database and enable UUID extension
\c erp_system_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";