const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const { supabase } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Encryption/Decryption utility functions
const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_KEY || 'default-32-char-secret-key-here!!';

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, secretKey);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText) {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts[0], 'hex');
  const encryptedData = textParts[1];
  const decipher = crypto.createDecipher(algorithm, secretKey);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Instagram API functions
const instagramAPI = {
  async getUserInfo(accessToken) {
    try {
      const response = await axios.get(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
      return response.data;
    } catch (error) {
      console.error('Instagram API Error:', error.response?.data || error.message);
      throw new Error('Failed to get Instagram user info');
    }
  },

  async createMediaObject(accessToken, imageUrl, caption) {
    try {
      const response = await axios.post(`https://graph.instagram.com/me/media`, {
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken
      });
      return response.data.id;
    } catch (error) {
      console.error('Instagram Media Creation Error:', error.response?.data || error.message);
      throw new Error('Failed to create Instagram media object');
    }
  },

  async publishMedia(accessToken, creationId) {
    try {
      const response = await axios.post(`https://graph.instagram.com/me/media_publish`, {
        creation_id: creationId,
        access_token: accessToken
      });
      return response.data;
    } catch (error) {
      console.error('Instagram Publish Error:', error.response?.data || error.message);
      throw new Error('Failed to publish Instagram media');
    }
  },

  async postToInstagram(accessToken, imageUrl, caption) {
    try {
      // Step 1: Create media object
      const creationId = await this.createMediaObject(accessToken, imageUrl, caption);
      
      // Step 2: Publish media
      const result = await this.publishMedia(accessToken, creationId);
      
      return result;
    } catch (error) {
      console.error('Instagram Post Error:', error);
      throw error;
    }
  }
};

// Connect Instagram account with provided access token
router.post('/instagram/connect', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(400).json({ error: 'Instagram access token not configured' });
    }

    // Get user info from Instagram
    const userInfo = await instagramAPI.getUserInfo(accessToken);

    // Store the encrypted token in database
    const encryptedToken = encrypt(accessToken);
    
    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'instagram')
      .eq('platform_user_id', userInfo.id)
      .single();

    if (existingAccount) {
      // Update existing account
      const { error } = await supabase
        .from('social_accounts')
        .update({
          encrypted_token: encryptedToken,
          username: userInfo.username,
          is_connected: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAccount.id);

      if (error) throw error;
    } else {
      // Create new account
      const { error } = await supabase
        .from('social_accounts')
        .insert({
          user_id: userId,
          platform: 'instagram',
          platform_user_id: userInfo.id,
          username: userInfo.username,
          encrypted_token: encryptedToken,
          is_connected: true
        });

      if (error) throw error;
    }

    res.json({
      success: true,
      message: 'Instagram account connected successfully',
      account: {
        platform: 'instagram',
        username: userInfo.username,
        id: userInfo.id
      }
    });
  } catch (error) {
    console.error('Error connecting Instagram:', error);
    res.status(500).json({ error: error.message });
  }
});

// Post to Instagram
router.post('/instagram/post', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { imageUrl, caption } = req.body;

    if (!imageUrl || !caption) {
      return res.status(400).json({ error: 'Image URL and caption are required' });
    }

    // Get Instagram account for user
    const { data: account, error: fetchError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'instagram')
      .eq('is_connected', true)
      .single();

    if (fetchError || !account) {
      return res.status(400).json({ error: 'Instagram account not connected' });
    }

    // Decrypt token
    const accessToken = decrypt(account.encrypted_token);

    // Post to Instagram
    const result = await instagramAPI.postToInstagram(accessToken, imageUrl, caption);

    res.json({
      success: true,
      message: 'Posted to Instagram successfully',
      post_id: result.id
    });
  } catch (error) {
    console.error('Error posting to Instagram:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Instagram auth URL (for future OAuth implementation)
router.get('/instagram/auth', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Use the connect endpoint with your access token',
      authUrl: '/api/social/instagram/connect'
    });
  } catch (error) {
    console.error('Error getting Instagram auth URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all connected social accounts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('id, platform, username, is_connected, created_at, updated_at')
      .eq('user_id', userId);

    if (error) throw error;

    // Add mock accounts for platforms that aren't connected yet
    const connectedPlatforms = accounts.map(acc => acc.platform);
    const allPlatforms = ['instagram']; // Only Instagram for now
    
    const mockAccounts = allPlatforms
      .filter(platform => !connectedPlatforms.includes(platform))
      .map(platform => ({
        id: null,
        platform,
        username: null,
        isConnected: false,
        followers: Math.floor(Math.random() * 5000) + 1000, // Mock follower count
        created_at: null,
        updated_at: null
      }));

    const formattedAccounts = accounts.map(acc => ({
      ...acc,
      isConnected: acc.is_connected,
      followers: Math.floor(Math.random() * 5000) + 1000 // Mock follower count
    }));

    res.json([...formattedAccounts, ...mockAccounts]);
  } catch (error) {
    console.error('Error fetching social accounts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Disconnect social account
router.delete('/:platform', authMiddleware, async (req, res) => {
  try {
    const { platform } = req.params;
    const { userId } = req.user;

    const { error } = await supabase
      .from('social_accounts')
      .delete()
      .eq('user_id', userId)
      .eq('platform', platform);

    if (error) throw error;

    res.json({ 
      success: true, 
      message: `${platform} account disconnected successfully` 
    });
  } catch (error) {
    console.error('Error disconnecting account:', error);
    res.status(500).json({ error: error.message });
  }
});

// Legacy endpoints for future implementation
router.get('/twitter/auth', authMiddleware, async (req, res) => {
  res.status(501).json({ 
    error: 'Twitter integration not yet implemented',
    message: 'Coming soon!'
  });
});

router.get('/linkedin/auth', authMiddleware, async (req, res) => {
  res.status(501).json({ 
    error: 'LinkedIn integration not yet implemented',
    message: 'Coming soon!'
  });
});

module.exports = router;

    // Exchange code for access token (simplified)
    // In production, you'd make actual API calls to Twitter
    const mockAccessToken = 'mock_twitter_access_token_' + Date.now();
    const mockRefreshToken = 'mock_twitter_refresh_token_' + Date.now();
    const mockAccountInfo = {
      id: 'twitter_user_' + Date.now(),
      username: 'mock_twitter_user'
    };

    // Encrypt tokens before storing
    const encryptedAccessToken = encrypt(mockAccessToken);
    const encryptedRefreshToken = encrypt(mockRefreshToken);

    // Save to database
    await prisma.socialAccount.create({
      data: {
        userId: req.user.userId,
        platform: 'TWITTER',
        accountId: mockAccountInfo.id,
        accountName: mockAccountInfo.username,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: true,
      }
    });

    res.json({ 
      message: 'Twitter account connected successfully',
      account: {
        platform: 'TWITTER',
        accountName: mockAccountInfo.username
      }
    });

  } catch (error) {
    console.error('Twitter callback error:', error);
    res.status(500).json({ error: 'Failed to connect Twitter account' });
  }
});

