# 📅 How to Schedule Posts for Tomorrow (With Photos/Text)

## ✅ **FIXED ISSUES:**

### 1. **Database Integration Fixed**

- ✅ Replaced Prisma with Supabase in `posts.js`
- ✅ Fixed all database queries and table references
- ✅ Updated field names to match database schema

### 2. **API Endpoints Working**

- ✅ `POST /api/posts/schedule` - Schedule new posts
- ✅ `GET /api/posts/scheduled` - Get scheduled posts for calendar
- ✅ `PUT /api/posts/scheduled/:id` - Update scheduled posts
- ✅ `DELETE /api/posts/scheduled/:id` - Delete scheduled posts

### 3. **Calendar Integration**

- ✅ Calendar now loads scheduled posts correctly
- ✅ Click on dates to create new scheduled posts
- ✅ View/edit existing scheduled posts

---

## 🗓️ **HOW TO SCHEDULE A POST FOR TOMORROW:**

### **Method 1: Using the Calendar UI (Recommended)**

1. **Open your browser** and go to: `http://localhost:3000`

2. **Login** to your account:

   - Go to `http://localhost:3000/login`
   - Enter your credentials

3. **Navigate to Calendar**:

   - Go to `http://localhost:3000/calendar`
   - You'll see a calendar interface

4. **Click on Tomorrow's Date**:

   - Find tomorrow's date on the calendar
   - Click on the date cell
   - A "Schedule New Post" modal will appear

5. **Fill in the Post Details**:

   ```
   Content: "🚀 Tomorrow's automated post! Check out this amazing photo! #automation #socialmedia"

   Scheduled Time: [Tomorrow's date] 2:30 PM

   Platforms: ☑️ Twitter ☑️ Instagram
   ```

6. **Adding a Photo (Optional)**:

   - Currently, you can specify an image URL in the `imageUrl` field
   - Example: `https://example.com/your-image.jpg`
   - The system will automatically upload and attach it to your post

7. **Click "Schedule Post"**:
   - Your post will be saved to the database
   - It will appear on the calendar
   - It will be automatically posted at the scheduled time

### **Method 2: Using API Directly**

```javascript
// Schedule a post with photo for tomorrow
const schedulePost = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 30, 0, 0); // 2:30 PM tomorrow

  const postData = {
    content: "🌟 Tomorrow's scheduled post with photo! #automation #twitter",
    scheduledAt: tomorrow.toISOString(),
    platforms: ["twitter"],
    mediaUrl: "https://example.com/your-awesome-image.jpg", // Your image URL
    mediaType: "IMAGE",
  };

  const response = await fetch("http://localhost:5001/api/posts/schedule", {
    method: "POST",
    headers: {
      Authorization: "Bearer YOUR_JWT_TOKEN",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });

  const result = await response.json();
  console.log("Post scheduled:", result);
};
```

---

## 📸 **PHOTO POSTING EXAMPLES:**

### **Text + Photo Tweet for Tomorrow:**

```javascript
{
  "content": "🌅 Good morning! Starting tomorrow with this beautiful sunrise! #photography #morning",
  "scheduledAt": "2025-09-27T07:00:00.000Z", // 7 AM tomorrow
  "platforms": ["twitter"],
  "mediaUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
  "mediaType": "IMAGE"
}
```

### **Text Only Tweet for Tomorrow Afternoon:**

```javascript
{
  "content": "💡 Pro tip for tomorrow: Always schedule your social media posts in advance! It saves time and ensures consistency. #productivity #socialmedia #tips",
  "scheduledAt": "2025-09-27T15:00:00.000Z", // 3 PM tomorrow
  "platforms": ["twitter"]
}
```

### **Multi-Platform Post with Photo:**

```javascript
{
  "content": "🎉 Exciting announcement coming tomorrow! Stay tuned for something amazing! #announcement #exciting",
  "scheduledAt": "2025-09-27T12:00:00.000Z", // 12 PM tomorrow
  "platforms": ["twitter", "instagram"],
  "mediaUrl": "https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6",
  "mediaType": "IMAGE"
}
```

---

## 🔧 **Technical Details:**

### **Database Structure:**

```sql
-- scheduled_posts table
- id: unique identifier
- user_id: links to your user account
- social_account_id: links to your connected Twitter/Instagram
- content: the post text
- media_url: URL of the image to post
- media_type: IMAGE, VIDEO, or GIF
- scheduled_time: when to post (ISO string)
- status: scheduled, posted, failed, cancelled
- platform: twitter, instagram, linkedin
```

### **Supported Features:**

- ✅ **Text-only posts** (up to 280 characters for Twitter)
- ✅ **Posts with images** (JPEG, PNG, GIF)
- ✅ **Multiple platforms** (Twitter, Instagram)
- ✅ **Flexible scheduling** (any future date/time)
- ✅ **Edit/Delete** scheduled posts
- ✅ **Calendar view** for easy management

### **Image Requirements:**

- **Formats:** JPEG, PNG, GIF
- **Size:** Up to 5MB recommended
- **URL:** Must be publicly accessible
- **Twitter:** Supports up to 4 images per tweet
- **Instagram:** Single image per post

---

## 🚀 **Quick Test - Schedule Right Now:**

1. **Open:** `http://localhost:3000/calendar`
2. **Click:** Tomorrow's date
3. **Fill in:**
   - Content: "🎯 Testing my automated posting system! This will post tomorrow at 2 PM. #test #automation"
   - Time: Tomorrow 2:00 PM
   - Platform: Twitter
4. **Submit:** Click "Schedule Post"
5. **Verify:** Check that it appears on the calendar

---

## 📊 **Status Updates:**

✅ **Backend Fixed** - All database issues resolved  
✅ **API Working** - Schedule, view, edit, delete posts  
✅ **Calendar Fixed** - UI now works with corrected backend  
✅ **Twitter Integration** - Ready to post automatically  
✅ **Photo Support** - Images can be attached to posts  
✅ **Multi-Platform** - Twitter and Instagram supported

**🎉 Your scheduled posts system is now fully operational!**

---

## 🛠️ **Troubleshooting:**

**Problem:** "Posts not appearing on calendar"
**Solution:** Check that you're logged in and have connected social accounts

**Problem:** "Failed to schedule post"
**Solution:** Ensure the scheduled time is in the future and you have connected Twitter account

**Problem:** "Image not posting"
**Solution:** Verify the image URL is publicly accessible and in supported format (JPEG/PNG/GIF)

---

**Your automated posting system is ready! Schedule your first post for tomorrow! 🚀**
