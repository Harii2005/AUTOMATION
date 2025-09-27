const dotenv = require('dotenv');
const { supabase } = require('./src/utils/database');

// Load environment variables
dotenv.config();

/**
 * Verification script to check if the automatic posting system is properly configured
 */

async function checkEnvironmentVariables() {
  console.log('🔧 Checking Environment Variables');
  console.log('=================================');

  const requiredVars = [
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET',
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ];

  let allPresent = true;
  requiredVars.forEach(varName => {
    const isPresent = !!process.env[varName];
    console.log(`${isPresent ? '✅' : '❌'} ${varName}: ${isPresent ? 'Set' : 'Missing'}`);
    if (!isPresent) allPresent = false;
  });

  return allPresent;
}

async function checkDatabaseConnection() {
  console.log('\n📦 Checking Database Connection');
  console.log('==============================');

  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Database connection failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (err) {
    console.log('❌ Database connection error:', err.message);
    return false;
  }
}

async function checkTablesExist() {
  console.log('\n🗄️  Checking Required Tables');
  console.log('============================');

  const tables = ['users', 'social_accounts', 'scheduled_posts'];
  let allExist = true;

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table '${table}': Error - ${error.message}`);
        allExist = false;
      } else {
        console.log(`✅ Table '${table}': Exists`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}': Error - ${err.message}`);
      allExist = false;
    }
  }

  return allExist;
}

async function checkTwitterIntegration() {
  console.log('\n🐦 Checking Twitter Integration');
  console.log('==============================');

  try {
    const { TwitterApi } = require('twitter-api-v2');
    
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    // Try to get user info to verify credentials
    const user = await client.v2.me();
    console.log(`✅ Twitter API connection successful`);
    console.log(`👤 Connected as: @${user.data.username} (${user.data.name})`);
    return true;

  } catch (error) {
    console.log('❌ Twitter API connection failed:', error.message);
    console.log('💡 Please check your Twitter API credentials in the .env file');
    return false;
  }
}

async function checkScheduledPostsStructure() {
  console.log('\n📋 Checking Scheduled Posts Structure');
  console.log('====================================');

  try {
    // Check if we can query scheduled posts with the expected structure
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select(`
        id,
        userId,
        socialAccountId,
        content,
        scheduledTime,
        status,
        platform,
        retryCount,
        error,
        platformPostId,
        social_accounts (
          id,
          platform,
          accountName,
          accessToken,
          isActive
        )
      `)
      .limit(1);

    if (error) {
      console.log('❌ Scheduled posts query failed:', error.message);
      return false;
    }

    console.log('✅ Scheduled posts structure is correct');
    console.log(`📊 Current scheduled posts count: ${data?.length || 0}`);
    return true;

  } catch (error) {
    console.log('❌ Error checking scheduled posts structure:', error.message);
    return false;
  }
}

async function checkUsersWithTwitterAccounts() {
  console.log('\n👥 Checking Users with Twitter Accounts');
  console.log('======================================');

  try {
    const { data: users, error } = await supabase
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
      .eq('social_accounts.isActive', true);

    if (error) {
      console.log('❌ Error fetching users:', error.message);
      return false;
    }

    console.log(`✅ Found ${users?.length || 0} users with active Twitter accounts`);
    
    if (users && users.length > 0) {
      users.forEach(user => {
        console.log(`  👤 ${user.email}: @${user.social_accounts[0].accountName}`);
      });
    } else {
      console.log('💡 No users with Twitter accounts found. Connect a Twitter account to test posting.');
    }

    return true;

  } catch (error) {
    console.log('❌ Error checking users:', error.message);
    return false;
  }
}

async function runFullVerification() {
  console.log('🔍 Automatic Posting System Verification');
  console.log('========================================\n');

  const checks = [
    { name: 'Environment Variables', fn: checkEnvironmentVariables },
    { name: 'Database Connection', fn: checkDatabaseConnection },
    { name: 'Required Tables', fn: checkTablesExist },
    { name: 'Twitter Integration', fn: checkTwitterIntegration },
    { name: 'Scheduled Posts Structure', fn: checkScheduledPostsStructure },
    { name: 'Users with Twitter Accounts', fn: checkUsersWithTwitterAccounts }
  ];

  let passedChecks = 0;
  let totalChecks = checks.length;

  for (const check of checks) {
    try {
      const passed = await check.fn();
      if (passed) passedChecks++;
    } catch (error) {
      console.log(`❌ ${check.name} check failed:`, error.message);
    }
  }

  console.log('\n🏁 Verification Summary');
  console.log('=====================');
  console.log(`✅ Passed: ${passedChecks}/${totalChecks} checks`);
  
  if (passedChecks === totalChecks) {
    console.log('🎉 All checks passed! The automatic posting system is ready to use.');
    console.log('💡 You can now:');
    console.log('   1. Schedule posts using the frontend or API');
    console.log('   2. Run "node test-automatic-posting.js" to test the system');
    console.log('   3. Start the server with "npm run dev" to enable automatic posting');
  } else {
    console.log('⚠️  Some checks failed. Please fix the issues above before using the system.');
  }
}

if (require.main === module) {
  runFullVerification();
}

module.exports = {
  checkEnvironmentVariables,
  checkDatabaseConnection,
  checkTablesExist,
  checkTwitterIntegration,
  checkScheduledPostsStructure,
  checkUsersWithTwitterAccounts,
  runFullVerification
};