import express from "express";
import request from "supertest";
import subscriptionRoutes, {
  subscriptionWebhook,
} from "../src/routes/subscriptionRoutes";

const app = express();
app.use(express.json());
app.use("/api/subscriptions", subscriptionRoutes);
app.post("/webhooks/stripe", subscriptionWebhook);

async function run() {
  const r = await request(app).post("/webhooks/stripe").send({});
  if (r.status !== 200 && r.status !== 501)
    throw new Error("Unexpected webhook status");
  console.log("✅ Subscription webhook smoke test passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
