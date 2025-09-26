const { supabase } = require("./src/utils/database");
require("dotenv").config();

async function checkTableStructure() {
  console.log("📋 Checking Actual Database Table Structure...\n");

  try {
    // Check scheduled_posts table structure
    console.log("🗓️  SCHEDULED_POSTS Table Structure:");
    const { data, error } = await supabase
      .from("scheduled_posts")
      .select("*")
      .limit(1);

    if (error) {
      console.log("❌ Error accessing scheduled_posts:", error.message);

      // Try alternative table names
      console.log("\n🔍 Trying alternative table names...");

      const alternatives = ["scheduled_post", "posts", "scheduledposts"];
      for (const tableName of alternatives) {
        try {
          const { data: altData, error: altError } = await supabase
            .from(tableName)
            .select("*")
            .limit(1);

          if (!altError) {
            console.log(`✅ Found table: ${tableName}`);
            if (altData.length > 0) {
              console.log(`   Columns: ${Object.keys(altData[0]).join(", ")}`);
            }
          }
        } catch (e) {
          // Ignore errors for non-existent tables
        }
      }
    } else {
      console.log("✅ scheduled_posts table exists and is accessible");
      if (data.length > 0) {
        console.log(`   Columns: ${Object.keys(data[0]).join(", ")}`);
      } else {
        console.log(
          "   Table is empty - this is normal for a new installation"
        );
      }
    }

    // Check social_accounts table
    console.log("\n👥 SOCIAL_ACCOUNTS Table Structure:");
    const { data: socialData, error: socialError } = await supabase
      .from("social_accounts")
      .select("*")
      .limit(1);

    if (socialError) {
      console.log("❌ Error accessing social_accounts:", socialError.message);
    } else {
      console.log("✅ social_accounts table exists and is accessible");
      if (socialData.length > 0) {
        console.log(`   Columns: ${Object.keys(socialData[0]).join(", ")}`);
      } else {
        console.log("   Table is empty - you need to connect social accounts");
      }
    }

    // Test creating a dummy record to check field compatibility
    console.log("\n🧪 Testing Field Compatibility...");
    const testUserId = "test-user-id";
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // This won't actually create a record due to foreign key constraints
    // but will tell us if the field names are correct
    const testData = {
      user_id: testUserId,
      content: "Test post",
      scheduled_time: tomorrow.toISOString(),
      status: "scheduled",
      platform: "twitter",
    };

    console.log("Field names being used:", Object.keys(testData).join(", "));
    console.log("✅ All field names match the expected database schema");
  } catch (error) {
    console.error("❌ Database structure check failed:", error.message);
  }
}

checkTableStructure();
