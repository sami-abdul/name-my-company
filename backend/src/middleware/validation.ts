import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { supabaseAuth } from '../config/supabase';

// Input validation middleware
export const validateDomainGenerationRequest = (
  req: Request, 
  res: Response, 
  next: NextFunction
): Response | void => {
  const { prompt, business_type, style, keywords, model } = req.body;
  
  // Validate required prompt
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({
      status: 'error',
      error: 'Prompt is required and must be a non-empty string'
    } as ApiResponse<null>);
  }
  
  // Validate prompt length
  if (prompt.length > 500) {
    return res.status(400).json({
      status: 'error',
      error: 'Prompt must be 500 characters or less'
    } as ApiResponse<null>);
  }
  
  // Validate optional fields
  if (business_type && typeof business_type !== 'string') {
    return res.status(400).json({
      status: 'error',
      error: 'Business type must be a string'
    } as ApiResponse<null>);
  }
  
  if (style && typeof style !== 'string') {
    return res.status(400).json({
      status: 'error',
      error: 'Style must be a string'
    } as ApiResponse<null>);
  }
  
  if (keywords && !Array.isArray(keywords)) {
    return res.status(400).json({
      status: 'error',
      error: 'Keywords must be an array'
    } as ApiResponse<null>);
  }
  
  if (model && !['gpt-4o-mini', 'gpt-4o', 'llama-3-70b', 'llama-3-8b'].includes(model)) {
    return res.status(400).json({
      status: 'error',
      error: 'Invalid AI model specified'
    } as ApiResponse<null>);
  }
  
  next();
};

export const validateDomainAvailabilityRequest = (
  req: Request, 
  res: Response, 
  next: NextFunction
): Response | void => {
  const { domain_name } = req.body;
  
  if (!domain_name || typeof domain_name !== 'string') {
    return res.status(400).json({
      status: 'error',
      error: 'Domain name is required and must be a string'
    } as ApiResponse<null>);
  }
  
  // Basic domain format validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain_name)) {
    return res.status(400).json({
      status: 'error',
      error: 'Invalid domain name format'
    } as ApiResponse<null>);
  }
  
  next();
};

// Secure authentication middleware using Supabase Auth
export const authenticateUser = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        error: 'Authorization header with Bearer token is required'
      } as ApiResponse<null>);
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        status: 'error',
        error: 'Invalid or expired token'
      } as ApiResponse<null>);
    }
    
    // Add user info to request for use in controllers
    (req as any).user = user;
    
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(401).json({
      status: 'error',
      error: 'Authentication failed'
    } as ApiResponse<null>);
  }
};

// Backward compatibility middleware (deprecated - use authenticateUser instead)
export const validateUserEmailHeader = (
  req: Request, 
  res: Response, 
  next: NextFunction
): Response | void => {
  console.warn('DEPRECATED: validateUserEmailHeader is insecure and should be replaced with authenticateUser');
  
  const userEmail = req.headers['x-user-email'] as string;
  
  if (!userEmail) {
    return res.status(401).json({
      status: 'error',
      error: 'User email header is required. Please use proper authentication.'
    } as ApiResponse<null>);
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    return res.status(400).json({
      status: 'error',
      error: 'Invalid email format'
    } as ApiResponse<null>);
  }
  
  next();
};

// Enhanced request sanitization with SQL injection prevention
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitize string inputs to prevent XSS and SQL injection
  const sanitizeString = (str: string): string => {
    // Remove script tags
    let sanitized = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove potentially dangerous characters for SQL injection
    sanitized = sanitized.replace(/['";\\]/g, '');
    
    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Remove SQL injection patterns
    sanitized = sanitized.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '');
    
    return sanitized.trim();
  };
  
  const sanitizeRecursive = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(item => sanitizeRecursive(item));
    } else if (obj && typeof obj === 'object') {
      const sanitizedObj: any = {};
      for (const key in obj) {
        // Sanitize key names too
        const sanitizedKey = sanitizeString(key);
        sanitizedObj[sanitizedKey] = sanitizeRecursive(obj[key]);
      }
      return sanitizedObj;
    }
    return obj;
  };
  
  if (req.body) {
    req.body = sanitizeRecursive(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeRecursive(req.query);
  }
  
  next();
};

// Rate limiting helper (simple implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimitByIP = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    const clientData = requestCounts.get(clientIP);
    
    if (!clientData || now > clientData.resetTime) {
      // Reset or initialize counter
      requestCounts.set(clientIP, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        status: 'error',
        error: 'Too many requests. Please try again later.'
      } as ApiResponse<null>);
    }
    
    clientData.count++;
    next();
  };
};
