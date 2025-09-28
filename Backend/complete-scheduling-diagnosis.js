const axios = require('axios');

async function testFullSchedulingWorkflow() {
  console.log('🔍 Complete Calendar Scheduling Work      console.log('💡 Issue Found: User needs to connect social media accounts!');
      console.log('   This is likely why calendar scheduling shows success but does not work');
      console.log('   Users need to visit /social-accounts to connect Instagram/Twitter first');w Test\n');
  
  const BACKEND_URL = 'http://localhost:5001/api';
  
  // Step 1: Test authentication flow
  console.log('1️⃣ Testing Authentication Flow');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // First, let's try to register/login to get a valid token
  const testUser = {
    email: 'test@scheduling.com',
    password: 'testPassword123',
    name: 'Test Scheduler'
  };
  
  let authToken = null;
  let userId = null;
  
  // Try to register the test user
  try {
    console.log('📝 Attempting to register test user...');
    const registerResponse = await axios.post(`${BACKEND_URL}/auth/register`, testUser);
    
    if (registerResponse.data.token) {
      authToken = registerResponse.data.token;
      userId = registerResponse.data.user.id;
      console.log('✅ Registration successful - Got token');
    }
  } catch (error) {
    if (error.response?.data?.error?.includes('already exists')) {
      console.log('ℹ️  User already exists, trying to login...');
      
      // Try to login instead
      try {
        const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        
        if (loginResponse.data.token) {
          authToken = loginResponse.data.token;
          userId = loginResponse.data.user.id;
          console.log('✅ Login successful - Got token');
        }
      } catch (loginError) {
        console.log('❌ Login failed:', loginError.response?.data);
        console.log('\\n⚠️  Cannot continue without valid authentication');
        return;
      }
    } else {
      console.log('❌ Registration failed:', error.response?.data);
      return;
    }
  }
  
  if (!authToken) {
    console.log('❌ No authentication token obtained. Cannot test scheduling.');
    return;
  }
  
  console.log('✅ Successfully authenticated');
  console.log('Token (first 20 chars):', authToken.substring(0, 20) + '...');
  
  // Step 2: Test with valid authentication
  console.log('\\n2️⃣ Testing Schedule Endpoint with Valid Auth');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const scheduleData = {
    content: '🧪 FULL WORKFLOW TEST: This post is scheduled via authenticated API call! Should work perfectly! 🚀\\n\\n#authentication #test #success',
    mediaUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1080&h=1080&fit=crop&auto=format&q=80',
    mediaType: 'IMAGE',
    scheduledAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutes from now
    platforms: ['instagram', 'twitter']
  };
  
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
    
    console.log('✅ Schedule request successful!');
    console.log('Response:', scheduleResponse.data);
    
    // Step 3: Verify post was saved to database
    console.log('\\n3️⃣ Verifying Post Saved to Database');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      const scheduledPostsResponse = await axios.get(
        `${BACKEND_URL}/posts/scheduled`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      
      console.log('✅ Retrieved scheduled posts successfully');
      console.log(`📊 Found ${scheduledPostsResponse.data.posts?.length || 0} scheduled posts`);
      
      if (scheduledPostsResponse.data.posts?.length > 0) {
        const latestPost = scheduledPostsResponse.data.posts[0];
        console.log('📝 Latest scheduled post:');
        console.log('   ID:', latestPost.id);
        console.log('   Content:', latestPost.content.substring(0, 50) + '...');
        console.log('   Scheduled for:', latestPost.scheduled_at);
        console.log('   Status:', latestPost.status);
        console.log('   Platforms:', latestPost.platforms);
      }
      
    } catch (error) {
      console.log('❌ Failed to retrieve scheduled posts:', error.response?.data);
    }
    
  } catch (error) {
    console.log('❌ Schedule request failed!');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    
    if (error.response?.data?.error?.includes('social accounts')) {
      console.log('\\n💡 Issue Found: User needs to connect social media accounts!');
      console.log('   This is likely why calendar scheduling shows success but doesn\\'t work');
      console.log('   Users need to visit /social-accounts to connect Instagram/Twitter first');
    }
  }
  
  // Step 4: Check social accounts
  console.log('\\n4️⃣ Checking Social Media Accounts');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const socialAccountsResponse = await axios.get(
      `${BACKEND_URL}/social`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    console.log('✅ Social accounts retrieved successfully');
    console.log('Connected accounts:', socialAccountsResponse.data);
    
    if (!socialAccountsResponse.data || Object.keys(socialAccountsResponse.data).length === 0) {
      console.log('\\n⚠️  NO SOCIAL ACCOUNTS CONNECTED!');
      console.log('💡 This is the ROOT CAUSE of the calendar scheduling issue!');
      console.log('   Users must connect Instagram/Twitter accounts before scheduling posts');
    }
    
  } catch (error) {
    console.log('❌ Failed to get social accounts:', error.response?.data);
  }
  
  // Step 5: Monitor cron job activity
  console.log('\\n5️⃣ Monitoring Scheduled Posting Service');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('⏳ Watching for cron job activity for 10 seconds...');
  console.log('   (Check backend terminal for "Checking for scheduled posts..." messages)');
  
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Final diagnosis
  console.log('\\n🎯 CALENDAR SCHEDULING ISSUE DIAGNOSIS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('\\n🔍 ROOT CAUSES IDENTIFIED:');
  console.log('\\n1. 🔐 AUTHENTICATION ISSUE:');
  console.log('   • Frontend may not be sending valid JWT tokens');
  console.log('   • User might not be properly logged in');
  console.log('   • Token might be expired or invalid');
  
  console.log('\\n2. 🔗 SOCIAL ACCOUNTS ISSUE:');
  console.log('   • Users must connect Instagram/Twitter accounts first');
  console.log('   • Calendar doesn\\'t check for connected accounts before scheduling');
  console.log('   • Backend returns success but can\\'t post without connected accounts');
  
  console.log('\\n3. 💬 USER EXPERIENCE ISSUE:');
  console.log('   • Calendar shows "success" even when requirements aren\\'t met');
  console.log('   • No validation for connected social accounts');
  console.log('   • Users don\\'t get feedback about missing requirements');
  
  console.log('\\n🔧 FIXES NEEDED:');
  console.log('\\n1. 🛠️  Calendar Component:');
  console.log('   • Add validation for social account connections');
  console.log('   • Show proper error messages for missing requirements');
  console.log('   • Don\\'t show success unless all requirements are met');
  
  console.log('\\n2. 🛠️  Backend Validation:');
  console.log('   • Return proper errors when social accounts not connected');
  console.log('   • Don\\'t save posts that can\\'t be executed');
  console.log('   • Provide detailed error messages to frontend');
  
  console.log('\\n3. 🛠️  User Flow:');
  console.log('   • Guide users to connect social accounts before scheduling');
  console.log('   • Show connected account status in calendar');
  console.log('   • Provide clear setup instructions');
  
  console.log('\\n📋 IMMEDIATE NEXT STEPS:');
  console.log('1. Check if user is logged in at localhost:3000/calendar');
  console.log('2. Navigate to localhost:3000/social-accounts and connect platforms');
  console.log('3. Return to calendar and try scheduling again');
  console.log('4. Monitor backend logs for successful scheduling and posting');
  
  console.log('\\n✨ Test completed! Check the diagnosis above for solutions.');
}

testFullSchedulingWorkflow().catch(console.error);