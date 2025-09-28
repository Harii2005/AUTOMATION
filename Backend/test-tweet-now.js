const axios = require("axios");

async function testTweetNow() {
  try {
    console.log("🧪 Testing immediate tweet to verify connection...");

    const loginResponse = await axios.post(
      "https://backend-automation-gcbv.onrender.com/api/auth/login",
      {
        email: "twittertest@example.com",
        password: "testpass123",
      }
    );

    const authToken = loginResponse.data.token;
    console.log("✅ Authenticated successfully");

    const tweetResponse = await axios.post(
      "https://backend-automation-gcbv.onrender.com/api/posts/post-now",
      {
        content:
          "🚀 Backend deployment test successful! Twitter integration working perfectly ✅",
        platform: "twitter",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("🎉 Test tweet posted successfully!");
    console.log("Response:", tweetResponse.data);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testTweetNow();
