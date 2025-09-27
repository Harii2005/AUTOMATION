const axios = require("axios");

async function createTestPosts() {
  try {
    // Login
    const loginResponse = await axios.post(
      "http://localhost:5001/api/auth/login",
      {
        email: "test@example.com",
        password: "testpassword",
      }
    );

    const token = loginResponse.data.token;
    console.log("✅ Logged in");

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Create posts for different days to test bookmark indicators
    const testPosts = [
      {
        content: "Good morning! Starting the day with coffee ☕",
        scheduledAt: "2025-09-28T08:00:00.000Z", // Tomorrow morning
        platforms: ["twitter"],
      },
      {
        content: "Lunch break thoughts 🤔",
        scheduledAt: "2025-09-28T17:00:00.000Z", // Tomorrow evening (same day as first)
        platforms: ["twitter"],
      },
      {
        content: "Weekend vibes! 🎉",
        scheduledAt: "2025-09-29T15:30:00.000Z", // Day after tomorrow
        platforms: ["twitter"],
      },
      {
        content: "Monday motivation 💪",
        scheduledAt: "2025-09-30T09:00:00.000Z", // Monday
        platforms: ["twitter"],
      },
    ];

    console.log("Creating test posts for bookmark indicators...");

    for (let i = 0; i < testPosts.length; i++) {
      const post = testPosts[i];
      try {
        const response = await axios.post(
          "http://localhost:5001/api/posts/schedule",
          post,
          { headers }
        );
        console.log(
          `✅ Created post ${i + 1}: "${post.content.substring(
            0,
            30
          )}..." for ${new Date(post.scheduledAt).toLocaleDateString()}`
        );
      } catch (error) {
        console.error(
          `❌ Failed to create post ${i + 1}:`,
          error.response?.data?.error || error.message
        );
      }
    }

    console.log(
      "\n🎯 Test posts created! Check the calendar to see bookmark indicators:"
    );
    console.log("- September 28: Should show 2 bookmark indicators (2 posts)");
    console.log("- September 29: Should show 1 bookmark indicator (1 post)");
    console.log("- September 30: Should show 1 bookmark indicator (1 post)");
    console.log(
      "\nGo to http://localhost:3000/calendar to see the indicators!"
    );
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

createTestPosts();
