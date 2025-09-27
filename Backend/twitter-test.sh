#!/bin/bash

echo "🐦 TWITTER-ONLY SCHEDULING TEST"
echo "=============================="

# First, get a JWT token by logging in
echo "1️⃣ Getting authentication token..."

# Use the known working user from our previous tests
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test1758989353084@example.com", 
    "password": "password"
  }')

echo "Login response: $LOGIN_RESPONSE"

# Extract token (simple grep approach)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."

# Now create a scheduled Twitter post
echo ""
echo "2️⃣ Creating scheduled Twitter post..."

# Schedule for 2 minutes from now
FUTURE_TIME=$(date -u -v+2M +%Y-%m-%dT%H:%M:%S.000Z)
echo "⏰ Scheduling for: $FUTURE_TIME"

SCHEDULE_RESPONSE=$(curl -s -X POST http://localhost:5001/api/posts/schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"content\": \"hello hari this is a test text - $(date)\",
    \"scheduledAt\": \"$FUTURE_TIME\",
    \"platforms\": [\"twitter\"]
  }")

echo "Schedule response: $SCHEDULE_RESPONSE"

# Check if it contains success
if echo "$SCHEDULE_RESPONSE" | grep -q "success.*true"; then
  echo "✅ SUCCESS! Twitter post scheduled successfully"
else
  echo "❌ FAILED! Twitter post scheduling failed"
  echo "Response: $SCHEDULE_RESPONSE"
fi

echo ""
echo "🎉 Test complete! Check backend logs for detailed information."