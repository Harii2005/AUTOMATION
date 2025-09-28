const axios = require("axios");

async function testSocialAccountsStatus() {
  console.log("🔄 Testing social accounts status...\n");

  const BACKEND_URL = "http://localhost:5001";

  try {
    console.log("📊 Checking Instagram connection status...");

    const response = await axios.get(
      `${BACKEND_URL}/api/social/instagram/test-connection`
    );

    console.log("✅ Instagram connection test successful!");
    console.log("📋 Account Details:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log("❌ Instagram connection test failed:");
    console.log("Error:", error.response?.data || error.message);
  }

  try {
    console.log("\n📊 Checking backend health...");

    const healthResponse = await axios.get(`${BACKEND_URL}/api/health`);

    console.log("✅ Backend health check successful!");
    console.log("📋 Status:", JSON.stringify(healthResponse.data, null, 2));
  } catch (error) {
    console.log("❌ Backend health check failed:");
    console.log("Error:", error.response?.data || error.message);
  }
}

testSocialAccountsStatus().catch(console.error);
