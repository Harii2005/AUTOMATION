const axios = require("axios");

async function debugTwitterScheduling() {
  console.log("🐦 Debugging Twitter Scheduling Workflow\n");

  const BACKEND_URL = "http://localhost:5001/api";

  // Test user credentials
  const testUser = {
    email: "twittertest@debug.com",
    username: "twitterdebug",
    password: "testPassword123",
    firstName: "Twitter",
    lastName: "Debug",
  };

  let authToken = null;

  console.log("1️⃣ Authentication Setup...");

  try {
    const registerResponse = await axios.post(
      `${BACKEND_URL}/auth/register`,
      testUser
    );
    authToken = registerResponse.data.token;
    console.log("✅ Registration successful");
  } catch (error) {
    if (error.response?.data?.error?.includes("already exists")) {
      try {
        const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password,
        });
        authToken = loginResponse.data.token;
        console.log("✅ Login successful");
      } catch (loginError) {
        console.log("❌ Login failed:", loginError.response?.data);
        return;
      }
    } else {
      console.log("❌ Registration failed:", error.response?.data);
      return;
    }
  }

  console.log("\\n2️⃣ Checking Social Accounts Status...");

  try {
    const socialResponse = await axios.get(`${BACKEND_URL}/social`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("✅ Social accounts data retrieved");
    const accounts = socialResponse.data || [];

    const twitterAccount = accounts.find((acc) => acc.platform === "twitter");
    console.log("Twitter account status:", {
      platform: twitterAccount?.platform,
      isConnected: twitterAccount?.isConnected,
      accountName: twitterAccount?.accountName,
      id: twitterAccount?.id,
    });

    if (!twitterAccount?.isConnected || !twitterAccount?.id) {
      console.log("⚠️  Twitter account is not properly connected!");
      console.log("   This could be why Twitter posts are not working");
    } else {
      console.log("✅ Twitter account appears connected");
    }
  } catch (error) {
    console.log("❌ Social accounts check failed:", error.response?.data);
  }

  console.log("\\n3️⃣ Testing Schedule API Call (Frontend Simulation)...");

  // Simulate exactly what frontend calendar sends
  const frontendScheduleData = {
    content:
      "🐦 TWITTER DEBUG TEST: This should appear on Twitter when scheduled time arrives! #test #debug #automation",
    imageUrl:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1080&h=1080&fit=crop&auto=format&q=80",
    scheduledAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(), // 3 minutes from now
    platforms: ["twitter"], // Only Twitter for this test
  };

  console.log("Sending schedule request with data:", {
    content: frontendScheduleData.content.substring(0, 50) + "...",
    platforms: frontendScheduleData.platforms,
    scheduledAt: frontendScheduleData.scheduledAt,
    imageUrl: frontendScheduleData.imageUrl ? "PROVIDED" : "NONE",
  });

  try {
    const scheduleResponse = await axios.post(
      `${BACKEND_URL}/posts/schedule`,
      frontendScheduleData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Schedule request successful!");
    console.log("Backend response:", scheduleResponse.data);

    if (scheduleResponse.data.post) {
      const savedPost = scheduleResponse.data.post;
      console.log("📝 Saved post details:");
      console.log("   ID:", savedPost.id);
      console.log("   Content:", savedPost.content?.substring(0, 50) + "...");
      console.log("   Platforms:", savedPost.platforms);
      console.log("   Status:", savedPost.status);
      console.log("   Scheduled for:", savedPost.scheduled_at);
    }
  } catch (error) {
    console.log("❌ Schedule request failed!");
    console.log("Status:", error.response?.status);
    console.log("Error:", error.response?.data);

    if (error.response?.status === 400) {
      if (error.response.data.error?.includes("social accounts")) {
        console.log("\\n💡 ISSUE FOUND: Twitter account not connected!");
        console.log("   Users need to connect Twitter account first");
        console.log("   Go to /social-accounts to connect Twitter");
      } else {
        console.log("\\n💡 ISSUE FOUND: Validation error in schedule request");
      }
      return; // Don't continue if scheduling failed
    }
  }

  console.log("\\n4️⃣ Checking Scheduled Posts in Database...");

  try {
    const scheduledPostsResponse = await axios.get(
      `${BACKEND_URL}/posts/scheduled`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    console.log("✅ Retrieved scheduled posts");
    const posts = scheduledPostsResponse.data.posts || [];
    console.log(`📊 Total scheduled posts: ${posts.length}`);

    const twitterPosts = posts.filter(
      (post) => post.platforms && post.platforms.includes("twitter")
    );

    console.log(`🐦 Twitter posts scheduled: ${twitterPosts.length}`);

    if (twitterPosts.length > 0) {
      const latestTwitterPost = twitterPosts[0];
      console.log("Latest Twitter post:", {
        id: latestTwitterPost.id,
        content: latestTwitterPost.content?.substring(0, 50) + "...",
        status: latestTwitterPost.status,
        scheduledAt: latestTwitterPost.scheduled_at,
        platforms: latestTwitterPost.platforms,
      });
    } else {
      console.log("⚠️  No Twitter posts found in database!");
      console.log("   This could explain why Twitter posts are not appearing");
    }
  } catch (error) {
    console.log("❌ Failed to get scheduled posts:", error.response?.data);
  }

  console.log("\\n5️⃣ Testing Twitter API Connection Directly...");

  // Test Twitter API with credentials from .env
  try {
    const TwitterApi = require("twitter-api-v2").TwitterApi;

    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    console.log("Testing Twitter API connection...");

    // Test with a simple API call
    const user = await twitterClient.v2.me();
    console.log("✅ Twitter API connection successful");
    console.log("Connected Twitter account:", user.data.username);
  } catch (twitterError) {
    console.log("❌ Twitter API connection failed!");
    console.log("Error:", twitterError.message);

    if (twitterError.message.includes("rate limit")) {
      console.log("💡 Twitter API rate limited - this is normal after testing");
    } else if (twitterError.message.includes("authentication")) {
      console.log("💡 Twitter API credentials issue - check .env file");
    } else {
      console.log("💡 Other Twitter API issue:", twitterError.code);
    }
  }

  console.log("\\n🎯 TWITTER SCHEDULING DIAGNOSIS");
  console.log("==================================");

  console.log("\\n🔍 Potential Issues:");
  console.log("1. ❓ Twitter account not connected in social accounts");
  console.log("2. ❓ Posts not being saved to database with Twitter platform");
  console.log("3. ❓ Scheduled posting service not processing Twitter posts");
  console.log("4. ❓ Twitter API credentials or rate limiting issues");

  console.log("\\n🔧 Next Steps:");
  console.log("1. Check if user connected Twitter account in /social-accounts");
  console.log(
    "2. Verify posts are saved to database with correct platform data"
  );
  console.log("3. Monitor scheduledPostingService.js cron job execution");
  console.log(
    "4. Check Twitter API posting function in scheduledPostingService.js"
  );

  console.log("\\n⏰ Monitoring Instructions:");
  console.log("• Start backend server: node src/index.js");
  console.log("• Watch for cron job logs every minute");
  console.log('• Check for "Processing Twitter post" messages');
  console.log("• Verify actual Twitter posts appear on platform");
}

debugTwitterScheduling().catch(console.error);
