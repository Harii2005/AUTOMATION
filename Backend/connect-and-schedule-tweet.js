const axios = require("axios");

const BACKEND_URL = "https://backend-automation-gcbv.onrender.com";

async function connectTwitterAndScheduleTweet() {
  try {
    console.log("🐦 Setting up Twitter account and scheduling 4:00 PM tweet");
    console.log("Backend URL:", BACKEND_URL);

    // Step 1: Authenticate user
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

    // Step 2: Connect Twitter account using global credentials
    console.log("\n🔗 Step 2: Connecting Twitter account...");
    
    // First check if Twitter account is already connected
    try {
      const accountsResponse = await axios.get(
        `${BACKEND_URL}/api/social/accounts`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      
      console.log("📋 Current connected accounts:", accountsResponse.data);
      
      const twitterAccount = accountsResponse.data.find(account => 
        account.platform.toLowerCase() === 'twitter'
      );
      
      if (twitterAccount) {
        console.log("✅ Twitter account already connected:", twitterAccount);
      } else {
        console.log("🔗 No Twitter account found, connecting with global credentials...");
        
        const connectResponse = await axios.post(
          `${BACKEND_URL}/api/social/connect-global-twitter`,
          {},
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        
        console.log("✅ Twitter connected successfully:", connectResponse.data);
      }
    } catch (accountError) {
      console.log("⚠️  Error checking/connecting accounts:", accountError.response?.data || accountError.message);
      console.log("🔧 Proceeding to try manual connection...");
      
      // Try to connect Twitter account directly
      try {
        const connectResponse = await axios.post(
          `${BACKEND_URL}/api/social/connect-global-twitter`,
          {},
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        
        console.log("✅ Twitter connected successfully:", connectResponse.data);
      } catch (connectError) {
        console.error("❌ Failed to connect Twitter:", connectError.response?.data || connectError.message);
        console.log("🔧 Will try to schedule tweet anyway...");
      }
    }

    // Step 3: Schedule the tweet for 4:00 PM
    console.log("\n⏰ Step 3: Scheduling tweet for 4:00 PM...");

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(16, 0, 0, 0); // 4:00 PM (16:00)

    // If 4:00 PM has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    console.log("Current time:", now.toLocaleString());
    console.log("Scheduled time:", scheduledTime.toLocaleString());

    // Tweet content
    const tweetData = {
      content: "🚀 4:00 PM Tweet! Testing automated scheduling system. #AutomationTest #TwitterBot",
      scheduledAt: scheduledTime.toISOString(),
      platforms: ["twitter"],
      postOptions: {
        useUserTokens: false, // Try to use global tokens first
        fallbackToGlobal: true,
        retryOnFailure: true,
        maxRetries: 3,
        postType: "standard",
      },
    };

    console.log("\n📝 Tweet Data:");
    console.log("Content:", tweetData.content);
    console.log("Scheduled for:", tweetData.scheduledAt);

    // Schedule the tweet
    const response = await axios.post(
      `${BACKEND_URL}/api/posts/schedule`,
      tweetData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("\n✅ Tweet scheduled successfully!");
    console.log("Response:", response.data);
    console.log(`🕐 Your tweet will be posted at ${scheduledTime.toLocaleString()}`);

  } catch (error) {
    console.error("\n❌ Error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Message:", error.message);
    }
  }
}

// Run the function
connectTwitterAndScheduleTweet();