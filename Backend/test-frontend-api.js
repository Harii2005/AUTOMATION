const axios = require("axios");

// Simulate frontend API call to test schedule post
async function testSchedulePost() {
  try {
    // First, register a user (or login if exists)
    console.log("1. Registering/logging in to get authentication token...");

    let token;
    try {
      // Login as the user who has the Twitter account
      console.log("Trying to login as user with Twitter account...");
      const loginResponse = await axios.post(
        "http://localhost:5001/api/auth/login",
        {
          email: "harikrishnankrkv@gmail.com",
          password: "hari123", // Try common password
        }
      );
      token = loginResponse.data.token;
      console.log("✅ Login successful as hari, token obtained");
    } catch (loginError) {
      console.log("Failed to login as hari, trying testuser...");
      const loginResponse = await axios.post(
        "http://localhost:5001/api/auth/login",
        {
          email: "test@example.com",
          password: "testpassword",
        }
      );
      token = loginResponse.data.token;
      console.log("✅ Login successful as testuser, token obtained");
    }

    // Get social accounts to find Twitter account ID
    console.log("2. Getting social accounts...");
    const socialResponse = await axios.get("http://localhost:5001/api/social", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Social accounts:", socialResponse.data);

    // Find Twitter account
    const twitterAccount = socialResponse.data.find(
      (account) => account.platform === "twitter"
    );
    if (!twitterAccount) {
      console.log("❌ No Twitter account found");
      return;
    }

    console.log("✅ Twitter account found:", twitterAccount.id);

    // Now test the schedule post endpoint (same as frontend would call)
    console.log("3. Testing schedule post...");
    const postData = {
      content: "Test post from frontend API simulation",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      platforms: ["twitter"], // This should map to the social account
    };

    console.log("Sending post data:", postData);

    const scheduleResponse = await axios.post(
      "http://localhost:5001/api/posts/schedule",
      postData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Schedule post successful!");
    console.log("Response:", scheduleResponse.data);
  } catch (error) {
    console.error("❌ Error occurred:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message || error.message);
    console.error("Full error:", error.message);
    console.error("Full error data:", error.response?.data);
    if (error.code) {
      console.error("Error code:", error.code);
    }
  }
}

testSchedulePost();
