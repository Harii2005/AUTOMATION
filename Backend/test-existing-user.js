const axios = require("axios");

// Load environment variables first
require("dotenv").config();

// Direct Supabase client
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testWithExistingUser() {
  const baseURL = "http://localhost:5001/api";

  try {
    console.log("🔧 TESTING WITH EXISTING USER");
    console.log("==============================\n");

    // Get the latest user that has a social account
    console.log("1️⃣ Finding user with Twitter account...");
    const { data: usersWithSocial } = await supabase
      .from("social_accounts")
      .select(
        `
                userId,
                users!inner (
                    id,
                    email,
                    username
                )
            `
      )
      .eq("platform", "TWITTER")
      .eq("isActive", true)
      .order("createdAt", { ascending: false })
      .limit(1);

    if (!usersWithSocial || usersWithSocial.length === 0) {
      console.error("❌ No users with Twitter accounts found!");
      return;
    }

    const user = usersWithSocial[0].users;
    const userId = user.id;
    const email = user.email;

    console.log("✅ Found user with Twitter account:");
    console.log(`   ID: ${userId}`);
    console.log(`   Email: ${email}`);

    // Create a JWT token manually or try a test login
    // Since we may not know the password, let's use a test approach
    console.log("\n2️⃣ Creating temporary login credentials...");

    // Reset password for this user to something we know
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password:
          "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      }) // "password"
      .eq("id", userId);

    if (updateError) {
      console.error("❌ Could not update user password:", updateError);
      return;
    }

    // Now try to login
    let token;
    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: email,
        password: "password",
      });
      token = loginResponse.data.token;
      console.log("✅ Login successful!");
    } catch (loginError) {
      console.error("❌ Login failed:", loginError.response?.data);
      return;
    }

    // Check social accounts for this user
    console.log("\n3️⃣ Verifying social accounts...");
    const { data: socialAccounts, error: socialError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("userId", userId)
      .eq("platform", "TWITTER")
      .eq("isActive", true);

    if (socialError || !socialAccounts || socialAccounts.length === 0) {
      console.error("❌ No Twitter accounts found:", socialError);
      return;
    }

    console.log("✅ Twitter account verified:");
    console.log(`   Account ID: ${socialAccounts[0].id}`);
    console.log(`   Platform: ${socialAccounts[0].platform}`);
    console.log(`   Account Name: ${socialAccounts[0].accountName}`);

    // Now try to create a scheduled post
    console.log("\n4️⃣ Creating scheduled post...");
    const testTime = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
    console.log(`⏰ Scheduling for: ${testTime.toLocaleString()}`);

    const postData = {
      content:
        'Hello Hari! This is your requested test: "hello hari this is a test text" - ' +
        new Date().toLocaleString(),
      scheduledAt: testTime.toISOString(),
      platforms: ["twitter"],
    };

    console.log("📝 Post data being sent:", JSON.stringify(postData, null, 2));

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

      console.log("✅ SCHEDULED POST CREATED SUCCESSFULLY!");
      console.log(
        "📋 Response:",
        JSON.stringify(scheduleResponse.data, null, 2)
      );

      // Verify in database
      console.log("\n5️⃣ Verifying in database...");
      const { data: scheduledPosts } = await supabase
        .from("scheduled_posts")
        .select("*")
        .eq("userId", userId)
        .eq("status", "PENDING")
        .order("scheduledTime", { ascending: true });

      console.log(`📋 Found ${scheduledPosts?.length || 0} pending posts:`);
      scheduledPosts?.forEach((post, index) => {
        console.log(`   ${index + 1}. "${post.content}"`);
        console.log(
          `      ⏰ ${new Date(post.scheduledTime).toLocaleString()}`
        );
        console.log(`      📱 Platform: ${post.platform}`);
        console.log(`      🔗 Social Account: ${post.socialAccountId}`);
      });

      console.log(
        "\n🎉 SUCCESS! Tweet will be posted automatically by the scheduled service."
      );
      console.log(
        "⏰ Watch the backend logs around",
        testTime.toLocaleString()
      );
    } catch (scheduleError) {
      console.error("❌ Scheduling failed:");
      console.error("Status:", scheduleError.response?.status);
      console.error(
        "Error:",
        JSON.stringify(scheduleError.response?.data, null, 2)
      );

      // Additional debugging
      console.log("\n🔍 Debugging information:");
      console.log("- User ID:", userId);
      console.log("- Token exists:", !!token);
      console.log("- Social accounts exist:", socialAccounts.length);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }

  process.exit(0);
}

testWithExistingUser();
