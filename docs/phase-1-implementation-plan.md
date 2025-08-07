# Phase 1 Implementation Plan: Core Infrastructure

## Overview

This document outlines the detailed implementation plan for Phase 1 of the AI Domain Name Tool backend development (Days 1-3). This phase establishes the foundational infrastructure including development environment setup, database schema implementation, authentication system, and core API endpoints.

## Phase 1 Objectives

- ✅ Set up complete development environment
- ✅ Implement database schema with all core tables
- ✅ Build robust authentication system with JWT
- ✅ Create user registration/login APIs
- ✅ Establish middleware architecture
- ✅ Configure environment management
- ✅ Set up basic error handling and logging

## Day-by-Day Breakdown

### Day 1: Environment Setup & Project Foundation

#### Morning (4 hours)
**1. Project Initialization & Structure**
- Initialize Node.js project with TypeScript
- Set up project directory structure following NMC architecture guidelines
- Configure package.json with all required dependencies
- Set up TypeScript configuration with strict mode
- Initialize Git repository with proper .gitignore

**Expected Directory Structure:**
```
src/
├── controllers/          # Route handlers
├── middleware/          # Custom middleware
├── models/              # Database models/types
├── services/            # Business logic
├── routes/              # API route definitions
├── utils/               # Helper functions
├── config/              # Configuration files
├── database/            # Database setup & migrations
│   └── migrations/      # SQL migration files
├── types/               # TypeScript type definitions
└── tests/               # Test files
```

**2. Core Dependencies Installation**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "@supabase/supabase-js": "^2.38.0",
    "redis": "^4.6.10",
    "winston": "^3.11.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/express": "^4.17.17",
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.3",
    "@types/uuid": "^9.0.5",
    "typescript": "^5.2.0",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.5"
  }
}
```

**3. Environment Configuration Setup**
- Create comprehensive .env.example file
- Set up environment variable validation using Zod
- Configure different environments (development, staging, production)
- Document all required environment variables

#### Afternoon (4 hours)
**4. Supabase Integration Setup**
- Create Supabase project for development
- Configure Supabase client with proper connection settings
- Set up connection pooling configuration
- Test database connectivity
- Configure Row Level Security (RLS) policies foundation

**5. Basic Express Server Configuration**
- Set up Express application with TypeScript
- Configure essential middleware (CORS, Helmet, JSON parsing)
- Set up basic error handling middleware
- Configure request logging with Winston
- Create health check endpoint
- Set up graceful shutdown handling

**6. Redis Integration**
- Set up Redis connection for session management
- Configure Redis client with proper error handling
- Create Redis utility functions for session operations
- Test Redis connectivity and basic operations

### Day 2: Database Schema Implementation

#### Morning (4 hours)
**1. Database Schema Design Implementation**

**Users Table Creation:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'mid', 'premium')),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
```

**Subscriptions Table:**
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'mid', 'premium')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
    stripe_subscription_id VARCHAR(255),
    price_paid DECIMAL(10,2),
    billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('monthly', 'yearly')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
```

**2. Remaining Core Tables Implementation**
- Generation Sessions table with JSONB for style preferences
- Domain Suggestions table with AI reasoning storage
- Social Handle Checks table for multi-platform tracking
- Trademark Checks table with JSONB for matching trademarks
- Generated Assets table for logos and color palettes
- Usage Tracking table for tier enforcement
- Email Deliverables table for campaign tracking

#### Afternoon (4 hours)
**3. Database Migrations System**
- Set up Supabase migration system
- Create migration files for all tables
- Implement database seeding for development
- Create migration runner utilities
- Test migration rollback functionality

**4. Database Models & Types**
- Create TypeScript interfaces for all database entities
- Implement Zod schemas for request/response validation
- Create database connection utilities
- Set up query helper functions
- Implement basic CRUD operations for User model

**5. Row Level Security (RLS) Setup**
- Enable RLS on all tables
- Create policies for user data access
- Set up admin role policies
- Test RLS policies with different user scenarios
- Document security model

### Day 3: Authentication System Implementation

#### Morning (4 hours)
**1. Password Security Implementation**
- Set up bcrypt with 12 rounds for password hashing
- Create password strength validation
- Implement secure password comparison
- Create password reset token generation
- Set up password history tracking (prevent reuse)

**2. JWT Token System**
- Configure JWT signing and verification
- Implement access token generation (short-lived, 1 hour)
- Set up refresh token system (long-lived, 7 days)
- Create token blacklist system using Redis
- Implement token validation middleware

**3. Authentication Middleware**
- Create JWT authentication middleware
- Implement role-based access control
- Set up rate limiting for auth endpoints
- Create account lockout protection
- Implement request sanitization

#### Afternoon (4 hours)
**4. User Registration System**
```typescript
// Registration flow implementation
interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    subscriptionTier: string;
  };
  accessToken: string;
  refreshToken: string;
}
```

**Implementation includes:**
- Email format validation and uniqueness check
- Password strength requirements
- User creation with default free tier
- Welcome email queueing
- Initial session creation
- Response with JWT tokens

**5. User Login System**
- Email/password authentication
- Account lockout after failed attempts
- Session management with Redis
- Login attempt logging
- Remember me functionality
- Secure token refresh mechanism

**6. Core Auth API Endpoints**
```typescript
POST /auth/register     // User registration
POST /auth/login        // User login
POST /auth/logout       // User logout (token blacklist)
POST /auth/refresh      // Refresh access token
GET  /auth/me          // Get current user profile
POST /auth/forgot-password  // Password reset request
POST /auth/reset-password   // Password reset completion
```

## Technical Implementation Details

### 1. Environment Configuration

**Required Environment Variables:**
```bash
# Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Authentication Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Application Configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000

