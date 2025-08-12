import Stripe from "stripe";
import { prisma } from "../config/prisma";
import { DatabaseService } from "./databaseService";

export type SubscriptionTier = "free" | "mid" | "premium";
export type SubscriptionStatus =
  | "none"
  | "active"
  | "canceled"
  | "past_due"
  | "unpaid"
  | "trialing";

function getStripe(): Stripe | null {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2024-06-20" } as any);
}

export async function createCheckoutSession(params: {
  tier: Exclude<SubscriptionTier, "free">;
  customerEmail?: string;
  userId?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false as const, reason: "not_configured" as const };
  }

  const priceId =
    params.tier === "mid"
      ? process.env["STRIPE_PRICE_MID"]
      : process.env["STRIPE_PRICE_PREMIUM"];
  if (!priceId) {
    return { ok: false as const, reason: "missing_price_id" as const };
  }

  // Check if user already has a Stripe customer
  let customerId: string | undefined;
  if (params.userId) {
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId: params.userId },
      orderBy: { createdAt: "desc" },
    });
    customerId = existingSubscription?.stripeCustomerId || undefined;
  }

  const createParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      tier: params.tier,
      ...(params.userId && { userId: params.userId }),
    },
  };

  if (customerId) {
    createParams.customer = customerId;
  } else if (params.customerEmail) {
    createParams.customer_email = params.customerEmail;
  }

  const session = await stripe.checkout.sessions.create(createParams);

  return { ok: true as const, url: session.url ?? null, sessionId: session.id };
}

export async function getUserSubscriptionStatus(opts: {
  customerEmail?: string;
  userId?: string;
}): Promise<{
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date;
  stripeCustomerId?: string;
}> {
  return DatabaseService.getUserSubscriptionStatus(
    opts.userId,
    opts.customerEmail
  );
}

export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCanceled(subscription);
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentSucceeded(invoice);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.metadata?.["userId"];
  if (!userId) {
    console.error("No userId in checkout session metadata");
    return;
  }

  const tier = session.metadata?.["tier"] as SubscriptionTier;
  if (!tier || tier === "free") {
    console.error("Invalid tier in checkout session metadata");
    return;
  }

  // Get the subscription details from Stripe
  const stripe = getStripe()!;
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );
  const subscriptionObj = subscription as any;

  // Use database service to upsert subscription
  await DatabaseService.upsertSubscription({
    userId,
    stripeCustomerId: session.customer as string,
    stripeSubscriptionId: subscription.id,
    tier,
    status: subscription.status as SubscriptionStatus,
    currentPeriodEnd: new Date(subscriptionObj.current_period_end * 1000),
  });

  console.log(`Subscription created/updated for user ${userId}, tier: ${tier}`);
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription
): Promise<void> {
  const subscriptionObj = subscription as any;
  const dbSubscription = await DatabaseService.findSubscriptionByStripeId(
    subscription.id
  );

  if (!dbSubscription) {
    console.error(
      `No database subscription found for Stripe subscription ${subscription.id}`
    );
    return;
  }

  await DatabaseService.updateSubscription(dbSubscription.id, {
    status: subscription.status as SubscriptionStatus,
    currentPeriodEnd: new Date(subscriptionObj.current_period_end * 1000),
  });

  console.log(
    `Subscription updated for ${subscription.id}, status: ${subscription.status}`
  );
}

