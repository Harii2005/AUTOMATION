const axios = require("axios");

// Load environment variables first
require("dotenv").config();

// Direct Supabase client
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function createTestScheduledPost() {
  const baseURL = "http://localhost:5001/api";

  try {
    console.log("📅 CREATING TEST SCHEDULED POST");
    console.log("=================================\n");

    // Step 1: Use existing user with email test2@example.com
    console.log("1️⃣ Logging into existing test account...");
    let token, userId;

    // Try login first
    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: "test2@example.com",
        password: "password123",
      });
      token = loginResponse.data.token;
      userId = loginResponse.data.user.id;
      console.log("✅ Login successful! User ID:", userId);
    } catch (error) {
      console.error(
        "❌ Login failed. Please run the full diagnostic script first to create the user."
      );
      return;
    }

    // Step 2: Verify Twitter account exists
    console.log("\n2️⃣ Verifying Twitter social account...");
    const { data: socialAccounts, error: socialError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("userId", userId)
      .eq("platform", "TWITTER")
      .eq("isActive", true);

    if (socialError || !socialAccounts || socialAccounts.length === 0) {
      console.error("❌ No Twitter account found. Creating one...");

      const { data: newAccount, error: createError } = await supabase
        .from("social_accounts")
        .insert({
          userId: userId,
          platform: "TWITTER",
          accountId: "test_twitter_account",
          username: "test_user",
          accountName: "Test User",
          accessToken: "dummy_token",
          refreshToken: "dummy_refresh",
          expiresAt: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isActive: true,
        })
        .select()
        .single();

      if (createError) {
        console.error("❌ Error creating social account:", createError);
        return;
      } else {
        console.log("✅ Twitter social account created!");
      }
    } else {
      console.log("✅ Twitter social account verified");
    }

    // Step 3: Create a test scheduled post for 1 minute from now
    console.log("\n3️⃣ Creating test scheduled post...");
    const testTime = new Date(Date.now() + 1 * 60 * 1000); // 1 minute from now
    console.log(`⏰ Scheduling for: ${testTime.toLocaleString()}`);

    const postData = {
      content:
        "Hello Hari! This is a test scheduled tweet - " +
        new Date().toLocaleString(),
      scheduledAt: testTime.toISOString(),
      platforms: ["twitter"],
    };

    console.log("📝 Post data:", JSON.stringify(postData, null, 2));

    try {
      const scheduleResponse = await axios.post(
        `${baseURL}/posts/schedule`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Scheduled post created successfully!");
      console.log("Response:", JSON.stringify(scheduleResponse.data, null, 2));
    } catch (scheduleError) {
      console.error("❌ Scheduling failed:");
      console.error("Status:", scheduleError.response?.status);
      console.error(
        "Data:",
        JSON.stringify(scheduleError.response?.data, null, 2)
      );

      // Debug: Check what the backend logs show
      console.log(
        "\n🔍 Debug info: Check backend terminal for detailed logs..."
      );
    }

    // Step 4: Verify the post was created in database
    console.log("\n4️⃣ Verifying scheduled post in database...");
    const { data: scheduledPosts, error: queryError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("userId", userId)
      .eq("status", "PENDING")
      .order("scheduledTime", { ascending: true });

    if (queryError) {
      console.error("❌ Database query error:", queryError);
    } else {
      console.log(
        `📋 Found ${scheduledPosts?.length || 0} pending posts in database:`
      );
      scheduledPosts?.forEach((post, index) => {
        console.log(
          `   ${index + 1}. "${post.content}" - ${new Date(
            post.scheduledTime
          ).toLocaleString()}`
        );
        console.log(
          `      Status: ${post.status}, Platform: ${post.platform}, Social Account ID: ${post.socialAccountId}`
        );
      });
    }

    console.log(
      "\n🎉 Test complete! Watch the backend logs for scheduled posting activity."
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }

  process.exit(0);
}

createTestScheduledPost();