# Logging Configuration
LOG_LEVEL=debug
```

### 2. Middleware Stack Implementation

**Security Middleware Chain:**
```typescript
// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Request validation middleware
const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid request data' });
    }
  };
};
```

### 3. Error Handling Strategy

**Centralized Error Handler:**
```typescript
interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { statusCode = 500, message } = err;
  
  logger.error({
    error: err,
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
    },
  });

  res.status(statusCode).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : message,
  });
};
```

### 4. Database Connection Management

**Supabase Client Configuration:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  }
);

// Connection health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};
```

### 5. Logging Configuration

**Winston Logger Setup:**
```typescript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'nmc-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## Testing Strategy

### 1. Unit Tests
- Authentication service functions
- Password hashing/verification
- JWT token generation/validation
- Database model operations
- Middleware functions

### 2. Integration Tests
- User registration flow
- Login/logout functionality
- Token refresh mechanism
- Database operations
- API endpoint responses

### 3. Security Tests
- SQL injection prevention
- XSS protection
- Rate limiting effectiveness
- Authentication bypass attempts
- Token security validation

## Deployment Preparation

### 1. Development Environment
- Docker setup for local Redis
- Supabase local development setup
- Environment variable validation
- Database migration automation
- Hot reload configuration

### 2. CI/CD Foundation
- GitHub Actions workflow setup
- Automated testing pipeline
- Environment-specific deployments
- Database migration validation
- Security scanning integration

## Success Criteria

### Day 1 Completion Criteria:
- ✅ Express server running on specified port
- ✅ Supabase connection established
- ✅ Redis connection functional
- ✅ Basic middleware stack operational
- ✅ Health check endpoint responding
- ✅ Environment configuration validated

### Day 2 Completion Criteria:
- ✅ All database tables created and indexed
- ✅ Migration system functional
- ✅ RLS policies implemented and tested
- ✅ TypeScript models defined
- ✅ Basic CRUD operations working
- ✅ Database connection health checks passing

### Day 3 Completion Criteria:
- ✅ User registration working end-to-end
- ✅ Login/logout functionality complete
- ✅ JWT token system operational
- ✅ Authentication middleware protecting routes
- ✅ Password security measures active
- ✅ Rate limiting functional
- ✅ Error handling comprehensive

## Risk Mitigation

### Technical Risks:
1. **Database Connection Issues**: Implement connection pooling and retry logic
2. **Redis Connectivity**: Set up Redis clustering for production readiness
3. **JWT Security**: Use strong secrets and implement token rotation
4. **Rate Limiting Bypass**: Implement multiple layers of protection

### Performance Considerations:
1. **Database Queries**: Proper indexing and query optimization
2. **Memory Usage**: Efficient Redis usage for sessions
3. **Response Times**: Implement caching strategies
4. **Concurrent Users**: Connection pooling and resource management

## Post-Phase 1 Handoff

### Documentation Deliverables:
- API endpoint documentation
- Database schema documentation
- Authentication flow diagrams
- Environment setup guide
- Troubleshooting guide

### Code Quality Standards:
- TypeScript strict mode compliance
- ESLint and Prettier configuration
- Test coverage > 80%
- Security vulnerability scanning
- Performance benchmarking

This Phase 1 implementation establishes a solid foundation for the remaining development phases, ensuring security, scalability, and maintainability from the ground up.
