const axios = require("axios");

async function testSchedulingWorkflow() {
  console.log("🔍 Testing scheduling workflow issue from calendar...\n");

  const BACKEND_URL = "http://localhost:5001";

  // Test 1: Check if backend is running
  console.log("1️⃣ Testing backend connection...");
  try {
    const healthResponse = await axios.get(`${BACKEND_URL}/api/health`);
    console.log("✅ Backend is running:", healthResponse.data.status);
  } catch (error) {
    console.log(
      "❌ Backend is not running. Please start it with: node src/index.js"
    );
    return;
  }

  // Test 2: Check scheduling endpoint without authentication
  console.log("\\n2️⃣ Testing schedule endpoint (no auth)...");
  try {
    const testScheduleData = {
      content:
        "🧪 Test scheduling from calendar! This should show up in the database and be posted when the time comes! 🚀\\n\\n#test #scheduling #automation",
      mediaUrl:
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1080&h=1080&fit=crop&auto=format&q=80",
      mediaType: "IMAGE",
      scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      platforms: ["instagram", "twitter"],
    };

    const scheduleResponse = await axios.post(
      `${BACKEND_URL}/api/posts/schedule`,
      testScheduleData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Schedule request successful:", scheduleResponse.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("⚠️  Schedule endpoint requires authentication (expected)");
      console.log(
        "💡 This explains why calendar scheduling might show success but not work"
      );

      console.log("\\n🔍 Details about authentication issue:");
      console.log("   Error:", error.response.data);
    } else {
      console.log("❌ Schedule endpoint failed:");
      console.log("   Status:", error.response?.status);
      console.log("   Error:", error.response?.data);
    }
  }

  // Test 3: Check if we can fetch scheduled posts without auth
  console.log("\\n3️⃣ Testing scheduled posts fetch (no auth)...");
  try {
    const postsResponse = await axios.get(`${BACKEND_URL}/api/posts/scheduled`);
    console.log("✅ Posts fetch successful:", postsResponse.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("⚠️  Scheduled posts endpoint requires authentication");
    } else {
      console.log("❌ Posts fetch failed:", error.response?.data);
    }
  }

  // Test 4: Check what happens with a token (simulate frontend behavior)
  console.log("\\n4️⃣ Testing with authentication simulation...");

  // Create a test user token (this is just for testing - in real app this comes from login)
  const testToken = "test-token-simulation";

  try {
    const authTestResponse = await axios.post(
      `${BACKEND_URL}/api/posts/schedule`,
      {
        content: "Test with auth header",
        scheduledAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        platforms: ["instagram"],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testToken}`,
        },
      }
    );

    console.log("✅ With auth header:", authTestResponse.data);
  } catch (error) {
    console.log("❌ With auth header failed:", error.response?.data);

    if (error.response?.data?.error === "Access denied. No token provided.") {
      console.log("💡 Token format issue detected");
    } else if (error.response?.data?.error === "Invalid or expired token") {
      console.log("💡 Token validation issue detected");
    }
  }

  // Test 5: Check the scheduled posting service
  console.log("\\n5️⃣ Checking scheduled posting service status...");

  // The service should be logging every minute, let's wait and see
  console.log("⏳ Waiting 5 seconds to observe cron job activity...");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("\\n🎯 Scheduling Issue Analysis:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log("\\n🔍 Likely Issues:");
  console.log(
    "1. ❌ Authentication: Calendar might not be sending valid JWT token"
  );
  console.log(
    "2. ❌ User Account: User might not have connected social accounts"
  );
  console.log("3. ❌ Database: Posts might not be saved properly");
  console.log(
    "4. ❌ Cron Service: Scheduled posting service might not be processing posts"
  );

  console.log("\\n🔧 Debugging Steps:");
  console.log("1. Check browser dev tools for authentication errors");
  console.log("2. Verify user is logged in and token is valid");
  console.log("3. Check if user has connected Instagram/Twitter accounts");
  console.log("4. Monitor backend logs for cron job activity");
  console.log("5. Check database for scheduled posts being created");

  console.log("\\n🚀 Next Actions:");
  console.log("• Start backend and monitor logs");
  console.log("• Test calendar scheduling with browser dev tools open");
  console.log("• Check if posts are being saved to database");
  console.log("• Verify cron job is processing saved posts");
}

testSchedulingWorkflow().catch(console.error);
