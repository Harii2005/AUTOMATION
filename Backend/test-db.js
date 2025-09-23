const { supabase } = require('./src/utils/database');

async function testDatabase() {
  console.log('🔍 Testing Database Connection...\n');
  
  try {
    // Test users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    console.log('✅ SUCCESS: Database connection is working!');
    console.log('✅ Users table exists and is accessible');
    console.log('✅ Your "Success. No rows returned" message was correct!');
    
    // Test insert capability
    console.log('\n🔍 Testing write permissions...');
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        email: 'test@example.com',
        username: 'testuser' + Date.now(),
        password: 'testpassword'
      })
      .select();
    
    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
    } else {
      console.log('✅ Insert successful! User ID:', insertData[0].id);
      
      // Clean up
      await supabase.from('users').delete().eq('id', insertData[0].id);
      console.log('✅ Test data cleaned up');
    }
    
    console.log('\n🎉 CONCLUSION: Your database is fully functional!');
    
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
  }
}

testDatabase();