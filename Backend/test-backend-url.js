const axios = require("axios");

async function checkBackendURL() {
  const BACKEND_URL = "http://localhost:5001";
  console.log(`🔍 Testing backend URL: ${BACKEND_URL}\n`);

  // Test 1: Basic health check
  console.log("1️⃣ Testing health endpoint...");
  try {
    const healthResponse = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 10000,
    });
    console.log("✅ Health check successful!");
    console.log("📊 Response:", JSON.stringify(healthResponse.data, null, 2));
  } catch (error) {
    console.log("❌ Health check failed:");
    console.log("Status:", error.response?.status);
    console.log("Error:", error.response?.data || error.message);
  }

  // Test 2: Instagram test endpoint
  console.log("\n2️⃣ Testing Instagram API endpoint...");
  try {
    const instagramResponse = await axios.get(
      `${BACKEND_URL}/api/social/instagram/test-public`,
      {
        timeout: 15000,
      }
    );
    console.log("✅ Instagram API test successful!");
    console.log(
      "📊 Account:",
      instagramResponse.data.account?.username || "N/A"
    );
    console.log(
      "📊 Media Count:",
      instagramResponse.data.account?.media_count || "N/A"
    );
  } catch (error) {
    console.log("❌ Instagram API test failed:");
    console.log("Status:", error.response?.status);
    console.log("Error:", error.response?.data || error.message);
  }

  // Test 3: General connectivity
  console.log("\n3️⃣ Testing general connectivity...");
  try {
    const response = await axios.get(BACKEND_URL, {
      timeout: 10000,
    });
    console.log("✅ Backend is accessible");
    console.log("📊 Status Code:", response.status);
  } catch (error) {
    console.log("❌ Backend not accessible:");
    console.log("Status:", error.response?.status);
    console.log("Error:", error.response?.data || error.message);
  }

  // Test 4: API routes structure
  console.log("\n4️⃣ Testing API routes structure...");
  const routes = ["/api/health", "/api/auth", "/api/posts", "/api/social"];

  for (const route of routes) {
    try {
      const response = await axios.get(`${BACKEND_URL}${route}`, {
        timeout: 5000,
        validateStatus: (status) => status < 500, // Accept 4xx as valid (auth required, etc.)
      });
      console.log(`✅ ${route}: Status ${response.status}`);
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        console.log(`⏱️  ${route}: Timeout`);
      } else {
        console.log(`❌ ${route}: ${error.response?.status || error.message}`);
      }
    }
  }

  console.log("\n🎯 Backend URL Status Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`URL: ${BACKEND_URL}`);
  console.log(
    "Expected: Backend should respond with health info and API routes"
  );
}

checkBackendURL().catch(console.error);
