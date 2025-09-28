#!/bin/bash

# Tweet scheduler script for 11:11 AM
# This script will wait until 11:11 AM and then post the tweet directly

BACKEND_URL="https://backend-automation-gcbv.onrender.com"
TWEET_CONTENT="render backend testing"

# Get authentication token
echo "🔐 Getting authentication token..."
AUTH_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "twittertest@example.com",
    "password": "testpass123"
  }')

TOKEN=$(echo $AUTH_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  echo "Response: $AUTH_RESPONSE"
  exit 1
fi

echo "✅ Authentication successful"

# Calculate time until 11:11 AM
CURRENT_TIME=$(date +%s)
TARGET_TIME=$(date -d "11:11:00" +%s)

# If 11:11 has passed today, schedule for tomorrow
if [ $TARGET_TIME -le $CURRENT_TIME ]; then
  TARGET_TIME=$(date -d "tomorrow 11:11:00" +%s)
  echo "⏰ 11:11 AM has passed today. Scheduling for tomorrow."
else
  echo "⏰ Tweet will post today at 11:11 AM"
fi

WAIT_SECONDS=$((TARGET_TIME - CURRENT_TIME))
echo "⏳ Waiting $WAIT_SECONDS seconds until 11:11 AM..."
echo "Current time: $(date)"
echo "Target time: $(date -d @$TARGET_TIME)"

# Wait until 11:11 AM
sleep $WAIT_SECONDS

# Post the tweet
echo ""
echo "🐦 It's 11:11 AM! Posting tweet now..."
echo "Tweet content: $TWEET_CONTENT"

RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/posts/post-now" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"content\": \"$TWEET_CONTENT\",
    \"platform\": \"twitter\"
  }")

echo "📱 Tweet Response:"
echo $RESPONSE | jq '.' 2>/dev/null || echo $RESPONSE

if echo $RESPONSE | grep -q '"success":true'; then
  echo ""
  echo "🎉 SUCCESS! Tweet posted at $(date)"
  echo "✅ Your tweet '$TWEET_CONTENT' has been posted to Twitter!"
else
  echo ""
  echo "❌ Tweet posting failed"
  echo "Response: $RESPONSE"
fi