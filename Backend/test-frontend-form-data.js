const axios = require('axios');

async function testFrontendFormData() {
  try {
    // Login first
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Logged in');
    
    // Test the exact data structure that the frontend form would send
    // Based on the screenshot: content="hello moto", but using a future date
    
    // Convert the frontend date format to what backend expects (future date)
    const scheduledAtString = "2025-09-28T14:30"; // Tomorrow at 2:30 PM
    const scheduledDate = new Date(scheduledAtString);
    
    const formData = {
      content: "hello moto",
      scheduledAt: scheduledDate.toISOString(), // This is what Calendar.js does
      platforms: ["twitter"]  // This is the platforms array from the form
    };
    
    console.log('🚀 Sending form data that matches frontend:');
    console.log(JSON.stringify(formData, null, 2));
    
    const response = await axios.post('http://localhost:5001/api/posts/schedule', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success:', response.data);
    
  } catch (error) {
    console.error('❌ Error occurred:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.error || error.message);
    console.error('Full response:', error.response?.data);
  }
}

testFrontendFormData();