const express = require('express');
const { supabase } = require("./src/utils/database");
const { authMiddleware } = require("./src/middleware/auth");

// Test the Twitter connection endpoint
async function testTwitterConnection() {
  // Simulate the request object
  const mockReq = {
    user: {
      userId: 'edade439-a996-4938-8b98-f52a303cff85' // User 'hariiii' who doesn't have Twitter connected yet
    }
  };

  console.log('🔗 Testing Twitter connection for user:', mockReq.user.userId);

  try {
    // Check if Twitter credentials are configured
    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_ACCESS_TOKEN) {
      console.log("❌ Twitter API credentials not configured");
      return;
    }

    console.log("✅ Twitter credentials are configured");

    // Check if account already exists (this is the logic from the route)
    const { data: existingAccount, error: checkError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("userId", mockReq.user.userId)
      .eq("platform", "TWITTER")
      .single();

    console.log('Existing account check:', { data: existingAccount, error: checkError });

    if (!existingAccount) {
      console.log("🔗 No existing account found, would create new one");
      
      // This would normally get user info from Twitter API, but let's simulate
      const mockUserInfo = {
        id: "mock_twitter_id_" + Date.now(),
        username: "mock_twitter_user"
      };

      // Create new account (simulated)
      const { data: newAccount, error: insertError } = await supabase
        .from("social_accounts")
        .insert({
          userId: mockReq.user.userId,
          platform: "TWITTER",
          accountId: mockUserInfo.id,
          accountName: mockUserInfo.username,
          accessToken: "mock-encrypted-token",
          isActive: true,
        })
        .select()
        .single();

      console.log('New account creation:', { data: newAccount, error: insertError });
      
      if (!insertError) {
        console.log("✅ Twitter account connected successfully!");
      }
    } else {
      console.log("ℹ️ Account already exists, would update it");
    }

  } catch (error) {
    console.error("💥 Error in Twitter connection test:", error);
  }
}

testTwitterConnection();