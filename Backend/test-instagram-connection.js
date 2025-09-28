const axios = require("axios");
require("dotenv").config();

async function testInstagramConnection() {
  console.log("📸 Testing Instagram Connection Issue\n");

  const BACKEND_URL = "http://localhost:5001/api";

  // Check Instagram credentials from .env
  console.log("1️⃣ Checking Instagram credentials...");
  console.log(
    "INSTAGRAM_ACCESS_TOKEN:",
    process.env.INSTAGRAM_ACCESS_TOKEN
      ? "Present (" + process.env.INSTAGRAM_ACCESS_TOKEN.length + " chars)"
      : "Missing"
  );
  console.log(
    "INSTAGRAM_CLIENT_ID:",
    process.env.INSTAGRAM_CLIENT_ID ? "Present" : "Missing"
  );
  console.log(
    "INSTAGRAM_CLIENT_SECRET:",
    process.env.INSTAGRAM_CLIENT_SECRET ? "Present" : "Missing"
  );

  // Test Instagram API directly
  console.log("\\n2️⃣ Testing Instagram API directly...");

  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) {
    console.log("❌ No Instagram access token found in .env file");
    return;
  }

  try {
    const response = await axios.get(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
    );

    console.log("✅ Instagram API working directly");
    console.log("Instagram account info:", {
      id: response.data.id,
      username: response.data.username,
      account_type: response.data.account_type,
      media_count: response.data.media_count,
    });
  } catch (error) {
    console.log("❌ Instagram API failed directly");
    console.log("Error:", error.response?.data || error.message);

    if (error.response?.data?.error?.message?.includes("Invalid")) {
      console.log("💡 Instagram access token appears to be invalid or expired");
      console.log("   You need to regenerate the access token");
    }
    return;
  }

  // Test with a user account
  console.log("\\n3️⃣ Testing Instagram connection via backend...");

  const testUser = {
    email: "instagramtest@test.com",
    username: "instagramtest",
    password: "testPassword123",
    firstName: "Instagram",
    lastName: "Test",
  };

  let authToken = null;

  // Authenticate user
  try {
    const registerResponse = await axios.post(
      `${BACKEND_URL}/auth/register`,
      testUser
    );
    authToken = registerResponse.data.token;
    console.log("✅ User authenticated");
  } catch (error) {
    if (error.response?.data?.error?.includes("already exists")) {
      const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password,
      });
      authToken = loginResponse.data.token;
      console.log("✅ User authenticated");
    } else {
      console.log("❌ Authentication failed:", error.response?.data);
      return;
    }
  }

  // Try to connect Instagram
  try {
    const connectResponse = await axios.post(
      `${BACKEND_URL}/social/instagram/connect`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    console.log("✅ Instagram connection successful!");
    console.log("Response:", connectResponse.data);
  } catch (error) {
    console.log("❌ Instagram connection failed via backend");
    console.log("Error:", error.response?.data);

    if (error.response?.data?.error?.includes("access token not configured")) {
      console.log("💡 Instagram access token not configured in backend");
    } else if (error.response?.data?.error?.includes("Invalid")) {
      console.log("💡 Instagram access token is invalid or expired");
    }
  }

  // Check social accounts status
  console.log("\\n4️⃣ Checking social accounts status...");

  try {
    const socialResponse = await axios.get(`${BACKEND_URL}/social`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("✅ Social accounts retrieved");
    const accounts = socialResponse.data || [];

    const instagramAccount = accounts.find(
      (acc) => acc.platform === "instagram"
    );
    console.log("Instagram account status:", {
      platform: instagramAccount?.platform,
      isConnected: instagramAccount?.isConnected,
      accountName: instagramAccount?.accountName,
      id: instagramAccount?.id,
    });
  } catch (error) {
    console.log("❌ Failed to get social accounts:", error.response?.data);
  }

  console.log("\\n🎯 INSTAGRAM CONNECTION DIAGNOSIS:");
  console.log("==================================");

  console.log("\\nPossible issues:");
  console.log("1. Instagram access token expired or invalid");
  console.log("2. Instagram API permissions not properly set");
  console.log("3. Account connection not saved to database properly");
  console.log("4. Frontend not refreshing connection status");

  console.log("\\nTo fix Instagram connection:");
  console.log("1. Check Instagram access token in .env file");
  console.log("2. Verify token has proper permissions (instagram_basic)");
  console.log("3. Regenerate token if expired");
  console.log("4. Test connection via /social/instagram/connect endpoint");
  console.log("5. Refresh frontend to see updated status");
}

testInstagramConnection().catch(console.error);
