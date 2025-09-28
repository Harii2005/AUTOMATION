// Quick test of the status endpoint
fetch("http://localhost:5001/api/social/status")
  .then((response) => response.json())
  .then((data) => {
    console.log("📊 Platform Status Check:", data);

    if (data.success) {
      console.log(
        "✅ Instagram:",
        data.status.instagram.connected ? "CONNECTED" : "Not Connected"
      );
      if (data.status.instagram.connected) {
        console.log("   Account:", data.status.instagram.account.username);
      }

      console.log(
        "✅ Twitter:",
        data.status.twitter.connected ? "CONNECTED" : "Not Connected"
      );
      if (data.status.twitter.connected) {
        console.log("   Account:", data.status.twitter.account.username);
      }
    }
  })
  .catch((error) => console.error("❌ Error:", error));
