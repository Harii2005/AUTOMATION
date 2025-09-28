const axios = require("axios");

async function testPublicInstagramEndpoint() {
  const BASE_URL = "https://backendautomationn.onrender.com/api/social";

  console.log("🔄 Testing public Instagram API endpoint...\n");

  try {
    const response = await axios.get(`${BASE_URL}/instagram/test-public`, {
      timeout: 10000,
    });

    console.log("✅ Public Instagram API Test Success!");
    console.log("📊 Response:", JSON.stringify(response.data, null, 2));

    const data = response.data;
    if (data.success) {
      console.log("\n🎉 Instagram API Summary:");
      console.log(`📱 Account: @${data.account.username}`);
      console.log(`👤 Account Type: ${data.account.account_type}`);
      console.log(`📸 Media Count: ${data.account.media_count}`);
      console.log(`👥 Followers: ${data.account.followers_count || "N/A"}`);
      console.log(`💾 Token Length: ${data.credentials.tokenLength} chars`);
      console.log(`📅 Test Time: ${data.timestamp}`);

      if (data.recentMedia && data.recentMedia.data.length > 0) {
        console.log(`🖼️  Recent Posts: ${data.recentMedia.data.length}`);
      } else {
        console.log("🖼️  Recent Posts: None (new account)");
      }

      return true;
    } else {
      console.log("❌ API test indicated failure:", data.message);
      return false;
    }
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.log(
        "❌ Cannot connect to server. Make sure the backend is running on port 5001"
      );
      console.log("💡 Run: npm start in the Backend directory");
    } else {
      console.log("❌ Test failed:", error.response?.data || error.message);
    }
    return false;
  }
}

if (require.main === module) {
  testPublicInstagramEndpoint().then((success) => {
    if (success) {
      console.log("\n🎯 Instagram API integration is working perfectly!");
      process.exit(0);
    } else {
      console.log("\n💥 Instagram API test failed");
      process.exit(1);
    }
  });
}

module.exports = { testPublicInstagramEndpoint };
