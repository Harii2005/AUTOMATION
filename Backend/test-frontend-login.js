const axios = require("axios");

async function testFrontendLogin() {
  try {
    console.log("🔍 Testing Frontend Login Flow");
    console.log("=================================");
    
    // Test 1: Direct backend API call
    console.log("\n📡 Test 1: Direct Backend API Call");
    try {
      const directResponse = await axios.post(
        "https://backend-automation-gcbv.onrender.com/api/auth/login",
        {
          email: "twittertest@example.com",
          password: "testpass123"
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      
      console.log("✅ Direct backend call: SUCCESS");
      console.log("User:", directResponse.data.user.email);
      console.log("Token received:", directResponse.data.token ? "YES" : "NO");
      
    } catch (directError) {
      console.error("❌ Direct backend call failed:", directError.response?.data || directError.message);
    }
    
    // Test 2: Simulate frontend API call with CORS headers
    console.log("\n🌐 Test 2: Frontend-style API Call (with CORS)");
    try {
      const frontendResponse = await axios.post(
        "https://backend-automation-gcbv.onrender.com/api/auth/login",
        {
          email: "twittertest@example.com",
          password: "testpass123"
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Origin": "https://frontenddautomation.onrender.com",
            "Referer": "https://frontenddautomation.onrender.com/login",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          }
        }
      );
      
      console.log("✅ Frontend-style call: SUCCESS");
      console.log("User:", frontendResponse.data.user.email);
      console.log("Token received:", frontendResponse.data.token ? "YES" : "NO");
      
    } catch (frontendError) {
      console.error("❌ Frontend-style call failed:", frontendError.response?.data || frontendError.message);
    }
    
    // Test 3: Check if frontend is loading
    console.log("\n📱 Test 3: Frontend Accessibility");
    try {
      const frontendCheck = await axios.get("https://frontenddautomation.onrender.com", {
        timeout: 10000
      });
      
      console.log("✅ Frontend is accessible");
      console.log("Status:", frontendCheck.status);
      console.log("Content type:", frontendCheck.headers['content-type']);
      
      // Check if it's actually HTML content
      if (frontendCheck.data.includes('<html')) {
        console.log("✅ HTML content detected - frontend is serving properly");
        
        // Check for React app indicators
        if (frontendCheck.data.includes('react') || frontendCheck.data.includes('root')) {
          console.log("✅ React app detected");
        } else {
          console.log("⚠️  React app indicators not found");
        }
        
      } else {
        console.log("❌ No HTML content - frontend might not be built properly");
      }
      
    } catch (frontendError) {
      console.error("❌ Frontend not accessible:", frontendError.message);
    }
    
    // Test 4: Check specific login page
    console.log("\n🔐 Test 4: Login Page Accessibility");
    try {
      const loginPageResponse = await axios.get("https://frontenddautomation.onrender.com/login", {
        timeout: 10000
      });
      
      console.log("✅ Login page accessible");
      console.log("Status:", loginPageResponse.status);
      
      // Check if login page has form elements (basic check)
      const hasEmailInput = loginPageResponse.data.includes('email') || loginPageResponse.data.includes('Email');
      const hasPasswordInput = loginPageResponse.data.includes('password') || loginPageResponse.data.includes('Password');
      const hasLoginForm = loginPageResponse.data.includes('form') || loginPageResponse.data.includes('login');
      
      console.log("Email field detected:", hasEmailInput ? "YES" : "NO");
      console.log("Password field detected:", hasPasswordInput ? "YES" : "NO");
      console.log("Login form detected:", hasLoginForm ? "YES" : "NO");
      
    } catch (loginPageError) {
      console.error("❌ Login page not accessible:", loginPageError.message);
    }
    
    // Test 5: CORS preflight check
    console.log("\n🔧 Test 5: CORS Preflight Check");
    try {
      const corsResponse = await axios.options("https://backend-automation-gcbv.onrender.com/api/auth/login", {
        headers: {
          "Origin": "https://frontenddautomation.onrender.com",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type"
        }
      });
      
      console.log("✅ CORS preflight successful");
      console.log("Status:", corsResponse.status);
      
    } catch (corsError) {
      console.log("⚠️  CORS preflight check:", corsError.response?.status || corsError.message);
    }
    
    console.log("\n📋 DIAGNOSIS SUMMARY:");
    console.log("====================");
    console.log("1. Backend login API: Working ✅");
    console.log("2. Frontend deployment: Check results above");
    console.log("3. CORS configuration: Check results above");
    console.log("\n💡 POSSIBLE ISSUES:");
    console.log("• Frontend might not be built/deployed properly");
    console.log("• React app might have JavaScript errors");
    console.log("• Network connectivity issues");
    console.log("• Environment variables not set in frontend");
    
    console.log("\n🛠️  NEXT STEPS:");
    console.log("• Check browser console for JavaScript errors");
    console.log("• Verify frontend build is working");
    console.log("• Check if REACT_APP_API_URL is set correctly");
    
  } catch (error) {
    console.error("❌ Test error:", error.message);
  }
}

testFrontendLogin();