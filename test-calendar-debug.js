// Calendar debugging script
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// Test function to check calendar endpoint
async function testCalendarEndpoint() {
  try {
    console.log('🔍 Testing Calendar API Endpoint...');
    
    // First, let's test without authentication
    console.log('\n1. Testing /posts/calendar endpoint without auth:');
    try {
      const response = await axios.get(`${API_BASE_URL}/posts/calendar`);
      console.log('Response:', response.data);
    } catch (error) {
      console.log('Expected error (no auth):', error.response?.status, error.response?.data);
    }
    
    // Test login endpoint
    console.log('\n2. Testing login functionality:');
    try {
      // First check if we have any users
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'testpassword'
      });
      console.log('Login successful:', loginResponse.data);
      
      // Now test with token
      const token = loginResponse.data.token;
      console.log('\n3. Testing /posts/calendar with valid token:');
      
      const calendarResponse = await axios.get(`${API_BASE_URL}/posts/calendar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Calendar data:', calendarResponse.data);
      
    } catch (error) {
      console.log('Login error:', error.response?.status, error.response?.data);
      
      // If login fails, try to register a test user
      console.log('\n3. Registering test user:');
      try {
        const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
          email: 'test@example.com',
          password: 'testpassword',
          name: 'Test User'
        });
        console.log('Registration successful:', registerResponse.data);
        
        // Test login again
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'test@example.com',
          password: 'testpassword'
        });
        console.log('Login after registration:', loginResponse.data);
        
        const token = loginResponse.data.token;
        const calendarResponse = await axios.get(`${API_BASE_URL}/posts/calendar`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Calendar data after auth:', calendarResponse.data);
        
      } catch (regError) {
        console.log('Registration error:', regError.response?.status, regError.response?.data);
      }
    }
    
  } catch (error) {
    console.error('General error:', error.message);
  }
}

// Test the calendar endpoint
testCalendarEndpoint();