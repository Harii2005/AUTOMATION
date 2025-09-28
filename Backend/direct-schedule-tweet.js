const axios = require("axios");

const BACKEND_URL = "https://backend-automation-gcbv.onrender.com";

async function directDatabaseInsertAndSchedule() {
  try {
    console.log(
      "🐦 Direct approach: Insert Twitter account and schedule tweet"
    );
    console.log("Backend URL:", BACKEND_URL);

    // Step 1: Authenticate
    console.log("\n🔐 Step 1: Authenticating...");
    const loginData = {
      email: "twittertest@example.com",
      password: "testpass123",
    };

    const loginResponse = await axios.post(
      `${BACKEND_URL}/api/auth/login`,
      loginData
    );
    const authToken = loginResponse.data.token;
    console.log("✅ Authentication successful");

    // Step 2: Use a direct database insert via a test endpoint
    console.log(
      "\n💾 Step 2: Attempting to insert Twitter account via Supabase..."
    );

    // Let's use the test-supabase endpoint to check if we can access it
    const testResponse = await axios.get(`${BACKEND_URL}/test-supabase`);
    console.log("✅ Supabase connection confirmed:", testResponse.data);

    // Step 3: Try a different approach - create a tweet that will use scheduled posting service
    console.log("\n⏰ Step 3: Direct scheduling approach using service...");

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(16, 0, 0, 0); // 4:00 PM

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    console.log("Current time:", now.toLocaleString());
    console.log("Scheduled time:", scheduledTime.toLocaleString());

    // Let's try to create a tweet using the immediate posting endpoint instead
    console.log(
      "\n🚀 Alternative: Trying immediate post to test Twitter connection..."
    );

    const immediatePostData = {
      content: "🚀 Test tweet from automation system! #AutomationTest",
      platforms: ["twitter"],
      postOptions: {
        useUserTokens: false,
        fallbackToGlobal: true,
        postType: "immediate",
      },
    };

    // Try posting immediately first to test the connection
    try {
      const immediateResponse = await axios.post(
        `${BACKEND_URL}/api/posts/create`,
        immediatePostData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ Immediate post successful:", immediateResponse.data);
    } catch (immediateError) {
      console.log(
        "⚠️  Immediate post failed:",
        immediateError.response?.data || immediateError.message
      );
    }

    // Now try the scheduled approach
    console.log("\n📅 Now trying scheduled post...");
    const tweetData = {
      content:
        "🕐 4:00 PM Automated Tweet! The scheduling system is working perfectly. #AutomationSuccess #TwitterBot",
      scheduledAt: scheduledTime.toISOString(),
      platforms: ["twitter"],
      postOptions: {
        useUserTokens: false,
        fallbackToGlobal: true,
        retryOnFailure: true,
        maxRetries: 3,
        postType: "standard",
      },
    };

    const response = await axios.post(
      `${BACKEND_URL}/api/posts/schedule`,
      tweetData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("\n✅ Tweet scheduled successfully!");
    console.log("Response:", response.data);
  } catch (error) {
    console.error("\n❌ Error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      console.error("Headers:", error.response.headers);
    } else {
      console.error("Message:", error.message);
    }
  }
}

directDatabaseInsertAndSchedule();
