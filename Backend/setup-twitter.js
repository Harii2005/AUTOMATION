const { supabase } = require("./src/utils/database");

async function setupTwitterAccount() {
  try {
    // First, let's check if there are any users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(1);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log("No users found. Please register a user first.");
      return;
    }

    const user = users[0];
    console.log("Using user:", user.email);

    // Check if Twitter account already exists
    const { data: existingAccount, error: existingError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("userId", user.id)
      .eq("platform", "TWITTER")
      .single();

    if (existingAccount && !existingError) {
      console.log("Twitter account already exists for this user");
      console.log("Account details:", existingAccount);
      return;
    }

    // Create a Twitter social account entry
    const { data: socialAccount, error: socialError } = await supabase
      .from("social_accounts")
      .insert({
        userId: user.id,
        platform: "TWITTER",
        accountId: "test_twitter_account",
        username: "test_user",
        displayName: "Test User",
        accessToken: "dummy_access_token", // This will use global tokens anyway
        refreshToken: "dummy_refresh_token",
        expiresAt: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 year from now
        isActive: true,
      })
      .select()
      .single();

    if (socialError) {
      console.error("Error creating social account:", socialError);
      return;
    }

    console.log("✅ Twitter social account created successfully!");
    console.log("Account ID:", socialAccount.id);
    console.log("User ID:", socialAccount.userId);
    console.log("Platform:", socialAccount.platform);

    // Test creating a scheduled post
    const { data: scheduledPost, error: postError } = await supabase
      .from("scheduled_posts")
      .insert({
        userId: user.id,
        socialAccountId: socialAccount.id,
        content: "hello hari this is a test text",
        scheduledTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutes from now
        status: "PENDING",
        postType: "STANDARD",
        platforms: ["twitter"],
      })
      .select()
      .single();

    if (postError) {
      console.error("Error creating scheduled post:", postError);
      return;
    }

    console.log("✅ Test scheduled post created!");
    console.log("Post ID:", scheduledPost.id);
    console.log("Content:", scheduledPost.content);
    console.log("Scheduled for:", scheduledPost.scheduledTime);
  } catch (error) {
    console.error("Setup error:", error);
  }
}

setupTwitterAccount();
