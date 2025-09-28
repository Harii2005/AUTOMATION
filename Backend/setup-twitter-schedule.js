const axios = require("axios");

const BACKEND_URL = "https://backend-automation-gcbv.onrender.com";

async function setupAndScheduleTweet() {
  try {
    console.log("🐦 Setting up Twitter Connection and Scheduling Tweet");
    console.log("Backend URL:", BACKEND_URL);

    // Create a new user
    console.log("\n👤 Step 1: Creating test user...");
    const testUser = {
      email: "twittertest@example.com",
      username: "twittertest",
      password: "testpass123",
      firstName: "Twitter",
      lastName: "Test",
    };

    let authToken;

    try {
      const registerResponse = await axios.post(
        `${BACKEND_URL}/api/auth/register`,
        testUser
      );
      authToken = registerResponse.data.token;
      console.log("✅ User created successfully");
    } catch (error) {
      if (error.response?.status === 400) {
        // User exists, try login
        console.log("🔄 User exists, logging in...");
        try {
          const loginResponse = await axios.post(
            `${BACKEND_URL}/api/auth/login`,
            {
              email: testUser.email,
              password: testUser.password,
            }
          );
          authToken = loginResponse.data.token;
          console.log("✅ Login successful");
        } catch (loginError) {
          console.log(
            "❌ Login failed:",
            loginError.response?.data || loginError.message
          );
          return;
        }
      } else {
        console.log(
          "❌ User creation failed:",
          error.response?.data || error.message
        );
        return;
      }
    }

    console.log(
      "\n🔗 Step 2: Testing direct Twitter posting (to verify connection)..."
    );
    try {
      const directPostResponse = await axios.post(
        `${BACKEND_URL}/api/posts/post-now`,
        {
          content: "Twitter connection test from deployed backend 🚀",
          platform: "twitter",
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Twitter connection working! Direct post successful");
      console.log("Post details:", directPostResponse.data);
    } catch (error) {
      console.log(
        "❌ Twitter connection failed:",
        error.response?.data || error.message
      );
      console.log(
        "🔍 This indicates an issue with Twitter API credentials or connection"
      );
      return;
    }

    console.log("\n⏰ Step 3: Now scheduling tweet for 11:11 AM...");

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(11, 11, 0, 0);

    // If 11:11 AM has passed, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    console.log("Current time:", now.toLocaleString());
    console.log("Tweet will be posted at:", scheduledTime.toLocaleString());

    const tweetData = {
      content: "render backend testing",
      platform: "twitter",
      scheduledTime: scheduledTime.toISOString(),
    };

    try {
      const scheduleResponse = await axios.post(
        `${BACKEND_URL}/api/posts/schedule`,
        tweetData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🎉 Tweet successfully scheduled for 11:11 AM!");
      console.log("Schedule response:", scheduleResponse.data);
    } catch (scheduleError) {
      console.log(
        "❌ Scheduling failed:",
        scheduleError.response?.data || scheduleError.message
      );

      // Let's check what the scheduling endpoint expects
      console.log("\n🔍 Checking schedule endpoint requirements...");
      console.log("Request data sent:", JSON.stringify(tweetData, null, 2));
    }

    // Final verification
    console.log("\n📋 Step 4: Verifying scheduled posts...");
    try {
      const scheduledResponse = await axios.get(
        `${BACKEND_URL}/api/posts/scheduled`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      console.log(
        `Found ${scheduledResponse.data.posts?.length || 0} scheduled posts:`
      );
      scheduledResponse.data.posts?.forEach((post, i) => {
        console.log(
          `  ${i + 1}. "${post.content}" at ${new Date(
            post.scheduledTime
          ).toLocaleString()}`
        );
      });
    } catch (error) {
      console.log(
        "❌ Could not fetch scheduled posts:",
        error.response?.data || error.message
      );
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
  }
}

setupAndScheduleTweet();
