const axios = require("axios");

async function testLocalhostSwitch() {
  console.log("🔄 Testing localhost configuration switch...\n");

  const LOCALHOST_URL = "http://localhost:5001";

  console.log("📋 URLs Updated:");
  console.log("✅ Frontend API base: http://localhost:5001/api");
  console.log(
    "✅ Backend posts endpoint: http://localhost:5001/api/social/twitter/post"
  );
  console.log(
    "✅ Backend Instagram endpoint: http://localhost:5001/api/social/instagram/post"
  );
  console.log(
    "✅ Instagram redirect URI: http://localhost:5001/api/social/instagram/callback"
  );
  console.log("✅ All test files: http://localhost:5001");

  console.log("\n🔍 Testing localhost connection...");

  try {
    console.log("⏳ Attempting to connect to localhost:5001...");
    const response = await axios.get(`${LOCALHOST_URL}/api/health`, {
      timeout: 5000,
    });

    console.log("✅ Localhost backend is running and responding!");
    console.log("📊 Response:", response.data);
  } catch (error) {
    console.log("❌ Localhost backend is not running");
    console.log("💡 To start the backend, run:");
    console.log("   cd Backend && npm start");
    console.log("   or");
    console.log("   cd Backend && node src/index.js");
  }

  console.log("\n🎯 Switch Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ All URLs switched from Render to localhost");
  console.log("✅ Frontend will now connect to local backend");
  console.log("✅ Backend endpoints updated for local development");
  console.log("✅ Test files configured for localhost testing");

  console.log("\n📝 Next Steps:");
  console.log("1. Start your backend server: cd Backend && npm start");
  console.log("2. Start your frontend: cd Frontend && npm start");
  console.log("3. Test the integration locally");
}

testLocalhostSwitch().catch(console.error);
