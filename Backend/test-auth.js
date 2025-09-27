const axios = require("axios");

async function testRegistrationAndLogin() {
  const baseURL = "http://localhost:5001/api";

  // Test data
  const testUser = {
    email: "test" + Date.now() + "@example.com",
    username: "testuser" + Date.now(),
    password: "password123",
    firstName: "Test",
    lastName: "User",
  };

  console.log("🧪 Testing Registration and Login Endpoints");
  console.log("============================================");

  try {
    // Test Registration
    console.log("📝 Testing Registration...");
    const registerResponse = await axios.post(
      `${baseURL}/auth/register`,
      testUser
    );
    console.log("✅ Registration successful!");
    console.log("User:", registerResponse.data.user);
    console.log("Token received:", !!registerResponse.data.token);

    // Test Login with the same user
    console.log("\n🔑 Testing Login...");
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    console.log("✅ Login successful!");
    console.log("User:", loginResponse.data.user);
    console.log("Token received:", !!loginResponse.data.token);

    // Test authenticated endpoint
    console.log("\n👤 Testing authenticated endpoint...");
    const meResponse = await axios.get(`${baseURL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${loginResponse.data.token}`,
      },
    });
    console.log("✅ Authenticated request successful!");
    console.log("User profile:", meResponse.data.user);
  } catch (error) {
    console.error("❌ Error occurred:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      console.error("Request made but no response received");
      console.error("Request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    console.error("Full error:", error);
  }
}

testRegistrationAndLogin();
