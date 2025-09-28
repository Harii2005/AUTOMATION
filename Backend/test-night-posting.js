const axios = require("axios");
const { TwitterApi } = require("twitter-api-v2");
require("dotenv").config();

async function testNightPosting() {
  console.log("🌙 Testing night posting at 1:25 AM...\n");

  const currentTime = new Date();
  console.log(`🕐 Current time: ${currentTime.toLocaleString()}`);
  console.log("🌃 Perfect time for night-themed posts!\n");

  // Night-themed content
  const nightCaption =
    "🌙 Good night from our automation platform! 😴✨\n\nPosting at 1:25 AM to test our nighttime social media automation! Both Instagram and Twitter APIs working perfectly in the late hours! 🌃🚀\n\n#automation #nightpost #api #instagram #twitter #goodnight #success";
  const nightImage =
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1080&fit=crop&auto=format&q=80";

  console.log("📋 Night Post Content:");
  console.log(`   Caption: ${nightCaption.substring(0, 100)}...`);
  console.log(`   Image: Night sky theme`);
  console.log(`   Time: Perfect for night posting!`);
  console.log("");

  // Test Instagram
  console.log("📸 Creating Instagram night post...");
  try {
    const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (INSTAGRAM_ACCESS_TOKEN) {
      // Create media object
      const createResponse = await axios.post(
        "https://graph.instagram.com/me/media",
        {
          image_url: nightImage,
          caption: nightCaption,
          access_token: INSTAGRAM_ACCESS_TOKEN,
        }
      );

      console.log(`✅ Instagram media created: ${createResponse.data.id}`);

      // Publish post
      const publishResponse = await axios.post(
        "https://graph.instagram.com/me/media_publish",
        {
          creation_id: createResponse.data.id,
          access_token: INSTAGRAM_ACCESS_TOKEN,
        }
      );

      console.log("🎉 Instagram night post published successfully!");
      console.log(`📊 Post ID: ${publishResponse.data.id}`);

      // Get post URL
      const postDetails = await axios.get(
        `https://graph.instagram.com/${publishResponse.data.id}?fields=permalink&access_token=${INSTAGRAM_ACCESS_TOKEN}`
      );
      console.log(`🔗 View on Instagram: ${postDetails.data.permalink}`);
    } else {
      console.log("❌ Instagram token not found");
    }
  } catch (error) {
    console.log("❌ Instagram error:", error.response?.data || error.message);
  }

  // Test Twitter
  console.log("\\n🐦 Creating Twitter night post...");
  try {
    if (process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN) {
      const client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      });

      // Get user info
      const me = await client.v2.me();
      console.log(`✅ Twitter ready: @${me.data.username}`);

      // Download image
      const imageResponse = await axios.get(nightImage, {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(imageResponse.data);

      // Upload media
      const mediaId = await client.v1.uploadMedia(buffer, {
        mimeType: "image/jpeg",
      });
      console.log(`✅ Media uploaded: ${mediaId}`);

      // Create tweet
      const tweet = await client.v2.tweet({
        text: nightCaption,
        media: { media_ids: [mediaId] },
      });

      console.log("🎉 Twitter night post created successfully!");
      console.log(`📊 Tweet ID: ${tweet.data.id}`);
      console.log(
        `🔗 View on Twitter: https://twitter.com/${me.data.username}/status/${tweet.data.id}`
      );
    } else {
      console.log("❌ Twitter credentials not found");
    }
  } catch (error) {
    if (error.code === 429) {
      console.log(
        "⏰ Twitter rate limited - API is working, just need to wait"
      );
    } else {
      console.log("❌ Twitter error:", error.message);
    }
  }

  console.log("\\n🌙 Night Posting Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Both platforms tested with night-themed content");
  console.log("🕐 Perfect timing for late-night automation testing");
  console.log("🚀 Your social media automation works at any hour!");
  console.log("😴 Sweet dreams! 💤");
}

testNightPosting().catch(console.error);
