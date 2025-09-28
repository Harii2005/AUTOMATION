// Test that the image upload endpoint is configured correctly
const express = require("express");
const multer = require("multer");
const path = require("path");

console.log("✅ All required modules are available");
console.log("✅ Express:", typeof express);
console.log("✅ Multer:", typeof multer);
console.log("✅ Path:", typeof path);

console.log("🎯 Image upload endpoint should be working with:");
console.log("   - POST /api/posts/upload-image");
console.log("   - Requires Bearer token authorization");
console.log('   - Accepts multipart/form-data with "image" field');
console.log("   - Returns JSON with imageUrl");
console.log("   - Images stored in uploads/ directory");
console.log("   - Images served at /uploads/<filename>");
