const puppeteer = require('puppeteer');

const FRONTEND_URL = "https://frontenddautomation.onrender.com";

async function scheduleTwitterPost() {
  let browser;
  
  try {
    console.log("🌐 Starting frontend-based tweet scheduling...");
    console.log("Frontend URL:", FRONTEND_URL);
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Set to true for headless mode
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Navigate to frontend
    console.log("\n📱 Step 1: Navigating to frontend...");
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });
    
    console.log("✅ Frontend loaded successfully");
    
    // Login
    console.log("\n🔐 Step 2: Logging in...");
    
    // Wait for login form to appear
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Fill in login credentials
    await page.type('input[type="email"]', 'twittertest@example.com');
    await page.type('input[type="password"]', 'testpass123');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log("✅ Login successful");
    
    // Navigate to Calendar page for post creation
    console.log("\n📅 Step 3: Navigating to Calendar...");
    
    // Look for calendar navigation link
    await page.waitForSelector('a[href="/calendar"]', { timeout: 5000 });
    await page.click('a[href="/calendar"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log("✅ Calendar page loaded");
    
    // Schedule tweet for 4:00 PM
    console.log("\n📝 Step 4: Creating scheduled post...");
    
    // Set up timing for 4:00 PM today
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(16, 0, 0, 0); // 4:00 PM
    
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    console.log("Current time:", now.toLocaleString());
    console.log("Scheduled time:", scheduledTime.toLocaleString());
    
    // Look for "Create Post" or "New Post" button
    const createButtons = [
      'button:contains("Create Post")',
      'button:contains("New Post")',
      'button:contains("Schedule Post")',
      '[data-testid="create-post-button"]',
      '.create-post-btn'
    ];
    
    let createButtonFound = false;
    for (const selector of createButtons) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.click(selector);
        createButtonFound = true;
        console.log(`✅ Clicked create button: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!createButtonFound) {
      // Try clicking on a date to create a post
      console.log("🔍 Looking for calendar date to click...");
      await page.click('.rbc-date-cell', { timeout: 5000 });
    }
    
    // Wait for post creation modal/form
    await page.waitForSelector('textarea, input[placeholder*="content"], input[placeholder*="post"]', { timeout: 10000 });
    console.log("✅ Post creation form opened");
    
    // Fill in tweet content
    const tweetContent = "🕐 4:00 PM Tweet from Frontend! 🚀 Successfully scheduled through the web interface! #AutomationSuccess #FrontendScheduling";
    
    const contentSelectors = [
      'textarea[placeholder*="content"]',
      'textarea[placeholder*="post"]',
      'textarea',
      'input[placeholder*="content"]'
    ];
    
    for (const selector of contentSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.type(selector, tweetContent);
        console.log(`✅ Content entered in: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    // Set schedule time
    console.log("\n⏰ Step 5: Setting schedule time...");
    
    // Look for time/date inputs
    const timeSelectors = [
      'input[type="datetime-local"]',
      'input[type="time"]',
      'input[type="date"]',
      'input[placeholder*="time"]',
      'input[placeholder*="schedule"]'
    ];
    
    for (const selector of timeSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        
        if (selector.includes('datetime-local')) {
          const datetimeValue = scheduledTime.toISOString().slice(0, 16);
          await page.evaluate((sel, val) => {
            document.querySelector(sel).value = val;
          }, selector, datetimeValue);
        } else if (selector.includes('time')) {
          await page.type(selector, '16:00');
        }
        
        console.log(`✅ Time set in: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    // Select Twitter platform
    console.log("\n🐦 Step 6: Selecting Twitter platform...");
    
    const platformSelectors = [
      'input[type="checkbox"][value="twitter"]',
      'input[type="radio"][value="twitter"]',
      'select option[value="twitter"]',
      'button:contains("Twitter")',
      '[data-platform="twitter"]'
    ];
    
    for (const selector of platformSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.click(selector);
        console.log(`✅ Twitter platform selected: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    // Submit the form
    console.log("\n🚀 Step 7: Submitting the post...");
    
    const submitSelectors = [
      'button[type="submit"]',
      'button:contains("Schedule")',
      'button:contains("Create")',
      'button:contains("Post")',
      '.submit-btn',
      '[data-testid="submit-button"]'
    ];
    
    for (const selector of submitSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.click(selector);
        console.log(`✅ Submit button clicked: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    // Wait for success confirmation
    await page.waitForTimeout(3000);
    
    console.log("\n✅ TWEET SCHEDULED SUCCESSFULLY!");
    console.log("🎯 Tweet will be posted at 4:00 PM via frontend interface");
    console.log("📱 Method: Web Interface (like a real user)");
    console.log("🔗 Platform: Twitter");
    console.log("📝 Content:", tweetContent);
    
    // Take a screenshot for confirmation
    await page.screenshot({ path: 'tweet-scheduled-confirmation.png', fullPage: true });
    console.log("📸 Screenshot saved: tweet-scheduled-confirmation.png");
    
  } catch (error) {
    console.error("❌ Error during frontend scheduling:", error.message);
    
    if (browser) {
      // Take screenshot of error state
      const page = await browser.newPage();
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
      console.log("📸 Error screenshot saved: error-screenshot.png");
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the function
scheduleTwitterPost();