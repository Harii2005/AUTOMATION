const axios = require("axios");

async function testSchedulingIssue() {
  console.log("Testing Calendar Scheduling Issue...\n");

  const BACKEND_URL = "http://localhost:5001/api";

  // Test user credentials
  const testUser = {
    email: "test@scheduling.com",
    username: "testscheduler",
    password: "testPassword123",
    firstName: "Test",
    lastName: "Scheduler",
  };

  let authToken = null;

  console.log("1. Testing Authentication...");

  // Try to register or login
  try {
    const registerResponse = await axios.post(
      `${BACKEND_URL}/auth/register`,
      testUser
    );
    authToken = registerResponse.data.token;
    console.log("✅ Registration successful - Got token");
  } catch (error) {
    if (error.response?.data?.error?.includes("already exists")) {
      console.log("User exists, trying login...");

      try {
        const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password,
        });
        authToken = loginResponse.data.token;
        console.log("✅ Login successful - Got token");
      } catch (loginError) {
        console.log("❌ Login failed:", loginError.response?.data);
        return;
      }
    } else {
      console.log("❌ Registration failed:", error.response?.data);
      return;
    }
  }

  if (!authToken) {
    console.log("❌ No auth token. Cannot test scheduling.");
    return;
  }

  console.log("\n2. Testing Schedule Endpoint...");

  const scheduleData = {
    content:
      "Test scheduling with authentication! This should work now! #test #scheduling",
    mediaUrl:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1080&h=1080&fit=crop&auto=format&q=80",
    mediaType: "IMAGE",
    scheduledAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutes from now
    platforms: ["instagram", "twitter"],
  };

  try {
    const scheduleResponse = await axios.post(
      `${BACKEND_URL}/posts/schedule`,
      scheduleData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Schedule request successful!");
    console.log("Response:", scheduleResponse.data);
  } catch (error) {
    console.log("❌ Schedule request failed!");
    console.log("Status:", error.response?.status);
    console.log("Error:", error.response?.data);

    if (error.response?.data?.error?.includes("social accounts")) {
      console.log(
        "\n💡 FOUND THE ISSUE: User needs to connect social media accounts!"
      );
      console.log(
        "   This explains why calendar shows success but does not work"
      );
      console.log(
        "   Users must visit /social-accounts to connect Instagram/Twitter first"
      );
    }
  }

  console.log("\n3. Checking Social Accounts...");

  try {
    const socialResponse = await axios.get(`${BACKEND_URL}/social`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    console.log("✅ Social accounts retrieved");
    console.log("Connected accounts:", socialResponse.data);

    if (!socialResponse.data || Object.keys(socialResponse.data).length === 0) {
      console.log("\n⚠️  NO SOCIAL ACCOUNTS CONNECTED!");
      console.log(
        "💡 This is the ROOT CAUSE of the calendar scheduling issue!"
      );
    }
  } catch (error) {
    console.log("❌ Failed to get social accounts:", error.response?.data);
  }

  console.log("\n🎯 DIAGNOSIS COMPLETE");
  console.log("=====================");
  console.log("\nThe issue is likely:");
  console.log("1. User is not properly authenticated in frontend");
  console.log("2. User has not connected Instagram/Twitter accounts");
  console.log("3. Calendar shows success but backend cannot execute posts");
  console.log("\nTo fix:");
  console.log("1. Make sure user is logged in at localhost:3000/calendar");
  console.log("2. Connect social accounts at localhost:3000/social-accounts");
  console.log("3. Then try scheduling posts again");
}

testSchedulingIssue().catch(console.error);
