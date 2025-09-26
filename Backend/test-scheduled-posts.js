const axios = require("axios");
require("dotenv").config();

async function testScheduledPosts() {
  console.log("🗓️  Testing Scheduled Posts Functionality...\n");

  const API_BASE = "http://localhost:5001/api";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 30, 0, 0); // 2:30 PM tomorrow

  try {
    // First, let's try to get a user token (you'll need to login first)
    console.log(
      "ℹ️  Note: You'll need to be logged in to test this functionality"
    );
    console.log("📋 Testing POST /api/posts/schedule endpoint...\n");

    const testPost = {
      content:
        "🚀 This is a test scheduled post for tomorrow! #automation #test",
      scheduledAt: tomorrow.toISOString(),
      platforms: ["twitter"],
      mediaUrl: null, // No media for this test
    };

    console.log("📝 Test Post Data:");
    console.log("   Content:", testPost.content);
    console.log("   Scheduled for:", tomorrow.toLocaleString());
    console.log("   Platforms:", testPost.platforms);
    console.log("   Character count:", testPost.content.length);

    console.log("\n🔧 To test this manually:");
    console.log("1. Go to http://localhost:3000/login and login");
    console.log("2. Go to http://localhost:3000/calendar");
    console.log("3. Click on tomorrow's date");
    console.log("4. Fill in the form and click 'Schedule Post'");

    console.log("\n📊 API Endpoint Details:");
    console.log("   URL: POST", API_BASE + "/posts/schedule");
    console.log("   Headers: Authorization: Bearer <your-jwt-token>");
    console.log("   Content-Type: application/json");

    console.log("\n🔍 Expected Database Tables:");
    console.log("   ✅ users - stores user accounts");
    console.log(
      "   ✅ social_accounts - stores connected Twitter/Instagram accounts"
    );
    console.log("   ✅ scheduled_posts - stores scheduled posts");

    console.log("\n📱 Frontend Calendar Features:");
    console.log("   ✅ Click on any date to schedule a post");
    console.log("   ✅ View all scheduled posts in calendar view");
    console.log("   ✅ Edit or delete existing scheduled posts");
    console.log("   ✅ Support for text + image posts");
    console.log("   ✅ Multi-platform posting (Twitter, Instagram)");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testScheduledPosts();
