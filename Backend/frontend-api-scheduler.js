const axios = require("axios");

// Use the frontend URL as the base, but make API calls like the frontend would
const FRONTEND_URL = "https://frontenddautomation.onrender.com";
const API_BASE_URL = "https://backend-automation-gcbv.onrender.com/api";

async function scheduleTwitterPostThroughFrontend() {
  try {
    console.log("🌐 Scheduling tweet through Frontend Interface");
    console.log("Frontend URL:", FRONTEND_URL);
    console.log("API calls will be made as if coming from:", FRONTEND_URL);

    // Step 1: Login (as the frontend would do)
    console.log("\n🔐 Step 1: Authenticating through frontend...");

    const loginResponse = await axios.post(
      `${API_BASE_URL}/auth/login`,
      {
        email: "twittertest@example.com",
        password: "testpass123",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Origin: FRONTEND_URL,
          Referer: `${FRONTEND_URL}/login`,
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );

    const authToken = loginResponse.data.token;
    console.log("✅ Frontend authentication successful");

    // Step 2: Simulate frontend API call for scheduling
    console.log("\n📅 Step 2: Scheduling tweet through frontend API flow...");

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(16, 0, 0, 0); // 4:00 PM

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    console.log("Current time:", now.toLocaleString());
    console.log("Scheduled time:", scheduledTime.toLocaleString());

    // Step 3: Check if we have connected social accounts (frontend would do this)
    console.log("\n🔗 Step 3: Checking social accounts (frontend flow)...");

    let twitterConnected = false;
    try {
      const accountsResponse = await axios.get(
        `${API_BASE_URL}/social/accounts`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Origin: FRONTEND_URL,
            Referer: `${FRONTEND_URL}/accounts`,
          },
        }
      );

      const twitterAccount = accountsResponse.data.find(
        (account) => account.platform.toLowerCase() === "twitter"
      );

      if (twitterAccount) {
        console.log("✅ Twitter account found:", twitterAccount.username);
        twitterConnected = true;
      }
    } catch (accountError) {
      console.log("⚠️  No social accounts found, will try direct posting");
    }

    // Step 4: Try immediate posting first (like frontend would test)
    console.log("\n🚀 Step 4: Testing immediate post (frontend validation)...");

    const tweetContent =
      "🌐 Frontend Tweet at 4:00 PM! 🚀 Posted through the web interface like a real user! #FrontendAutomation #WebScheduling";

    try {
      const testPostResponse = await axios.post(
        `${API_BASE_URL}/posts/post-now`,
        {
          content: "🧪 Frontend test: Connection verified for 4:00 PM tweet!",
          platform: "twitter",
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            Origin: FRONTEND_URL,
            Referer: `${FRONTEND_URL}/calendar`,
          },
        }
      );

      console.log("✅ Test tweet posted successfully:", testPostResponse.data);
      console.log("🔗 Twitter connection confirmed!");

      // Now schedule the 4:00 PM tweet
      console.log("\n⏰ Step 5: Scheduling 4:00 PM tweet...");

      // Create a simple scheduler that posts at 4:00 PM
      const timeUntil4PM = scheduledTime - now;

      if (timeUntil4PM > 0) {
        console.log(
          `⏳ Setting timer for ${Math.floor(
            timeUntil4PM / 1000 / 60
          )} minutes until 4:00 PM...`
        );

        setTimeout(async () => {
          try {
            console.log("\n🕐 4:00 PM - Posting scheduled tweet!");

            const scheduledPostResponse = await axios.post(
              `${API_BASE_URL}/posts/post-now`,
              {
                content: tweetContent,
                platform: "twitter",
              },
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                  Origin: FRONTEND_URL,
                  Referer: `${FRONTEND_URL}/calendar`,
                },
              }
            );

            console.log("🎉 4:00 PM Tweet posted successfully!");
            console.log("Response:", scheduledPostResponse.data);
            console.log("📱 Method: Frontend Web Interface");
            console.log("🌐 Origin:", FRONTEND_URL);
            console.log("📝 Content:", tweetContent);
          } catch (scheduleError) {
            console.error(
              "❌ Error posting 4:00 PM tweet:",
              scheduleError.response?.data || scheduleError.message
            );
          }
        }, timeUntil4PM);

        console.log("✅ 4:00 PM tweet scheduled successfully!");
        console.log("🔄 Timer is set, script will post at exactly 4:00 PM");
        console.log(
          "🌐 All requests appear to come from frontend:",
          FRONTEND_URL
        );

        // Keep the script running
        setInterval(() => {
          const currentTime = new Date();
          const minutesLeft = Math.floor(
            (scheduledTime - currentTime) / 1000 / 60
          );
          if (minutesLeft > 0) {
            console.log(
              `💓 Frontend scheduler heartbeat: ${minutesLeft} minutes until 4:00 PM tweet`
            );
          }
        }, 30000);
      } else {
        console.log("🚀 4:00 PM has passed, posting tweet now!");

        const immediatePostResponse = await axios.post(
          `${API_BASE_URL}/posts/post-now`,
          {
            content: tweetContent,
            platform: "twitter",
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
              Origin: FRONTEND_URL,
              Referer: `${FRONTEND_URL}/calendar`,
            },
          }
        );

        console.log("🎉 Tweet posted immediately!");
        console.log("Response:", immediatePostResponse.data);
      }
    } catch (postError) {
      console.error(
        "❌ Error with posting:",
        postError.response?.data || postError.message
      );

      // Fallback: try the schedule endpoint
      console.log("\n🔄 Trying schedule endpoint as fallback...");

      try {
        const scheduleResponse = await axios.post(
          `${API_BASE_URL}/posts/schedule`,
          {
            content: tweetContent,
            scheduledAt: scheduledTime.toISOString(),
            platforms: ["twitter"],
            postOptions: {
              useUserTokens: false,
              fallbackToGlobal: true,
              retryOnFailure: true,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
              Origin: FRONTEND_URL,
              Referer: `${FRONTEND_URL}/calendar`,
            },
          }
        );

        console.log(
          "✅ Fallback scheduling successful:",
          scheduleResponse.data
        );
      } catch (fallbackError) {
        console.error(
          "❌ Fallback also failed:",
          fallbackError.response?.data || fallbackError.message
        );
      }
    }
  } catch (error) {
    console.error(
      "❌ Frontend scheduling error:",
      error.response?.data || error.message
    );
  }
}

// Run the function
scheduleTwitterPostThroughFrontend();
