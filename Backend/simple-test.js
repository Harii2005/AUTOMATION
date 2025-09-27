const https = require("https");
const http = require("http");

// Make a simple HTTP request without any Node.js server imports
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => {
        responseData += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          data: responseData,
        });
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testTwitterScheduling() {
  console.log("🧪 SIMPLE TWITTER SCHEDULING TEST");
  console.log("=================================\n");

  try {
    // Step 1: Login
    console.log("1️⃣ Logging in...");
    const loginOptions = {
      hostname: "localhost",
      port: 5001,
      path: "/api/auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const loginData = JSON.stringify({
      email: "test1758989353084@example.com",
      password: "password",
    });

    const loginResult = await makeRequest(loginOptions, loginData);
    console.log("Login status:", loginResult.statusCode);

    if (loginResult.statusCode !== 200) {
      console.error("❌ Login failed:", loginResult.data);
      return;
    }

    const loginResponse = JSON.parse(loginResult.data);
    const token = loginResponse.token;
    console.log("✅ Login successful!");

    // Step 2: Schedule Twitter post
    console.log("\n2️⃣ Scheduling Twitter post...");
    const scheduleOptions = {
      hostname: "localhost",
      port: 5001,
      path: "/api/posts/schedule",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const futureTime = new Date(Date.now() + 60 * 1000); // 1 minute from now
    const scheduleData = JSON.stringify({
      content: "hello hari this is a test text",
      scheduledAt: futureTime.toISOString(),
      platforms: ["twitter"],
    });

    console.log("📝 Scheduling for:", futureTime.toLocaleString());

    const scheduleResult = await makeRequest(scheduleOptions, scheduleData);
    console.log("\n📊 Response Status:", scheduleResult.statusCode);
    console.log("📋 Response Data:", scheduleResult.data);

    if (
      scheduleResult.statusCode === 201 ||
      scheduleResult.statusCode === 200
    ) {
      console.log("\n✅ SUCCESS! Twitter post scheduled!");
    } else {
      console.log("\n❌ FAILED! Check backend logs for details.");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  console.log("\n🔚 Test complete. Check backend terminal for debug logs.");
  process.exit(0);
}

testTwitterScheduling();
