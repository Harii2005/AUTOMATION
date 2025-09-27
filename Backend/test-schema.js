const { supabase } = require("./src/utils/database");

async function checkDatabaseSchema() {
  try {
    console.log("Checking scheduled_posts table structure...");

    // Try to insert a minimal record to see what fields are required/available
    const testInsert = {
      userId: "d086a4b5-a126-4d04-820f-94f02c81e098",
      socialAccountId: "edc1d07e-c352-40ee-989d-0580a1919a3e",
      content: "Test content",
      scheduledTime: new Date("2025-09-28T20:00:00.000Z").toISOString(),
      status: "PENDING",
      platform: "TWITTER",
    };

    console.log("Trying basic insert:", testInsert);
    const { data, error } = await supabase
      .from("scheduled_posts")
      .insert(testInsert)
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
    } else {
      console.log("Insert successful:", data);

      // Clean up the test record
      await supabase.from("scheduled_posts").delete().eq("id", data.id);
      console.log("Test record cleaned up");
    }
  } catch (error) {
    console.error("Error:", error);
  }

  process.exit(0);
}

checkDatabaseSchema();