async function handleSubscriptionCanceled(
  subscription: Stripe.Subscription
): Promise<void> {
  const dbSubscription = await DatabaseService.findSubscriptionByStripeId(
    subscription.id
  );

  if (!dbSubscription) {
    console.error(
      `No database subscription found for Stripe subscription ${subscription.id}`
    );
    return;
  }

  await DatabaseService.updateSubscription(dbSubscription.id, {
    status: "canceled",
  });

  console.log(`Subscription canceled for ${subscription.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  // Cast to any to avoid type issues with Stripe SDK
  const invoiceObj = invoice as any;
  if (!invoiceObj.subscription) return;

  const subscriptionId = invoiceObj.subscription;
  const dbSubscription = await DatabaseService.findSubscriptionByStripeId(
    subscriptionId
  );

  if (!dbSubscription) {
    console.error(
      `No database subscription found for Stripe subscription ${subscriptionId}`
    );
    return;
  }

  await DatabaseService.updateSubscription(dbSubscription.id, {
    status: "active",
  });

  console.log(`Payment succeeded for subscription ${subscriptionId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  // Cast to any to avoid type issues with Stripe SDK
  const invoiceObj = invoice as any;
  if (!invoiceObj.subscription) return;

  const subscriptionId = invoiceObj.subscription;
  const dbSubscription = await DatabaseService.findSubscriptionByStripeId(
    subscriptionId
  );

  if (!dbSubscription) {
    console.error(
      `No database subscription found for Stripe subscription ${subscriptionId}`
    );
    return;
  }

  await DatabaseService.updateSubscription(dbSubscription.id, {
    status: "past_due",
  });

  console.log(`Payment failed for subscription ${subscriptionId}`);
}

export async function cancelSubscription(userId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, error: "Stripe not configured" };
  }

  try {
    const subscription = await DatabaseService.getActiveSubscription(userId);

    if (!subscription?.stripeSubscriptionId) {
      return { ok: false, error: "No active subscription found" };
    }

    // Cancel at period end (immediate cancellation would be canceledAt: 'now')
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await DatabaseService.updateSubscription(subscription.id, {
      status: "canceled",
    });

    return { ok: true };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return { ok: false, error: "Failed to cancel subscription" };
  }
}

export async function upgradeSubscription(
  userId: string,
  newTier: Exclude<SubscriptionTier, "free">
): Promise<{
  ok: boolean;
  error?: string;
}> {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, error: "Stripe not configured" };
  }

  const priceId =
    newTier === "mid"
      ? process.env["STRIPE_PRICE_MID"]
      : process.env["STRIPE_PRICE_PREMIUM"];

  if (!priceId) {
    return { ok: false, error: "Price ID not configured for tier" };
  }

  try {
    const subscription = await DatabaseService.getActiveSubscription(userId);

    if (!subscription?.stripeSubscriptionId) {
      return { ok: false, error: "No active subscription found" };
    }

    // Get current subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    if (!stripeSubscription.items.data[0]) {
      return { ok: false, error: "Invalid subscription structure" };
    }

    // Update the subscription to the new price
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [
        {
          id: stripeSubscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: "always_invoice", // Immediate proration
    });

    // Update local database
    await DatabaseService.updateSubscription(subscription.id, {
      tier: newTier,
    });

    return { ok: true };
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    return { ok: false, error: "Failed to upgrade subscription" };
  }
}

export async function reactivateSubscription(userId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, error: "Stripe not configured" };
  }

  try {
    const subscription = await DatabaseService.getCanceledSubscription(userId);

    if (!subscription?.stripeSubscriptionId) {
      return { ok: false, error: "No canceled subscription found" };
    }

    // Reactivate by removing cancellation
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await DatabaseService.updateSubscription(subscription.id, {
      status: "active",
    });

    return { ok: true };
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    return { ok: false, error: "Failed to reactivate subscription" };
  }
}

export async function getSubscriptionDetails(userId: string): Promise<{
  ok: boolean;
  data?: {
    subscription: any;
    upcomingInvoice?: any;
    paymentMethods?: any[];
  };
  error?: string;
}> {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, error: "Stripe not configured" };
  }

  try {
    const subscription = await DatabaseService.findSubscriptionByUserId(userId);

    if (!subscription?.stripeSubscriptionId || !subscription.stripeCustomerId) {
      return { ok: false, error: "No subscription found" };
    }

    // Get detailed subscription info from Stripe
    const [stripeSubscription, upcomingInvoice, paymentMethods] =
      await Promise.allSettled([
        stripe.subscriptions.retrieve(subscription.stripeSubscriptionId),
        (stripe.invoices as any).upcoming({
          customer: subscription.stripeCustomerId,
        }),
        stripe.customers.listSources(subscription.stripeCustomerId, {
          object: "card",
        }),
      ]);

    return {
      ok: true,
      data: {
        subscription:
          stripeSubscription.status === "fulfilled"
            ? stripeSubscription.value
            : null,
        upcomingInvoice:
          upcomingInvoice.status === "fulfilled" ? upcomingInvoice.value : null,
        paymentMethods:
          paymentMethods.status === "fulfilled"
            ? paymentMethods.value.data
            : [],
      },
    };
  } catch (error) {
    console.error("Error getting subscription details:", error);
    return { ok: false, error: "Failed to get subscription details" };
  }
}
