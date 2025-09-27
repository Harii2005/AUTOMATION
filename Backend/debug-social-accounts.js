const { supabase } = require("./src/utils/database");

async function debugSocialAccountQuery() {
  try {
    const userId = "7be82341-99d4-485d-a03f-b12f445160f2";
    const platform = "twitter"; // lowercase as received from frontend

    console.log("🔍 Debug: Testing social account queries...");
    console.log("User ID:", userId);
    console.log("Platform (lowercase):", platform);
    console.log("Platform (uppercase):", platform.toUpperCase());

    // Test 1: Get all social accounts for user
    console.log("\n1. Getting all social accounts for user:");
    const { data: allAccounts, error: allError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("userId", userId);

    if (allError) {
      console.error("Error:", allError);
    } else {
      console.log("All social accounts:", allAccounts);
    }

    // Test 2: Get specific platform account
    console.log("\n2. Getting specific platform account (uppercase):");
    const { data: platformAccount, error: platformError } = await supabase
      .from("social_accounts")
      .select("id, platform, accountName, isActive")
      .eq("userId", userId)
      .eq("platform", platform.toUpperCase())
      .eq("isActive", true)
      .single();

    if (platformError) {
      console.error("Error:", platformError);
    } else {
      console.log("Platform account:", platformAccount);
    }

    // Test 3: Get active accounts
    console.log("\n3. Getting all active social accounts:");
    const { data: activeAccounts, error: activeError } = await supabase
      .from("social_accounts")
      .select("platform")
      .eq("userId", userId)
      .eq("isActive", true);

    if (activeError) {
      console.error("Error:", activeError);
    } else {
      console.log("Active accounts:", activeAccounts);
      console.log(
        "Target platforms would be:",
        activeAccounts.map((acc) => acc.platform.toLowerCase())
      );
    }
  } catch (error) {
    console.error("General error:", error);
  }
}

debugSocialAccountQuery();
