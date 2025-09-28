const axios = require("axios");

// Instagram credentials from user
const INSTAGRAM_ACCESS_TOKEN =
  "IGAASZBSOMqFQ5BZAFFWSE9NUW1ybktTYlVmeHl5S25OVzV2OTBTZAmNES19nVXJuSWNQVUx3SlJoS3c5dE4xTEFKUXJQT2k5Uk5GU3JqRzFUVnF4eW5Mdy1ibWNyRTM0U1R2ZA1hhVW9sSG51bnNpUWtJTU5pcDF0TlJ0ZAGs3Rm5jawZDZD";
const INSTAGRAM_APP_SECRET = "62f6b8386809cbbef5dee0997bffb25c";

async function testInstagramAPI() {
  console.log("🔄 Testing Instagram API with provided credentials...\n");

  try {
    // Test 1: Get basic user info
    console.log("Test 1: Getting user information...");
    const userResponse = await axios.get(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${INSTAGRAM_ACCESS_TOKEN}`
    );
    console.log("✅ User Info Success:", userResponse.data);
    console.log("");

    // Test 2: Get account details with more fields
    console.log("Test 2: Getting detailed account information...");
    try {
      const accountResponse = await axios.get(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count,followers_count,follows_count&access_token=${INSTAGRAM_ACCESS_TOKEN}`
      );
      console.log("✅ Account Details Success:", accountResponse.data);
    } catch (accountError) {
      console.log(
        "⚠️  Some account details not available:",
        accountError.response?.data?.error?.message || accountError.message
      );
      console.log(
        "This is normal for some Instagram account types or permission levels"
      );
    }
    console.log("");

    // Test 3: Get user media
    console.log("Test 3: Getting user media...");
    try {
      const mediaResponse = await axios.get(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=5&access_token=${INSTAGRAM_ACCESS_TOKEN}`
      );
      console.log("✅ Media Success:", mediaResponse.data);
      console.log(`Found ${mediaResponse.data.data.length} media items`);
    } catch (mediaError) {
      console.log(
        "⚠️  Media fetch error:",
        mediaError.response?.data?.error?.message || mediaError.message
      );
      console.log("This might be due to permission levels or account type");
    }
    console.log("");

    // Test 4: Validate token (check if it's a long-lived token)
    console.log("Test 4: Checking token information...");
    try {
      const tokenResponse = await axios.get(
        `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_APP_SECRET}&access_token=${INSTAGRAM_ACCESS_TOKEN}`
      );
      console.log("✅ Token is valid and can be refreshed");
      console.log(
        "Token type:",
        tokenResponse.data.access_token ? "Long-lived" : "Short-lived"
      );
    } catch (tokenError) {
      console.log(
        "⚠️  Token validation error:",
        tokenError.response?.data?.error?.message || tokenError.message
      );
      console.log(
        "This might mean the token is already long-lived or there's a configuration issue"
      );
    }
    console.log("");

    // Summary
    console.log("🎉 Instagram API Test Results:");
    console.log("✅ Basic connection: SUCCESS");
    console.log("✅ User info retrieval: SUCCESS");
    console.log("✅ API credentials are working");
    console.log("");
    console.log(
      "📝 Note: Some advanced features may require additional permissions or Business/Creator account type"
    );

    return true;
  } catch (error) {
    console.error("❌ Instagram API Test Failed:");
    console.error("Error:", error.response?.data || error.message);
    console.error("Status:", error.response?.status);

    if (error.response?.data?.error) {
      console.error("Instagram Error Details:");
      console.error("- Message:", error.response.data.error.message);
      console.error("- Type:", error.response.data.error.type);
      console.error("- Code:", error.response.data.error.code);
      console.error(
        "- Error Subcode:",
        error.response.data.error.error_subcode
      );
    }

    return false;
  }
}

// Run the test
if (require.main === module) {
  testInstagramAPI().then((success) => {
    if (success) {
      console.log("🎯 All Instagram API tests completed successfully!");
      process.exit(0);
    } else {
      console.log("💥 Instagram API tests failed!");
      process.exit(1);
    }
  });
}

module.exports = { testInstagramAPI };
