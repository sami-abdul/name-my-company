import { config } from "dotenv";
config();

import express from "express";
import request from "supertest";
import {
  validateDomainGenerationRequest,
  validateDomainAvailabilityRequest,
  validateBatchDomainAvailabilityRequest,
} from "../src/middleware/validation";

const app = express();
app.use(express.json());

app.post("/gen", validateDomainGenerationRequest, (_req, res) =>
  res.json({ ok: true })
);
app.post("/avail", validateDomainAvailabilityRequest, (_req, res) =>
  res.json({ ok: true })
);
app.post("/batch", validateBatchDomainAvailabilityRequest, (_req, res) =>
  res.json({ ok: true })
);

async function run() {
  // generation: missing prompt should 400
  await request(app).post("/gen").send({}).expect(400);
  await request(app)
    .post("/gen")
    .send({ prompt: "a".repeat(501) })
    .expect(400);
  await request(app)
    .post("/gen")
    .send({ prompt: "ok", tier: "premium" })
    .expect(200);

  // single availability
  await request(app).post("/avail").send({ domain_name: "bad" }).expect(400);
  await request(app)
    .post("/avail")
    .send({ domain_name: "example.com" })
    .expect(200);

  // batch availability
  await request(app).post("/batch").send({ domains: [] }).expect(400);
  await request(app)
    .post("/batch")
    .send({ domains: ["example.com", "google.com"] })
    .expect(200);

  console.log("✅ Validator smoke tests passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
