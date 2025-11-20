-- Complete database reset - drop everything
-- Drop all schemas
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast'))
    LOOP
        EXECUTE 'DROP SCHEMA ' || quote_ident(r.schema_name) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all types
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
    LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END $$;

-- Recreate public schema
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO CURRENT_USER;
GRANT ALL ON SCHEMA public TO public;
