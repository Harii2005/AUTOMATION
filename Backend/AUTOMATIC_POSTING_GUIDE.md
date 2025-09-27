# Automatic Posting System Documentation

## Overview

The automatic posting system is a comprehensive solution that enables scheduled social media posts to be automatically published at their designated times. The system continuously monitors the database for pending posts and processes them when their scheduled time arrives.

## Architecture

### Components

1. **ScheduledPostingService** (`src/services/scheduledPostingService.js`)
   - Main service that runs continuously in the background
   - Checks for pending posts every minute using cron jobs
   - Handles posting to different social media platforms
   - Manages retry logic and error handling

2. **Database Schema** (`prisma/schema.prisma`)
   - `ScheduledPost` model with comprehensive tracking fields
   - Support for multiple platforms (Twitter, LinkedIn, Instagram)
   - Status tracking (PENDING, PROCESSING, POSTED, FAILED, CANCELLED)
   - Retry mechanism with count tracking

3. **API Routes** (`src/routes/posts.js`)
   - Endpoints for scheduling posts
   - Management endpoints for monitoring and controlling posts
   - Statistics and reporting functionality

## Features

### ✅ Implemented Features

1. **Automatic Post Processing**
   - Cron-based scheduler that runs every minute
   - Processes all pending posts that are due
   - Updates post status throughout the lifecycle

2. **Twitter Integration**
   - Text-only posts
   - Posts with media (images)
   - Per-user authentication token support
   - Fallback to global app tokens when needed

3. **Error Handling & Retry Logic**
   - Automatic retry for failed posts (up to 3 attempts)
   - 5-minute delay between retries
   - Comprehensive error logging and status tracking

4. **Post Management**
   - Cancel pending posts
   - Retry failed posts
   - View posts by status
   - Detailed post information retrieval

5. **Security**
   - Encrypted storage of access tokens
   - User-specific post access controls
   - Proper authentication middleware

### 🔄 Platform Support

| Platform  | Status | Features |
|-----------|--------|----------|
| Twitter   | ✅ Full | Text posts, media posts, user tokens |
| LinkedIn  | 📋 Planned | Placeholder implementation |
| Instagram | 📋 Planned | Placeholder implementation |

## How It Works

### 1. Post Scheduling Flow

```
User creates post → API validates → Saves to database with PENDING status
                                          ↓
Cron job runs every minute → Checks for due posts → Updates to PROCESSING
                                          ↓
Platform-specific posting → Success: POSTED | Failure: Retry or FAILED
```

### 2. Database States

- **PENDING**: Post is scheduled and waiting to be processed
- **PROCESSING**: Post is currently being processed
- **POSTED**: Successfully posted to the platform
- **FAILED**: Failed after maximum retry attempts
- **CANCELLED**: Manually cancelled by user

### 3. Retry Mechanism

- Failed posts are automatically retried up to 3 times
- 5-minute delay between retry attempts
- Retry count is tracked in the database
- After max retries, post is marked as FAILED

## API Endpoints

### Core Endpoints

- `POST /api/posts/schedule` - Schedule a new post
- `GET /api/posts` - Get user's scheduled posts
- `GET /api/posts/stats` - Get posting statistics

### Management Endpoints

- `GET /api/posts/status/:status` - Get posts by status
- `POST /api/posts/:id/cancel` - Cancel a scheduled post
- `POST /api/posts/:id/retry` - Retry a failed post
- `GET /api/posts/:id` - Get detailed post information

## Configuration

### Environment Variables

```env
# Database
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Twitter API
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_32_character_encryption_key
```

## Usage Examples

### 1. Schedule a Post

```javascript
const response = await fetch('/api/posts/schedule', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    content: 'Hello, world! This is a scheduled post.',
    scheduledAt: '2024-01-01T12:00:00Z',
    platforms: ['twitter']
  })
});
```

### 2. Monitor Post Status

```javascript
const response = await fetch('/api/posts/status/pending', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data: pendingPosts } = await response.json();
```

### 3. Cancel a Post

```javascript
const response = await fetch(`/api/posts/${postId}/cancel`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Testing

### 1. Verification Script

Run the verification script to ensure everything is set up correctly:

```bash
node verify-setup.js
```

### 2. Automatic Posting Test

Test the full posting workflow:

```bash
node test-automatic-posting.js
```

### 3. Query Test

Test the database queries:

```bash
node test-automatic-posting.js query
```

## Monitoring and Debugging

### 1. Logs

The system provides comprehensive logging:

- 🚀 Service startup messages
- 🔍 Scheduled post checking
- 📤 Post processing details
- ✅ Success confirmations
- ❌ Error messages with context

### 2. Database Monitoring

Check post statuses directly in the database:

```sql
SELECT 
  id, content, status, platform, 
  scheduledTime, error, retryCount
FROM scheduled_posts 
ORDER BY scheduledTime DESC;
```

### 3. Status Endpoints

Use the API endpoints to monitor system health:

- `/api/posts/stats` - Overall statistics
- `/api/posts/status/failed` - Failed posts
- `/api/posts/status/processing` - Currently processing

## Deployment

1. **Environment Setup**
   - Ensure all environment variables are configured
   - Run database migrations: `npx prisma migrate deploy`
   - Generate Prisma client: `npx prisma generate`

2. **Service Start**
   - The ScheduledPostingService starts automatically with the main server
   - No additional configuration required

3. **Monitoring**
   - Monitor server logs for posting activity
   - Set up alerting for failed posts if needed
   - Consider using a process manager like PM2 for production

## Troubleshooting

### Common Issues

1. **Twitter API Authentication Errors**
   - Verify API credentials in environment variables
   - Check Twitter Developer Console for app status
   - Ensure proper permissions are set

2. **Database Connection Issues**
   - Verify DATABASE_URL and Supabase credentials
   - Check network connectivity
   - Ensure database migrations are applied

3. **Posts Not Being Processed**
   - Check if the service is running
   - Verify cron job execution in logs
   - Check for posts with PENDING status in database

### Debug Commands

```bash
# Check service status
curl http://localhost:5001/health

# Verify database connection
curl http://localhost:5001/test-supabase

# Check environment setup
node verify-setup.js

# Test posting mechanism
node test-automatic-posting.js
```

## Security Considerations

1. **Token Storage**: Access tokens are encrypted before storage
2. **User Isolation**: Users can only access their own posts
3. **Rate Limiting**: Consider implementing rate limiting for API endpoints
4. **Error Handling**: Sensitive information is not exposed in error messages

## Future Enhancements

1. **Additional Platforms**: LinkedIn and Instagram integration
2. **Advanced Scheduling**: Recurring posts, optimal timing suggestions
3. **Media Management**: File upload and storage integration
4. **Analytics**: Post performance tracking and reporting
5. **Bulk Operations**: Schedule multiple posts at once
6. **User Interface**: Enhanced frontend for post management

## Contributing

When adding new features or platforms:

1. Follow the existing service pattern in `ScheduledPostingService`
2. Add appropriate error handling and logging
3. Update the database schema if needed
4. Add tests for new functionality
5. Update this documentation

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Maintainer**: Development Team