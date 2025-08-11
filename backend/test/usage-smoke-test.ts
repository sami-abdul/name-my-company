import express from "express";
import request from "supertest";
import {
  enforceMonthlyUsageLimits,
  _resetUsageFor,
} from "../src/middleware/usage";

const app = express();
app.use(express.json());

// Stub route to simulate generation endpoint with usage enforcement
app.post("/gen", enforceMonthlyUsageLimits, (_req, res) =>
  res.json({ ok: true })
);

async function run() {
  // Identify by IP fallback in tests; supertest uses 127.0.0.1
  // Ensure clean state
  _resetUsageFor("ip:127.0.0.1");

  // Default tier is free with limit 2
  await request(app)
    .post("/gen")
    .send({ prompt: "a", tier: "free" })
    .expect(200);
  await request(app)
    .post("/gen")
    .send({ prompt: "b", tier: "free" })
    .expect(200);
  // Third should be blocked
  await request(app)
    .post("/gen")
    .send({ prompt: "c", tier: "free" })
    .expect(429);

  // Mid tier should allow more (set env or rely on default 100). We test just acceptance
  _resetUsageFor("ip:127.0.0.1");
  await request(app)
    .post("/gen")
    .send({ prompt: "x", tier: "mid" })
    .expect(200);

  // Premium should be unlimited (Infinity)
  _resetUsageFor("ip:127.0.0.1");
  for (let i = 0; i < 5; i++) {
    await request(app)
      .post("/gen")
      .send({ prompt: `p${i}`, tier: "premium" })
      .expect(200);
  }

  console.log("✅ Usage enforcement smoke tests passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
