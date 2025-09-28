const axios = require("axios");

// Test configuration
const BASE_URL = "http://localhost:5001/api";
const TEST_TOKEN = "your-jwt-token-here"; // You'll need to get this from the frontend

// Test data
const testPost = {
  content: "Hello from the automated posting system! 🚀 #automation #test",
  imageUrl:
    "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&auto=format&fit=crop&q=60",
  scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
  platforms: ["twitter", "instagram"],
};

async function testEndpoints() {
  console.log("🔧 Testing Backend Endpoints...\n");

  try {
    // 1. Test health endpoint
    console.log("1. Testing health endpoint...");
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health check:", healthResponse.data);

    // 2. Test Instagram API connection (public endpoint)
    console.log("\n2. Testing Instagram API connection...");
    const instagramTest = await axios.get(
      `${BASE_URL}/social/instagram/test-public`
    );
    console.log(
      "✅ Instagram API test:",
      instagramTest.data.success ? "Connected" : "Failed"
    );
    if (instagramTest.data.account) {
      console.log("   Username:", instagramTest.data.account.username);
      console.log("   Account Type:", instagramTest.data.account.account_type);
    }

    // 3. Test Twitter posting (will fail without auth, but we can see if endpoint exists)
    console.log("\n3. Testing endpoint availability...");
    try {
      await axios.post(`${BASE_URL}/social/twitter/post`, {
        text: "Test tweet",
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ Twitter endpoint exists (requires auth)");
      } else {
        console.log("❌ Twitter endpoint error:", error.message);
      }
    }

    // 4. Test posts endpoint structure
    try {
      await axios.post(`${BASE_URL}/posts/schedule`, testPost);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ Posts schedule endpoint exists (requires auth)");
      } else {
        console.log("❌ Posts schedule endpoint error:", error.message);
      }
    }

    console.log("\n🎉 Basic endpoint tests completed!");
    console.log("\n📝 To test full functionality:");
    console.log("1. Open http://localhost:3000 in your browser");
    console.log("2. Login or register");
    console.log("3. Go to Social Accounts and connect your accounts");
    console.log("4. Go to Calendar and try scheduling a post");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Test direct Instagram posting (no auth required)
async function testInstagramPosting() {
  console.log("\n🔧 Testing Instagram Posting (Direct)...\n");

  try {
    const response = await axios.post(
      `${BASE_URL}/social/instagram/test-post`,
      {
        imageUrl:
          "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&auto=format&fit=crop&q=60",
        caption: "Test post from automated system! 🚀 #automation",
      }
    );

    console.log("✅ Instagram posting test:", response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("❌ Instagram posting requires authentication");
    } else {
      console.log(
        "❌ Instagram posting error:",
        error.response?.data || error.message
      );
    }
  }
}

// Run tests
if (require.main === module) {
  testEndpoints();
  testInstagramPosting();
}
