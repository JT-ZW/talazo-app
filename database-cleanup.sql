-- ============================================
-- TALAZO AGRITECH DATABASE CLEANUP SCRIPT
-- ============================================
-- This script will clean your existing Supabase database
-- and prepare it for the Talazo app
-- 
-- ⚠️ WARNING: This will DELETE ALL existing tables and data!
-- Make sure you have a backup if you need to keep anything!
-- ============================================

-- Step 1: Drop existing tables (if any exist)
-- Add any tables from your old project here
-- Example:
-- DROP TABLE IF EXISTS old_table_name CASCADE;

-- Drop common table names that might conflict
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Step 2: Drop any existing policies
-- This ensures a clean slate for new security policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop all policies in public schema
    FOR r IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Step 3: Drop existing functions (optional - uncomment if needed)
-- DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Confirmation message
DO $$
BEGIN
    RAISE NOTICE 'Database cleanup complete! Ready for Talazo schema.';
END $$;
