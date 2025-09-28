const axios = require('axios');

async function testInstagramPostWithImage() {
  try {
    console.log('🔍 Testing Instagram post with image URL...');
    
    // Test with a publicly accessible image
    const testImageUrl = 'https://picsum.photos/800/600'; // Random image service
    
    const postData = {
      platform: 'instagram',
      content: 'Test post from automation platform with image! 🚀 #automation #test',
      imageUrl: testImageUrl,
      scheduledFor: new Date(Date.now() + 60000).toISOString() // 1 minute from now
    };

    console.log('📤 Posting to Instagram with data:', postData);

    const response = await axios.post('http://localhost:5001/api/social/instagram/post', postData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Instagram post successful!');
    console.log('📸 Response:', response.data);

  } catch (error) {
    console.error('❌ Instagram post failed:', error.response?.data || error.message);
  }
}

// Run the test
testInstagramPostWithImage();