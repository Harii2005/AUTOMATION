const { supabase } = require("./src/utils/database");
require("dotenv").config();

async function checkDatabaseFinal() {
  console.log("📊 Final Database Check - Posts for Tomorrow\n");
  console.log("=".repeat(50));

  try {
    // Get all scheduled posts
    const { data: allPosts, error: allError } = await supabase
      .from("scheduled_posts")
      .select(
        `
        *,
        social_accounts(platform, accountName)
      `
      )
      .order("scheduledTime", { ascending: true });

    if (allError) {
      console.log("❌ Error fetching posts:", allError.message);
      return;
    }

    console.log(`\n📋 Total Posts in Database: ${allPosts.length}`);

    if (allPosts.length > 0) {
      console.log("\n🗓️  All Scheduled Posts:");
      console.log("-".repeat(50));

      allPosts.forEach((post, index) => {
        const scheduledDate = new Date(post.scheduledTime);
        const isToday =
          scheduledDate.toDateString() === new Date().toDateString();
        const isTomorrow =
          scheduledDate.toDateString() ===
          new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();

        let dateLabel = "";
        if (isToday) dateLabel = " 📅 TODAY";
        if (isTomorrow) dateLabel = " 🚀 TOMORROW";

        console.log(`\n${index + 1}. ${dateLabel}`);
        console.log(`   ID: ${post.id}`);
        console.log(`   Content: "${post.content}"`);
        console.log(`   Scheduled: ${scheduledDate.toLocaleString()}`);
        console.log(`   Platform: ${post.platform}`);
        console.log(`   Status: ${post.status}`);
        console.log(
          `   Account: ${post.social_accounts?.accountName || "N/A"}`
        );
        console.log(`   Created: ${new Date(post.createdAt).toLocaleString()}`);
      });
    }

    // Check specifically for tomorrow's posts
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const { data: tomorrowPosts, error: tomorrowError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .gte("scheduledTime", tomorrowStart.toISOString())
      .lte("scheduledTime", tomorrowEnd.toISOString());

    console.log("\n" + "=".repeat(50));
    console.log("🎯 TOMORROW'S POSTS SUMMARY");
    console.log("=".repeat(50));

    if (!tomorrowError && tomorrowPosts.length > 0) {
      console.log(
        `\n✅ ${
          tomorrowPosts.length
        } post(s) scheduled for tomorrow (${tomorrow.toDateString()})`
      );

      tomorrowPosts.forEach((post, index) => {
        const time = new Date(post.scheduledTime).toLocaleTimeString();
        console.log(`\n${index + 1}. ⏰ ${time}`);
        console.log(`   📝 "${post.content.substring(0, 60)}..."`);
        console.log(`   📱 Platform: ${post.platform}`);
        console.log(`   ⚡ Status: ${post.status}`);
      });

      console.log(`\n🚀 These posts will be automatically published tomorrow!`);
    } else {
      console.log("\n📭 No posts scheduled for tomorrow");
    }

    // Check user and social accounts
    const { data: users } = await supabase
      .from("users")
      .select("id, email")
      .limit(1);
    const { data: socialAccounts } = await supabase
      .from("social_accounts")
      .select("*");

    console.log("\n" + "=".repeat(50));
    console.log("👤 ACCOUNT STATUS");
    console.log("=".repeat(50));
    console.log(`✅ User: ${users[0]?.email}`);
    console.log(`✅ Connected Social Accounts: ${socialAccounts.length}`);
    socialAccounts.forEach((account) => {
      console.log(
        `   📱 ${account.platform}: @${account.accountName} (${
          account.isActive ? "Active" : "Inactive"
        })`
      );
    });
  } catch (error) {
    console.error("❌ Database check failed:", error.message);
  }
}

checkDatabaseFinal();
