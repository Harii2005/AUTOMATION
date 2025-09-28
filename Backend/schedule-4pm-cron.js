const axios = require("axios");
const cron = require("node-cron");

const BACKEND_URL = "https://backend-automation-gcbv.onrender.com";

async function postTweetAt4PM() {
  try {
    console.log("🚀 Posting scheduled tweet at 4:00 PM!");
    console.log("Time:", new Date().toLocaleString());

    // Authenticate
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: "twittertest@example.com",
      password: "testpass123",
    });

    const authToken = loginResponse.data.token;
    console.log("✅ Authenticated successfully");

    // Post the tweet
    const tweetResponse = await axios.post(
      `${BACKEND_URL}/api/posts/post-now`,
      {
        content:
          "🕐 4:00 PM Scheduled Tweet! 🚀 The automation system is working perfectly! #AutomationSuccess #4PMTweet",
        platform: "twitter",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("🎉 4:00 PM Tweet posted successfully!");
    console.log("Response:", tweetResponse.data);
    console.log("✅ Mission accomplished! Tweet sent at 4:00 PM");

    process.exit(0); // Exit the script after successful posting
  } catch (error) {
    console.error(
      "❌ Error posting tweet:",
      error.response?.data || error.message
    );
    process.exit(1);
  }
}

console.log("⏰ 4:00 PM Tweet Scheduler Started");
console.log("Current time:", new Date().toLocaleString());

// Check current time to see when to schedule
const now = new Date();
const targetTime = new Date();
targetTime.setHours(16, 0, 0, 0); // 4:00 PM

if (targetTime <= now) {
  console.log("❌ 4:00 PM has already passed today!");
  console.log("🔄 Setting up for 4:00 PM tomorrow...");
  targetTime.setDate(targetTime.getDate() + 1);
}

const timeUntil = targetTime - now;
const minutes = Math.floor(timeUntil / (1000 * 60));
const seconds = Math.floor((timeUntil % (1000 * 60)) / 1000);

console.log(`📅 Target time: ${targetTime.toLocaleString()}`);
console.log(`⏱️  Time until tweet: ${minutes} minutes and ${seconds} seconds`);

// If it's very close to 4 PM (within 1 minute), post immediately
if (minutes === 0 && seconds <= 60) {
  console.log("🚀 Very close to 4:00 PM! Posting now...");
  postTweetAt4PM();
} else {
  // Schedule using cron for exactly 4:00 PM
  console.log("⏰ Scheduling tweet for exactly 4:00 PM...");

  // Cron pattern for 4:00 PM daily: "0 16 * * *"
  // But for today specifically at 4:00 PM: "0 16 28 9 *" (28th September)
  const cronPattern = "0 16 * * *"; // Every day at 4:00 PM

  console.log(`📋 Cron pattern: ${cronPattern}`);

  const task = cron.schedule(
    cronPattern,
    () => {
      postTweetAt4PM();
    },
    {
      scheduled: false,
      timezone: "Asia/Kolkata", // Adjust timezone as needed
    }
  );

  task.start();
  console.log("✅ Cron job started! Waiting for 4:00 PM...");
  console.log("🔄 Script will keep running until tweet is posted.");

  // Keep the process alive
  setInterval(() => {
    const currentTime = new Date().toLocaleString();
    console.log(`💓 Scheduler heartbeat: ${currentTime}`);
  }, 30000); // Log every 30 seconds
}
