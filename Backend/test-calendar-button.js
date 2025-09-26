const axios = require("axios");
require("dotenv").config();

async function testCalendarScheduling() {
  console.log("🗓️ Testing Calendar Schedule Post Button Functionality...\n");

  const API_BASE = "http://localhost:5001/api";
  
  try {
    // First check if backend is running
    console.log("1. ✅ Checking backend server...");
    try {
      const healthCheck = await axios.get(`${API_BASE}/../health`);
      console.log("   ✅ Backend server is running:", healthCheck.data.status);
    } catch (error) {
      console.log("   ❌ Backend server not running. Start with: node src/index.js");
      return;
    }

    // Test the schedule endpoint without authentication (should fail with 401)
    console.log("\n2. 🔐 Testing authentication requirement...");
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(15, 0, 0, 0);

      const testPost = {
        content: "Test post from calendar",
        scheduledAt: tomorrow.toISOString(),
        platforms: ["twitter"]
      };

      const response = await axios.post(`${API_BASE}/posts/schedule`, testPost);
      console.log("   ❌ ISSUE: Endpoint accessible without authentication!");
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("   ✅ Endpoint correctly requires authentication");
      } else {
        console.log("   ❌ Unexpected error:", error.response?.data || error.message);
      }
    }

    // Check if posts endpoint exists and is properly configured
    console.log("\n3. 📋 Testing posts endpoint structure...");
    
    // Check what happens with a malformed request
    try {
      const malformedResponse = await axios.post(`${API_BASE}/posts/schedule`, {
        // Missing required fields
      }, {
        headers: { 'Authorization': 'Bearer fake-token' }
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("   ✅ Authentication properly enforced");
      } else if (error.response?.status === 400) {
        console.log("   ✅ Input validation working:", error.response.data.error);
      } else {
        console.log("   ❌ Unexpected response:", error.response?.data || error.message);
      }
    }

    console.log("\n📊 CALENDAR SCHEDULE BUTTON TROUBLESHOOTING:");
    console.log("=".repeat(50));
    
    console.log("\n🔍 POSSIBLE ISSUES:");
    console.log("1. ❓ User not logged in (no JWT token)");
    console.log("2. ❓ Frontend API call using wrong endpoint URL");
    console.log("3. ❓ Frontend not sending required fields (content, scheduledAt)");
    console.log("4. ❓ Frontend using snake_case instead of camelCase field names");
    console.log("5. ❓ Social accounts not connected");

    console.log("\n🛠️ TO DEBUG:");
    console.log("1. Open browser Developer Tools (F12)");  
    console.log("2. Go to http://localhost:3000/calendar");
    console.log("3. Try to schedule a post");
    console.log("4. Check Console tab for JavaScript errors");
    console.log("5. Check Network tab for failed API requests");

    console.log("\n✅ QUICK FIX TEST:");
    console.log("Try this in your browser console on the calendar page:");
    console.log(`
fetch('/api/posts/schedule', {
  method: 'POST', 
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({
    content: 'Test calendar post',
    scheduledAt: new Date(Date.now() + 24*60*60*1000).toISOString(),
    platforms: ['twitter']
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
    `);

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testCalendarScheduling();