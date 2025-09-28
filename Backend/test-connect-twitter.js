const { supabase } = require("./src/utils/database");

async function testConnectTwitter() {
  // Test userId (you'll need to replace with actual user ID)
  const testUserId = "test-user-id"; 

  try {
    console.log("🔍 Checking existing social accounts...");
    
    // First, let's see what's in the social_accounts table
    const { data: allAccounts, error: allError } = await supabase
      .from("social_accounts")
      .select("*");
      
    console.log("All social accounts:", allAccounts);
    if (allError) console.error("Error fetching all accounts:", allError);

    // Now try to insert a test Twitter connection
    console.log("🔗 Attempting to create Twitter connection...");
    
    const { data: account, error } = await supabase
      .from("social_accounts")
      .insert({
        userId: testUserId,
        platform: "TWITTER",
        accountId: "test-twitter-id",
        accountName: "TestTwitterBot",
        accessToken: "encrypted-test-token",
        isActive: true,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating Twitter social account:", error);
      
      // Let's check what columns actually exist
      console.log("🔍 Let's check the table structure...");
      const { data: structure, error: structError } = await supabase.rpc('pg_get_serial_sequence', {
        table_name: 'social_accounts'
      }).catch(() => null);
      
      console.log("Table structure response:", structure, structError);
    } else {
      console.log("✅ Twitter account connected successfully:", account);
    }

  } catch (error) {
    console.error("💥 Unexpected error:", error);
  }
}

testConnectTwitter();