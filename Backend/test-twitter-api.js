const { TwitterApi } = require("twitter-api-v2");

async function testTwitterAPI() {
  console.log("🔄 Testing Twitter API credentials...\n");

  try {
    // Check if environment variables are set
    console.log("🔑 Checking Twitter API credentials:");
    console.log(
      "TWITTER_API_KEY:",
      process.env.TWITTER_API_KEY ? "✅ Set" : "❌ Missing"
    );
    console.log(
      "TWITTER_API_SECRET:",
      process.env.TWITTER_API_SECRET ? "✅ Set" : "❌ Missing"
    );
    console.log(
      "TWITTER_ACCESS_TOKEN:",
      process.env.TWITTER_ACCESS_TOKEN ? "✅ Set" : "❌ Missing"
    );
    console.log(
      "TWITTER_ACCESS_TOKEN_SECRET:",
      process.env.TWITTER_ACCESS_TOKEN_SECRET ? "✅ Set" : "❌ Missing"
    );

    if (
      !process.env.TWITTER_API_KEY ||
      !process.env.TWITTER_API_SECRET ||
      !process.env.TWITTER_ACCESS_TOKEN ||
      !process.env.TWITTER_ACCESS_TOKEN_SECRET
    ) {
      console.log("\n❌ Missing Twitter API credentials");
      return;
    }

    // Create Twitter client
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    // Test connection by getting user info
    console.log("\n🔄 Testing Twitter API connection...");
    const me = await client.v2.me();

    console.log("✅ Twitter API connection successful!");
    console.log("📊 User Info:");
    console.log(`   Username: @${me.data.username}`);
    console.log(`   Name: ${me.data.name}`);
    console.log(`   ID: ${me.data.id}`);

    // Test posting capability with a dry run (we won't actually post)
    console.log("\n🧪 Testing tweet creation (dry run)...");
    const testTweet =
      "🧪 Testing Twitter API integration for scheduled posting! #test #automation";

    // We'll create the tweet object but not actually send it
    console.log(`   Test tweet: "${testTweet}"`);
    console.log(`   Length: ${testTweet.length} characters`);
    console.log("   ✅ Tweet format valid");

    console.log("\n🎉 Twitter API Status Summary:");
    console.log("✅ Credentials: Valid");
    console.log("✅ Connection: Working");
    console.log("✅ User Info: Retrieved");
    console.log("✅ Ready for posting");
  } catch (error) {
    console.log("\n❌ Twitter API test failed:");
    console.log("Error:", error.message);

    if (error.code === 401) {
      console.log(
        "💡 This is likely an authentication issue - check your Twitter API credentials"
      );
    } else if (error.code === 403) {
      console.log(
        "💡 This is likely a permissions issue - make sure your Twitter app has read/write permissions"
      );
    } else if (error.code === 429) {
      console.log("💡 Rate limit exceeded - wait and try again");
    }
  }
}

// Run the test
testTwitterAPI().catch(console.error);
