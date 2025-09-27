const axios = require("axios");

async function scheduleTweetToday925() {
  const baseURL = "http://localhost:5001/api";

  try {
    console.log("🔐 Logging in to schedule tweet...");

    // First login/register
    let token;
    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: "test@example.com",
        password: "password123",
      });
      token = loginResponse.data.token;
      console.log("✅ Login successful!");
    } catch (loginError) {
      console.log("Login failed, trying registration...");
      const registerResponse = await axios.post(`${baseURL}/auth/register`, {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      });
      token = registerResponse.data.token;
      console.log("✅ Registration successful!");
    }

    // Since it's past 9:25 AM today, schedule for 9:25 PM today
    const today = new Date();
    today.setHours(21, 25, 0, 0); // Set to 9:25 PM

    // If 9:25 PM has also passed, schedule for 9:25 AM tomorrow
    if (today <= new Date()) {
      today.setDate(today.getDate() + 1);
      today.setHours(9, 25, 0, 0); // Set to 9:25 AM tomorrow
    }

    console.log(`📅 Scheduling tweet for: ${today.toLocaleString()}`);
    console.log(`⏰ Current time: ${new Date().toLocaleString()}`);

    // Schedule the tweet
    const scheduleResponse = await axios.post(
      `${baseURL}/posts/schedule`,
      {
        content: "hello hari this is a test text",
        scheduledAt: today.toISOString(),
        platforms: ["twitter"],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Tweet scheduled successfully!");
    console.log("Response:", JSON.stringify(scheduleResponse.data, null, 2));

    // Also test immediate posting if you prefer
    console.log(
      "\n🚀 Would you like to post immediately instead? Testing immediate posting..."
    );
    try {
      const immediateResponse = await axios.post(
        `${baseURL}/posts/post-now`,
        {
          content: "hello hari this is a test text",
          platforms: ["twitter"],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Immediate posting also works!");
      console.log(
        "Immediate post response:",
        JSON.stringify(immediateResponse.data, null, 2)
      );
    } catch (immediateError) {
      console.log(
        "⚠️ Immediate posting had an issue:",
        immediateError.response?.data || immediateError.message
      );
    }
  } catch (error) {
    console.error("❌ Error scheduling tweet:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Message:", error.message);
    }
  }
}

scheduleTweetToday925();
