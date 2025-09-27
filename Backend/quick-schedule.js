const axios = require("axios");

// Load environment variables
require("dotenv").config();

// Direct Supabase client without importing server modules
const { createClient } = require("@supabase/supabase-js");

async function quickScheduleTest() {
  console.log("🚀 QUICK SCHEDULE TEST");
  console.log("=====================\n");

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  const baseURL = "http://localhost:5001/api";

  try {
    // Step 1: Use the known working user ID from terminal logs
    const userId = "586b7362-fe6c-4d15-93af-06d146aa940a";
    console.log("1️⃣ Using known user ID:", userId);

    // Step 2: First, ensure the user has a "password" password
    const bcrypt = require("bcryptjs");
    const hashedPassword = bcrypt.hashSync("password", 10);

    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", userId);

    if (updateError) {
      console.error("❌ Password update error:", updateError);
    }

    // Step 3: Get user email for login
    const { data: userData } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    if (!userData) {
      console.error("❌ User not found");
      return;
    }

    console.log("📧 User email:", userData.email);

    // Step 4: Login to get token
    console.log("\n2️⃣ Logging in...");
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: userData.email,
      password: "password",
    });

    const token = loginResponse.data.token;
    console.log("✅ Login successful!");

    // Step 5: Verify social account exists
    console.log("\n3️⃣ Checking social account...");
    const { data: socialAccount } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("userId", userId)
      .eq("platform", "TWITTER")
      .eq("isActive", true)
      .single();

    if (!socialAccount) {
      console.error("❌ No Twitter account found for user");
      return;
    }

    console.log("✅ Social account found:", socialAccount.accountName);

    // Step 6: Create scheduled post
    console.log("\n4️⃣ Creating scheduled post...");
    const futureTime = new Date(Date.now() + 90 * 1000); // 90 seconds from now
    console.log("⏰ Scheduled for:", futureTime.toLocaleString());

    const postPayload = {
      content: "hello hari this is a test text",
      scheduledAt: futureTime.toISOString(),
      platforms: ["twitter"],
    };

    const scheduleResponse = await axios.post(
      `${baseURL}/posts/schedule`,
      postPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ SCHEDULED POST CREATED!");
    console.log("Response:", scheduleResponse.data);

    // Step 7: Verify in database
    const { data: posts } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("userId", userId)
      .eq("status", "PENDING")
      .order("scheduledTime", { ascending: false })
      .limit(1);

    if (posts && posts.length > 0) {
      const post = posts[0];
      console.log("\n✅ Verified in database:");
      console.log(`   Content: "${post.content}"`);
      console.log(`   Time: ${new Date(post.scheduledTime).toLocaleString()}`);
      console.log(`   Platform: ${post.platform}`);
      console.log(`   Status: ${post.status}`);

      console.log("\n🎯 SUCCESS! The tweet should be posted automatically.");
      console.log(
        "⏰ Watch the backend terminal around:",
        futureTime.toLocaleString()
      );
    }
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

quickScheduleTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
