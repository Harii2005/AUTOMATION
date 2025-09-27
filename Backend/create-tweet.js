const axios = require("axios");

async function createTestTweet() {
  const baseURL = "http://localhost:5001/api";

  try {
    // First, we need to login to get a token
    console.log("🔑 Logging in to get authentication token...");
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: "test@example.com", // You might need to register first
      password: "password123",
    });

    if (!loginResponse.data.token) {
      console.log("❌ No token received, trying to register first...");

      // Try to register a user
      const registerResponse = await axios.post(`${baseURL}/auth/register`, {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      });

      console.log("✅ Registration successful!");
      var token = registerResponse.data.token;
    } else {
      var token = loginResponse.data.token;
      console.log("✅ Login successful!");
    }

    // Now create the tweet
    console.log('📝 Creating tweet: "hello hari this is a test text"');
    const tweetResponse = await axios.post(
      `${baseURL}/posts/schedule`,
      {
        content: "hello hari this is a test text",
        scheduledAt: new Date().toISOString(), // Schedule for now
        platforms: ["twitter"],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Tweet created successfully!");
    console.log("Tweet details:", tweetResponse.data);

    // Also try the post-now endpoint for immediate posting
    console.log("🚀 Attempting to post immediately...");
    const postNowResponse = await axios.post(
      `${baseURL}/posts/post-now`,
      {
        content: "hello hari this is a test text",
        platforms: ["twitter"],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Immediate post successful!");
    console.log("Post result:", postNowResponse.data);
  } catch (error) {
    console.error("❌ Error creating tweet:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Message:", error.message);
    }
  }
}

createTestTweet();
