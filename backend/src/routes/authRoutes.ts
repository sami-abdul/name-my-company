import { Router } from 'express';
import { getCurrentUser } from '../controllers/authController';

const router = Router();

// Get current user profile
router.get('/user', getCurrentUser);

export default router;
