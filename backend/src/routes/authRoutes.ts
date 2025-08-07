import { Router } from 'express';
import { getCurrentUser } from '../controllers/authController';
import { authenticateUser } from '../middleware/validation';

const router = Router();

// Get current user profile (requires authentication)
router.get('/user', authenticateUser, getCurrentUser);

export default router;
