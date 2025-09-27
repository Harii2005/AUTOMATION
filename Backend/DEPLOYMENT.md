# Backend Deployment Guide for Render

## Quick Deployment Steps

1. **Push your backend code to GitHub** (if not already done)
   
2. **Go to Render Dashboard** (https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the folder: `Backend`

3. **Configure Build & Deploy Settings:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** `Node.js`

4. **Add Environment Variables:**
   ```
   NODE_ENV=production
   SUPABASE_URL=https://jeokwwumxpgdqvahgksh.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Implb2t3d3VteHBnZHF2YWhna3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NDk0NTUsImV4cCI6MjA3NDEyNTQ1NX0.F6irEggOf2yKFQuzdN5IFFgybuP5L7Xxa-RHtUH8hbk
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   TWITTER_CONSUMER_KEY=hley26irqfkMdyZ5Gy08YyLO1
   TWITTER_CONSUMER_SECRET=8GNs2hRWv1YeZf6XOW8NkUEqXhw4KZpFbOEPMRhMDlZdaT7Y2p
   TWITTER_ACCESS_TOKEN=1902337434228346880-k3v6LlR4XPM7BFm4iC3yLKlojc8F07
   TWITTER_ACCESS_TOKEN_SECRET=CajCqhskvKYAo9f2hNZ9cAEWKV7X7RXCQHj8kLKJzQSy2
   ```

5. **Deploy** - Click "Create Web Service"

## Alternative: Manual Deployment

If you prefer not to use render.yaml, you can:

1. Create a new Web Service on Render
2. Set the root directory to `/Backend` 
3. Use the build and start commands above
4. Manually add environment variables in the Render dashboard

## After Deployment

Once your backend is deployed, you'll get a URL like:
`https://your-backend-name.onrender.com`

You'll need to update your frontend to use this URL instead of localhost.

## Testing the Deployment

Test your deployed backend:
```bash
curl https://your-backend-url.onrender.com/api/health
```

You should get a response like:
```json
{"status":"OK","timestamp":"...","service":"automation-backend"}
```