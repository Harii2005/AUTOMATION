const axios = require("axios");

const BACKEND_URL = "https://backend-automation-gcbv.onrender.com";

async function postTweetAt1111() {
  try {
    console.log("🐦 Tweet Scheduler for 11:11 AM");
    console.log("Backend URL:", BACKEND_URL);

    // Authenticate
    console.log("\n🔐 Authenticating...");
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: "twittertest@example.com",
      password: "testpass123",
    });
    const authToken = loginResponse.data.token;
    console.log("✅ Authentication successful");

    // Calculate time until 11:11 AM
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(11, 11, 0, 0);

    // If 11:11 has passed, schedule for tomorrow
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const waitMs = targetTime.getTime() - now.getTime();
    const waitMinutes = Math.floor(waitMs / (1000 * 60));
    const waitSeconds = Math.floor((waitMs % (1000 * 60)) / 1000);

    console.log(`\n⏰ Current time: ${now.toLocaleTimeString()}`);
    console.log(`⏰ Target time: ${targetTime.toLocaleTimeString()}`);
    console.log(
      `⏳ Waiting: ${waitMinutes} minutes and ${waitSeconds} seconds`
    );

    if (waitMs > 0) {
      console.log("\n⏳ Waiting until 11:11 AM...");
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    console.log("\n🎯 It's 11:11 AM! Posting tweet now...");
    console.log('Tweet content: "render backend testing"');

    const tweetResponse = await axios.post(
      `${BACKEND_URL}/api/posts/post-now`,
      {
        content: "render backend testing",
        platform: "twitter",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("\n🎉 SUCCESS! Tweet posted!");
    console.log("Response:", tweetResponse.data);
    console.log(
      `\n✅ Your tweet "render backend testing" was posted at ${new Date().toLocaleString()}`
    );

    // Clean up test files
    console.log("\n🧹 Cleaning up test files...");
    const fs = require("fs");
    const filesToDelete = [
      "test-twitter-schedule.js",
      "schedule-1111-tweet.js",
      "setup-twitter-schedule.js",
      "final-tweet-schedule.js",
      "complete-twitter-setup.js",
    ];

    filesToDelete.forEach((file) => {
      try {
        fs.unlinkSync(file);
        console.log(`✅ Deleted ${file}`);
      } catch (err) {
        // File doesn't exist or already deleted
      }
    });
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

postTweetAt1111();
