import { Router } from "express";
import {
  getCurrentUser,
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
} from "../controllers/authController";
import { authenticateUser } from "../middleware/validation";

const router = Router();

// Public authentication endpoints
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);

// Protected endpoints (require authentication)
router.get("/user", authenticateUser, getCurrentUser);
router.post("/logout", authenticateUser, logoutUser);

export default router;
