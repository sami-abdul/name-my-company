import { Router } from 'express';
import { 
  generateDomainSuggestions, 
  checkDomainAvailabilityController, 
  getUserGenerationHistory,
  batchCheckDomainAvailability
} from '../controllers/domainController';
import { 
  validateDomainGenerationRequest, 
  validateDomainAvailabilityRequest,
  authenticateUser,
  validateUserEmailHeader,
  sanitizeInput,
  rateLimitByIP
} from '../middleware/validation';

const router = Router();

// Apply rate limiting to all domain routes
router.use(rateLimitByIP(50, 15 * 60 * 1000)); // 50 requests per 15 minutes per IP

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Domain generation endpoint with validation
router.post('/generate', validateDomainGenerationRequest, generateDomainSuggestions);

// Single domain availability checking endpoint
router.post('/check-availability', validateDomainAvailabilityRequest, checkDomainAvailabilityController);

// Batch domain availability checking endpoint
router.post('/batch-check-availability', batchCheckDomainAvailability);

// User generation history endpoint (requires authentication)
router.get('/history', authenticateUser, getUserGenerationHistory);

export default router;
