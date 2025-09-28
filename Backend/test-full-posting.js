const axios = require("axios");

const BASE_URL = "http://localhost:5001/api";

async function testDirectPosting() {
  console.log("🚀 Testing Direct Social Media Posting...\n");

  const testData = {
    content:
      "🎉 Hello from the automated posting system! This is a test of our Instagram & Twitter integration. #automation #test #socialmedia",
    imageUrl:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    platforms: ["twitter", "instagram"],
  };

  try {
    console.log("📤 Posting to both Twitter and Instagram...");
    console.log("Content:", testData.content);
    console.log("Image:", testData.imageUrl);
    console.log("Platforms:", testData.platforms.join(", "));
    console.log("");

    const response = await axios.post(
      `${BASE_URL}/social/test-posting`,
      testData
    );

    console.log("📊 Results:");
    console.log("Overall Success:", response.data.success ? "✅" : "❌");
    console.log("Summary:", response.data.summary);
    console.log("");

    // Show details for each platform
    response.data.results.forEach((result) => {
      console.log(`${result.platform.toUpperCase()}:`);
      console.log(`  Status: ${result.success ? "✅ SUCCESS" : "❌ FAILED"}`);
      console.log(`  Message: ${result.message}`);

      if (result.success && result.result) {
        if (result.platform === "twitter" && result.result.id) {
          console.log(`  Tweet ID: ${result.result.id}`);
          console.log(
            `  Tweet URL: https://twitter.com/i/web/status/${result.result.id}`
          );
        }
        if (result.platform === "instagram" && result.result.id) {
          console.log(`  Instagram Post ID: ${result.result.id}`);
        }
      }

      if (!result.success) {
        console.log(`  Error: ${result.error}`);
      }
      console.log("");
    });

    if (response.data.success) {
      console.log("🎉 SUCCESS! Your posting system is working correctly!");
      console.log("");
      console.log("✅ What this means:");
      console.log("- Your Instagram API connection is working");
      console.log("- Your Twitter API connection is working");
      console.log("- The backend posting logic is functioning");
      console.log("- You can now schedule posts through the frontend calendar");
      console.log("");
      console.log("🌐 Next steps:");
      console.log("1. Go to http://localhost:3000/calendar");
      console.log("2. Create an account or login");
      console.log("3. Connect your social accounts");
      console.log("4. Schedule posts using the calendar interface");
    } else {
      console.log(
        "⚠️  Partial success - check the platform-specific errors above"
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Test only Instagram posting
async function testInstagramOnly() {
  console.log("\n📸 Testing Instagram-only posting...\n");

  const instagramData = {
    content:
      "📸 Instagram test post! Beautiful sunset captured with our automation system. #sunset #photography #automation",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=60",
    platforms: ["instagram"],
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/social/test-posting`,
      instagramData
    );
    console.log("Instagram Test Result:", response.data);
  } catch (error) {
    console.error(
      "Instagram test failed:",
      error.response?.data || error.message
    );
  }
}

// Test only Twitter posting
async function testTwitterOnly() {
  console.log("\n🐦 Testing Twitter-only posting...\n");

  const twitterData = {
    content:
      "🐦 Testing Twitter automation! This tweet was sent programmatically using our scheduling system. Pretty cool, right? #TwitterAPI #automation #coding",
    platforms: ["twitter"],
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/social/test-posting`,
      twitterData
    );
    console.log("Twitter Test Result:", response.data);
  } catch (error) {
    console.error(
      "Twitter test failed:",
      error.response?.data || error.message
    );
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--instagram-only")) {
    testInstagramOnly();
  } else if (args.includes("--twitter-only")) {
    testTwitterOnly();
  } else {
    testDirectPosting();
  }
}

module.exports = { testDirectPosting, testInstagramOnly, testTwitterOnly };
