import { prisma } from "../config/prisma";
import { SubscriptionTier, SubscriptionStatus } from "./paymentService";

export interface SubscriptionData {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  tier: string; // Prisma returns string for enum fields
  status: string; // Prisma returns string for enum fields
  currentPeriodEnd: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface CreateSubscriptionParams {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date;
}

export interface UpdateSubscriptionParams {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  tier?: SubscriptionTier;
  status?: SubscriptionStatus;
  currentPeriodEnd?: Date;
}

export class DatabaseService {
  /**
   * Create a new subscription record
   */
  static async createSubscription(
    params: CreateSubscriptionParams
  ): Promise<SubscriptionData> {
    try {
      const subscription = await prisma.subscription.create({
        data: {
          userId: params.userId,
          stripeCustomerId: params.stripeCustomerId,
          stripeSubscriptionId: params.stripeSubscriptionId,
          tier: params.tier,
          status: params.status,
          currentPeriodEnd: params.currentPeriodEnd || null,
        },
      });

      return subscription;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw new Error("Failed to create subscription in database");
    }
  }

  /**
   * Update an existing subscription
   */
  static async updateSubscription(
    subscriptionId: string,
    params: UpdateSubscriptionParams
  ): Promise<SubscriptionData> {
    try {
      const subscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          ...params,
          updatedAt: new Date(),
        },
      });

      return subscription;
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw new Error("Failed to update subscription in database");
    }
  }

  /**
   * Find subscription by user ID
   */
  static async findSubscriptionByUserId(
    userId: string
  ): Promise<SubscriptionData | null> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      return subscription;
    } catch (error) {
      console.error("Error finding subscription by user ID:", error);
      throw new Error("Failed to find subscription in database");
    }
  }

  /**
   * Find subscription by Stripe subscription ID
   */
  static async findSubscriptionByStripeId(
    stripeSubscriptionId: string
  ): Promise<SubscriptionData | null> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId },
      });

      return subscription;
    } catch (error) {
      console.error("Error finding subscription by Stripe ID:", error);
      throw new Error("Failed to find subscription in database");
    }
  }

  /**
   * Find subscription by user email
   */
  static async findSubscriptionByEmail(
    email: string
  ): Promise<SubscriptionData | null> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { user: { email } },
        orderBy: { createdAt: "desc" },
        include: { user: true },
      });

      return subscription;
    } catch (error) {
      console.error("Error finding subscription by email:", error);
      throw new Error("Failed to find subscription in database");
    }
  }

  /**
   * Get user's subscription status
   */
  static async getUserSubscriptionStatus(
    userId?: string,
    email?: string
  ): Promise<{
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    currentPeriodEnd?: Date;
    stripeCustomerId?: string;
  }> {
    try {
      let subscription: SubscriptionData | null = null;

      if (userId) {
        subscription = await this.findSubscriptionByUserId(userId);
      } else if (email) {
        subscription = await this.findSubscriptionByEmail(email);
      }

      if (!subscription) {
        return { tier: "free", status: "none" };
      }

      return {
        tier: subscription.tier as SubscriptionTier,
        status: subscription.status as SubscriptionStatus,
        ...(subscription.currentPeriodEnd && {
          currentPeriodEnd: subscription.currentPeriodEnd,
        }),
        ...(subscription.stripeCustomerId && {
          stripeCustomerId: subscription.stripeCustomerId,
        }),
      };
    } catch (error) {
      console.error("Error getting user subscription status:", error);
      return { tier: "free", status: "none" };
    }
  }

  /**
   * Get active subscription for user
   */
  static async getActiveSubscription(
    userId: string
  ): Promise<SubscriptionData | null> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: { in: ["active", "trialing", "past_due"] },
        },
        orderBy: { createdAt: "desc" },
      });

      return subscription;
    } catch (error) {
      console.error("Error getting active subscription:", error);
      throw new Error("Failed to get active subscription from database");
    }
  }

  /**
   * Get canceled subscription for user
   */
  static async getCanceledSubscription(
    userId: string
  ): Promise<SubscriptionData | null> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: "canceled",
        },
        orderBy: { createdAt: "desc" },
      });

      return subscription;
    } catch (error) {
      console.error("Error getting canceled subscription:", error);
      throw new Error("Failed to get canceled subscription from database");
    }
  }

  /**
   * Upsert subscription (create or update)
   */
  static async upsertSubscription(
    params: CreateSubscriptionParams
  ): Promise<SubscriptionData> {
    try {
      // Find existing subscription first
      const existingSubscription = await prisma.subscription.findFirst({
        where: { userId: params.userId },
      });

      if (existingSubscription) {
        const subscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            stripeCustomerId: params.stripeCustomerId,
            stripeSubscriptionId: params.stripeSubscriptionId,
            tier: params.tier,
            status: params.status,
            currentPeriodEnd: params.currentPeriodEnd || null,
            updatedAt: new Date(),
          },
        });

        return subscription as SubscriptionData;
      } else {
        const subscription = await prisma.subscription.create({
          data: {
            userId: params.userId,
            stripeCustomerId: params.stripeCustomerId,
            stripeSubscriptionId: params.stripeSubscriptionId,
            tier: params.tier,
            status: params.status,
            currentPeriodEnd: params.currentPeriodEnd || null,
          },
        });

        return subscription as SubscriptionData;
      }
    } catch (error) {
      console.error("Error upserting subscription:", error);
      throw new Error("Failed to upsert subscription in database");
    }
  }

  /**
   * Get subscription history for user
   */
  static async getSubscriptionHistory(
    userId: string,
    limit = 10,
    offset = 0
  ): Promise<SubscriptionData[]> {
    try {
      const subscriptions = await prisma.subscription.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

      return subscriptions;
    } catch (error) {
      console.error("Error getting subscription history:", error);
      throw new Error("Failed to get subscription history from database");
    }
  }

  /**
   * Get subscription statistics
   */
  static async getSubscriptionStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    canceledSubscriptions: number;
    tierBreakdown: Record<SubscriptionTier, number>;
  }> {
    try {
      const [total, active, canceled, tierBreakdown] = await Promise.all([
        prisma.subscription.count(),
        prisma.subscription.count({
          where: { status: { in: ["active", "trialing"] } },
        }),
        prisma.subscription.count({ where: { status: "canceled" } }),
        prisma.subscription.groupBy({
          by: ["tier"],
          _count: { tier: true },
        }),
      ]);

      const tierStats: Record<SubscriptionTier, number> = {
        free: 0,
        mid: 0,
        premium: 0,
      };

      tierBreakdown.forEach((item) => {
        tierStats[item.tier as SubscriptionTier] = item._count.tier;
      });

      return {
        totalSubscriptions: total,
        activeSubscriptions: active,
        canceledSubscriptions: canceled,
        tierBreakdown: tierStats,
      };
    } catch (error) {
      console.error("Error getting subscription stats:", error);
      throw new Error("Failed to get subscription statistics from database");
    }
  }

  /**
   * Clean up expired subscriptions (optional maintenance function)
   */
  static async cleanupExpiredSubscriptions(): Promise<number> {
    try {
      const result = await prisma.subscription.updateMany({
        where: {
          status: { in: ["canceled", "unpaid"] },
          currentPeriodEnd: { lt: new Date() },
        },
        data: {
          status: "canceled",
          updatedAt: new Date(),
        },
      });

      return result.count;
    } catch (error) {
      console.error("Error cleaning up expired subscriptions:", error);
      throw new Error("Failed to cleanup expired subscriptions");
    }
  }

  /**
   * Test database connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error("Database connection test failed:", error);
      return false;
    }
  }
}
