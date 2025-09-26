const { supabase } = require("./src/utils/database");
require("dotenv").config();

async function checkDatabase() {
  console.log("🔍 Checking database structure...\n");

  try {
    // Check if social_accounts table exists and has data
    console.log("1. Checking social_accounts table:");
    const { data: socialAccounts, error: socialError } = await supabase
      .from("social_accounts")
      .select("*")
      .limit(5);

    if (socialError) {
      console.log("❌ Error:", socialError.message);
    } else {
      console.log(`✅ Found ${socialAccounts.length} social accounts`);
      if (socialAccounts.length > 0) {
        console.log("   Sample columns:", Object.keys(socialAccounts[0]));
      }
    }

    // Check if scheduled_posts table exists
    console.log("\n2. Checking scheduled_posts table:");
    const { data: scheduledPosts, error: postsError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .limit(5);

    if (postsError) {
      console.log("❌ Error:", postsError.message);
      console.log(
        "   This table might not exist or have different column names"
      );
    } else {
      console.log(`✅ Found ${scheduledPosts.length} scheduled posts`);
      if (scheduledPosts.length > 0) {
        console.log("   Sample columns:", Object.keys(scheduledPosts[0]));
      }
    }

    // Check users table
    console.log("\n3. Checking users table:");
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, username")
      .limit(3);

    if (usersError) {
      console.log("❌ Error:", usersError.message);
    } else {
      console.log(`✅ Found ${users.length} users`);
    }
  } catch (error) {
    console.error("❌ Database check failed:", error.message);
  }
}

checkDatabase();
