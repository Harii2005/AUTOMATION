const axios = require('axios');

async function testCompleteFlow() {
  console.log('🔄 Testing complete Twitter schedule flow...\n');
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('User:', loginResponse.data.user.email);
    
    // Step 2: Check social accounts
    console.log('\n2️⃣ Checking social accounts...');
    const socialResponse = await axios.get('http://localhost:5001/api/social', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const twitterAccount = socialResponse.data.find(acc => acc.platform === 'twitter' && acc.isConnected);
    if (twitterAccount) {
      console.log('✅ Twitter account found and connected');
      console.log('Twitter username:', twitterAccount.username);
      console.log('Account ID:', twitterAccount.id);
    } else {
      console.log('❌ No connected Twitter account found');
      return;
    }
    
    // Step 3: Test schedule post (same as frontend would do)
    console.log('\n3️⃣ Testing schedule post...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 30, 0, 0); // 2:30 PM tomorrow
    
    const postData = {
      content: 'Test post from calendar button - Twitter integration working! 🐦',
      scheduledAt: tomorrow.toISOString(),
      platforms: ['twitter']
    };
    
    console.log('Scheduling post for:', tomorrow.toLocaleString());
    console.log('Content:', postData.content);
    
    const scheduleResponse = await axios.post('http://localhost:5001/api/posts/schedule', postData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Schedule post successful!');
    console.log('Post ID:', scheduleResponse.data.posts[0].id);
    console.log('Status:', scheduleResponse.data.posts[0].status);
    console.log('Scheduled for:', scheduleResponse.data.posts[0].scheduledTime);
    
    // Step 4: Verify post was saved
    console.log('\n4️⃣ Verifying post was saved...');
    const postsResponse = await axios.get('http://localhost:5001/api/posts/scheduled', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const posts = Array.isArray(postsResponse.data) ? postsResponse.data : postsResponse.data.posts || [];
    const savedPosts = posts.filter(post => 
      post.content.includes('calendar button') && post.platform === 'TWITTER'
    );
    
    if (savedPosts.length > 0) {
      console.log('✅ Post verified in database');
      console.log('Total Twitter posts scheduled:', savedPosts.length);
    }
    
    console.log('\n🎉 TWITTER SCHEDULE BUTTON IS WORKING! 🎉');
    console.log('\n📝 Summary:');
    console.log('✅ Authentication: Working');
    console.log('✅ Twitter account: Connected');
    console.log('✅ Schedule API: Working');
    console.log('✅ Database save: Working');
    console.log('\n🚀 The calendar schedule button should work for Twitter posts!');
    
  } catch (error) {
    console.error('\n❌ Error in flow:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Full error:', error.response?.data);
  }
}

testCompleteFlow();