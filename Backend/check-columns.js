const { supabase } = require("./src/utils/database");
require("dotenv").config();

async function checkActualTableStructure() {
  console.log("🔍 Checking Actual Database Table Columns...\n");

  try {
    // Get the actual structure by trying to insert with different field names
    console.log("📋 Testing social_accounts table columns...");

    // Try to get existing data to see column names
    const { data: existingData, error: selectError } = await supabase
      .from("social_accounts")
      .select("*")
      .limit(1);

    if (selectError) {
      console.log(
        "❌ Error selecting from social_accounts:",
        selectError.message
      );
    } else {
      if (existingData.length > 0) {
        console.log(
          "✅ Existing social_accounts columns:",
          Object.keys(existingData[0])
        );
      } else {
        console.log("Table exists but is empty. Let me check the schema...");
      }
    }

    // Let's check what columns exist by trying different insert patterns
    const testData = {
      user_id: "test-user",
      platform: "twitter",
      platform_user_id: "123456789",
      username: "test_user",
      access_token: "test-token", // Try access_token instead of encrypted_token
      is_connected: true,
    };

    console.log("\n🧪 Testing with access_token field...");
    const { data: testResult, error: testError } = await supabase
      .from("social_accounts")
      .insert(testData)
      .select();

    if (testError) {
      console.log("❌ Error with access_token:", testError.message);

      // Try with different field names
      const testData2 = {
        user_id: "test-user",
        platform: "twitter",
        platform_user_id: "123456789",
        username: "test_user",
        encrypted_token: "test-token", // Try encrypted_token
        is_connected: true,
      };

      console.log("\n🧪 Testing with encrypted_token field...");
      const { data: testResult2, error: testError2 } = await supabase
        .from("social_accounts")
        .insert(testData2)
        .select();

      if (testError2) {
        console.log("❌ Error with encrypted_token:", testError2.message);
      } else {
        console.log("✅ Success with encrypted_token field!");
        // Clean up test data
        await supabase
          .from("social_accounts")
          .delete()
          .eq("user_id", "test-user");
      }
    } else {
      console.log("✅ Success with access_token field!");
      // Clean up test data
      await supabase
        .from("social_accounts")
        .delete()
        .eq("user_id", "test-user");
    }

    // Check scheduled_posts table as well
    console.log("\n📋 Testing scheduled_posts table columns...");
    const { data: postsData, error: postsError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .limit(1);

    if (postsError) {
      console.log(
        "❌ Error selecting from scheduled_posts:",
        postsError.message
      );
    } else {
      if (postsData.length > 0) {
        console.log(
          "✅ Existing scheduled_posts columns:",
          Object.keys(postsData[0])
        );
      } else {
        console.log("Table exists but is empty.");
      }
    }
  } catch (error) {
    console.error("❌ Table structure check failed:", error.message);
  }
}

checkActualTableStructure();
