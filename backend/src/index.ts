import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import express from "express";
import cors from "cors";

// Import routes (now that env vars are loaded)
import domainRoutes from "./routes/domainRoutes";
import authRoutes from "./routes/authRoutes";
import subscriptionRoutes, {
  subscriptionWebhook,
} from "./routes/subscriptionRoutes";

const app = express();
const PORT = process.env["PORT"] || 3000;

// Basic middleware
app.use(
  cors({
    origin: process.env["CORS_ORIGIN"] || "http://localhost:3001",
    credentials: true,
  })
);

// Stripe webhook needs raw body, so handle it before JSON parsing
app.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  subscriptionWebhook
);

// JSON parsing for all other routes
app.use(express.json());

// Routes
app.use("/api/domains", domainRoutes);
app.use("/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Health check endpoint with comprehensive status
app.get("/health", async (_req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: "unknown",
      ai: "unknown",
      domain_api: "unknown",
      stripe: "unknown",
    },
  };

  try {
    // Check database connection
    const { checkDatabaseConnection } = await import("./config/supabase");
    health.services.database = (await checkDatabaseConnection())
      ? "healthy"
      : "unhealthy";
  } catch (error) {
    health.services.database = "error";
  }

  // Check AI service
  try {
    health.services.ai = process.env["OPENAI_API_KEY"]
      ? "configured"
      : "not_configured";
  } catch (error) {
    health.services.ai = "error";
  }

  // Check domain API
  try {
    health.services.domain_api =
      process.env["DOMAINR_API_KEY"] || process.env["RAPIDAPI_KEY"]
        ? "configured"
        : "not_configured";
  } catch (error) {
    health.services.domain_api = "error";
  }

  // Check Stripe
  try {
    health.services.stripe =
      process.env["STRIPE_SECRET_KEY"] &&
      process.env["STRIPE_PRICE_MID"] &&
      process.env["STRIPE_PRICE_PREMIUM"]
        ? "configured"
        : "not_configured";
  } catch (error) {
    health.services.stripe = "error";
  }

  // Determine overall status
  const hasErrors = Object.values(health.services).some(
    (status) => status === "error" || status === "unhealthy"
  );
  health.status = hasErrors ? "degraded" : "ok";

  res.json(health);
});

// Basic error handling
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`API endpoints:`);
  console.log(`  - POST /api/domains/generate`);
  console.log(`  - POST /api/domains/check-availability`);
  console.log(`  - GET /auth/user`);
  console.log(`  - POST /api/subscriptions/checkout`);
  console.log(`  - GET /api/subscriptions/current`);
  console.log(`  - GET /api/subscriptions/details`);
  console.log(`  - POST /api/subscriptions/cancel`);
  console.log(`  - POST /api/subscriptions/upgrade`);
  console.log(`  - POST /api/subscriptions/reactivate`);
  console.log(`  - POST /webhooks/stripe`);
});
