const axios = require("axios");

async function testScheduleAPI() {
  console.log("🧪 DIRECT API TEST");
  console.log("==================");

  const baseURL = "http://localhost:5001/api";

  try {
    // Test the specific user we know exists
    const userId = "586b7362-fe6c-4d15-93af-06d146aa940a";
    const email = "test1758989353084@example.com";

    console.log("1️⃣ Testing login...");
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: email,
      password: "password",
    });

    const token = loginResponse.data.token;
    console.log("✅ Login successful, got token");

    console.log("\n2️⃣ Testing scheduled post creation...");
    const futureTime = new Date(Date.now() + 90 * 1000);
    console.log("⏰ Scheduled for:", futureTime.toLocaleString());

    const postData = {
      content: "hello hari this is a test text",
      scheduledAt: futureTime.toISOString(),
      platforms: ["twitter"],
    };

    console.log("📝 Sending data:", JSON.stringify(postData, null, 2));
    console.log("🔑 Using token:", token.substring(0, 20) + "...");

    const scheduleResponse = await axios.post(
      `${baseURL}/posts/schedule`,
      postData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("✅ SUCCESS!");
    console.log("Response:", JSON.stringify(scheduleResponse.data, null, 2));
  } catch (error) {
    console.error("❌ Error details:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.message);
    } else {
      console.error("Request error:", error.message);
    }
  }
}

testScheduleAPI();
