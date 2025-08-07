-- AI Domain Name Tool - Core Database Schema
-- Migration 001: Create core tables for Phase 1

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - stores basic user information
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generation sessions table - tracks AI domain generation requests
CREATE TABLE IF NOT EXISTS generation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt VARCHAR(500) NOT NULL,
    model_used VARCHAR(100) DEFAULT 'gpt-4o-mini',
    token_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Domain suggestions table - stores AI-generated domain suggestions
CREATE TABLE IF NOT EXISTS domain_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES generation_sessions(id) ON DELETE CASCADE,
    domain_name VARCHAR(255) NOT NULL,
    is_available BOOLEAN DEFAULT NULL,
    checked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_generation_sessions_user_id ON generation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_created_at ON generation_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_domain_suggestions_session_id ON domain_suggestions(session_id);
CREATE INDEX IF NOT EXISTS idx_domain_suggestions_domain_name ON domain_suggestions(domain_name);
CREATE INDEX IF NOT EXISTS idx_domain_suggestions_created_at ON domain_suggestions(created_at);

-- Enable Row Level Security (RLS) for data protection
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_suggestions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (will be enhanced in Phase 2 with proper auth)
-- For now, allow all operations for service role
CREATE POLICY IF NOT EXISTS "Allow service role full access on users" 
    ON users FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow service role full access on generation_sessions" 
    ON generation_sessions FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow service role full access on domain_suggestions" 
    ON domain_suggestions FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Insert a test user for development
INSERT INTO users (email, name) VALUES 
    ('test@example.com', 'Test User')
ON CONFLICT (email) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE users IS 'Stores user account information and profiles';
COMMENT ON TABLE generation_sessions IS 'Tracks AI domain generation requests and metadata';
COMMENT ON TABLE domain_suggestions IS 'Stores AI-generated domain name suggestions';
