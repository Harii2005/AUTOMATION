const axios = require("axios");

async function testTwitterConnection() {
  console.log("🔗 Testing Twitter Account Connection Process\n");

  const BACKEND_URL = "http://localhost:5001/api";

  // Test user credentials
  const testUser = {
    email: "twitterconnect@test.com",
    username: "twitterconnect",
    password: "testPassword123",
    firstName: "Twitter",
    lastName: "Connect",
  };

  let authToken = null;

  console.log("1️⃣ Setting up test user...");

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

  console.log("\\n2️⃣ Connecting Twitter account...");

  try {
    const connectResponse = await axios.post(
      `${BACKEND_URL}/social/twitter/connect`,
      {}, // Empty body - uses env credentials
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    console.log("✅ Twitter connection successful!");
    console.log("Response:", connectResponse.data);
  } catch (error) {
    console.log("❌ Twitter connection failed!");
    console.log("Status:", error.response?.status);
    console.log("Error:", error.response?.data);

    if (error.response?.data?.error?.includes("credentials not configured")) {
      console.log("💡 Check .env file for Twitter API credentials");
    } else if (error.response?.data?.error?.includes("rate limit")) {
      console.log("💡 Twitter API rate limited - normal during testing");
    } else {
      console.log("💡 Check Twitter API credentials in .env file");
    }

    // Don't return - let's still check the account status
  }

  console.log("\\n3️⃣ Checking account status after connection...");

  try {
    const socialResponse = await axios.get(`${BACKEND_URL}/social`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("✅ Retrieved social accounts");
    const accounts = socialResponse.data || [];

    const twitterAccount = accounts.find((acc) => acc.platform === "twitter");
    console.log("Twitter account status after connection:", {
      platform: twitterAccount?.platform,
      isConnected: twitterAccount?.isConnected,
      accountName: twitterAccount?.accountName,
      id: twitterAccount?.id,
      username: twitterAccount?.username,
    });

    if (twitterAccount?.isConnected && twitterAccount?.id) {
      console.log("🎉 Twitter account successfully connected!");

      // Now test scheduling
      console.log("\\n4️⃣ Testing Twitter post scheduling...");

      const scheduleData = {
        content:
          "🎉 SUCCESS! Twitter account is now connected and this should be posted! #TwitterConnected #Test #Success",
        imageUrl:
          "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1080&h=1080&fit=crop&auto=format&q=80",
        scheduledAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutes from now
        platforms: ["twitter"],
      };

      try {
        const scheduleResponse = await axios.post(
          `${BACKEND_URL}/posts/schedule`,
          scheduleData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("✅ Twitter post scheduling successful!");
        console.log("Scheduled post:", {
          id: scheduleResponse.data.post?.id,
          content:
            scheduleResponse.data.post?.content?.substring(0, 50) + "...",
          scheduledAt: scheduleResponse.data.post?.scheduled_at,
          platforms: scheduleResponse.data.post?.platforms,
          status: scheduleResponse.data.post?.status,
        });

        console.log("\\n🎯 SCHEDULING TEST COMPLETE");
        console.log("============================");
        console.log("✅ Twitter account connected successfully");
        console.log("✅ Post scheduled successfully");
        console.log("✅ Post should appear on Twitter in 2 minutes");
        console.log("\\n📋 Monitor Instructions:");
        console.log("1. Keep backend running: node src/index.js");
        console.log("2. Watch for cron job logs every minute");
        console.log("3. Check Twitter account for the scheduled post");
        console.log("4. Verify post appears with image and content");
      } catch (scheduleError) {
        console.log("❌ Twitter scheduling failed after connection!");
        console.log("Error:", scheduleError.response?.data);
      }
    } else {
      console.log("⚠️  Twitter account still not properly connected");
      console.log("   Connection may have failed - check error above");
    }
  } catch (error) {
    console.log("❌ Failed to check account status:", error.response?.data);
  }

  console.log("\\n🔧 If connection failed, check these:");
  console.log("1. Twitter API credentials in .env file");
  console.log("2. Twitter API access permissions");
  console.log("3. Rate limiting (wait a few minutes and try again)");
  console.log("4. Backend server is running properly");
}

testTwitterConnection().catch(console.error);
