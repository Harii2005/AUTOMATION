const axios = require("axios");
const { TwitterApi } = require("twitter-api-v2");
require("dotenv").config();

async function testAPIsDirectly() {
  console.log("🚀 Testing Instagram and Twitter APIs directly...\n");

  // Test Instagram API directly
  console.log("📸 Testing Instagram API directly...");
  try {
    const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!INSTAGRAM_ACCESS_TOKEN) {
      console.log("❌ Instagram access token not found");
    } else {
      console.log("✅ Instagram access token found");

      const instagramData = {
        imageUrl:
          "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1080&h=1080&fit=crop&auto=format&q=80",
        caption:
          "🚀 Testing Instagram API direct posting! ✨\\n\\nThis is a test post from the automation platform to verify Instagram integration is working perfectly! 📱\\n\\n#automation #instagram #api #test #success #socialmedia",
      };

      console.log("🔄 Step 1: Creating Instagram media object...");
      const createResponse = await axios.post(
        `https://graph.instagram.com/me/media`,
        {
          image_url: instagramData.imageUrl,
          caption: instagramData.caption,
          access_token: INSTAGRAM_ACCESS_TOKEN,
        }
      );

      const creationId = createResponse.data.id;
      console.log(`✅ Media object created: ${creationId}`);

      console.log("🔄 Step 2: Publishing Instagram post...");
      const publishResponse = await axios.post(
        `https://graph.instagram.com/me/media_publish`,
        {
          creation_id: creationId,
          access_token: INSTAGRAM_ACCESS_TOKEN,
        }
      );

      console.log("🎉 Instagram post published successfully!");
      console.log(`📊 Post ID: ${publishResponse.data.id}`);
      console.log(
        "📋 Caption preview:",
        instagramData.caption.substring(0, 100) + "..."
      );

      // Get the published post details
      try {
        const postDetails = await axios.get(
          `https://graph.instagram.com/${publishResponse.data.id}?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${INSTAGRAM_ACCESS_TOKEN}`
        );
        console.log("📸 Post details:");
        console.log(`   URL: ${postDetails.data.permalink}`);
        console.log(`   Type: ${postDetails.data.media_type}`);
        console.log(`   Timestamp: ${postDetails.data.timestamp}`);
      } catch (detailsError) {
        console.log("⚠️  Could not fetch post details");
      }
    }
  } catch (instagramError) {
    console.log("❌ Instagram posting failed:");
    console.log(
      "Error:",
      instagramError.response?.data || instagramError.message
    );
  }

  // Test Twitter API directly
  console.log("\\n🐦 Testing Twitter API directly...");
  try {
    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_ACCESS_TOKEN) {
      console.log("❌ Twitter API credentials not found");
      return;
    }

    console.log("✅ Twitter API credentials found");

    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    // Test connection
    const me = await twitterClient.v2.me();
    console.log(`✅ Twitter connection successful: @${me.data.username}`);

    const twitterData = {
      text: "🐦 Testing Twitter API direct posting! 🚀\\n\\nThis is a test tweet from the automation platform to verify Twitter integration is working perfectly! Both Instagram and Twitter APIs are now fully functional! ✨\\n\\n#automation #twitter #api #test #success",
      imageUrl:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080&h=1080&fit=crop&auto=format&q=80",
    };

    console.log("🔄 Step 1: Downloading image for Twitter...");
    const imageResponse = await axios.get(twitterData.imageUrl, {
      responseType: "arraybuffer",
      timeout: 10000,
    });
    const imageBuffer = Buffer.from(imageResponse.data);
    console.log(`✅ Image downloaded: ${imageBuffer.length} bytes`);

    console.log("🔄 Step 2: Uploading media to Twitter...");
    const mediaId = await twitterClient.v1.uploadMedia(imageBuffer, {
      mimeType: "image/jpeg",
    });
    console.log(`✅ Media uploaded: ${mediaId}`);

    console.log("🔄 Step 3: Creating tweet with media...");
    const tweet = await twitterClient.v2.tweet({
      text: twitterData.text,
      media: { media_ids: [mediaId] },
    });

    console.log("🎉 Twitter post created successfully!");
    console.log(`📊 Tweet ID: ${tweet.data.id}`);
    console.log(
      "📋 Tweet preview:",
      twitterData.text.substring(0, 100) + "..."
    );
    console.log(
      `📸 Tweet URL: https://twitter.com/${me.data.username}/status/${tweet.data.id}`
    );
  } catch (twitterError) {
    console.log("❌ Twitter posting failed:");
    console.log("Error:", twitterError.message);

    if (twitterError.code === 401) {
      console.log("💡 Authentication issue - check Twitter API credentials");
    } else if (twitterError.code === 403) {
      console.log("💡 Permissions issue - check Twitter app permissions");
    } else if (twitterError.code === 429) {
      console.log("💡 Rate limit exceeded - wait and try again");
    }
  }

  console.log("\\n🎯 Direct API Testing Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Both APIs have been tested with actual posting attempts.");
  console.log(
    "Check your Instagram and Twitter accounts to see the new posts!"
  );
}

testAPIsDirectly().catch(console.error);
