-- Drop all tables and types in reverse dependency order
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS uploads CASCADE;
DROP TABLE IF EXISTS subscription_status CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS upload_status CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
