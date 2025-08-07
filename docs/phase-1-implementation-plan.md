# Phase 1 Implementation Plan: Core Infrastructure

## Overview

This document outlines the detailed implementation plan for Phase 1 of the AI Domain Name Tool backend development (Days 1-3). This phase establishes the foundational infrastructure including development environment setup, database schema implementation, authentication system, and core API endpoints.

## Phase 1 Objectives

- ✅ Set up minimal development environment
- ✅ Implement basic database schema (3 tables only)
- ✅ Google OAuth integration via Supabase Auth UI
- ✅ Basic AI domain generation functionality
- ✅ Simple domain availability checking
- ✅ Basic user session management

## Day-by-Day Breakdown

### Day 1: Minimal Setup & Core Foundation

#### Morning (4 hours)
**1. Project Initialization & Structure**
- Initialize Node.js project with TypeScript
- Set up basic project directory structure
- Configure package.json with minimal dependencies
- Set up TypeScript configuration
- Initialize Git repository with .gitignore

**Expected Directory Structure:**
```
src/
├── controllers/          # Route handlers
├── services/            # Business logic
├── routes/              # API route definitions
├── config/              # Configuration files
└── types/               # TypeScript type definitions
```

**2. Core Dependencies Installation**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "@supabase/supabase-js": "^2.38.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/express": "^4.17.17",
    "@types/uuid": "^9.0.5",
    "typescript": "^5.2.0",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1"
  }
}
```

**3. Environment Configuration Setup**
- Create basic .env.example file
- Set up environment variables for Supabase and AI APIs
- Document required environment variables

#### Afternoon (4 hours)
**4. Supabase Integration Setup**
- Create Supabase project for development
- Configure Supabase client with basic connection settings
- Test database connectivity
- Set up basic database tables

**5. Basic Express Server Configuration**
- Set up Express application with TypeScript
- Configure basic middleware (CORS, JSON parsing)
- Create simple health check endpoint
- Set up basic error handling

**6. Google OAuth Setup**
- Configure Google OAuth in Supabase Auth dashboard
- Test basic OAuth flow
- Set up simple user creation

### Day 2: Basic Database & AI Integration

#### Morning (4 hours)
**1. Minimal Database Schema Implementation**

**Users Table Creation:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

**Generation Sessions Table:**
```sql
CREATE TABLE generation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_generation_sessions_user_id ON generation_sessions(user_id);
```

**Domain Suggestions Table:**
```sql
CREATE TABLE domain_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES generation_sessions(id) ON DELETE CASCADE,
    domain_name VARCHAR(255) NOT NULL,
    is_available BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_domain_suggestions_session_id ON domain_suggestions(session_id);
```

#### Afternoon (4 hours)
**2. Basic Database Operations**
- Create simple database connection utilities
- Implement basic CRUD operations for User model
- Set up simple query helper functions
- Test basic database operations

**3. AI Integration Setup**
- Set up OpenAI/Groq API client
- Create basic AI service for domain generation
- Implement simple prompt engineering
- Test AI domain generation functionality

**4. Domain Availability Service**
- Set up Domainr API integration
- Create basic domain availability checking
- Implement simple error handling
- Test domain availability functionality

### Day 3: Integration & Polish

#### Morning (4 hours)
**1. API Endpoints Implementation**
- Create domain generation endpoint
- Implement domain availability checking endpoint
- Set up user history endpoint
- Create basic authentication endpoints

**2. Frontend Integration**
- Connect frontend to backend APIs
- Implement basic error handling
- Set up simple user session management
- Test end-to-end functionality

#### Afternoon (4 hours)
**3. Core API Endpoints**
```typescript
// Core API endpoints for MVP
POST /api/domains/generate     // Generate domain suggestions
GET  /api/domains/check-availability  // Check domain availability
GET  /api/domains/history      // Get user's generation history
GET  /auth/user                // Get current user profile
```

**Implementation includes:**
- Basic AI domain generation
- Simple domain availability checking
- User session management
- Basic error handling
- Simple response formatting

**4. Testing & Bug Fixes**
- Manual testing of all features
- Fix any integration issues
- Ensure basic functionality works
- Prepare for user testing

**5. Documentation & Handoff**
- Document API endpoints
- Create basic setup guide
- Prepare for Phase 2 development

## Technical Implementation Details

### 1. Environment Configuration

**Required Environment Variables:**
```bash
# Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AI Services Configuration
OPENAI_API_KEY=sk-...  # or GROQ_API_KEY=gsk_...

