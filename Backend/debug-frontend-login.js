const puppeteer = require('puppeteer');

async function debugFrontendLogin() {
  let browser;
  
  try {
    console.log("🔍 Debugging Frontend Login Issues...");
    
    browser = await puppeteer.launch({
      headless: false, // Show browser for debugging
      defaultViewport: null,
      args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log('FRONTEND CONSOLE:', msg.text());
    });
    
    // Enable error logging
    page.on('pageerror', error => {
      console.error('FRONTEND ERROR:', error.message);
    });
    
    // Enable request logging
    page.on('request', request => {
      if (request.url().includes('api')) {
        console.log('API REQUEST:', request.method(), request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('api')) {
        console.log('API RESPONSE:', response.status(), response.url());
      }
    });
    
    console.log("\n🌐 Step 1: Loading frontend...");
    
    // Navigate to login page
    await page.goto('https://frontenddautomation.onrender.com/login', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log("✅ Frontend loaded");
    
    // Wait for login form
    console.log("\n📝 Step 2: Finding login form...");
    
    try {
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      console.log("✅ Email input found");
      
      await page.waitForSelector('input[type="password"]', { timeout: 5000 });
      console.log("✅ Password input found");
      
      await page.waitForSelector('button[type="submit"], button:contains("Sign in"), button:contains("Login")', { timeout: 5000 });
      console.log("✅ Submit button found");
      
    } catch (selectorError) {
      console.error("❌ Form elements not found:", selectorError.message);
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'frontend-login-debug.png', fullPage: true });
      console.log("📸 Debug screenshot saved: frontend-login-debug.png");
      
      // Get page content for debugging
      const content = await page.content();
      console.log("📄 Page content preview:", content.substring(0, 500) + "...");
      
      return;
    }
    
    console.log("\n🔐 Step 3: Attempting login...");
    
    // Fill in credentials
    await page.type('input[type="email"]', 'twittertest@example.com');
    await page.type('input[type="password"]', 'testpass123');
    
    console.log("✅ Credentials entered");
    
    // Click submit button
    await page.click('button[type="submit"]');
    
    console.log("✅ Submit button clicked, waiting for response...");
    
    // Wait for navigation or error message
    try {
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
        page.waitForSelector('.error, [role="alert"], .alert-error', { timeout: 10000 })
      ]);
      
      const currentUrl = page.url();
      console.log("Current URL after login attempt:", currentUrl);
      
      if (currentUrl.includes('dashboard')) {
        console.log("🎉 LOGIN SUCCESSFUL! Redirected to dashboard");
      } else if (currentUrl.includes('login')) {
        console.log("❌ Still on login page - checking for error messages...");
        
        // Look for error messages
        const errorElements = await page.$$('.error, [role="alert"], .alert-error, .text-red-500, .text-danger');
        
        for (let element of errorElements) {
          const errorText = await element.textContent();
          console.log("Error message:", errorText);
        }
        
        // Check console for errors
        console.log("Check the FRONTEND CONSOLE messages above for more details");
      }
      
    } catch (waitError) {
      console.error("❌ Timeout waiting for login response:", waitError.message);
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'login-attempt-result.png', fullPage: true });
    console.log("📸 Final screenshot saved: login-attempt-result.png");
    
    // Keep browser open for manual inspection
    console.log("\n🔍 Browser will stay open for 30 seconds for manual inspection...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error("❌ Debug error:", error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debugFrontendLogin();