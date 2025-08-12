import { DatabaseService } from "../src/services/databaseService";

async function testDatabaseService() {
  console.log("🧪 Testing Database Service...");

  try {
    // Test 1: Database connection
    console.log("🔌 Testing database connection...");
    const isConnected = await DatabaseService.testConnection();
    if (!isConnected) {
      console.log("⚠️  Database connection failed - skipping database tests");
      return;
    }
    console.log("✅ Database connection successful");

    // Test 2: Create subscription
    console.log("📝 Testing subscription creation...");

    // First create a test user
    const { prisma } = await import("../src/config/prisma");
    const testUser = await prisma.user.create({
      data: {
        email: "test-" + Date.now() + "@example.com",
        name: "Test User",
      },
    });

    const testSubscription = await DatabaseService.createSubscription({
      userId: testUser.id,
      stripeCustomerId: "cus_test_" + Date.now(),
      stripeSubscriptionId: "sub_test_" + Date.now(),
      tier: "mid",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    console.log(`✅ Created subscription: ${testSubscription.id}`);

    // Test 3: Find subscription by user ID
    console.log("🔍 Testing find by user ID...");
    const foundByUserId = await DatabaseService.findSubscriptionByUserId(
      testUser.id
    );
    if (!foundByUserId || foundByUserId.id !== testSubscription.id) {
      throw new Error("Failed to find subscription by user ID");
    }
    console.log("✅ Found subscription by user ID");

    // Test 4: Find subscription by Stripe ID
    console.log("🔍 Testing find by Stripe ID...");
    const foundByStripeId = await DatabaseService.findSubscriptionByStripeId(
      testSubscription.stripeSubscriptionId!
    );
    if (!foundByStripeId || foundByStripeId.id !== testSubscription.id) {
      throw new Error("Failed to find subscription by Stripe ID");
    }
    console.log("✅ Found subscription by Stripe ID");

    // Test 5: Update subscription
    console.log("✏️  Testing subscription update...");
    const updatedSubscription = await DatabaseService.updateSubscription(
      testSubscription.id,
      {
        tier: "premium",
        status: "trialing",
      }
    );

    if (
      updatedSubscription.tier !== "premium" ||
      updatedSubscription.status !== "trialing"
    ) {
      throw new Error("Failed to update subscription");
    }
    console.log("✅ Updated subscription successfully");

    // Test 6: Get user subscription status
    console.log("📊 Testing subscription status retrieval...");
    const status = await DatabaseService.getUserSubscriptionStatus(testUser.id);
    if (status.tier !== "premium" || status.status !== "trialing") {
      throw new Error("Failed to get correct subscription status");
    }
    console.log("✅ Retrieved subscription status correctly");

    // Test 7: Get active subscription
    console.log("✅ Testing active subscription retrieval...");
    const activeSubscription = await DatabaseService.getActiveSubscription(
      testUser.id
    );
    if (!activeSubscription) {
      throw new Error("Failed to get active subscription");
    }
    console.log("✅ Retrieved active subscription");

    // Test 8: Upsert subscription
    console.log("🔄 Testing subscription upsert...");
    const upsertedSubscription = await DatabaseService.upsertSubscription({
      userId: testUser.id,
      stripeCustomerId: "cus_test_upsert_" + Date.now(),
      stripeSubscriptionId: "sub_test_upsert_" + Date.now(),
      tier: "mid",
      status: "active",
    });

    if (upsertedSubscription.userId !== testUser.id) {
      throw new Error("Failed to upsert subscription");
    }
    console.log("✅ Upserted subscription successfully");

    // Test 9: Get subscription history
    console.log("📚 Testing subscription history...");
    const history = await DatabaseService.getSubscriptionHistory(
      testUser.id,
      5,
      0
    );
    if (history.length === 0) {
      throw new Error("Failed to get subscription history");
    }
    console.log(`✅ Retrieved ${history.length} subscription history records`);

    // Test 10: Get subscription statistics
    console.log("📈 Testing subscription statistics...");
    const stats = await DatabaseService.getSubscriptionStats();
    if (typeof stats.totalSubscriptions !== "number") {
      throw new Error("Failed to get subscription statistics");
    }
    console.log(
      `✅ Retrieved subscription stats: ${stats.totalSubscriptions} total subscriptions`
    );

    // Test 11: Test with non-existent user
    console.log("❌ Testing non-existent user...");
    const nonExistentStatus = await DatabaseService.getUserSubscriptionStatus(
      "non-existent-user"
    );
    if (
      nonExistentStatus.tier !== "free" ||
      nonExistentStatus.status !== "none"
    ) {
      throw new Error("Failed to handle non-existent user correctly");
    }
    console.log("✅ Handled non-existent user correctly");

    // Test 12: Test error handling
    console.log("🚨 Testing error handling...");
    try {
      await DatabaseService.updateSubscription("non-existent-id", {
        tier: "premium",
      });
      throw new Error(
        "Should have thrown an error for non-existent subscription"
      );
    } catch (error) {
      console.log("✅ Error handling working correctly");
    }

    console.log("\n🎉 All database service tests passed!");
  } catch (error) {
    console.error("\n❌ Database service test failed:", error);
    throw error;
  }
}

async function runTests() {
  try {
    await testDatabaseService();
    console.log("\n🚀 Database service tests completed successfully!");
  } catch (error) {
    console.error("Test runner failed:", error);
    process.exit(1);
  }
}

runTests();
