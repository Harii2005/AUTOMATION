const { supabase } = require('./src/utils/database');

/**
 * Simple script to schedule the image post
 */

async function schedulePost() {
  try {
    console.log('🎯 Scheduling Image Post');
    console.log('========================\n');

    // Get user with Twitter account
    const { data: users } = await supabase
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

    if (!users || users.length === 0) {
      console.log('❌ No Twitter account found');
      return;
    }

    const user = users[0];
    console.log(`👤 User: ${user.email}`);
    console.log(`🐦 Account: ${user.social_accounts[0].accountName}\n`);

    // Schedule for 2 minutes from now for testing
    const scheduledTime = new Date(Date.now() + 2 * 60 * 1000);
    console.log(`⏰ Scheduling for: ${scheduledTime.toLocaleString()}\n`);

    // Post content about the study notes
    const content = `📚 Study notes on Bézier curves and computer graphics! 

Key concepts covered:
• Identifying splines for closer specification of tangent vectors
• Tangent control for steering curve direction  
• Control points defining curve shape
• Applications in computer graphics and animation

Perfect reference material! 🎨

#ComputerGraphics #BezierCurves #StudyNotes #Programming #Mathematics`;

    // Note: For a real implementation, you'd upload the image to cloud storage first
    // Using a placeholder URL here - in production you'd have the actual image URL
    const mediaUrl = 'https://via.placeholder.com/800x600/f0f0f0/333333?text=Study+Notes';

    // Create scheduled post (using existing schema fields)
    const { data: post, error } = await supabase
      .from('scheduled_posts')
      .insert({
        userId: user.id,
        socialAccountId: user.social_accounts[0].id,
        content: content,
        mediaUrl: mediaUrl,
        mediaType: 'IMAGE',
        scheduledTime: scheduledTime.toISOString(),
        status: 'PENDING',
        platform: 'TWITTER'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Post scheduled successfully!');
    console.log(`📝 Post ID: ${post.id}`);
    console.log(`📅 Will be posted at: ${scheduledTime.toLocaleString()}`);
    console.log(`📄 Content length: ${content.length} characters`);
    console.log(`🖼️  Has media: Yes (${mediaUrl})`);
    
    console.log('\n🚀 Watch the server logs to see it get posted automatically!');
    console.log('💡 The automatic posting service checks every minute.');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

schedulePost();