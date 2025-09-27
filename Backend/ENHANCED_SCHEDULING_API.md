# Enhanced Scheduling API Documentation

## Overview

The enhanced scheduling API now supports advanced posting options including media uploads, user-specific tokens, retry configuration, and bulk scheduling.

## Enhanced Schedule Endpoint

### POST `/api/posts/schedule`

Schedule a post with advanced options.

#### Request Body

```json
{
  "content": "Your post content here",
  "mediaUrl": "https://example.com/image.jpg", // Optional
  "mediaType": "IMAGE", // Optional: IMAGE, VIDEO, GIF
  "scheduledAt": "2024-01-01T12:00:00Z",
  "platforms": ["twitter", "linkedin"], // Optional, defaults to all connected
  "postOptions": {
    "useUserTokens": true, // Use user-specific tokens
    "fallbackToGlobal": true, // Fallback to app tokens if user tokens fail
    "retryOnFailure": true, // Enable automatic retry
    "maxRetries": 3, // Maximum retry attempts (0-5)
    "enableEncryption": true, // Encrypt sensitive data
    "postType": "standard" // standard, thread, reply, retweet
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "scheduled": [
      {
        "id": "post_id",
        "content": "Post content",
        "platform": "TWITTER",
        "scheduledTime": "2024-01-01T12:00:00Z",
        "status": "PENDING",
        "useUserTokens": true,
        "maxRetries": 3
      }
    ],
    "summary": {
      "total": 1,
      "successful": 1,
      "failed": 0
    }
  }
}
```

## New Endpoints

### GET `/api/posts/options/available`

Get available posting options and connected accounts.

#### Response

```json
{
  "success": true,
  "data": {
    "connectedAccounts": [
      {
        "id": "account_id",
        "platform": "TWITTER",
        "accountName": "@username",
        "isActive": true
      }
    ],
    "postingOptions": {
      "mediaTypes": [
        {
          "value": "IMAGE",
          "label": "Image",
          "description": "JPG, PNG, GIF images"
        }
      ],
      "postTypes": [
        {
          "value": "STANDARD",
          "label": "Standard Post",
          "description": "Regular social media post"
        }
      ],
      "platforms": [
        {
          "platform": "TWITTER",
          "accountName": "@username",
          "features": {
            "textPosts": true,
            "mediaPosts": true,
            "threads": true,
            "scheduling": true
          }
        }
      ],
      "advancedOptions": {
        "useUserTokens": {
          "label": "Use Personal Tokens",
          "description": "Use your personal social media tokens for posting",
          "default": true
        }
      }
    },
    "limits": {
      "contentLength": {
        "TWITTER": 280,
        "LINKEDIN": 3000
      },
      "mediaSize": {
        "maxImageSize": "5MB",
        "maxVideoSize": "512MB"
      }
    }
  }
}
```

### POST `/api/posts/schedule/bulk`

Schedule multiple posts at once (up to 10 posts).

#### Request Body

```json
{
  "posts": [
    {
      "content": "First post content",
      "scheduledAt": "2024-01-01T12:00:00Z",
      "platforms": ["twitter"],
      "postOptions": {
        "useUserTokens": true,
        "maxRetries": 3
      }
    },
    {
      "content": "Second post content",
      "mediaUrl": "https://example.com/image.jpg",
      "mediaType": "IMAGE",
      "scheduledAt": "2024-01-01T13:00:00Z",
      "platforms": ["twitter", "linkedin"]
    }
  ]
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "scheduled": [
      {
        "id": "post_1_id",
        "content": "First post content",
        "platform": "TWITTER",
        "status": "PENDING"
      }
    ],
    "errors": [
      {
        "index": 1,
        "platform": "linkedin",
        "error": "No connected linkedin account found"
      }
    ],
    "summary": {
      "total": 2,
      "successful": 1,
      "failed": 1
    }
  }
}
```

### GET `/api/posts/templates`

