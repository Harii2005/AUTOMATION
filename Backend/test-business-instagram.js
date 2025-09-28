const axios = require("axios");

async function testBusinessInstagramAPI() {
  // New Business account credentials
  const ACCESS_TOKEN =
    "IGAASZBSOMqFQ5BZAFFBSUVlQXpvSjBpUlVOTWV1TzBod2dwVDFXajc3ZATJxamN4S1ZAXazNiZADlOTmh3cDNsbFo5SEd6cEtsdVpWZAXpmLUpmckNGWjdENzAzZAE5YZAVUtejdOU0NqM09idWcwS2thMFgzS19rREJCUS1pekxWTFowWQZDZD";
  const APP_SECRET = "62f6b8386809cbbef5dee0997bffb25c";

  console.log("🏢 Testing Instagram Business Account API...\n");

  // Test 1: Verify Business account
  try {
    console.log("📱 Step 1: Verifying Business account...");
    const userResponse = await axios.get(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${ACCESS_TOKEN}`
    );

    console.log("✅ Account Info:");
    console.log(JSON.stringify(userResponse.data, null, 2));

    const accountType = userResponse.data.account_type;
    if (accountType === "BUSINESS") {
      console.log(
        "\n🎉 Perfect! BUSINESS account confirmed - Instagram Graph API posting enabled!"
      );
    } else {
      console.log(`\n❌ Account type is "${accountType}" - expected BUSINESS`);
      return;
    }
  } catch (error) {
    console.log("❌ Account verification failed:");
    console.log(JSON.stringify(error.response?.data, null, 2));
    return;
  }

  // Test 2: Create and publish a real Instagram post
  try {
    console.log("\n📸 Step 2: Creating and publishing Instagram post...");

    // Using a high-quality direct image URL
    const testImageUrl =
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1080&h=1080&fit=crop&auto=format&q=80";
    const testCaption =
      "🚀 Instagram API is now working with Business account! \n\n#automation #instagram #api #business #socialmedia #success";

    console.log("🖼️ Image URL:", testImageUrl);
    console.log("📝 Caption:", testCaption);

    // Step 2a: Create media container
    console.log("\n⚙️ Creating media container...");
    const mediaResponse = await axios.post(
      "https://graph.instagram.com/me/media",
      {
        image_url: testImageUrl,
        caption: testCaption,
        access_token: ACCESS_TOKEN,
      }
    );

    const creationId = mediaResponse.data.id;
    console.log("✅ Media container created!");
    console.log("🆔 Creation ID:", creationId);

    // Step 2b: Publish the media
    console.log("\n🚀 Publishing to Instagram...");
    const publishResponse = await axios.post(
      "https://graph.instagram.com/me/media_publish",
      {
        creation_id: creationId,
        access_token: ACCESS_TOKEN,
      }
    );

    console.log("🎉 SUCCESS! Instagram post published!");
    console.log("📱 Post ID:", publishResponse.data.id);
    console.log(
      "\n✨ Check your Instagram account (@automationtesting_hari) - the post is live!"
    );

    return publishResponse.data;
  } catch (error) {
    console.log("❌ Instagram posting failed:");
    console.log("Status:", error.response?.status);
    console.log("Error:", JSON.stringify(error.response?.data, null, 2));

    // Error analysis
    if (error.response?.data?.error?.code === 9004) {
      console.log("\n🔍 Image URL issue - trying alternative...");

      // Try with a different reliable image
      try {
        const altImageUrl = "https://picsum.photos/1080/1080.jpg";
        console.log("🔄 Retrying with alternative image:", altImageUrl);

        const altMediaResponse = await axios.post(
          "https://graph.instagram.com/me/media",
          {
            image_url: altImageUrl,
            caption:
              "🔧 Testing Instagram API with Business account! #test #api",
            access_token: ACCESS_TOKEN,
          }
        );

        const altPublishResponse = await axios.post(
          "https://graph.instagram.com/me/media_publish",
          {
            creation_id: altMediaResponse.data.id,
            access_token: ACCESS_TOKEN,
          }
        );

        console.log("✅ SUCCESS with alternative image!");
        console.log("📱 Post ID:", altPublishResponse.data.id);
      } catch (altError) {
        console.log(
          "❌ Alternative image also failed:",
          altError.response?.data
        );
      }
    }
  }
}

testBusinessInstagramAPI().catch(console.error);
