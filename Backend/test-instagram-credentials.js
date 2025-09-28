const axios = require("axios");

async function testInstagramAPI() {
  // Your provided credentials
  const ACCESS_TOKEN =
    "IGAASZBSOMqFQ5BZAFFWSE9NUW1ybktTYlVmeHl5S25OVzV2OTBTZAmNES19nVXJuSWNQVUx3SlJoS3c5dE4xTEFKUXJQT2k5Uk5GU3JqRzFUVnF4eW5Mdy1ibWNyRTM0U1R2ZA1hhVW9sSG51bnNpUWtJTU5pcDF0TlJ0ZAGs3Rm5jawZDZD";
  const APP_SECRET = "62f6b8386809cbbef5dee0997bffb25c";

  console.log("🔍 Testing Instagram API with provided credentials...\n");

  // Test 1: Verify access token and get user info
  try {
    console.log("📱 Step 1: Testing access token...");
    const userResponse = await axios.get(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${ACCESS_TOKEN}`
    );

    console.log("✅ Access token valid!");
    console.log("📊 Account Info:", JSON.stringify(userResponse.data, null, 2));
  } catch (error) {
    console.log("❌ Access token test failed:");
    console.log("Error:", error.response?.data || error.message);
    return;
  }

  // Test 2: Check permissions
  try {
    console.log("\n🔐 Step 2: Checking permissions...");
    const permissionsResponse = await axios.get(
      `https://graph.instagram.com/me/permissions?access_token=${ACCESS_TOKEN}`
    );

    console.log("✅ Permissions check successful!");
    console.log(
      "🛡️ Available Permissions:",
      JSON.stringify(permissionsResponse.data, null, 2)
    );
  } catch (error) {
    console.log("❌ Permissions check failed:");
    console.log("Error:", error.response?.data || error.message);
  }

  // Test 3: Create media object with test image
  try {
    console.log("\n📸 Step 3: Creating media object...");
    const testImageUrl = "https://picsum.photos/800/600";
    const testCaption =
      "Test post from Instagram API verification! 🚀 #test #automation";

    const mediaResponse = await axios.post(
      "https://graph.instagram.com/me/media",
      {
        image_url: testImageUrl,
        caption: testCaption,
        access_token: ACCESS_TOKEN,
      }
    );

    console.log("✅ Media object created successfully!");
    console.log("🆔 Creation ID:", mediaResponse.data.id);

    // Test 4: Publish media
    console.log("\n🚀 Step 4: Publishing media...");
    const publishResponse = await axios.post(
      "https://graph.instagram.com/me/media_publish",
      {
        creation_id: mediaResponse.data.id,
        access_token: ACCESS_TOKEN,
      }
    );

    console.log("✅ Media published successfully!");
    console.log(
      "📝 Post Details:",
      JSON.stringify(publishResponse.data, null, 2)
    );
  } catch (error) {
    console.log("❌ Media creation/publishing failed:");
    console.log(
      "Error Details:",
      JSON.stringify(error.response?.data, null, 2)
    );
    console.log("Status:", error.response?.status);
    console.log("Headers:", error.response?.headers);

    // Additional debugging
    if (error.response?.data?.error?.code === 190) {
      console.log("\n🔍 Debug Info: Access token might be expired or invalid");
    } else if (error.response?.data?.error?.code === 100) {
      console.log(
        "\n🔍 Debug Info: Invalid parameter - check image URL or caption format"
      );
    } else if (error.response?.data?.error?.code === 10) {
      console.log(
        "\n🔍 Debug Info: Permission issue - account might not have posting permissions"
      );
    }
  }

  // Test 5: Check account type (must be Business or Creator)
  try {
    console.log("\n👤 Step 5: Verifying account type...");
    const accountResponse = await axios.get(
      `https://graph.instagram.com/me?fields=account_type&access_token=${ACCESS_TOKEN}`
    );

    const accountType = accountResponse.data.account_type;
    console.log("📋 Account Type:", accountType);

    if (accountType === "BUSINESS" || accountType === "CREATOR") {
      console.log("✅ Account type is valid for Instagram Graph API posting");
    } else {
      console.log(
        "❌ Account type must be BUSINESS or CREATOR for Instagram Graph API posting"
      );
      console.log(
        "💡 Switch to a Business or Creator account in Instagram settings"
      );
    }
  } catch (error) {
    console.log("❌ Account type check failed:");
    console.log("Error:", error.response?.data || error.message);
  }
}

// Run the comprehensive test
testInstagramAPI().catch(console.error);
