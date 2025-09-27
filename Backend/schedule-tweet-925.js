const axios = require("axios");

async function scheduleTweetAt925() {
  const baseURL = "http://localhost:5001/api";

  try {
    console.log("🔐 Logging in to schedule tweet...");

    // First login/register
    let token;
    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: "test@example.com",
        password: "password123",
      });
      token = loginResponse.data.token;
      console.log("✅ Login successful!");
    } catch (loginError) {
      console.log("Login failed, trying registration...");
      const registerResponse = await axios.post(`${baseURL}/auth/register`, {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      });
      token = registerResponse.data.token;
      console.log("✅ Registration successful!");
    }

    // Calculate 9:25 AM tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 25, 0, 0); // Set to 9:25 AM

    console.log(`📅 Scheduling tweet for: ${tomorrow.toLocaleString()}`);

    // Schedule the tweet
    const scheduleResponse = await axios.post(
      `${baseURL}/posts/schedule`,
      {
        content: "hello hari this is a test text",
        scheduledAt: tomorrow.toISOString(),
        platforms: ["twitter"],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Tweet scheduled successfully!");
    console.log("Scheduled post details:");
    console.log(
      `- Content: "${
        scheduleResponse.data.scheduledPosts?.[0]?.content ||
        "hello hari this is a test text"
      }"`
    );
    console.log(`- Scheduled for: ${tomorrow.toLocaleString()}`);
    console.log(`- Platform: Twitter`);
    console.log(
      `- Status: ${
        scheduleResponse.data.scheduledPosts?.[0]?.status || "PENDING"
      }`
    );

    // Also get all scheduled posts to verify
    console.log("\n📋 Checking all scheduled posts...");
    const postsResponse = await axios.get(`${baseURL}/posts/scheduled`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const upcomingPosts = postsResponse.data.filter(
      (post) => new Date(post.scheduledTime) > new Date()
    );

    console.log(`Found ${upcomingPosts.length} upcoming scheduled posts:`);
    upcomingPosts.forEach((post, index) => {
      const scheduledTime = new Date(post.scheduledTime);
      console.log(
        `${index + 1}. "${post.content}" - ${scheduledTime.toLocaleString()}`
      );
    });
  } catch (error) {
    console.error("❌ Error scheduling tweet:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Message:", error.message);
    }
  }
}

scheduleTweetAt925();
