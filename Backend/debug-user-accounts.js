const axios = require("axios");

async function debugUserAndAccounts() {
  try {
    // Login and get token
    const loginResponse = await axios.post(
      "http://localhost:5001/api/auth/login",
      {
        email: "test@example.com",
        password: "testpassword",
      }
    );

    const token = loginResponse.data.token;
    console.log("Token user data:", loginResponse.data.user);

    // Get user profile to see the user ID
    const profileResponse = await axios.get(
      "http://localhost:5001/api/auth/me",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Current user from /me endpoint:", profileResponse.data);

    // Now let's see what social accounts exist for ALL users
    const { createClient } = require("@supabase/supabase-js");
    require("dotenv").config();

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { data: allUsers, error: usersError } = await supabase
      .from("users")
      .select("*");

    if (usersError) {
      console.error("Error getting users:", usersError);
    } else {
      console.log("All users:");
      console.table(allUsers);
    }

    const { data: allAccounts, error: accountsError } = await supabase
      .from("social_accounts")
      .select("*");

    if (accountsError) {
      console.error("Error getting accounts:", accountsError);
    } else {
      console.log("All social accounts:");
      console.table(allAccounts);
    }
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

debugUserAndAccounts();
