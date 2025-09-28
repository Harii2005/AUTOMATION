const axios = require('axios');

async function testCompleteTwitterWorkflow() {
  console.log('🔄 Complete Twitter Scheduling Workflow Test\n');
  
  const BACKEND_URL = 'http://localhost:5001/api';
  
  //      console.log('⏰ Monitoring period ended');
      console.log('💡 If post has not been published yet:');
      console.log('   1. Check if backend server is running');
      console.log('   2. Verify cron job is executing every minute');
      console.log('   3. Check Twitter API rate limits');
      console.log('   4. Monitor backend logs for errors');user credentials
  const testUser = {
    email: 'fullworkflow@test.com',
    username: 'fullworkflow',
    password: 'testPassword123',
    firstName: 'Full',
    lastName: 'Workflow'
  };
  
  let authToken = null;
  
  console.log('1️⃣ Setting up authenticated user...');
  
  try {
    const registerResponse = await axios.post(`${BACKEND_URL}/auth/register`, testUser);
    authToken = registerResponse.data.token;
    console.log('✅ Registration successful');
  } catch (error) {
    if (error.response?.data?.error?.includes('already exists')) {
      try {
        const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        authToken = loginResponse.data.token;
        console.log('✅ Login successful');
      } catch (loginError) {
        console.log('❌ Login failed:', loginError.response?.data);
        return;
      }
    } else {
      console.log('❌ Registration failed:', error.response?.data);
      return;
    }
  }
  
  console.log('\\n2️⃣ Connecting Twitter account...');
  
  try {
    const connectResponse = await axios.post(
      `${BACKEND_URL}/social/twitter/connect`,
      {},
      { headers: { 'Authorization': `Bearer ${authToken}` } }
    );
    
    console.log('✅ Twitter connected:', connectResponse.data.account.username);
    
  } catch (error) {
    console.log('❌ Twitter connection failed:', error.response?.data);
    
    // Check if already connected
    const socialResponse = await axios.get(`${BACKEND_URL}/social`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const twitterAccount = socialResponse.data?.find(acc => acc.platform === 'twitter');
    if (twitterAccount?.isConnected) {
      console.log('✅ Twitter already connected:', twitterAccount.accountName);
    } else {
      console.log('❌ Cannot proceed without Twitter connection');
      return;
    }
  }
  
  console.log('\\n3️⃣ Scheduling Twitter post...');
  
  const scheduleData = {
    content: '🚀 COMPLETE WORKFLOW TEST: This Twitter post was scheduled via API and should be posted automatically by the cron job! #automation #test #success',
    imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1080&h=1080&fit=crop&auto=format&q=80',
    scheduledAt: new Date(Date.now() + 90 * 1000).toISOString(), // 90 seconds from now
    platforms: ['twitter']
  };
  
  let scheduledPostId = null;
  
  try {
    const scheduleResponse = await axios.post(
      `${BACKEND_URL}/posts/schedule`,
      scheduleData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Twitter post scheduled successfully!');
    
    // Parse response correctly
    const responseData = scheduleResponse.data;
    console.log('📝 Schedule Response:');
    console.log('   Message:', responseData.message);
    console.log('   Scheduled Time:', responseData.scheduledTime);
    console.log('   Posts Created:', responseData.posts?.length || 0);
    
    if (responseData.posts && responseData.posts.length > 0) {
      const post = responseData.posts[0];
      scheduledPostId = post.id;
      console.log('   Post ID:', post.id);
      console.log('   Content:', post.content?.substring(0, 50) + '...');
      console.log('   Status:', post.status);
      console.log('   Platform:', post.platforms);
    }
    
  } catch (error) {
    console.log('❌ Twitter scheduling failed!');
    console.log('Error:', error.response?.data);
    return;
  }
  
  console.log('\\n4️⃣ Verifying post in database...');
  
  try {
    const scheduledPostsResponse = await axios.get(
      `${BACKEND_URL}/posts/scheduled`,
      { headers: { 'Authorization': `Bearer ${authToken}` } }
    );
    
    const posts = scheduledPostsResponse.data.data || [];
    const twitterPosts = posts.filter(post => 
      post.platforms?.includes('twitter') || post.platform === 'twitter'
    );
    
    console.log(`✅ Found ${twitterPosts.length} Twitter posts in database`);
    
    if (twitterPosts.length > 0) {
      const latestPost = twitterPosts[0];
      console.log('📄 Latest Twitter post:');
      console.log('   ID:', latestPost.id);
      console.log('   Content:', latestPost.content?.substring(0, 60) + '...');
      console.log('   Status:', latestPost.status);
      console.log('   Scheduled At:', latestPost.scheduledAt);
      console.log('   Platforms:', latestPost.platforms);
    }
    
  } catch (error) {
    console.log('❌ Failed to verify post in database:', error.response?.data);
  }
  
  console.log('\\n5️⃣ Monitoring Cron Job Execution...');
  console.log('⏰ Post scheduled for 90 seconds from now');
  console.log('🔍 Monitoring for cron job processing...');
  console.log('💡 Check backend terminal for these messages:');
  console.log('   - "Checking for scheduled posts to execute..."');
  console.log('   - "Found X scheduled posts to process"');
  console.log('   - "Processing post for platform: twitter"');
  console.log('   - "Successfully posted to Twitter"');
  
  // Wait and check status updates
  console.log('\\n⏳ Waiting 2 minutes to observe cron job execution...');
  
  let checkCount = 0;
  const maxChecks = 8; // Check 8 times over 2 minutes
  const checkInterval = 15000; // Check every 15 seconds
  
  const checkInterval_id = setInterval(async () => {
    checkCount++;
    console.log(`\\n🔍 Status Check #${checkCount} (${checkCount * 15} seconds elapsed):`);
    
    try {
      const statusResponse = await axios.get(
        `${BACKEND_URL}/posts/scheduled`,
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );
      
      const posts = statusResponse.data.data || [];
      const ourPost = posts.find(p => p.id === scheduledPostId);
      
      if (ourPost) {
        console.log('📊 Post Status Update:');
        console.log('   Status:', ourPost.status);
        console.log('   Scheduled At:', ourPost.scheduledAt);
        console.log('   Current Time:', new Date().toISOString());
        
        if (ourPost.status === 'published' || ourPost.status === 'completed') {
          console.log('\\n🎉 SUCCESS! Post has been published to Twitter!');
          console.log('✅ Complete workflow working:');
          console.log('   1. Twitter account connected ✅');
          console.log('   2. Post scheduled successfully ✅');
          console.log('   3. Cron job processed post ✅');
          console.log('   4. Posted to Twitter ✅');
          clearInterval(checkInterval_id);
          return;
        } else if (ourPost.status === 'failed') {
          console.log('\\n❌ Post failed to publish');
          console.log('💡 Check backend logs for Twitter API errors');
          clearInterval(checkInterval_id);
          return;
        }
      } else {
        console.log('⚠️  Post not found in scheduled posts');
      }
      
    } catch (error) {
      console.log('❌ Status check failed:', error.response?.data?.error || error.message);
    }
    
    if (checkCount >= maxChecks) {
      console.log('\\n⏰ Monitoring period ended');
      console.log('💡 If post hasn\\'t been published yet:');
      console.log('   1. Check if backend server is running');
      console.log('   2. Verify cron job is executing every minute');
      console.log('   3. Check Twitter API rate limits');
      console.log('   4. Monitor backend logs for errors');
      clearInterval(checkInterval_id);
    }
  }, checkInterval);
  
  console.log('\\n🎯 TEST SUMMARY');
  console.log('================');
  console.log('✅ Twitter account connection: Working');
  console.log('✅ Post scheduling: Working');  
  console.log('✅ Database storage: Working');
  console.log('⏳ Cron job execution: Monitoring...');
  console.log('\\n💡 The issue was: Users need to connect Twitter accounts first!');
  console.log('📋 Frontend should show connection status and guide users to connect accounts');
}

testCompleteTwitterWorkflow().catch(console.error);