Get predefined post templates.

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "announcement",
      "name": "Announcement",
      "description": "General announcement template",
      "content": "🎉 Exciting news! [Your announcement here] #announcement",
      "mediaType": "IMAGE",
      "platforms": ["TWITTER", "LINKEDIN"]
    }
  ]
}
```

## Advanced Features

### 1. Media Support

#### Supported Media Types

- **IMAGE**: JPG, PNG, GIF (up to 5MB)
- **VIDEO**: MP4, MOV (up to 512MB)
- **GIF**: Animated GIF files

#### Example with Media

```json
{
  "content": "Check out this amazing image!",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "IMAGE",
  "scheduledAt": "2024-01-01T12:00:00Z"
}
```

### 2. Token Management

#### User-Specific Tokens

- Posts use the user's personal social media tokens by default
- Provides better authentication and posting permissions
- Respects user's account settings and limitations

#### Fallback to Global Tokens

- If user tokens fail, system can fallback to app-level tokens
- Ensures posts are still delivered even if user tokens expire
- Configurable per post

#### Example Configuration

```json
{
  "postOptions": {
    "useUserTokens": true, // Try user tokens first
    "fallbackToGlobal": true // Fallback to app tokens if needed
  }
}
```

### 3. Enhanced Retry Logic

#### Exponential Backoff

- First retry: 5 minutes
- Second retry: 10 minutes
- Third retry: 20 minutes

#### Configurable Retries

```json
{
  "postOptions": {
    "retryOnFailure": true,
    "maxRetries": 3 // 0-5 retries allowed
  }
}
```

### 4. Post Types

#### Available Types

- **STANDARD**: Regular social media post
- **THREAD**: Multi-part post series (Twitter)
- **REPLY**: Reply to existing post
- **RETWEET**: Share existing content

### 5. Platform-Specific Features

#### Twitter

- ✅ Text posts (280 characters)
- ✅ Media posts (images, videos, GIFs)
- ✅ Threads
- ✅ User tokens support
- ✅ Retry logic

#### LinkedIn (Planned)

- 📋 Text posts (3000 characters)
- 📋 Media posts
- 📋 Polls
- 📋 Company page posting

#### Instagram (Planned)

- 📋 Media-only posts
- 📋 Stories
- 📋 Reels

## Error Handling

### Common Errors

```json
{
  "error": "Content and scheduled time are required"
}
```

```json
{
  "error": "Invalid media type. Supported types: IMAGE, VIDEO, GIF"
}
```

```json
{
  "error": "No connected twitter account found for user"
}
```

### Retry Errors

```json
{
  "error": "Max retries reached: Twitter API rate limit exceeded"
}
```

## Frontend Integration Examples

### Basic Scheduling Form

```html
<form id="scheduleForm">
  <textarea
    name="content"
    placeholder="What's on your mind?"
    maxlength="280"
  ></textarea>

  <input type="file" name="media" accept="image/*,video/*" />

  <input type="datetime-local" name="scheduledAt" required />

  <div class="platforms">
    <label
      ><input type="checkbox" name="platforms" value="twitter" /> Twitter</label
    >
    <label
      ><input type="checkbox" name="platforms" value="linkedin" />
      LinkedIn</label
    >
  </div>

  <div class="advanced-options">
    <label
      ><input type="checkbox" name="useUserTokens" checked /> Use my personal
      tokens</label
    >
    <label
      ><input type="checkbox" name="fallbackToGlobal" checked /> Fallback to app
      tokens</label
    >
    <label
      ><input type="checkbox" name="retryOnFailure" checked /> Auto-retry failed
      posts</label
    >
    <input
      type="number"
      name="maxRetries"
      value="3"
      min="0"
      max="5"
      placeholder="Max retries"
    />
  </div>

  <button type="submit">Schedule Post</button>
</form>
```

### JavaScript Integration

```javascript
async function schedulePost(formData) {
  const response = await fetch("/api/posts/schedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      content: formData.content,
      mediaUrl: formData.mediaUrl,
      mediaType: formData.mediaType,
      scheduledAt: formData.scheduledAt,
      platforms: formData.platforms,
      postOptions: {
        useUserTokens: formData.useUserTokens,
        fallbackToGlobal: formData.fallbackToGlobal,
        retryOnFailure: formData.retryOnFailure,
        maxRetries: formData.maxRetries,
        postType: formData.postType || "standard",
      },
    }),
  });

  const result = await response.json();

  if (result.success) {
    console.log("Posts scheduled:", result.data.scheduled);
  } else {
    console.error("Scheduling failed:", result.error);
  }
}
```

## Migration Guide

### From Basic to Enhanced Scheduling

#### Old Format

```json
{
  "content": "Hello world",
  "scheduledAt": "2024-01-01T12:00:00Z",
  "platforms": ["twitter"]
}
```

#### New Format (Backward Compatible)

```json
{
  "content": "Hello world",
  "scheduledAt": "2024-01-01T12:00:00Z",
  "platforms": ["twitter"],
  "postOptions": {
    "useUserTokens": true,
    "fallbackToGlobal": true,
    "retryOnFailure": true,
    "maxRetries": 3
  }
}
```

The API is fully backward compatible. Existing code will continue to work with default enhanced options applied automatically.

---

**Last Updated**: September 27, 2025  
**Version**: 2.0.0  
**API Base URL**: `/api/posts`
