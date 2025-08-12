import express from "express";
import request from "supertest";
import subscriptionRoutes from "../src/routes/subscriptionRoutes";

const app = express();
app.use(express.json());
app.use("/api/subscriptions", subscriptionRoutes);

async function run() {
  // Should return 501 if Stripe not configured
  const r1 = await request(app)
    .post("/api/subscriptions/checkout")
    .set("x-user-email", "test@example.com")
    .send({
      tier: "mid",
      success_url: "https://example.com/s",
      cancel_url: "https://example.com/c",
    });
  if (r1.status !== 200 && r1.status !== 501)
    throw new Error("Unexpected status");

  const r2 = await request(app)
    .get("/api/subscriptions/current")
    .set("x-user-email", "test@example.com");
  if (r2.status !== 200) throw new Error("Unexpected status for current");

  console.log("✅ Subscription smoke tests passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
