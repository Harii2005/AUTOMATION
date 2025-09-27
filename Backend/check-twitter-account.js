const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkTwitterAccount() {
  try {
    console.log("Checking all social accounts...");

    // Get all social accounts
    const { data: accounts, error } = await supabase
      .from("social_accounts")
      .select("*");

    if (error) {
      console.error("Error:", error);
      return;
    }

    console.log("All social accounts:");
    console.table(accounts);

    // Find Twitter specifically
    const twitterAccounts = accounts.filter(
      (acc) => acc.platform === "twitter"
    );
    console.log("Twitter accounts found:", twitterAccounts.length);

    if (twitterAccounts.length > 0) {
      console.log("Twitter accounts:");
      console.table(twitterAccounts);
    } else {
      console.log("❌ No Twitter accounts found");

      // Check if the existing account is actually Twitter but with wrong case
      const twitterUppercase = accounts.filter(
        (acc) => acc.platform === "TWITTER"
      );
      if (twitterUppercase.length > 0) {
        console.log(
          "Found Twitter account with uppercase platform name, fixing..."
        );
        const { data: updatedAccount, error: updateError } = await supabase
          .from("social_accounts")
          .update({ platform: "twitter" })
          .eq("id", twitterUppercase[0].id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating Twitter account:", updateError);
        } else {
          console.log(
            "✅ Fixed Twitter account platform case:",
            updatedAccount
          );
        }
      } else {
        console.log("No Twitter account found to fix");
      }

      if (createError) {
        console.error("Error creating Twitter account:", createError);
      } else {
        console.log("✅ Created Twitter account:", newAccount);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkTwitterAccount();
