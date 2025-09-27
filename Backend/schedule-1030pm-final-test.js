require("dotenv").config();
const { supabase } = require("./src/utils/database");

async function scheduleTwitterPost() {
  try {
    console.log("🚀 Scheduling Twitter post for 10:30pm...");

    // Use the authenticated user ID
    const userId = "d086a4b5-a126-4d04-820f-94f02c81e098";

    // First, let's check if social account exists
    const { data: socialAccount, error: socialError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("userId", userId)
      .eq("platform", "TWITTER")
      .eq("isActive", true)
      .single();

    console.log("Social account check:", {
      data: socialAccount,
      error: socialError,
    });

    if (!socialAccount) {
      console.log("❌ No Twitter account found. Creating one...");

      // Create a Twitter account for this user
      const { data: newAccount, error: createError } = await supabase
        .from("social_accounts")
        .insert({
          userId: userId,
          platform: "TWITTER",
          accountId: "1902337434228346880",
          accountName: "Harii_2005",
          accessToken: process.env.TWITTER_ACCESS_TOKEN,
          refreshToken: process.env.TWITTER_ACCESS_TOKEN_SECRET,
          isActive: true,
        })
        .select()
        .single();

      console.log("Account creation result:", {
        data: newAccount,
        error: createError,
      });

      if (createError) {
        throw new Error(
          "Failed to create Twitter account: " + createError.message
        );
      }

      socialAccount = newAccount;
    }

    // Schedule the post for 10:30pm today
    const today = new Date();
    const scheduleTime = new Date(today);
    scheduleTime.setHours(22, 30, 0, 0); // 10:30 PM

    console.log(`⏰ Scheduling for: ${scheduleTime.toISOString()}`);

    const { data: scheduledPost, error: postError } = await supabase
      .from("scheduled_posts")
      .insert({
        userId: userId,
        socialAccountId: socialAccount.id,
        content: "final test of twitter",
        scheduledTime: scheduleTime.toISOString(),
        status: "PENDING",
        platform: "TWITTER",
      })
      .select()
      .single();

    console.log("Scheduled post result:", {
      data: scheduledPost,
      error: postError,
    });

    if (postError) {
      throw new Error("Failed to schedule post: " + postError.message);
    }

    console.log("✅ Successfully scheduled Twitter post for 10:30pm!");
    console.log("Post ID:", scheduledPost.id);
    console.log("Content:", scheduledPost.content);
    console.log("Scheduled for:", scheduledPost.scheduledTime);
  } catch (error) {
    console.error("❌ Error scheduling Twitter post:", error.message);
  }
}

scheduleTwitterPost();
