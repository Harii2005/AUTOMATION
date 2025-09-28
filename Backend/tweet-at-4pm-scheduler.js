const axios = require("axios");
const cron = require("node-cron");

const BACKEND_URL = "https://backend-automation-gcbv.onrender.com";

async function postTweetAt4PM() {
  try {
    console.log("🐦 Posting scheduled 4:00 PM tweet...");

    // Login to get auth token
    const loginResponse = await axios.post(
      `${BACKEND_URL}/api/auth/login`,
      {
        email: "twittertest@example.com",
        password: "testpass123",
      }
    );

    const authToken = loginResponse.data.token;
    console.log("✅ Authenticated successfully");

    // Post the tweet
    const tweetResponse = await axios.post(
      `${BACKEND_URL}/api/posts/post-now`,
      {
        content: "🕐 4:00 PM Tweet! Automated scheduling system working perfectly! #AutomationSuccess #TwitterBot #4PMTweet",
        platform: "twitter",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("🎉 4:00 PM tweet posted successfully!");
    console.log("Response:", tweetResponse.data);
    console.log("Time posted:", new Date().toLocaleString());
    
    // Exit the process after successful posting
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Error posting 4:00 PM tweet:", error.response?.data || error.message);
    process.exit(1);
  }
}

function setup4PMTweetScheduler() {
  console.log("⏰ Setting up 4:00 PM tweet scheduler...");
  console.log("Current time:", new Date().toLocaleString());

  // Check if it's already past 4:00 PM today
  const now = new Date();
  const targetTime = new Date();
  targetTime.setHours(16, 0, 0, 0); // 4:00 PM

  if (now >= targetTime) {
    console.log("🚀 It's already 4:00 PM or later, posting tweet now!");
    postTweetAt4PM();
    return;
  }

  const minutesUntil4PM = Math.floor((targetTime - now) / (1000 * 60));
  console.log(`⏳ Waiting ${minutesUntil4PM} minutes until 4:00 PM...`);

  // Schedule for exactly 4:00 PM today
  const cronExpression = "0 16 * * *"; // At 4:00 PM every day
  
  console.log("📅 Cron job scheduled for 4:00 PM (16:00)");
  console.log("🔄 Script will remain running until the tweet is posted...");

  cron.schedule(cronExpression, () => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    
    // Only run if it's actually 4:00 PM
    if (currentHour === 16) {
      console.log("🕐 It's 4:00 PM! Posting tweet now...");
      postTweetAt4PM();
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Adjust timezone as needed
  });

  // Also set a direct timeout for today's 4:00 PM
  const timeUntil4PM = targetTime - now;
  if (timeUntil4PM > 0) {
    setTimeout(() => {
      console.log("⏰ Direct timeout triggered at 4:00 PM!");
      postTweetAt4PM();
    }, timeUntil4PM);
  }

  // Keep the script running
  console.log("✅ Scheduler is now active and waiting...");
  console.log("🔄 This script will run continuously until 4:00 PM");
  console.log("📍 Press Ctrl+C to stop the scheduler");
}

// Start the scheduler
setup4PMTweetScheduler();