// LinkedIn OAuth initiation
router.get('/linkedin/auth', authMiddleware, (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');
  const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent('http://localhost:5000/api/social/linkedin/callback')}&state=${state}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
  
  res.json({ 
    authUrl: linkedinAuthUrl,
    state: state 
  });
});

// LinkedIn OAuth callback
router.get('/linkedin/callback', authMiddleware, async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code not provided' });
    }

    // Mock LinkedIn integration
    const mockAccessToken = 'mock_linkedin_access_token_' + Date.now();
    const mockAccountInfo = {
      id: 'linkedin_user_' + Date.now(),
      name: 'Mock LinkedIn User'
    };

    const encryptedAccessToken = encrypt(mockAccessToken);

    await prisma.socialAccount.create({
      data: {
        userId: req.user.userId,
        platform: 'LINKEDIN',
        accountId: mockAccountInfo.id,
        accountName: mockAccountInfo.name,
        accessToken: encryptedAccessToken,
        tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isActive: true,
      }
    });

    res.json({ 
      message: 'LinkedIn account connected successfully',
      account: {
        platform: 'LINKEDIN',
        accountName: mockAccountInfo.name
      }
    });

  } catch (error) {
    console.error('LinkedIn callback error:', error);
    res.status(500).json({ error: 'Failed to connect LinkedIn account' });
  }
});

// Instagram OAuth initiation
router.get('/instagram/auth', authMiddleware, (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');
  const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent('http://localhost:5000/api/social/instagram/callback')}&scope=user_profile,user_media&response_type=code&state=${state}`;
  
  res.json({ 
    authUrl: instagramAuthUrl,
    state: state 
  });
});

// Instagram OAuth callback
router.get('/instagram/callback', authMiddleware, async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code not provided' });
    }

    // Mock Instagram integration
    const mockAccessToken = 'mock_instagram_access_token_' + Date.now();
    const mockAccountInfo = {
      id: 'instagram_user_' + Date.now(),
      username: 'mock_instagram_user'
    };

    const encryptedAccessToken = encrypt(mockAccessToken);

    await prisma.socialAccount.create({
      data: {
        userId: req.user.userId,
        platform: 'INSTAGRAM',
        accountId: mockAccountInfo.id,
        accountName: mockAccountInfo.username,
        accessToken: encryptedAccessToken,
        tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isActive: true,
      }
    });

    res.json({ 
      message: 'Instagram account connected successfully',
      account: {
        platform: 'INSTAGRAM',
        accountName: mockAccountInfo.username
      }
    });

  } catch (error) {
    console.error('Instagram callback error:', error);
    res.status(500).json({ error: 'Failed to connect Instagram account' });
  }
});

// Disconnect social account
router.delete('/:platform', authMiddleware, async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user.userId;

    const platformUpper = platform.toUpperCase();
    if (!['TWITTER', 'LINKEDIN', 'INSTAGRAM'].includes(platformUpper)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const deletedAccount = await prisma.socialAccount.deleteMany({
      where: {
        userId: userId,
        platform: platformUpper,
      }
    });

    if (deletedAccount.count === 0) {
      return res.status(404).json({ error: 'Social account not found' });
    }

    res.json({ message: `${platform} account disconnected successfully` });

  } catch (error) {
    console.error('Disconnect social account error:', error);
    res.status(500).json({ error: 'Failed to disconnect social account' });
  }
});

// Get all connected social accounts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const socialAccounts = await prisma.socialAccount.findMany({
      where: { userId: req.user.userId },
      select: {
        id: true,
        platform: true,
        accountName: true,
        accountId: true,
        isActive: true,
        createdAt: true,
        tokenExpiry: true,
      }
    });

    res.json({ socialAccounts });

  } catch (error) {
    console.error('Get social accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;