import { Router } from "express";
import {
  createCheckout,
  getSubscription,
  cancelUserSubscription,
  upgradeUserSubscription,
  reactivateUserSubscription,
  getDetailedSubscription,
  handleWebhook,
} from "../controllers/subscriptionController";
import { sanitizeInput, rateLimitByIP } from "../middleware/validation";

const router = Router();

router.use(rateLimitByIP(30, 15 * 60 * 1000));
router.use(sanitizeInput);

// For smoke tests, allow email via header if not authenticated yet
router.post("/checkout", createCheckout);
router.get("/current", getSubscription);
router.get("/details", getDetailedSubscription);
router.post("/cancel", cancelUserSubscription);
router.post("/upgrade", upgradeUserSubscription);
router.post("/reactivate", reactivateUserSubscription);

export default router;

// Webhook handler with proper implementation
export const subscriptionWebhook = handleWebhook;
