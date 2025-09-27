const axios = require("axios");

async function testTweetPosting() {
  const baseURL = "http://localhost:5001/api";

  try {
    console.log("🔐 Testing Twitter posting...");

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

    // Test immediate posting
    console.log("🚀 Testing immediate tweet posting...");
    const postResponse = await axios.post(
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

    console.log("✅ Tweet posted successfully!");
    console.log("Response:", JSON.stringify(postResponse.data, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    }
  }
}

testTweetPosting();
