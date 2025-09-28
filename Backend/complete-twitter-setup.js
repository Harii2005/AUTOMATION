const axios = require("axios");

const BACKEND_URL = "https://backend-automation-gcbv.onrender.com";

async function connectTwitterAndSchedule() {
  try {
    console.log("🐦 Complete Twitter Setup and Tweet Scheduling");
    console.log("Backend URL:", BACKEND_URL);

    // Authenticate
    console.log("\n🔐 Step 1: Authenticating...");
    const loginData = {
      email: "twittertest@example.com",
      password: "testpass123",
    };

    const loginResponse = await axios.post(
      `${BACKEND_URL}/api/auth/login`,
      loginData
    );
    const authToken = loginResponse.data.token;
    console.log("✅ Authentication successful");

    // Connect Twitter account
    console.log("\n🔗 Step 2: Connecting Twitter account...");
    try {
      const connectResponse = await axios.post(
        `${BACKEND_URL}/api/social/twitter/connect`,
        {
          // Using global Twitter credentials from environment variables
          useGlobalCredentials: true,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log("✅ Twitter account connected successfully");
      console.log("Connection details:", connectResponse.data);
    } catch (connectError) {
      if (
        connectError.response?.status === 400 &&
        connectError.response.data?.error?.includes("already connected")
      ) {
        console.log("✅ Twitter account already connected");
      } else {
        console.log(
          "⚠️ Twitter connection issue:",
          connectError.response?.data || connectError.message
        );
        console.log("🔄 Continuing with global credentials...");
      }
    }

    // Verify social accounts
    console.log("\n📋 Step 3: Checking connected accounts...");
    try {
      const socialResponse = await axios.get(`${BACKEND_URL}/api/social`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log(
        "Connected accounts:",
        socialResponse.data.accounts?.map((acc) => ({
          platform: acc.platform,
          accountName: acc.accountName,
          isActive: acc.isActive,
        })) || "None"
      );
    } catch (error) {
      console.log(
        "⚠️ Could not fetch social accounts:",
        error.response?.data || error.message
      );
    }

    // Test direct posting first to ensure Twitter works
    console.log("\n🧪 Step 4: Testing direct Twitter post...");
    try {
      const testPostResponse = await axios.post(
        `${BACKEND_URL}/api/posts/post-now`,
        {
          content: "Backend deployment test - direct post ✅",
          platform: "twitter",
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ Direct posting works! Twitter credentials are valid");
    } catch (directError) {
      console.log(
        "❌ Direct posting failed:",
        directError.response?.data || directError.message
      );
      return;
    }

    // Schedule the tweet for 11:11 AM
    console.log("\n⏰ Step 5: Scheduling tweet for 11:11 AM...");

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(11, 11, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    console.log("Current time:", now.toLocaleString());
    console.log("Target time:", scheduledTime.toLocaleString());

    // Try different approaches to scheduling
    const approaches = [
      {
        name: "Standard scheduling",
        data: {
          content: "render backend testing",
          scheduledAt: scheduledTime.toISOString(),
          platforms: ["twitter"],
        },
      },
      {
        name: "With global tokens",
        data: {
          content: "render backend testing",
          scheduledAt: scheduledTime.toISOString(),
          platforms: ["twitter"],
          postOptions: {
            useUserTokens: false,
            fallbackToGlobal: true,
          },
        },
      },
      {
        name: "Simple format",
        data: {
          content: "render backend testing",
          scheduledAt: scheduledTime.toISOString(),
          platform: "twitter",
        },
      },
    ];

    let success = false;

    for (const approach of approaches) {
      console.log(`\n🔄 Trying: ${approach.name}...`);
      try {
        const scheduleResponse = await axios.post(
          `${BACKEND_URL}/api/posts/schedule`,
          approach.data,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("🎉 SUCCESS! Tweet scheduled!");
        console.log("Response:", scheduleResponse.data);
        success = true;
        break;
      } catch (error) {
        console.log(
          `❌ ${approach.name} failed:`,
          error.response?.data || error.message
        );
      }
    }

    if (success) {
      // Verify scheduled posts
      console.log("\n📅 Final verification - checking scheduled posts...");
      try {
        const scheduledResponse = await axios.get(
          `${BACKEND_URL}/api/posts/scheduled`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        const posts = scheduledResponse.data.posts || [];
        console.log(`Found ${posts.length} scheduled posts:`);
        posts.forEach((post, i) => {
          console.log(
            `  ${i + 1}. "${post.content}" at ${new Date(
              post.scheduledAt
            ).toLocaleString()}`
          );
        });
      } catch (error) {
        console.log(
          "⚠️ Could not verify scheduled posts:",
          error.response?.data
        );
      }
    }

    console.log("\n📊 FINAL STATUS REPORT:");
    console.log("🌐 Backend deployment: ✅ WORKING");
    console.log("🔐 Authentication: ✅ WORKING");
    console.log("🐦 Twitter API connection: ✅ WORKING");
    console.log("📤 Direct posting: ✅ WORKING");
    console.log(
      `⏰ Tweet scheduling: ${success ? "✅ WORKING" : "❌ NEEDS ATTENTION"}`
    );

    if (success) {
      console.log(
        '\n🎯 Your tweet "render backend testing" is scheduled for 11:11 AM!'
      );
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
  }
}

connectTwitterAndSchedule();
