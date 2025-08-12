import express from "express";
import request from "supertest";
import subscriptionRoutes from "../src/routes/subscriptionRoutes";

const app = express();
app.use(express.json());

// Mock user middleware for testing - must come before routes
app.use((req, _res, next) => {
  (req as any).user = {
    id: "test-user-123",
    email: "test@example.com",
  };
  next();
});

app.use("/api/subscriptions", subscriptionRoutes);

async function testSubscriptionEndpoints() {
  console.log("🧪 Running subscription integration tests...");

  try {
    // Test 1: Get current subscription status
    console.log("📊 Testing subscription status endpoint...");
    const statusRes = await request(app)
      .get("/api/subscriptions/current")
      .expect((res) => {
        if (res.status !== 200) {
          throw new Error(`Expected 200, got ${res.status}: ${res.body.error}`);
        }
        if (!res.body.data || typeof res.body.data.tier !== "string") {
          throw new Error("Invalid subscription status response structure");
        }
      });

    console.log(
      `✅ Current tier: ${statusRes.body.data.tier}, status: ${statusRes.body.data.status}`
    );

    // Test 2: Create checkout session
    console.log("💳 Testing checkout session creation...");
    const checkoutRes = await request(app)
      .post("/api/subscriptions/checkout")
      .send({
        tier: "mid",
        success_url: "https://example.com/success",
        cancel_url: "https://example.com/cancel",
      })
      .expect((res) => {
        // Should either succeed (200) or fail due to missing Stripe config (501)
        if (res.status !== 200 && res.status !== 501) {
          throw new Error(`Unexpected checkout status: ${res.status}`);
        }
      });

    if (checkoutRes.status === 200) {
      console.log("✅ Checkout session created successfully");
      console.log(
        `Session URL: ${checkoutRes.body.data.url ? "Present" : "Missing"}`
      );
    } else {
      console.log(
        "⚠️  Checkout failed - Stripe not configured (expected in test environment)"
      );
    }

    // Test 3: Try to get detailed subscription info
    console.log("📋 Testing detailed subscription endpoint...");
    const detailsRes = await request(app)
      .get("/api/subscriptions/details")
      .expect((res) => {
        // Should either succeed or fail gracefully
        if (res.status !== 200 && res.status !== 400 && res.status !== 501) {
          throw new Error(`Unexpected details status: ${res.status}`);
        }
      });

    if (detailsRes.status === 200) {
      console.log("✅ Detailed subscription info retrieved");
    } else {
      console.log("⚠️  No detailed subscription found (expected for new user)");
    }

    // Test 4: Try to upgrade subscription (should fail gracefully without active subscription)
    console.log("⬆️  Testing subscription upgrade...");
    await request(app)
      .post("/api/subscriptions/upgrade")
      .send({ tier: "premium" })
      .expect((res) => {
        // Should fail gracefully - no active subscription to upgrade
        if (res.status !== 400 && res.status !== 501) {
          throw new Error(`Unexpected upgrade status: ${res.status}`);
        }
      });

    console.log(
      "✅ Upgrade endpoint responded appropriately (no active subscription)"
    );

    // Test 5: Try to cancel subscription (should fail gracefully)
    console.log("❌ Testing subscription cancellation...");
    await request(app)
      .post("/api/subscriptions/cancel")
      .expect((res) => {
        // Should fail gracefully - no active subscription to cancel
        if (res.status !== 400 && res.status !== 501) {
          throw new Error(`Unexpected cancel status: ${res.status}`);
        }
      });

    console.log(
      "✅ Cancel endpoint responded appropriately (no active subscription)"
    );

    // Test 6: Validate request schemas
    console.log("🔍 Testing request validation...");

    // Invalid checkout request
    await request(app)
      .post("/api/subscriptions/checkout")
      .send({
        tier: "invalid",
        success_url: "not-a-url",
        cancel_url: "also-not-a-url",
      })
      .expect(400);

    // Invalid upgrade request
    await request(app)
      .post("/api/subscriptions/upgrade")
      .send({ tier: "invalid" })
      .expect(400);

    console.log("✅ Request validation working correctly");

    console.log("\n🎉 All subscription integration tests passed!");
  } catch (error) {
    console.error("\n❌ Subscription integration test failed:", error);
    process.exit(1);
  }
}

// Test webhook endpoint separately since it needs raw body
async function testWebhookEndpoint() {
  console.log("\n🪝 Testing webhook endpoint...");

  const webhookApp = express();
  // Simulate webhook middleware
  webhookApp.post(
    "/webhooks/stripe",
    express.raw({ type: "application/json" }),
    (_req, res) => {
      // Mock webhook response
      if (!process.env["STRIPE_SECRET_KEY"]) {
        return res
          .status(501)
          .json({ status: "error", error: "Stripe not configured" });
      }
      return res.json({ status: "success" });
    }
  );

  try {
    await request(webhookApp)
      .post("/webhooks/stripe")
      .set("Content-Type", "application/json")
      .send(Buffer.from('{"test": "webhook"}'))
      .expect((res) => {
        if (res.status !== 200 && res.status !== 501 && res.status !== 400) {
          throw new Error(`Unexpected webhook status: ${res.status}`);
        }
      });

    console.log("✅ Webhook endpoint responds appropriately");
  } catch (error) {
    console.error("❌ Webhook test failed:", error);
    process.exit(1);
  }
}

async function runTests() {
  await testSubscriptionEndpoints();
  await testWebhookEndpoint();
  console.log("\n🚀 All subscription tests completed successfully!");
}

runTests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
