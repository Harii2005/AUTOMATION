const { supabase } = require("./src/utils/database");
const path = require("path");
const fs = require("fs");

/**
 * Test script to schedule a post with the provided image
 */

async function scheduleImagePost() {
  try {
    console.log("📝 Scheduling image post for 1:30 AM today");

    // Get the first user with a Twitter account
    const { data: users, error: userError } = await supabase
      .from("users")
      .select(
        `
        id,
        email,
        social_accounts!inner (
          id,
          platform,
          accountName,
          isActive
        )
      `
      )
      .eq("social_accounts.platform", "TWITTER")
      .eq("social_accounts.isActive", true)
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.error("❌ No users with Twitter accounts found");
      return;
    }

    const user = users[0];
    console.log(`👤 Using user: ${user.email}`);
    console.log(`🐦 Twitter account: ${user.social_accounts[0].accountName}`);

    // Set scheduled time to today at 1:30 AM
    const today = new Date();
    const scheduledTime = new Date(today);
    scheduledTime.setHours(1, 30, 0, 0); // 1:30 AM

    // If 1:30 AM has already passed today, schedule for tomorrow
    if (scheduledTime <= new Date()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
      console.log("⏰ 1:30 AM has passed today, scheduling for tomorrow");
    }

    // For testing purposes, let's schedule it for 2 minutes from now instead
    const testScheduledTime = new Date(Date.now() + 2 * 60 * 1000);

    console.log(`📅 Original schedule time: ${scheduledTime.toISOString()}`);
    console.log(
      `📅 Test schedule time (2 min from now): ${testScheduledTime.toISOString()}`
    );

    // Note: In a real implementation, you would upload the image to a cloud storage service
    // For this demo, I'll use a placeholder URL - you'd need to implement image upload
    const mediaUrl = "https://example.com/uploaded-image.jpg"; // This would be the actual uploaded image URL

    const postContent = `📚 Study notes on Bézier curves and computer graphics! 
    
Key concepts:
• Identifying splines allows closer specification of tangent vectors at endpoints
• Tangent control allows steering curve direction and smoothing interpolation
• Control points define the curve's shape

Perfect for computer graphics, animation, and vector graphics! 

#ComputerGraphics #BezierCurves #StudyNotes #Programming`;

    // Create the scheduled post
    const { data: scheduledPost, error: postError } = await supabase
      .from("scheduled_posts")
      .insert({
        userId: user.id,
        socialAccountId: user.social_accounts[0].id,
        content: postContent,
        mediaUrl: mediaUrl,
        mediaType: "IMAGE",
        scheduledTime: testScheduledTime.toISOString(), // Use test time for immediate testing
        status: "PENDING",
        platform: "TWITTER",
        maxRetries: 3,
        useUserTokens: true,
        fallbackToGlobal: true,
        postType: "STANDARD",
        postOptions: {
          hasImage: true,
          testPost: true,
          originalScheduleTime: scheduledTime.toISOString(),
        },
      })
      .select()
      .single();

    if (postError) {
      console.error("❌ Error creating scheduled post:", postError);
      return;
    }

    console.log("✅ Post scheduled successfully!");
    console.log(`📝 Post ID: ${scheduledPost.id}`);
    console.log(`📅 Scheduled for: ${testScheduledTime.toLocaleString()}`);
    console.log(`📄 Content preview: ${postContent.substring(0, 100)}...`);
    console.log(`🖼️  Media URL: ${mediaUrl}`);
    console.log(
      `🔧 Post options:`,
      JSON.stringify(scheduledPost.postOptions, null, 2)
    );

    console.log(
      "\n🚀 The automatic posting service will process this post in ~2 minutes!"
    );
    console.log(
      "💡 Make sure your backend server is running to see the post get published."
    );

    return scheduledPost;
  } catch (error) {
    console.error("❌ Error scheduling post:", error);
  }
}

async function checkServerStatus() {
  try {
    const response = await fetch("http://localhost:5001/health");
    const data = await response.json();
    console.log("✅ Server is running:", data);
    return true;
  } catch (error) {
    console.log("❌ Server is not running on port 5001");
    console.log("💡 Please start the server with: node src/index.js");
    return false;
  }
}

async function main() {
  console.log("🎯 Image Post Scheduling Test");
  console.log("==============================\n");

  // Check if server is running
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    return;
  }

  // Schedule the post
  await scheduleImagePost();
}

if (require.main === module) {
  main();
}

module.exports = { scheduleImagePost, checkServerStatus };
