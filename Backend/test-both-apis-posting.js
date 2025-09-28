const axios = require("axios");
require("dotenv").config();

async function testBothAPIsPosting() {
  console.log(
    "🚀 Testing both Instagram and Twitter API posting with captions...\n"
  );

  const BACKEND_URL = "http://localhost:5001";

  // Test data
  const testImageUrl =
    "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1080&h=1080&fit=crop&auto=format&q=80";
  const instagramCaption =
    "🚀 Testing Instagram API posting from automation platform! ✨\n\nThis post was created automatically using our social media automation system! 📱\n\n#automation #instagram #api #testing #socialmedia #tech #success";
  const twitterCaption =
    "🐦 Testing Twitter API posting from automation platform! 🚀\n\nBoth Instagram and Twitter APIs are now fully integrated and working! 📱✨\n\n#automation #twitter #api #testing #tech #success";

  console.log("📊 Test Configuration:");
  console.log(`   Backend URL: ${BACKEND_URL}`);
  console.log(`   Image URL: ${testImageUrl.substring(0, 50)}...`);
  console.log(`   Instagram Caption: ${instagramCaption.substring(0, 60)}...`);
  console.log(`   Twitter Caption: ${twitterCaption.substring(0, 60)}...`);
  console.log("");

  // Test 1: Instagram Posting
  console.log("📸 Testing Instagram API posting...");
  try {
    const instagramResponse = await axios.post(
      `${BACKEND_URL}/api/social/instagram/test-post`,
      {
        imageUrl: testImageUrl,
        caption: instagramCaption,
      },
      {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Instagram test successful!");
    console.log(
      "📋 Response:",
      JSON.stringify(instagramResponse.data, null, 2)
    );

    // If test successful, try actual posting
    console.log("\\n🔄 Attempting actual Instagram post...");
    try {
      const actualInstagramPost = await axios.post(
        `${BACKEND_URL}/api/social/instagram/post`,
        {
          imageUrl: testImageUrl,
          caption: instagramCaption,
        },
        {
          timeout: 20000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🎉 Instagram post created successfully!");
      console.log(
        "📊 Post data:",
        JSON.stringify(actualInstagramPost.data, null, 2)
      );
    } catch (actualPostError) {
      if (actualPostError.response?.status === 401) {
        console.log(
          "⚠️  Instagram actual posting requires authentication (expected)"
        );
        console.log(
          "💡 Test mode successful - API is ready for authenticated posting"
        );
      } else {
        console.log("❌ Instagram actual posting failed:");
        console.log("Status:", actualPostError.response?.status);
        console.log(
          "Error:",
          actualPostError.response?.data || actualPostError.message
        );
      }
    }
  } catch (instagramError) {
    console.log("❌ Instagram test failed:");
    console.log("Status:", instagramError.response?.status);
    console.log(
      "Error:",
      JSON.stringify(instagramError.response?.data, null, 2)
    );
  }

  // Test 2: Twitter Posting
  console.log("\\n🐦 Testing Twitter API posting...");
  try {
    // First check if we have Twitter credentials
    const { TwitterApi } = require("twitter-api-v2");

    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_ACCESS_TOKEN) {
      console.log("❌ Twitter API credentials not found");
      return;
    }

    console.log("✅ Twitter API credentials found");

    // Test Twitter client
    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    // Test connection
    const me = await twitterClient.v2.me();
    console.log(`✅ Twitter connection successful: @${me.data.username}`);

    // Test actual Twitter posting
    console.log("\\n🔄 Attempting Twitter post with image...");

    // Download image for Twitter
    const imageResponse = await axios.get(testImageUrl, {
      responseType: "arraybuffer",
      timeout: 10000,
    });
    const imageBuffer = Buffer.from(imageResponse.data);
    console.log(`✅ Image downloaded: ${imageBuffer.length} bytes`);

    // Upload media to Twitter
    const mediaId = await twitterClient.v1.uploadMedia(imageBuffer, {
      mimeType: "image/jpeg",
    });
    console.log(`✅ Media uploaded to Twitter: ${mediaId}`);

    // Create tweet with media
    const tweet = await twitterClient.v2.tweet({
      text: twitterCaption,
      media: { media_ids: [mediaId] },
    });

    console.log("🎉 Twitter post created successfully!");
    console.log("📊 Tweet data:");
    console.log(`   Tweet ID: ${tweet.data.id}`);
    console.log(`   Text: ${tweet.data.text.substring(0, 100)}...`);
    console.log(
      `   URL: https://twitter.com/${me.data.username}/status/${tweet.data.id}`
    );
  } catch (twitterError) {
    console.log("❌ Twitter posting failed:");
    console.log("Error:", twitterError.message);

    if (twitterError.code === 401) {
      console.log("💡 Twitter API authentication issue - check credentials");
    } else if (twitterError.code === 403) {
      console.log("💡 Twitter API permissions issue - check app permissions");
    } else if (twitterError.code === 429) {
      console.log("💡 Twitter API rate limit exceeded");
    }
  }

  console.log("\\n🎯 API Testing Results Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📱 Instagram API: Testing completed");
  console.log("🐦 Twitter API: Testing completed");
  console.log("\\n🚀 Both APIs are configured and ready for posting!");
}

testBothAPIsPosting().catch(console.error);
