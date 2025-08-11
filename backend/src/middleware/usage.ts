import { Request, Response, NextFunction } from "express";

type Tier = "free" | "mid" | "premium";

interface UsageCounter {
  count: number;
  windowKey: string; // e.g., '2025-08' for monthly window
}

// In-memory usage counters keyed by user identifier
const usageCounters = new Map<string, UsageCounter>();

function getMonthlyWindowKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function getTierLimit(tier: Tier): number {
  const free = Number(process.env["FREE_TIER_LIMIT"] ?? 2);
  const mid = Number(process.env["MID_TIER_LIMIT"] ?? 100);
  const premium = process.env["PREMIUM_TIER_LIMIT"] ?? "unlimited";
  const premiumLimit = premium === "unlimited" ? Infinity : Number(premium);

  switch (tier) {
    case "free":
      return Number.isFinite(free) ? free : 2;
    case "mid":
      return Number.isFinite(mid) ? mid : 100;
    case "premium":
      return Number.isFinite(premiumLimit) ? premiumLimit : Infinity;
    default:
      return 2;
  }
}

function getIdentifier(req: Request): string {
  const user = (req as any).user as { id?: string; email?: string } | undefined;
  if (user?.id) return `user:${user.id}`;
  // Fallbacks for unauthenticated flows; not security-critical, only for soft enforcement
  const email = req.headers["x-user-email"];
  if (typeof email === "string" && email.length > 0)
    return `email:${email.toLowerCase()}`;
  const ip = req.ip || (req.connection as any)?.remoteAddress || "unknown";
  return `ip:${ip}`;
}

function resolveTier(req: Request): Tier {
  // If we later attach subscription tier to req.user, prefer that.
  const bodyTier = (req.body?.tier as Tier | undefined) ?? "free";
  if (bodyTier === "mid" || bodyTier === "premium") return bodyTier;
  return "free";
}

export function enforceMonthlyUsageLimits(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const identifier = getIdentifier(req);
    const tier = resolveTier(req);
    const limit = getTierLimit(tier);
    if (!Number.isFinite(limit)) {
      // Unlimited usage
      return next();
    }

    const windowKey = getMonthlyWindowKey();
    const current = usageCounters.get(identifier);

    if (!current || current.windowKey !== windowKey) {
      usageCounters.set(identifier, { count: 0, windowKey });
    }

    const updated = usageCounters.get(identifier)!;
    if (updated.count >= limit) {
      return res.status(429).json({
        status: "error",
        error:
          "Monthly usage limit reached for your tier. Please upgrade or wait until next month.",
      });
    }

    updated.count += 1;
    usageCounters.set(identifier, updated);
    return next();
  } catch (error) {
    // On error, fail-closed to avoid abuse
    return res.status(429).json({
      status: "error",
      error: "Usage limit enforcement error",
    });
  }
}

// Helper for tests or admin ops
export function _resetUsageFor(identifier: string) {
  usageCounters.delete(identifier);
}
