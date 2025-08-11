import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ApiResponse } from "../types";

// Common helpers and schemas (Zod)
const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;

const domainGenerationSchema = z.object({
  prompt: z.string().min(1).max(500),
  user_id: z.string().uuid().optional(),
  business_type: z.string().optional(),
  style: z.string().optional(),
  keywords: z.array(z.string().min(1).max(64)).max(20).optional(),
  model: z
    .enum(["gpt-4o-mini", "gpt-4o", "llama-3-70b", "llama-3-8b"])
    .optional(),
  tier: z.enum(["free", "mid", "premium"]).optional(),
});

const domainAvailabilitySchema = z.object({
  domain_name: z.string().regex(domainRegex, "Invalid domain name format"),
});

const batchAvailabilitySchema = z.object({
  domains: z
    .array(z.string().regex(domainRegex, "Invalid domain name format"))
    .min(1)
    .max(10),
});

function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        status: "error",
        error: result.error.issues.map((i) => i.message).join("; "),
      } as ApiResponse<null>);
    }
    // Replace body with parsed (sanitized) data
    req.body = result.data as unknown as Request["body"];
    return next();
  };
}

// Input validation middleware (Zod-backed)
export const validateDomainGenerationRequest = validateBody(
  domainGenerationSchema
);

export const validateDomainAvailabilityRequest = validateBody(
  domainAvailabilitySchema
);

export const validateBatchDomainAvailabilityRequest = validateBody(
  batchAvailabilitySchema
);

// Secure authentication middleware using Supabase Auth
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { supabaseAuth } = await import("../config/supabase");
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        error: "Authorization header with Bearer token is required",
      } as ApiResponse<null>);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token with Supabase
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        status: "error",
        error: "Invalid or expired token",
      } as ApiResponse<null>);
    }

    // Add user info to request for use in controllers
    (req as any).user = user;

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(401).json({
      status: "error",
      error: "Authentication failed",
    } as ApiResponse<null>);
  }
};

// Backward compatibility middleware (deprecated - use authenticateUser instead)
export const validateUserEmailHeader = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  console.warn(
    "DEPRECATED: validateUserEmailHeader is insecure and should be replaced with authenticateUser"
  );

  const userEmail = req.headers["x-user-email"] as string;

  if (!userEmail) {
    return res.status(401).json({
      status: "error",
      error: "User email header is required. Please use proper authentication.",
    } as ApiResponse<null>);
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    return res.status(400).json({
      status: "error",
      error: "Invalid email format",
    } as ApiResponse<null>);
  }

  next();
};

// Enhanced request sanitization with SQL injection prevention
export const sanitizeInput = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Sanitize string inputs to prevent XSS and SQL injection
  const sanitizeString = (str: string): string => {
    // Remove script tags
    let sanitized = str.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );

    // Remove potentially dangerous characters for SQL injection
    sanitized = sanitized.replace(/['";\\]/g, "");

    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, "");

    // Remove SQL injection patterns
    sanitized = sanitized.replace(
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      ""
    );

    return sanitized.trim();
  };

  const sanitizeRecursive = (obj: any): any => {
    if (typeof obj === "string") {
      return sanitizeString(obj);
    } else if (Array.isArray(obj)) {
      return obj.map((item) => sanitizeRecursive(item));
    } else if (obj && typeof obj === "object") {
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

export const rateLimitByIP = (
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000
) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const clientIP = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();

    const clientData = requestCounts.get(clientIP);

    if (!clientData || now > clientData.resetTime) {
      // Reset or initialize counter
      requestCounts.set(clientIP, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        status: "error",
        error: "Too many requests. Please try again later.",
      } as ApiResponse<null>);
    }

    clientData.count++;
    next();
  };
};
