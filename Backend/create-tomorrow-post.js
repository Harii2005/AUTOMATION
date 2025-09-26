const axios = require("axios");
const { supabase } = require("./src/utils/database");
require("dotenv").config();

async function createTomorrowPost() {
  console.log("🗓️  Creating a Scheduled Post for Tomorrow...\n");

  try {
    // First, we need to create a user and get a token (simulating login)
    console.log("1. 👤 Setting up test user...");

    // Check if we have any users in the database
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, username")
      .limit(1);

    let userId;
    if (usersError || users.length === 0) {
      console.log("   No users found. You need to register/login first.");
      console.log(
        "   Go to http://localhost:3000/register to create an account"
      );
      return;
    } else {
      userId = users[0].id;
      console.log(
        `   ✅ Using existing user: ${users[0].email} (ID: ${userId})`
      );
    }

    // Check if user has connected social accounts
    console.log("\n2. 🔗 Checking social accounts...");
    const { data: socialAccounts, error: socialError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("userId", userId); // Using camelCase for Supabase

    if (socialError || socialAccounts.length === 0) {
      console.log("   ❌ No social accounts connected.");
      console.log("   You need to connect Twitter first:");
      console.log("   1. Go to http://localhost:3000/login");
      console.log("   2. Login with your account");
      console.log("   3. Go to http://localhost:3000/accounts");
      console.log("   4. Connect your Twitter account");

      // Let's create a social account entry for testing
      console.log("\n   🛠️  Creating test social account...");
      const { data: newSocialAccount, error: createError } = await supabase
        .from("social_accounts")
        .insert({
          userId: userId, // camelCase as per database schema
          platform: "TWITTER", // uppercase as per schema constraint
          accountId: "1902337434228346880", // Your Twitter ID
          accountName: "Harii_2005",
          accessToken: "test-encrypted-token", // accessToken field
          isActive: true, // camelCase
        })
        .select()
        .single();

      if (createError) {
        console.log(
          "   ❌ Error creating social account:",
          createError.message
        );
        return;
      } else {
        console.log("   ✅ Created test Twitter account connection");
        socialAccounts = [newSocialAccount]; // Use the newly created account
      }
    } else {
      console.log(
        `   ✅ Found ${socialAccounts.length} connected social account(s)`
      );
    }

    // Create tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 30, 0, 0); // 2:30 PM tomorrow

    console.log("\n3. 📝 Creating scheduled post...");
    console.log(`   Scheduled for: ${tomorrow.toLocaleString()}`);

    // Create the scheduled post directly in database
    const postData = {
      userId: userId, // camelCase for Supabase
      socialAccountId: socialAccounts[0]?.id, // Use actual social account ID
      content:
        "🚀 This is my automated post for tomorrow! Testing the scheduling system. #automation #tomorrow #test",
      mediaUrl: null,
      mediaType: null,
      scheduledTime: tomorrow.toISOString(), // camelCase for Supabase
      status: "PENDING", // uppercase as per schema constraint
      platform: "TWITTER", // uppercase as per schema constraint
    };

    const { data: scheduledPost, error: postError } = await supabase
      .from("scheduled_posts")
      .insert(postData)
      .select()
      .single();

    if (postError) {
      console.log("   ❌ Error creating scheduled post:", postError.message);
      return;
    }

    console.log("   ✅ Successfully created scheduled post!");
    console.log(`   Post ID: ${scheduledPost.id}`);
    console.log(`   Content: "${scheduledPost.content}"`);
    console.log(
      `   Scheduled: ${new Date(scheduledPost.scheduledTime).toLocaleString()}`
    );

    // Now check the database
    console.log("\n4. 🔍 Checking database...");
    await checkDatabase();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function checkDatabase() {
  try {
    // Check scheduled posts
    const { data: posts, error: postsError } = await supabase
      .from("scheduled_posts")
      .select(
        `
        *,
        social_accounts(platform, accountName)
      `
      )
      .order("createdAt", { ascending: false }); // camelCase for Supabase

    if (postsError) {
      console.log("   ❌ Error fetching posts:", postsError.message);
      return;
    }

    console.log(`   📊 Total scheduled posts in database: ${posts.length}`);

    if (posts.length > 0) {
      console.log("\n   📋 Recent scheduled posts:");
      posts.slice(0, 3).forEach((post, index) => {
        console.log(`   ${index + 1}. "${post.content.substring(0, 50)}..."`);
        console.log(
          `      Scheduled: ${new Date(post.scheduledTime).toLocaleString()}`
        );
        console.log(`      Status: ${post.status}`);
        console.log(`      Platform: ${post.platform}`);
        console.log(
          `      Created: ${new Date(post.createdAt).toLocaleString()}`
        );
        console.log("");
      });
    }

    // Check if any posts are for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const { data: tomorrowPosts, error: tomorrowError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .gte("scheduledTime", tomorrowStart.toISOString()) // camelCase
      .lte("scheduledTime", tomorrowEnd.toISOString()); // camelCase

    if (!tomorrowError && tomorrowPosts.length > 0) {
      console.log(
        `   🗓️  Posts scheduled for tomorrow: ${tomorrowPosts.length}`
      );
      tomorrowPosts.forEach((post, index) => {
        console.log(
          `   ${index + 1}. ${new Date(
            post.scheduledTime
          ).toLocaleTimeString()} - "${post.content.substring(0, 30)}..."`
        );
      });
    } else {
      console.log("   📅 No posts scheduled for tomorrow yet");
    }
  } catch (error) {
    console.error("   ❌ Database check failed:", error.message);
  }
}

// Run the test
createTomorrowPost();
