const { supabase } = require("./src/utils/database");

async function testSchedulePost() {
  // Use the first user who has a Twitter account connected
  const testUserId = 'd086a4b5-a126-4d04-820f-94f02c81e098'; // This is the 'hari' user
  const platforms = ['twitter'];

  try {
    console.log(`🔍 Testing schedule post for user ${testUserId}`);
    console.log(`Platforms requested: ${platforms.join(', ')}`);

    // Step 1: Get all connected social accounts for the user (like in the actual code)
    console.log('\n📋 Step 1: Fetching social accounts for defaults...');
    const { data: socialAccounts, error: accountsError } = await supabase
      .from("social_accounts")
      .select("platform")
      .eq("userId", testUserId)
      .eq("isActive", true);

    console.log('Social accounts query result:', { data: socialAccounts, error: accountsError });

    if (accountsError) {
      console.error("❌ Error fetching social accounts:", accountsError);
      return;
    }

    console.log('Available platforms:', socialAccounts.map(account => account.platform.toLowerCase()));

    // Step 2: For each platform, get the social account
    console.log('\n📋 Step 2: Getting specific social account for each platform...');
    
    for (const platform of platforms) {
      console.log(`\n🔍 Looking for ${platform} account for user ${testUserId}`);
      
      const { data: socialAccount, error: socialError } = await supabase
        .from("social_accounts")
        .select("id, platform, accountName")
        .eq("userId", testUserId)
        .eq("platform", platform.toUpperCase())
        .eq("isActive", true)
        .single();

      console.log(`📊 Social account query result for ${platform}:`, {
        data: socialAccount,
        error: socialError,
      });

      if (socialError || !socialAccount) {
        console.warn(`❌ No connected ${platform} account found for user ${testUserId}`);
        console.log(`Error details:`, socialError);
      } else {
        console.log(`✅ Found ${platform} account:`, socialAccount);
      }
    }

  } catch (error) {
    console.error("💥 Unexpected error:", error);
  }
}

testSchedulePost();