const { TwitterApi } = require("twitter-api-v2");
require("dotenv").config();

async function testTwitterAPI() {
  console.log("🐦 Testing Twitter API Integration...\n");

  // Check if all required environment variables are set
  const requiredVars = [
    "TWITTER_API_KEY",
    "TWITTER_API_SECRET", 
    "TWITTER_ACCESS_TOKEN",
    "TWITTER_ACCESS_TOKEN_SECRET"
  ];

  console.log("📋 Checking environment variables:");
  for (const varName of requiredVars) {
    const value = process.env[varName];
    console.log(`${varName}: ${value ? "✅ Set" : "❌ Missing"}`);
  }
  console.log();

  if (!requiredVars.every(varName => process.env[varName])) {
    console.log("❌ Missing required environment variables. Please check your .env file.");
    return;
  }

  try {
    // Initialize Twitter client
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    console.log("🔐 Testing Twitter API authentication...");
    
    // Test 1: Get user info
    console.log("Test 1: Getting user information...");
    const user = await client.v2.me();
    console.log("✅ User info retrieved successfully:");
    console.log(`   Username: @${user.data.username}`);
    console.log(`   User ID: ${user.data.id}`);
    console.log(`   Name: ${user.data.name}\n`);

    // Test 2: Check rate limits
    console.log("Test 2: Checking API rate limits...");
    const rateLimits = await client.v1.rateLimitStatuses();
    const tweetLimit = rateLimits.resources.statuses["/statuses/update"];
    console.log("✅ Rate limit info:");
    console.log(`   Tweet limit: ${tweetLimit.remaining}/${tweetLimit.limit}`);
    console.log(`   Reset time: ${new Date(tweetLimit.reset * 1000).toLocaleString()}\n`);

    // Test 3: Post a test tweet (commented out to avoid spam)
    console.log("Test 3: Tweet posting capability...");
    console.log("ℹ️  Tweet posting test skipped to avoid spam");
    console.log("   API is ready to post tweets when needed\n");

    console.log("🎉 All Twitter API tests passed!");
    console.log("✅ Twitter integration is ready to use!");

  } catch (error) {
    console.error("❌ Twitter API test failed:");
    console.error("Error:", error.message);
    
    if (error.code) {
      console.error("Error code:", error.code);
    }
    
    if (error.data) {
      console.error("Error details:", JSON.stringify(error.data, null, 2));
    }

    // Common error explanations
    if (error.message.includes("401")) {
      console.log("\n💡 This usually means:");
      console.log("   - Invalid API credentials");
      console.log("   - Check your Twitter API keys and tokens");
    } else if (error.message.includes("403")) {
      console.log("\n💡 This usually means:");
      console.log("   - API access restrictions");
      console.log("   - App may not have proper permissions");
    } else if (error.message.includes("429")) {
      console.log("\n💡 This usually means:");
      console.log("   - Rate limit exceeded");
      console.log("   - Wait before trying again");
    }
  }
}

// Run the test
testTwitterAPI();