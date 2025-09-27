const { supabase } = require('./src/utils/database');
const ScheduledPostingService = require('./src/services/scheduledPostingService');

/**
 * Manual test of the posting functionality
 */

async function testPostingDirectly() {
  console.log('🧪 Testing automatic posting functionality...');
  
  try {
    // Get the text post
    const { data: posts, error: findError } = await supabase
      .from('scheduled_posts')
      .select(`
        *,
        social_accounts (
          accessToken,
          refreshToken,
          platform
        )
      `)
      .eq('content', 'this is a test')
      .eq('status', 'PENDING')
      .limit(1);

    if (findError) {
      console.error('❌ Error finding post:', findError);
      return;
    }

    if (!posts || posts.length === 0) {
      console.error('❌ No pending text post found');
      return;
    }

    const post = posts[0];
    console.log(`📝 Found post: ${post.id}`);
    console.log(`📝 Content: "${post.content}"`);
    console.log(`📝 Platform: ${post.platform}`);

    // Create a posting service instance
    const service = new ScheduledPostingService();
    
    console.log('🚀 Attempting to post directly...');
    
    // Process the post directly
    await service.processScheduledPost(post);
    
    console.log('✅ Direct posting test completed!');
    
    // Check the updated status
    const { data: updatedPost, error: statusError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('id', post.id)
      .single();

    if (statusError) {
      console.error('❌ Error checking updated status:', statusError);
    } else {
      console.log(`📊 Updated status: ${updatedPost.status}`);
      if (updatedPost.error) {
        console.log(`⚠️ Error details: ${updatedPost.error}`);
      }
      if (updatedPost.platformPostId) {
        console.log(`🔗 Platform post ID: ${updatedPost.platformPostId}`);
      }
    }

  } catch (error) {
    console.error('❌ Error in direct posting test:', error);
  }
}

// Run the test
testPostingDirectly();