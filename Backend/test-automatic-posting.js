const { supabase } = require("./src/utils/database");
const ScheduledPostingService = require("./src/services/scheduledPostingService");

/**
 * Test script for the automatic posting mechanism
 * This script creates test scheduled posts and verifies the service processes them
 */

async function createTestPost(userId, socialAccountId, delayMinutes = 1) {
  const scheduledTime = new Date(Date.now() + delayMinutes * 60 * 1000);

  const { data: post, error } = await supabase
    .from("scheduled_posts")
    .insert({
      userId: userId,
      socialAccountId: socialAccountId,
      content: `Test automated post - ${new Date().toISOString()}`,
      scheduledTime: scheduledTime.toISOString(),
      status: "PENDING",
      platform: "TWITTER",
    })
    .select()
    .single();

  if (error) {
    console.error("❌ Error creating test post:", error);
    return null;
  }

  console.log(
    `✅ Created test post: ${
      post.id
    } scheduled for ${scheduledTime.toISOString()}`
  );
  return post;
}

async function getTestUser() {
  // Get the first user with a Twitter account
  const { data: users, error } = await supabase
    .from("users")
    .select(
      `
      id,
      email,
      social_accounts!inner (
        id,
        platform,
        accountName,
        isActive
      )
    `
    )
    .eq("social_accounts.platform", "TWITTER")
    .eq("social_accounts.isActive", true)
    .limit(1);

  if (error) {
    console.error("❌ Error fetching test user:", error);
    return null;
  }

  if (!users || users.length === 0) {
    console.error("❌ No users with Twitter accounts found");
    console.log("💡 Please connect a Twitter account first using the frontend");
    return null;
  }

  return users[0];
}

async function monitorPostStatus(postId, maxWaitMinutes = 5) {
  console.log(
    `👀 Monitoring post ${postId} for up to ${maxWaitMinutes} minutes...`
  );

  const startTime = Date.now();
  const maxWaitTime = maxWaitMinutes * 60 * 1000;

  while (Date.now() - startTime < maxWaitTime) {
    const { data: post, error } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error) {
      console.error("❌ Error fetching post status:", error);
      break;
    }

    console.log(
      `📊 Post ${postId} status: ${
        post.status
      } (${new Date().toLocaleTimeString()})`
    );

    if (post.status === "POSTED") {
      console.log(`🎉 Success! Post ${postId} was posted successfully`);
      console.log(`🔗 Platform post ID: ${post.platformPostId}`);
      return true;
    } else if (post.status === "FAILED") {
      console.log(`❌ Post ${postId} failed: ${post.error}`);
      return false;
    }

    // Wait 10 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  console.log(
    `⏰ Timeout: Post ${postId} did not complete within ${maxWaitMinutes} minutes`
  );
  return false;
}

async function testAutomaticPosting() {
  console.log("🚀 Starting Automatic Posting Test");
  console.log("=====================================");

  try {
    // Get a test user
    const user = await getTestUser();
    if (!user) {
      return;
    }

    console.log(`👤 Using test user: ${user.email} (${user.id})`);
    console.log(`🐦 Twitter account: ${user.social_accounts[0].accountName}`);

    // Create a test post scheduled for 1 minute from now
    const testPost = await createTestPost(
      user.id,
      user.social_accounts[0].id,
      1
    );
    if (!testPost) {
      return;
    }

    // Start the scheduled posting service manually for testing
    console.log("🔧 Starting scheduled posting service...");
    const service = new ScheduledPostingService();
    service.start();

    // Monitor the post status
    const success = await monitorPostStatus(testPost.id, 5);

    console.log("=====================================");
    if (success) {
      console.log("✅ Automatic posting test PASSED");
    } else {
      console.log("❌ Automatic posting test FAILED");
    }

    // Note: In a real test environment, you'd want to stop the service
    // service.stop(); // This would need to be implemented properly
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

async function testScheduledPostsQuery() {
  console.log("🔍 Testing scheduled posts query...");

  const now = new Date();
  const { data: posts, error } = await supabase
    .from("scheduled_posts")
    .select(
      `
      *,
      social_accounts (
        accessToken,
        refreshToken,
        platform
      )
    `
    )
    .eq("status", "PENDING")
    .lte("scheduledTime", now.toISOString())
    .order("scheduledTime", { ascending: true });

  if (error) {
    console.error("❌ Query error:", error);
    return;
  }

  console.log(`📝 Found ${posts?.length || 0} posts ready for processing`);
  posts?.forEach((post) => {
    console.log(
      `  - Post ${post.id}: "${post.content.substring(
        0,
        50
      )}..." scheduled for ${post.scheduledTime}`
    );
  });
}

// Run the test
if (require.main === module) {
  const testType = process.argv[2] || "posting";

  if (testType === "query") {
    testScheduledPostsQuery();
  } else if (testType === "posting") {
    testAutomaticPosting();
  } else {
    console.log("Usage: node test-automatic-posting.js [posting|query]");
    console.log(
      "  posting: Test the full automatic posting workflow (default)"
    );
    console.log("  query: Test the scheduled posts database query");
  }
}

module.exports = {
  createTestPost,
  getTestUser,
  monitorPostStatus,
  testAutomaticPosting,
  testScheduledPostsQuery,
};
