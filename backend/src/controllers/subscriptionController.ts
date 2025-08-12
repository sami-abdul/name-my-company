import { Request, Response } from "express";
import { z } from "zod";
import {
  createCheckoutSession,
  getUserSubscriptionStatus,
  cancelSubscription,
  upgradeSubscription,
  reactivateSubscription,
  getSubscriptionDetails,
  handleStripeWebhook,
} from "../services/paymentService";
import Stripe from "stripe";

const checkoutSchema = z.object({
  tier: z.enum(["mid", "premium"]),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
});

export async function createCheckout(req: Request, res: Response) {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      error: parsed.error.issues.map((i) => i.message).join("; "),
    });
  }

  const { tier, success_url, cancel_url } = parsed.data;
  const user = (req as any).user;
  const email =
    user?.email ?? (req.headers["x-user-email"] as string | undefined);
  const userId = user?.id;

  const result = await createCheckoutSession({
    tier,
    customerEmail: email,
    userId,
    successUrl: success_url,
    cancelUrl: cancel_url,
  });

  if (!result.ok) {
    const msg =
      result.reason === "not_configured"
        ? "Stripe not configured"
        : "Price ID not set";
    return res.status(501).json({ status: "error", error: msg });
  }

  return res.json({
    status: "success",
    data: {
      url: result.url,
      sessionId: result.sessionId,
    },
  });
}

export async function getSubscription(req: Request, res: Response) {
  const user = (req as any).user;
  const email =
    user?.email ?? (req.headers["x-user-email"] as string | undefined);
  const userId = user?.id;

  const subscription = await getUserSubscriptionStatus({
    customerEmail: email,
    userId,
  });

  return res.json({ status: "success", data: subscription });
}

export async function cancelUserSubscription(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user?.id) {
    return res.status(401).json({
      status: "error",
      error: "Authentication required",
    });
  }

  const result = await cancelSubscription(user.id);

  if (!result.ok) {
    return res.status(400).json({
      status: "error",
      error: result.error || "Failed to cancel subscription",
    });
  }

  return res.json({
    status: "success",
    data: {
      message: "Subscription will be canceled at the end of the current period",
    },
  });
}

const upgradeSchema = z.object({
  tier: z.enum(["mid", "premium"]),
});

export async function upgradeUserSubscription(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user?.id) {
    return res.status(401).json({
      status: "error",
      error: "Authentication required",
    });
  }

  const parsed = upgradeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      error: parsed.error.issues.map((i) => i.message).join("; "),
    });
  }

  const { tier } = parsed.data;
  const result = await upgradeSubscription(user.id, tier);

  if (!result.ok) {
    return res.status(400).json({
      status: "error",
      error: result.error || "Failed to upgrade subscription",
    });
  }

  return res.json({
    status: "success",
    data: { message: `Successfully upgraded to ${tier} tier` },
  });
}

export async function reactivateUserSubscription(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user?.id) {
    return res.status(401).json({
      status: "error",
      error: "Authentication required",
    });
  }

  const result = await reactivateSubscription(user.id);

  if (!result.ok) {
    return res.status(400).json({
      status: "error",
      error: result.error || "Failed to reactivate subscription",
    });
  }

  return res.json({
    status: "success",
    data: { message: "Subscription reactivated successfully" },
  });
}

export async function getDetailedSubscription(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user?.id) {
    return res.status(401).json({
      status: "error",
      error: "Authentication required",
    });
  }

  const result = await getSubscriptionDetails(user.id);

  if (!result.ok) {
    return res.status(400).json({
      status: "error",
      error: result.error || "Failed to get subscription details",
    });
  }

  return res.json({
    status: "success",
    data: result.data,
  });
}

export async function handleWebhook(req: Request, res: Response) {
  const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"]!, {
    apiVersion: "2024-06-20" as any,
  });

  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env["STRIPE_WEBHOOK_SECRET"];

  if (!sig || !endpointSecret) {
    return res.status(400).json({
      status: "error",
      error: "Missing signature or webhook secret",
    });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).json({
      status: "error",
      error: "Invalid signature",
    });
  }

  try {
    await handleStripeWebhook(event);
    return res.json({ status: "success" });
  } catch (error) {
    console.error("Webhook handling failed:", error);
    return res.status(500).json({
      status: "error",
      error: "Webhook processing failed",
    });
  }
}
