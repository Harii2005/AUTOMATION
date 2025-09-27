const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function createTwitterForTestUser() {
  try {
    console.log("Creating Twitter account for testuser...");

    const testUserId = "7be82341-99d4-485d-a03f-b12f445160f2";

    const { data: newAccount, error } = await supabase
      .from("social_accounts")
      .insert({
        userId: testUserId,
        platform: "TWITTER", // Use uppercase to match database constraint
        accountId: "1902337434228346880", // Twitter account ID
        accountName: "Harii_2005",
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        refreshToken: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        isActive: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating Twitter account:", error);
    } else {
      console.log(
        "✅ Successfully created Twitter account for testuser:",
        newAccount
      );
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

createTwitterForTestUser();
