const { supabase } = require('./src/utils/database');

/**
 * Check the status of scheduled posts
 */

async function checkScheduledPosts() {
  console.log('🔍 Checking scheduled posts...');
  
  try {
    const now = new Date();
    console.log(`⏰ Current time: ${now.toISOString()}`);

    // Get all scheduled posts
    const { data: allPosts, error: allError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .order('scheduledTime', { ascending: true });

    if (allError) {
      console.error('❌ Error fetching all posts:', allError);
      return;
    }

    console.log(`📊 Total scheduled posts: ${allPosts?.length || 0}`);

    if (allPosts && allPosts.length > 0) {
      console.log('\n📝 All scheduled posts:');
      allPosts.forEach((post, index) => {
        const scheduledTime = new Date(post.scheduledTime);
        const isPastDue = scheduledTime <= now;
        console.log(`  ${index + 1}. ID: ${post.id.substring(0, 8)}...`);
        console.log(`     Content: "${post.content}"`);
        console.log(`     Status: ${post.status}`);
        console.log(`     Platform: ${post.platform}`);
        console.log(`     Scheduled: ${scheduledTime.toLocaleString()}`);
        console.log(`     ${isPastDue ? '🔴 PAST DUE' : '🟡 FUTURE'}`);
        console.log('');
      });
    }

    // Get posts that should be processed now
    const { data: duePosts, error: dueError } = await supabase
      .from('scheduled_posts')
      .select(`
        *,
        social_accounts (
          accessToken,
          refreshToken,
          platform
        )
      `)
      .eq('status', 'PENDING')
      .lte('scheduledTime', now.toISOString())
      .order('scheduledTime', { ascending: true });

    if (dueError) {
      console.error('❌ Error fetching due posts:', dueError);
      return;
    }

    console.log(`🚀 Posts ready for processing: ${duePosts?.length || 0}`);

    if (duePosts && duePosts.length > 0) {
      console.log('\n📤 Posts ready to be processed:');
      duePosts.forEach((post, index) => {
        console.log(`  ${index + 1}. "${post.content}" (${post.platform})`);
        console.log(`     Scheduled: ${new Date(post.scheduledTime).toLocaleString()}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking scheduled posts:', error);
  }
}

// Run the function
checkScheduledPosts();