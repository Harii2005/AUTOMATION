// Quick test to login via frontend and check localStorage
// Run this in browser console at http://localhost:3000

// First check if user is already logged in
console.log("Current token:", localStorage.getItem("token"));
console.log("Current user:", localStorage.getItem("user"));

// If no token, we need to login first
if (!localStorage.getItem("token")) {
  console.log("No token found, need to login first");
  console.log("Go to http://localhost:3000/login and login with:");
  console.log("Email: test@example.com");
  console.log("Password: testpassword");
} else {
  console.log("User is logged in, token exists");

  // Test API call to social accounts
  fetch("http://localhost:5001/api/social", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Social accounts from frontend:", data);
    })
    .catch((error) => {
      console.error("Error fetching social accounts:", error);
    });
}
