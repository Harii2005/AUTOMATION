const { supabase } = require("./src/utils/database");

async function checkDatabase() {
  try {
    console.log("Checking social_accounts table...");

    const { data: accounts, error } = await supabase
      .from("social_accounts")
      .select("*");

    if (error) throw error;

    console.log("All social accounts:");
    console.log(accounts);

    console.log("\nChecking users table...");
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("*");

    if (userError) throw userError;

    console.log("All users:");
    console.log(users);
  } catch (error) {
    console.error("Error:", error);
  }
}

checkDatabase();
