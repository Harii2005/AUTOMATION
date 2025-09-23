// Test script to simulate frontend registration
const axios = require("axios");

async function testFrontendRegistration() {
  console.log("🔍 Testing registration from frontend perspective...\n");

  const registrationData = {
    firstName: "Harikrishnan",
    lastName: "R",
    email: "harikrishnankrkv@gmail.com",
    username: "hari",
    password: "123456", // This would be hashed on frontend before sending
  };

  try {
    console.log(
      "📤 Sending registration request to:",
      "http://localhost:5001/api/auth/register"
    );
    console.log("📤 Data:", JSON.stringify(registrationData, null, 2));

    const response = await axios.post(
      "http://localhost:5001/api/auth/register",
      registrationData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("✅ Registration SUCCESS!");
    console.log("📥 Response status:", response.status);
    console.log("📥 Response data:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log("❌ Registration FAILED!");

    if (error.response) {
      console.log("📥 Status:", error.response.status);
      console.log("📥 Error:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log(
        "📥 No response received - possible network/connection issue"
      );
      console.log("📥 Request config:", error.config?.url);
    } else {
      console.log("📥 Error:", error.message);
    }
  }
}

testFrontendRegistration();
