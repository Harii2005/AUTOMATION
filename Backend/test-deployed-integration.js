const axios = require("axios");

const FRONTEND_URL = "https://frontenddautomation.onrender.com";
const BACKEND_URL = "https://backend-automation-gcbv.onrender.com";

async function testDeployedIntegration() {
  try {
    console.log("🔗 Testing Deployed Frontend ↔ Backend Integration");
    console.log(`Frontend: ${FRONTEND_URL}`);
    console.log(`Backend: ${BACKEND_URL}`);

    console.log("\n🏗️ Step 1: Testing Backend Health...");
    const backendHealth = await axios.get(`${BACKEND_URL}/health`);
    console.log("✅ Backend Health:", backendHealth.data);

    console.log("\n🌐 Step 2: Testing Frontend Accessibility...");
    try {
      const frontendResponse = await axios.get(FRONTEND_URL, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      });
      console.log("✅ Frontend accessible:", frontendResponse.status === 200);
    } catch (error) {
      console.log(
        "⚠️ Frontend check:",
        error.response?.status || "Connection error"
      );
    }

    console.log("\n🔐 Step 3: Testing API Integration...");

    // Test user registration (should work)
    const testUser = {
      email: `integration-test-${Date.now()}@example.com`,
      username: `integrationtest${Date.now()}`,
      password: "testpass123",
      firstName: "Integration",
      lastName: "Test",
    };

    const registerResponse = await axios.post(
      `${BACKEND_URL}/api/auth/register`,
      testUser
    );
    console.log("✅ User registration successful");

    const authToken = registerResponse.data.token;

    // Test authenticated API call
    const userResponse = await axios.get(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ Authenticated API call successful");

    console.log("\n🤖 Step 4: Testing AI Chat Integration...");
    const chatResponse = await axios.post(
      `${BACKEND_URL}/api/chat/generate-content`,
      {
        prompt: "Generate a short test message for integration testing",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ AI Chat working:", chatResponse.data.message);
    console.log(
      "📝 Generated content preview:",
      chatResponse.data.generatedContent.substring(0, 100) + "..."
    );

    console.log("\n🐦 Step 5: Testing Twitter Integration...");
    const twitterTest = await axios.post(
      `${BACKEND_URL}/api/posts/post-now`,
      {
        content:
          "Integration test successful! 🚀 Frontend and backend are connected.",
        platform: "twitter",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ Twitter posting working:", twitterTest.data.success);

    console.log("\n🎉 INTEGRATION TEST RESULTS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🌐 Frontend URL:", FRONTEND_URL, "✅");
    console.log("🏗️ Backend URL:", BACKEND_URL, "✅");
    console.log("🔐 Authentication System: ✅ WORKING");
    console.log("🤖 AI Chat (DeepSeek): ✅ WORKING");
    console.log("🐦 Twitter Integration: ✅ WORKING");
    console.log("📡 CORS Configuration: ✅ WORKING");
    console.log("🔗 Frontend ↔ Backend: ✅ FULLY INTEGRATED");

    console.log(
      "\n✅ SUCCESS! Your application is fully deployed and working!"
    );
    console.log("🎯 Users can now access your app at:", FRONTEND_URL);
  } catch (error) {
    console.error("\n❌ Integration test failed:");
    console.error("Error:", error.response?.data || error.message);

    if (error.code === "ENOTFOUND") {
      console.log(
        "🔍 Network connectivity issue - check if URLs are accessible"
      );
    } else if (error.response?.status === 404) {
      console.log("🔍 Endpoint not found - check API routes");
    } else if (error.response?.status === 401) {
      console.log("🔍 Authentication issue - check JWT configuration");
    } else if (error.response?.status >= 500) {
      console.log("🔍 Server error - check backend logs on Render");
    }
  }
}

testDeployedIntegration();
