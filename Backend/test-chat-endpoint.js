const jwt = require("jsonwebtoken");
const axios = require("axios");

// Create a test JWT token for authentication
function createTestToken() {
  const payload = {
    userId: "test-user-123",
    email: "test@example.com",
  };

  // Use the JWT_SECRET from .env (or a default for testing)
  const secret =
    process.env.JWT_SECRET ||
    "your-super-secret-jwt-key-change-this-in-production";
  const token = jwt.sign(payload, secret, { expiresIn: "1h" });

  return token;
}

async function testChatEndpoint() {
  try {
    const token = createTestToken();
    console.log("🔑 Created test JWT token");

    console.log("🧪 Testing AI Chat Assistant at /api/chat/generate-content");

    const response = await axios.post(
      "http://localhost:5001/api/chat/generate-content",
      {
        prompt:
          "Write a short social media post about AI helping content creators",
        contentType: "text_post",
        platform: "instagram",
        tone: "professional",
        length: "medium",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ SUCCESS! Chat endpoint is working!");
    console.log("📊 Response Status:", response.status);
    console.log("🤖 AI Generated Content:");
    console.log("=" * 50);
    console.log(response.data.generatedContent);
    console.log("=" * 50);
    console.log("📋 Metadata:", response.data.metadata);

    return true;
  } catch (error) {
    console.error("❌ ERROR testing chat endpoint:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Error:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
    return false;
  }
}

// Test different content scenarios
async function testMultipleScenarios() {
  try {
    const token = createTestToken();

    const scenarios = [
      {
        name: "Twitter Post",
        data: {
          prompt: "Create a motivational tweet about productivity",
          contentType: "text_post",
          platform: "twitter",
          tone: "casual",
          length: "short",
        },
      },
      {
        name: "LinkedIn Post",
        data: {
          prompt: "Write a professional post about AI in business",
          contentType: "text_post",
          platform: "linkedin",
          tone: "professional",
          length: "long",
        },
      },
      {
        name: "Instagram Caption",
        data: {
          prompt: "Create an engaging caption for a tech startup post",
          contentType: "caption_with_image",
          platform: "instagram",
          tone: "friendly",
          length: "medium",
        },
      },
    ];

    console.log("🎯 Testing multiple content scenarios...\n");

    for (const scenario of scenarios) {
      try {
        console.log(`📱 Testing ${scenario.name}...`);

        const response = await axios.post(
          "http://localhost:5001/api/chat/generate-content",
          scenario.data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log(`✅ ${scenario.name} Success!`);
        console.log(
          "Content:",
          response.data.generatedContent.substring(0, 100) + "..."
        );
        console.log("---\n");
      } catch (error) {
        console.error(
          `❌ ${scenario.name} Failed:`,
          error.response?.data || error.message
        );
      }
    }
  } catch (error) {
    console.error("Error in multiple scenarios test:", error);
  }
}

// Run tests
async function runAllTests() {
  console.log("🚀 Starting Chat Endpoint Tests\n");

  const basicTest = await testChatEndpoint();

  if (basicTest) {
    console.log("\n🎉 Basic test passed! Running additional scenarios...\n");
    await testMultipleScenarios();
    console.log("🎯 All tests completed!");
  } else {
    console.log("❌ Basic test failed. Check server and configuration.");
  }
}

// Load environment variables and run tests
require("dotenv").config();
runAllTests();
