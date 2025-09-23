const axios = require('axios');

async function testRegistration() {
  console.log('🔍 Testing registration endpoint...');
  
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      email: `test${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Registration failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testRegistration();