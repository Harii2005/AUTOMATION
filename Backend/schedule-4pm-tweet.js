const axios = require("axios");

const BACKEND_URL = "https://backend-automation-gcbv.onrender.com";

async function schedule4PMTweet() {
  try {
    console.log("🐦 Scheduling Tweet for 4:00 PM");
    console.log("Backend URL:", BACKEND_URL);

    // Use existing user
    console.log("\n🔐 Authenticating...");
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

    console.log("\n⏰ Setting up schedule for 4:00 PM today...");

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(16, 0, 0, 0); // 4:00 PM (16:00)

    // If 4:00 PM has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    console.log("Current time:", now.toLocaleString());
    console.log("Scheduled time:", scheduledTime.toLocaleString());

    // Tweet content for 4:00 PM
    const tweetData = {
      content: "🚀 4:00 PM Tweet! Testing automated scheduling system. #AutomationTest #TwitterBot",
      scheduledAt: scheduledTime.toISOString(),
      platforms: ["twitter"],
      postOptions: {
        useUserTokens: false, // Use global Twitter tokens from .env
        fallbackToGlobal: true,
        retryOnFailure: true,
        maxRetries: 3,
        postType: "standard",
      },
    };

    console.log("\n📝 Tweet Data:");
    console.log("Content:", tweetData.content);
    console.log("Scheduled for:", tweetData.scheduledAt);
    console.log("Platforms:", tweetData.platforms);

    // Schedule the tweet
    console.log("\n🔄 Sending schedule request...");
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
    console.log(`🕐 Your tweet will be posted at ${scheduledTime.toLocaleString()}`);
    
    // Check if there are any scheduled posts
    console.log("\n📋 Checking all scheduled posts...");
    const scheduledPosts = await axios.get(
      `${BACKEND_URL}/api/posts/scheduled`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    
    console.log("Scheduled posts:", scheduledPosts.data);

  } catch (error) {
    console.error("\n❌ Error scheduling tweet:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
    
    // Additional debugging
    console.log("\n🔍 Debug Information:");
    console.log("Full error:", JSON.stringify(error, null, 2));
  }
}

// Run the function
schedule4PMTweet();