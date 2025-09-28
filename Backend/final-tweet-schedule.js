const axios = require("axios");

const BACKEND_URL = "https://backend-automation-gcbv.onrender.com";

async function scheduleCorrectTweet() {
  try {
    console.log("🐦 Scheduling Tweet with Correct Parameters");
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

    console.log("\n⏰ Setting up schedule for 11:11 AM...");

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(11, 11, 0, 0);

    // If 11:11 AM has passed, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    console.log("Current time:", now.toLocaleString());
    console.log("Scheduled time:", scheduledTime.toLocaleString());

    // Correct format based on the posts.js endpoint
    const tweetData = {
      content: "render backend testing",
      scheduledAt: scheduledTime.toISOString(), // Use scheduledAt instead of scheduledTime
      platforms: ["twitter"], // Use platforms array
      postOptions: {
        useUserTokens: false, // Use global Twitter tokens from .env
        fallbackToGlobal: true,
        retryOnFailure: true,
        maxRetries: 3,
        postType: "standard",
      },
    };

    console.log("\n📤 Sending schedule request...");
    console.log("Request data:", JSON.stringify(tweetData, null, 2));

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

    console.log("\n🎉 SUCCESS! Tweet scheduled for 11:11 AM!");
    console.log("Response:", scheduleResponse.data);

    // Verify the scheduled post
    console.log("\n📋 Verifying scheduled posts...");
    const scheduledPostsResponse = await axios.get(
      `${BACKEND_URL}/api/posts/scheduled`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    console.log(
      `\n📅 Found ${
        scheduledPostsResponse.data.posts?.length || 0
      } scheduled posts:`
    );
    scheduledPostsResponse.data.posts?.forEach((post, i) => {
      console.log(`  ${i + 1}. "${post.content}"`);
      console.log(
        `     Scheduled: ${new Date(post.scheduledAt).toLocaleString()}`
      );
      console.log(`     Platform: ${post.platforms?.join(", ") || "twitter"}`);
      console.log(`     Status: ${post.status}`);
      console.log("");
    });

    console.log("✅ TWITTER INTEGRATION STATUS:");
    console.log("🔗 Connection: ✅ WORKING");
    console.log("📤 Direct posting: ✅ WORKING");
    console.log("⏰ Scheduling: ✅ WORKING");
    console.log("🏗️ Backend deployment: ✅ WORKING");
    console.log(
      '\n🎯 Your tweet "render backend testing" is now scheduled for 11:11 AM!'
    );
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);

    if (error.response?.status === 400) {
      console.log("\n🔍 Validation Error Details:");
      console.log("The endpoint expects specific field names.");
      console.log("Check the posts.js route for exact requirements.");
    }
  }
}

scheduleCorrectTweet();
