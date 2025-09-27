const axios = require("axios");

// Load environment variables first
require("dotenv").config();

// Direct Supabase client without requiring database.js
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseTweetIssues() {
  const baseURL = "http://localhost:5001/api";

  try {
    console.log("🔍 DIAGNOSING TWEET SCHEDULING ISSUES");
    console.log("=====================================\n");

    // Step 1: Check backend health
    console.log("1️⃣ Testing backend connection...");
    try {
      const healthResponse = await axios.get(`${baseURL}/health`);
      console.log("✅ Backend is responding:", healthResponse.data);
    } catch (error) {
      console.error("❌ Backend not responding:", error.message);
      return;
    }

    // Step 2: Check database connection
    console.log("\n2️⃣ Testing database connection...");
    const { data: dbTest, error: dbError } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (dbError) {
      console.error("❌ Database error:", dbError);
      return;
    }
    console.log("✅ Database connected successfully");

    // Step 3: Get or create user
    console.log("\n3️⃣ Setting up user account...");
    let token, userId;

    // Try to find existing user first
    const { data: existingUsers } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", "test@example.com")
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      console.log("👤 User already exists, attempting login...");
      try {
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
          email: "test@example.com",
          password: "password123",
        });
        token = loginResponse.data.token;
        userId = loginResponse.data.user.id;
        console.log("✅ Login successful! User ID:", userId);
      } catch (loginError) {
        console.error("❌ Login failed:", loginError.response?.data);
        console.log("🔄 Trying to create user with different email...");
        const randomEmail = `test${Date.now()}@example.com`;
        try {
          const registerResponse = await axios.post(
            `${baseURL}/auth/register`,
            {
              email: randomEmail,
              username: `testuser${Date.now()}`,
              password: "password123",
              firstName: "Test",
              lastName: "User",
            }
          );
          token = registerResponse.data.token;
          userId = registerResponse.data.user.id;
          console.log("✅ New user created! User ID:", userId);
        } catch (registerError) {
          console.error(
            "❌ Registration failed:",
            registerError.response?.data
          );
          return;
        }
      }
    } else {
      console.log("📝 Creating new user...");
      try {
        const registerResponse = await axios.post(`${baseURL}/auth/register`, {
          email: "test@example.com",
          username: "testuser",
          password: "password123",
          firstName: "Test",
          lastName: "User",
        });
        token = registerResponse.data.token;
        userId = registerResponse.data.user.id;
        console.log("✅ Registration successful! User ID:", userId);
      } catch (registerError) {
        console.error("❌ Registration failed:", registerError.response?.data);
        return;
      }
    }

    // Step 4: Check for existing social accounts
    console.log("\n4️⃣ Checking Twitter social account...");
    const { data: socialAccounts, error: socialError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("userId", userId)
      .eq("platform", "TWITTER");

    if (socialError) {
      console.error("❌ Error checking social accounts:", socialError);
    }

    if (!socialAccounts || socialAccounts.length === 0) {
      console.log("📱 Creating Twitter social account...");
      const { data: newAccount, error: createError } = await supabase
        .from("social_accounts")
        .insert({
          userId: userId,
          platform: "TWITTER",
          accountId: "test_twitter_account",
          accountName: "test_user", // Changed from displayName to accountName
          accessToken: "dummy_token", // Will use global tokens
          refreshToken: "dummy_refresh",
          tokenExpiry: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isActive: true,
        })
        .select()
        .single();

      if (createError) {
        console.error("❌ Error creating social account:", createError);
      } else {
        console.log("✅ Twitter social account created!");
      }
    } else {
      console.log("✅ Twitter social account exists");
    }

    // Step 5: Check existing scheduled posts
    console.log("\n5️⃣ Checking existing scheduled posts...");
    const { data: existingPosts, error: postsError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("userId", userId)
      .order("scheduledTime", { ascending: false });

    if (postsError) {
      console.error("❌ Error checking scheduled posts:", postsError);
    } else {
      console.log(`📋 Found ${existingPosts.length} existing scheduled posts`);
      if (existingPosts.length > 0) {
        existingPosts.forEach((post, index) => {
          console.log(
            `   ${index + 1}. "${post.content}" - ${new Date(
              post.scheduledTime
            ).toLocaleString()} (${post.status})`
          );
        });
      }
    }

    // Step 6: Test immediate posting
    console.log("\n6️⃣ Testing immediate Twitter posting...");
    try {
      const postResponse = await axios.post(
        `${baseURL}/posts/post-now`,
        {
          content:
            "Test tweet from automation system - " +
            new Date().toLocaleString(),
          platforms: ["twitter"],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Immediate posting test successful!");
      console.log("Response:", JSON.stringify(postResponse.data, null, 2));
    } catch (postError) {
      console.error("❌ Immediate posting failed:");
      console.error("Status:", postError.response?.status);
      console.error("Data:", postError.response?.data);
    }

    // Step 7: Create a test scheduled post for 2 minutes from now
    console.log("\n7️⃣ Creating test scheduled post...");
    const testTime = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
    console.log(`⏰ Scheduling test post for: ${testTime.toLocaleString()}`);

    try {
      const scheduleResponse = await axios.post(
        `${baseURL}/posts/schedule`,
        {
          content:
            "hello hari this is a test text - scheduled at " +
            new Date().toLocaleString(),
          scheduledAt: testTime.toISOString(),
          platforms: ["twitter"],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Test post scheduled successfully!");
      console.log("Response:", JSON.stringify(scheduleResponse.data, null, 2));
    } catch (scheduleError) {
      console.error("❌ Scheduling failed:");
      console.error("Status:", scheduleError.response?.status);
      console.error("Data:", scheduleError.response?.data);
    }

    // Step 8: Final verification
    console.log("\n8️⃣ Final verification - checking scheduled posts again...");
    const { data: finalPosts } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("userId", userId)
      .eq("status", "PENDING")
      .gte("scheduledTime", new Date().toISOString())
      .order("scheduledTime", { ascending: true });

    console.log(`📋 Found ${finalPosts?.length || 0} pending scheduled posts:`);
    finalPosts?.forEach((post, index) => {
      console.log(
        `   ${index + 1}. "${post.content}" - ${new Date(
          post.scheduledTime
        ).toLocaleString()}`
      );
    });

    console.log("\n🎉 DIAGNOSIS COMPLETE!");
    console.log("Frontend: http://localhost:3000/calendar");
    console.log(
      "The scheduled posting service should pick up posts automatically."
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during diagnosis:", error.message);
    process.exit(1);
  }
}

diagnoseTweetIssues();
