const axios = require("axios");

const BACKEND_URL = "https://backend-automation-gcbv.onrender.com";

async function scheduleTestTweet() {
  try {
    console.log("🐦 Testing Twitter Integration and Scheduling Tweet...");
    console.log("Backend URL:", BACKEND_URL);
    console.log("Target Time: 11:11 AM today");

    // First, let's test if we can create a user and get a token
    console.log("\n📝 Step 1: Testing user registration...");

    const testUser = {
      email: `test${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      password: "testpassword123",
      firstName: "Test",
      lastName: "User",
    };

    let authToken;

    try {
      const registerResponse = await axios.post(
        `${BACKEND_URL}/api/auth/register`,
        testUser
      );
      authToken = registerResponse.data.token;
      console.log("✅ User registered successfully");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Try login instead
        console.log("🔄 User exists, trying login...");
        try {
          const loginResponse = await axios.post(
            `${BACKEND_URL}/api/auth/login`,
            {
              email: "test@example.com",
              password: "testpassword123",
            }
          );
          authToken = loginResponse.data.token;
          console.log("✅ Login successful");
        } catch (loginError) {
          console.log(
            "❌ Login failed:",
            loginError.response?.data || loginError.message
          );
          return;
        }
      } else {
        console.log(
          "❌ Registration failed:",
          error.response?.data || error.message
        );
        return;
      }
    }

    if (!authToken) {
      console.log("❌ Could not obtain authentication token");
      return;
    }

    console.log("\n🔍 Step 2: Checking Twitter connection...");

    // Check if user has Twitter account connected
    try {
      const socialAccountsResponse = await axios.get(
        `${BACKEND_URL}/api/social`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const twitterAccount = socialAccountsResponse.data.accounts?.find(
        (acc) => acc.platform === "twitter"
      );

      if (twitterAccount) {
        console.log("✅ Twitter account found:", {
          platform: twitterAccount.platform,
          accountName: twitterAccount.accountName,
          isActive: twitterAccount.isActive,
        });
      } else {
        console.log("⚠️  No Twitter account connected for this user");
        console.log(
          "📋 Available social accounts:",
          socialAccountsResponse.data.accounts?.map((acc) => ({
            platform: acc.platform,
            accountName: acc.accountName,
          })) || "None"
        );

        // Let's try to connect Twitter account
        console.log("\n🔗 Step 3: Attempting to connect Twitter account...");
        try {
          const twitterAuthResponse = await axios.get(
            `${BACKEND_URL}/api/social/twitter/auth`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
          console.log("🔄 Twitter auth URL:", twitterAuthResponse.data);
        } catch (authError) {
          console.log(
            "❌ Twitter auth failed:",
            authError.response?.data || authError.message
          );
        }
      }
    } catch (socialError) {
      console.log(
        "❌ Failed to check social accounts:",
        socialError.response?.data || socialError.message
      );
    }

    console.log("\n⏰ Step 4: Scheduling tweet for 11:11 AM...");

    // Calculate 11:11 AM today
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(11, 11, 0, 0);

    // If 11:11 AM has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const tweetData = {
      content: "render backend testing",
      platform: "twitter",
      scheduledTime: scheduledTime.toISOString(),
    };

    console.log("Tweet content:", tweetData.content);
    console.log("Scheduled for:", scheduledTime.toLocaleString());

    try {
      const scheduleResponse = await axios.post(
        `${BACKEND_URL}/api/posts/schedule`,
        tweetData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🎉 Tweet scheduled successfully!");
      console.log("Schedule Response:", scheduleResponse.data);
    } catch (scheduleError) {
      console.log(
        "❌ Tweet scheduling failed:",
        scheduleError.response?.data || scheduleError.message
      );

      // Let's also test direct posting to see if Twitter connection works
      console.log("\n🔄 Testing direct Twitter posting...");
      try {
        const directPostResponse = await axios.post(
          `${BACKEND_URL}/api/posts/post-now`,
          {
            content: "render backend testing - direct post test",
            platform: "twitter",
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("✅ Direct post successful!");
        console.log("Direct Post Response:", directPostResponse.data);
      } catch (directPostError) {
        console.log(
          "❌ Direct post failed:",
          directPostError.response?.data || directPostError.message
        );
      }
    }

    // Check scheduled posts
    console.log("\n📋 Step 5: Checking scheduled posts...");
    try {
      const scheduledPostsResponse = await axios.get(
        `${BACKEND_URL}/api/posts/scheduled`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      console.log(
        "📅 Scheduled posts:",
        scheduledPostsResponse.data.posts?.length || 0
      );
      if (scheduledPostsResponse.data.posts?.length > 0) {
        scheduledPostsResponse.data.posts.forEach((post, index) => {
          console.log(
            `  ${index + 1}. "${post.content}" - ${new Date(
              post.scheduledTime
            ).toLocaleString()}`
          );
        });
      }
    } catch (postsError) {
      console.log(
        "❌ Failed to fetch scheduled posts:",
        postsError.response?.data || postsError.message
      );
    }
  } catch (error) {
    console.error("❌ General error:", error.message);
  }
}

scheduleTestTweet();
