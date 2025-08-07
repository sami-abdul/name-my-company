import { Router } from 'express';
import { generateDomainSuggestions, checkDomainAvailabilityController } from '../controllers/domainController';

const router = Router();

// Domain generation endpoint
router.post('/generate', generateDomainSuggestions);

// Domain availability checking endpoint
router.post('/check-availability', checkDomainAvailabilityController);

export default router;
