const { supabase } = require("./src/utils/database");

/**
 * Update a scheduled post to trigger immediately
 */

async function triggerPostNow() {
  console.log("🚀 Triggering text post to run immediately...");

  try {
    // Find the text post we just scheduled
    const { data: posts, error: findError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("content", "this is a test")
      .eq("status", "PENDING")
      .limit(1);

    if (findError) {
      console.error("❌ Error finding post:", findError);
      return;
    }

    if (!posts || posts.length === 0) {
      console.error("❌ No pending text post found");
      return;
    }

    const post = posts[0];
    console.log(`📝 Found post: ${post.id}`);

    // Update the scheduled time to now (trigger immediately)
    const now = new Date();
    const { error: updateError } = await supabase
      .from("scheduled_posts")
      .update({
        scheduledTime: now.toISOString(),
      })
      .eq("id", post.id);

    if (updateError) {
      console.error("❌ Error updating post:", updateError);
      return;
    }

    console.log("✅ Post updated to trigger immediately!");
    console.log(`📅 New scheduled time: ${now.toLocaleString()}`);
    console.log(
      "💡 Now start the server to see it process the post: node src/index.js"
    );
  } catch (error) {
    console.error("❌ Error triggering post:", error);
  }
}

// Run the function
triggerPostNow();
