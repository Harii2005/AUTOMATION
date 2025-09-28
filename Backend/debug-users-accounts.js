const { supabase } = require("./src/utils/database");

async function checkUsersAndAccounts() {
  try {
    console.log("🔍 Checking users...");
    
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, username");
      
    console.log("Users:", users);
    if (usersError) console.error("Error fetching users:", usersError);

    console.log("\n🔍 Checking social accounts...");
    
    const { data: accounts, error: accountsError } = await supabase
      .from("social_accounts")
      .select("*");
      
    console.log("Social Accounts:", accounts);
    if (accountsError) console.error("Error fetching accounts:", accountsError);

  } catch (error) {
    console.error("💥 Unexpected error:", error);
  }
}

checkUsersAndAccounts();