# Domain Services Configuration
DOMAINR_API_KEY=your-domainr-api-key

# Application Configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

### 2. Basic Express Server Setup

**Minimal Server Configuration:**
```typescript
import express from 'express';
import cors from 'cors';

const app = express();

// Basic middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// Basic error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
```

### 3. Supabase Client Configuration

**Basic Supabase Setup:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Basic database operations
export const createUser = async (email: string, name: string) => {
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, name }])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const createGenerationSession = async (userId: string, prompt: string) => {
  const { data, error } = await supabase
    .from('generation_sessions')
    .insert([{ user_id: userId, prompt }])
    .select();
  
  if (error) throw error;
  return data[0];
};
```

### 4. Basic AI Service

**Simple AI Integration:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateDomains = async (prompt: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a domain name generator. Generate 5 creative domain names based on the user's prompt."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate domains');
  }
};
```

## Testing Strategy (Phase 2+)

### 1. Unit Tests (Phase 2+)
- Authentication service functions
- Database model operations
- AI service functions
- Domain service functions

### 2. Integration Tests (Phase 2+)
- User authentication flow
- Domain generation flow
- Database operations
- API endpoint responses

### 3. Security Tests (Phase 2+)
- SQL injection prevention
- XSS protection
- Authentication bypass attempts
- API security validation

## Deployment Preparation (Phase 2+)

### 1. Development Environment
- Supabase local development setup
- Environment variable validation
- Database migration automation
- Hot reload configuration

### 2. CI/CD Foundation (Phase 2+)
- GitHub Actions workflow setup
- Automated testing pipeline
- Environment-specific deployments
- Database migration validation

## Success Criteria

### Day 1 Completion Criteria:
- ✅ Express server running on specified port
- ✅ Supabase connection established
- ✅ Basic project structure set up
- ✅ Health check endpoint responding
- ✅ Environment configuration validated

### Day 2 Completion Criteria:
- ✅ Basic database tables created (3 tables)
- ✅ AI service integration functional
- ✅ Domain availability service working
- ✅ Basic database operations functional
- ✅ Simple error handling in place

### Day 3 Completion Criteria:
- ✅ Core API endpoints working
- ✅ Frontend integration functional
- ✅ End-to-end domain generation working
- ✅ Basic user session management
- ✅ Manual testing completed
- ✅ Ready for user feedback

## Risk Mitigation

### Technical Risks:
1. **Database Connection Issues**: Basic error handling and retry logic
2. **AI API Integration**: Ensure proper error handling and fallbacks
3. **Domain API Integration**: Monitor API response times and errors
4. **Basic Security**: Implement simple input validation

### Performance Considerations:
1. **Database Queries**: Basic indexing for performance
2. **AI API Performance**: Monitor response times
3. **Response Times**: Basic error handling
4. **Concurrent Users**: Simple connection management

## Post-Phase 1 Handoff

### Documentation Deliverables:
- Basic API endpoint documentation
- Simple database schema documentation
- Environment setup guide
- Basic troubleshooting guide

### Code Quality Standards (Phase 2+):
- TypeScript strict mode compliance
- ESLint and Prettier configuration
- Test coverage > 80%
- Security vulnerability scanning
- Performance benchmarking

This Phase 1 implementation establishes a minimal viable product that can be quickly deployed and tested with users, providing a foundation for iterative development based on user feedback and needs.
