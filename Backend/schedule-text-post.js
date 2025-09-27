const { supabase } = require('./src/utils/database');

/**
 * Schedule a text post for today at 1:30 AM
 */

async function scheduleTextPost() {
  console.log('📝 Scheduling text post for today at 1:30 AM');
  
  try {
    // Get the first user with a Twitter account
    const { data: users, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        social_accounts!inner (
          id,
          platform,
          accountName,
          isActive
        )
      `)
      .eq('social_accounts.platform', 'TWITTER')
      .eq('social_accounts.isActive', true)
      .limit(1);

    if (userError) {
      console.error('❌ Error fetching user:', userError);
      return;
    }

    if (!users || users.length === 0) {
      console.error('❌ No users with Twitter accounts found');
      return;
    }

    const user = users[0];
    const socialAccount = user.social_accounts[0];

    // Set scheduled time to today at 1:30 AM
    const today = new Date();
    const scheduledTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 1, 30, 0);
    
    // If 1:30 AM has already passed today, schedule for tomorrow
    if (scheduledTime < new Date()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    console.log(`👤 Using user: ${user.email}`);
    console.log(`🐦 Twitter account: ${socialAccount.accountName}`);
    console.log(`⏰ Scheduled time: ${scheduledTime.toISOString()}`);

    // Create the scheduled post
    const { data: post, error: postError } = await supabase
      .from('scheduled_posts')
      .insert({
        userId: user.id,
        socialAccountId: socialAccount.id,
        content: 'this is a test',
        scheduledTime: scheduledTime.toISOString(),
        status: 'PENDING',
        platform: 'TWITTER'
      })
      .select()
      .single();

    if (postError) {
      console.error('❌ Error creating scheduled post:', postError);
      return;
    }

    console.log('✅ Text post scheduled successfully!');
    console.log(`📝 Post ID: ${post.id}`);
    console.log(`📝 Content: "${post.content}"`);
    console.log(`📅 Scheduled for: ${scheduledTime.toLocaleString()}`);
    console.log(`📊 Status: ${post.status}`);

    // Check if the server is running to process the post
    const now = new Date();
    const timeUntilPost = scheduledTime.getTime() - now.getTime();
    const minutesUntil = Math.round(timeUntilPost / (1000 * 60));

    if (minutesUntil > 0) {
      console.log(`⏳ Post will be processed in approximately ${minutesUntil} minutes`);
      console.log(`💡 Make sure the server is running: node src/index.js`);
    } else {
      console.log(`🚀 Post is scheduled for immediate processing (past due)`);
    }

  } catch (error) {
    console.error('❌ Error scheduling text post:', error);
  }
}

// Run the function
scheduleTextPost();