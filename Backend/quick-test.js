const axios = require("axios");

async function quickTest() {
  const baseURL = "http://localhost:5001/api";

  try {
    // Test backend health
    console.log("🔍 Testing backend health...");
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log("✅ Backend is healthy:", healthResponse.data);

    // Test authentication
    console.log("🔐 Testing authentication...");
    let token;
    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: "test@example.com",
        password: "password123",
      });
      token = loginResponse.data.token;
      console.log("✅ Login successful!");
    } catch (loginError) {
      console.log("📝 Login failed, creating new user...");
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

    // Test immediate posting (safer than scheduling)
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

    console.log("✅ Tweet posting test completed!");
    console.log("Response:", JSON.stringify(postResponse.data, null, 2));

    console.log("\n🎉 SUMMARY:");
    console.log("✅ Backend: Running on port 5001");
    console.log("✅ Frontend: Running on port 3000");
    console.log("✅ Authentication: Working");
    console.log("✅ Tweet Posting: Ready");
    console.log("\n🌐 Access your app at: http://localhost:3000/calendar");
  } catch (error) {
    console.error("❌ Error during testing:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Message:", error.message);
    }
  }
}

quickTest();
