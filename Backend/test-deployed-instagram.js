const axios = require("axios");

const DEPLOYED_BASE_URL =
  "https://backend-automation-gcbv.onrender.com/api/social";

async function testDeployedInstagramAPI() {
  console.log("🔄 Testing Instagram API on deployed backend...\n");
  console.log("Backend URL:", DEPLOYED_BASE_URL);

  try {
    // Test 1: Check if backend is accessible
    console.log("Test 1: Checking backend accessibility...");
    try {
      const healthResponse = await axios.get(
        "https://backend-automation-gcbv.onrender.com/api/health",
        {
          timeout: 10000,
        }
      );
      console.log("✅ Backend is accessible:", healthResponse.data);
    } catch (healthError) {
      console.log("⚠️  Health endpoint error:", healthError.message);
      console.log("Proceeding with Instagram API tests anyway...");
    }
    console.log("");

    // Test 2: Test the public Instagram endpoint (if it exists)
    console.log("Test 2: Testing public Instagram test endpoint...");
    try {
      const response = await axios.get(
        `${DEPLOYED_BASE_URL}/instagram/test-public`,
        {
          timeout: 15000,
        }
      );
      console.log("✅ Public Instagram Test Success:", response.data);
    } catch (error) {
      console.log(
        "❌ Public Instagram Test Error:",
        error.response?.status,
        error.response?.data || error.message
      );

      if (error.response?.status === 404) {
        console.log(
          "📝 The public endpoint might not exist yet or needs deployment"
        );
      }
    }
    console.log("");

    // Test 3: Test with mock authentication
    console.log("Test 3: Testing Instagram endpoints with mock auth...");
    const mockToken = "mock-jwt-token";

    try {
      const response = await axios.get(`${DEPLOYED_BASE_URL}/instagram/test`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });
      console.log("✅ Instagram Test with Auth Success:", response.data);
    } catch (error) {
      console.log(
        "❌ Instagram Test with Auth Error:",
        error.response?.status,
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        console.log("📝 Authentication required - this is expected");
      } else if (error.response?.status === 404) {
        console.log("📝 Endpoint not found - deployment needed");
      }
    }
    console.log("");

    // Test 4: Check general social accounts endpoint
    console.log("Test 4: Testing general social endpoints...");
    try {
      const response = await axios.get(`${DEPLOYED_BASE_URL}/`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });
      console.log("✅ Social accounts endpoint working");
    } catch (error) {
      console.log(
        "❌ Social accounts error:",
        error.response?.status,
        error.response?.data || error.message
      );
    }
    console.log("");

    // Test 5: Direct Instagram API test (to confirm credentials work)
    console.log("Test 5: Testing Instagram API directly...");
    const INSTAGRAM_ACCESS_TOKEN =
      "IGAASZBSOMqFQ5BZAFFWSE9NUW1ybktTYlVmeHl5S25OVzV2OTBTZAmNES19nVXJuSWNQVUx3SlJoS3c5dE4xTEFKUXJQT2k5Uk5GU3JqRzFUVnF4eW5Mdy1ibWNyRTM0U1R2ZA1hhVW9sSG51bnNpUWtJTU5pcDF0TlJ0ZAGs3Rm5jawZDZD";

    try {
      const response = await axios.get(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${INSTAGRAM_ACCESS_TOKEN}`,
        { timeout: 10000 }
      );
      console.log("✅ Direct Instagram API Success:", response.data);
    } catch (error) {
      console.log(
        "❌ Direct Instagram API Error:",
        error.response?.data || error.message
      );
    }
  } catch (error) {
    console.error("❌ Test execution failed:", error.message);
  }
}

// Assessment function
async function assessDeploymentNeeds() {
  console.log("\n🔍 Assessing Deployment Needs...\n");

  const needs = {
    backendRedeployment: false,
    frontendRedeployment: false,
    reasons: [],
  };

  // Check if Instagram endpoints exist
  try {
    const response = await axios.get(
      "https://backend-automation-gcbv.onrender.com/api/social/instagram/test",
      {
        headers: { Authorization: "Bearer test" },
        timeout: 10000,
      }
    );
    console.log("✅ Instagram endpoints already deployed");
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("✅ Instagram endpoints exist (authentication required)");
    } else if (error.response?.status === 404) {
      needs.backendRedeployment = true;
      needs.reasons.push(
        "Instagram endpoints not found - new code needs deployment"
      );
    } else {
      console.log("⚠️  Backend accessibility issue:", error.message);
    }
  }

  // Check environment variables
  console.log("📝 Instagram credentials added to render.yaml");
  needs.backendRedeployment = true;
  needs.reasons.push("Instagram environment variables added to render.yaml");

  return needs;
}

// Run all tests
if (require.main === module) {
  (async () => {
    console.log("🚀 Testing deployed Instagram API integration...\n");

    await testDeployedInstagramAPI();

    const assessment = await assessDeploymentNeeds();

    console.log("\n📊 Deployment Assessment:");
    console.log(
      `Backend Redeployment Needed: ${
        assessment.backendRedeployment ? "✅ YES" : "❌ NO"
      }`
    );
    console.log(
      `Frontend Redeployment Needed: ${
        assessment.frontendRedeployment ? "✅ YES" : "❌ NO"
      }`
    );

    if (assessment.reasons.length > 0) {
      console.log("\n📝 Reasons:");
      assessment.reasons.forEach((reason) => console.log(`  • ${reason}`));
    }

    console.log("\n🎯 Summary:");
    if (assessment.backendRedeployment) {
      console.log("✅ Please redeploy the BACKEND to Render");
      console.log("   - New Instagram API endpoints added");
      console.log("   - Instagram environment variables added");
    }
    if (assessment.frontendRedeployment) {
      console.log("✅ Please redeploy the FRONTEND to Render");
    }
    if (!assessment.backendRedeployment && !assessment.frontendRedeployment) {
      console.log("✅ No redeployment needed - everything is up to date");
    }

    process.exit(0);
  })();
}

module.exports = { testDeployedInstagramAPI, assessDeploymentNeeds };
