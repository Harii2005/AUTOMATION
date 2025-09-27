const { supabase } = require('./src/utils/database');

async function createTestSocialAccount() {
  try {
    console.log('🔧 Creating test social account...');
    
    // Get the test user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'test@example.com')
      .single();
    
    if (userError || !user) {
      console.error('Test user not found:', userError);
      return;
    }
    
    console.log('Found test user:', user.id);
    
    // Check if social account already exists
    const { data: existingSocial } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('userId', user.id)
      .eq('platform', 'TWITTER');
    
    if (existingSocial && existingSocial.length > 0) {
      console.log('Twitter account already exists for test user');
      console.log('Social account:', existingSocial[0]);
      return;
    }
    
    // Create a test social account
    const { data: socialAccount, error: socialError } = await supabase
      .from('social_accounts')
      .insert({
        userId: user.id,
        platform: 'TWITTER',
        accountId: 'test_twitter_account_id',
        accountName: 'TestUser',
        accessToken: 'test_access_token', // In real app, this would be encrypted
        refreshToken: 'test_refresh_token',
        tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true
      })
      .select()
      .single();
    
    if (socialError) {
      console.error('Error creating social account:', socialError);
      return;
    }
    
    console.log('✅ Social account created successfully:', socialAccount);
    
    // Now test creating a scheduled post
    console.log('\n📝 Testing post creation...');
    
    const { data: scheduledPost, error: postError } = await supabase
      .from('scheduled_posts')
      .insert({
        userId: user.id,
        socialAccountId: socialAccount.id,
        content: 'Test calendar post from debug script',
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        status: 'PENDING',
        platform: 'TWITTER',
        maxRetries: 3,
        useUserTokens: true,
        fallbackToGlobal: true,
        postType: 'STANDARD'
      })
      .select()
      .single();
    
    if (postError) {
      console.error('Error creating scheduled post:', postError);
      return;
    }
    
    console.log('✅ Test scheduled post created:', scheduledPost);
    
  } catch (error) {
    console.error('General error:', error);
  }
}

createTestSocialAccount();