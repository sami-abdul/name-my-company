import request from "supertest";
import { createServer } from "../src/index";

const app = createServer();

describe("Production Authentication Flow", () => {
  let authToken: string;
  let refreshToken: string;
  let userId: string;

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: "TestPassword123!",
    name: "Test User",
  };

  describe("User Registration", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send(testUser)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.session).toBeDefined();
      expect(response.body.data.session.access_token).toBeDefined();
      expect(response.body.data.session.refresh_token).toBeDefined();

      // Store tokens for later tests
      authToken = response.body.data.session.access_token;
      refreshToken = response.body.data.session.refresh_token;
      userId = response.body.data.user.id;
    });

    it("should fail registration with invalid email", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "invalid-email",
          password: "TestPassword123!",
        })
        .expect(400);

      expect(response.body.status).toBe("error");
    });

    it("should fail registration with weak password", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "123",
        })
        .expect(400);

      expect(response.body.status).toBe("error");
    });
  });

  describe("User Login", () => {
    it("should login user successfully", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.session.access_token).toBeDefined();
      expect(response.body.data.session.refresh_token).toBeDefined();

      // Update tokens
      authToken = response.body.data.session.access_token;
      refreshToken = response.body.data.session.refresh_token;
    });

    it("should fail login with wrong password", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword123!",
        })
        .expect(401);

      expect(response.body.status).toBe("error");
    });

    it("should fail login with non-existent user", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "TestPassword123!",
        })
        .expect(401);

      expect(response.body.status).toBe("error");
    });
  });

  describe("Protected Endpoints", () => {
    it("should access protected endpoint with valid token", async () => {
      const response = await request(app)
        .get("/auth/user")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.email).toBe(testUser.email);
    });

    it("should fail to access protected endpoint without token", async () => {
      const response = await request(app).get("/auth/user").expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.error).toContain("Authorization header");
    });

    it("should fail to access protected endpoint with invalid token", async () => {
      const response = await request(app)
        .get("/auth/user")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.status).toBe("error");
    });

    it("should access domain history with valid token", async () => {
      const response = await request(app)
        .get("/api/domains/history")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe("success");
    });
  });

  describe("Token Refresh", () => {
    it("should refresh token successfully", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({
          refresh_token: refreshToken,
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.session.access_token).toBeDefined();
      expect(response.body.data.session.refresh_token).toBeDefined();

      // Update tokens
      authToken = response.body.data.session.access_token;
      refreshToken = response.body.data.session.refresh_token;
    });

    it("should fail refresh with invalid refresh token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({
          refresh_token: "invalid-refresh-token",
        })
        .expect(401);

      expect(response.body.status).toBe("error");
    });
  });

  describe("User Logout", () => {
    it("should logout user successfully", async () => {
      const response = await request(app)
        .post("/auth/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe("success");
    });

    it("should fail to access protected endpoint after logout", async () => {
      const response = await request(app)
        .get("/auth/user")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(401);

      expect(response.body.status).toBe("error");
    });
  });

  describe("Domain Generation with Authentication", () => {
    it("should generate domains with authenticated user", async () => {
      // First login again to get fresh token
      const loginResponse = await request(app)
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      const freshToken = loginResponse.body.data.session.access_token;

      const response = await request(app)
        .post("/api/domains/generate")
        .set("Authorization", `Bearer ${freshToken}`)
        .send({
          businessNiche: "tech startup",
          brandTone: "professional",
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.domains).toBeDefined();
      expect(response.body.data.domains.length).toBeGreaterThan(0);
    });
  });
});

// Helper function to create a test server
function createServer() {
  const express = require("express");
  const app = express();

  app.use(require("express").json());

  // Import and use routes
  const authRoutes = require("../src/routes/authRoutes").default;
  const domainRoutes = require("../src/routes/domainRoutes").default;

  app.use("/auth", authRoutes);
  app.use("/api/domains", domainRoutes);

  return app;
}
