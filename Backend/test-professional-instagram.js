const axios = require("axios");

async function testInstagramAPIProfessional() {
  // Your provided credentials
  const ACCESS_TOKEN =
    "IGAASZBSOMqFQ5BZAFFWSE9NUW1ybktTYlVmeHl5S25OVzV2OTBTZAmNES19nVXJuSWNQVUx3SlJoS3c5dE4xTEFKUXJQT2k5Uk5GU3JqRzFUVnF4eW5Mdy1ibWNyRTM0U1R2ZA1hhVW9sSG51bnNpUWtJTU5pcDF0TlJ0ZAGs3Rm5jawZDZD";
  const APP_SECRET = "62f6b8386809cbbef5dee0997bffb25c";

  console.log("🔍 Testing Instagram API for Professional Account...\n");

  // Test 1: Get account info
  try {
    console.log("📱 Step 1: Getting account info...");
    const userResponse = await axios.get(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${ACCESS_TOKEN}`
    );

    console.log("✅ Account Info Retrieved:");
    console.log(JSON.stringify(userResponse.data, null, 2));

    const accountType = userResponse.data.account_type;
    console.log("\n📋 Account Analysis:");
    if (accountType === "BUSINESS") {
      console.log("✅ BUSINESS account - Perfect for Instagram Graph API");
    } else if (accountType === "CREATOR") {
      console.log("✅ CREATOR account - Perfect for Instagram Graph API");
    } else {
      console.log(
        `❌ Account type "${accountType}" - Need BUSINESS or CREATOR`
      );
      console.log(
        "💡 Please convert to Business or Creator account in Instagram settings"
      );
      return;
    }
  } catch (error) {
    console.log("❌ Failed to get account info:");
    console.log(JSON.stringify(error.response?.data, null, 2));
    return;
  }

  // Test 2: Try creating media with a direct image URL
  try {
    console.log("\n📸 Step 2: Testing media creation with direct image URL...");

    // Using a reliable direct image URL
    const testImageUrl =
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=600&fit=crop&auto=format";
    const testCaption =
      "Test post from Instagram Graph API! 🚀 #automation #test #instagram";

    console.log("🔗 Testing with image URL:", testImageUrl);

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

    // Test 3: Publish the media
    console.log("\n🚀 Step 3: Publishing media to Instagram...");
    const publishResponse = await axios.post(
      "https://graph.instagram.com/me/media_publish",
      {
        creation_id: mediaResponse.data.id,
        access_token: ACCESS_TOKEN,
      }
    );

    console.log("✅ SUCCESS! Media published to Instagram!");
    console.log("📝 Published Post Details:");
    console.log(JSON.stringify(publishResponse.data, null, 2));
    console.log("\n🎉 Check your Instagram account - the post should be live!");
  } catch (error) {
    console.log("❌ Media creation/publishing failed:");
    console.log("Status:", error.response?.status);
    console.log("Error Details:");
    console.log(JSON.stringify(error.response?.data, null, 2));

    // Detailed error analysis
    if (error.response?.data?.error?.code === 9004) {
      console.log("\n🔍 Analysis: Media download failed");
      console.log("💡 Solutions:");
      console.log("  1. Try a different image URL");
      console.log("  2. Ensure image is publicly accessible");
      console.log("  3. Use images from reliable CDNs (like Unsplash, Imgur)");
    } else if (error.response?.data?.error?.code === 190) {
      console.log("\n🔍 Analysis: Access token issue");
      console.log("💡 Solutions:");
      console.log("  1. Regenerate access token");
      console.log("  2. Check token permissions");
    } else if (error.response?.data?.error?.code === 100) {
      console.log("\n🔍 Analysis: Parameter issue");
      console.log("💡 Solutions:");
      console.log("  1. Check image URL format");
      console.log("  2. Verify caption length (max 2200 characters)");
    }
  }

  // Test 4: Test with an uploaded image from your backend
  try {
    console.log("\n🌐 Step 4: Testing with potential backend upload URL...");

    // This would be the format your backend generates
    const backendImageUrl = "http://localhost:5001/uploads/test-image.jpg";
    console.log("🔗 Testing backend URL format:", backendImageUrl);

    // Check if the URL is accessible
    const headResponse = await axios.head(backendImageUrl).catch(() => null);

    if (headResponse && headResponse.status === 200) {
      console.log("✅ Backend image URL is accessible");

      const mediaResponse = await axios.post(
        "https://graph.instagram.com/me/media",
        {
          image_url: backendImageUrl,
          caption: "Test post with uploaded image! 📷 #automation #upload",
          access_token: ACCESS_TOKEN,
        }
      );

      console.log("✅ Backend image media object created!");
      console.log("🆔 Creation ID:", mediaResponse.data.id);
    } else {
      console.log(
        "❌ Backend image URL not accessible (expected - no actual image uploaded yet)"
      );
      console.log(
        "💡 This is normal - upload an image through your frontend to test"
      );
    }
  } catch (error) {
    console.log("❌ Backend image test failed (expected):", error.message);
  }
}

// Run the comprehensive test
testInstagramAPIProfessional().catch(console.error);
