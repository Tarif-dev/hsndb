// Setup script for BLAST backend with database integration
const fs = require("fs");
const path = require("path");

console.log("🔧 BLAST Backend Setup with Database Integration");
console.log("================================================\n");

// Step 1: Install dependencies
console.log("1. Installing Supabase dependency...");
console.log("   Run: npm install @supabase/supabase-js dotenv\n");

// Step 2: Environment configuration
console.log("2. Environment Configuration:");
console.log("   • Copy .env.example to .env");
console.log("   • Update SUPABASE_URL and SUPABASE_ANON_KEY");
console.log("   • Get these from your Supabase project settings\n");

// Step 3: Check current configuration
const envExamplePath = path.join(__dirname, ".env.example");
const envPath = path.join(__dirname, ".env");

if (fs.existsSync(envExamplePath)) {
  console.log("✅ .env.example file exists");
} else {
  console.log("❌ .env.example file missing");
}

if (fs.existsSync(envPath)) {
  console.log("✅ .env file exists");
} else {
  console.log("⚠️  .env file not found - copy from .env.example");
}

// Step 4: Database verification
console.log("\n3. Database Verification:");
console.log("   Your Supabase database should have:");
console.log(
  "   • Table: proteins (columns: id, hsn_id, uniprot_id, gene_name, protein_name, organism, description)"
);
console.log("   • Table: formats (columns: id, hsn_id, uniprot_id, fasta)");
console.log("   • HSN IDs should match between both tables");

// Step 5: Testing instructions
console.log("\n4. Testing:");
console.log("   • Start server: node server.js");
console.log('   • Check logs for "Database mappings initialized"');
console.log("   • Run BLAST search and verify gene/protein names appear");

console.log("\n🎯 Expected Behavior After Setup:");
console.log("   • BLAST results show real gene names (e.g., GAPDH, ACTB)");
console.log(
  '   • Protein names are descriptive (e.g., "Glyceraldehyde-3-phosphate dehydrogenase")'
);
console.log("   • HSN IDs link correctly to protein detail pages");
console.log('   • No more "Unknown" values in results');

console.log("\n📋 Troubleshooting:");
console.log("   • If mappings fail: Check Supabase credentials");
console.log("   • If no results: Verify FASTA identifiers match database");
console.log('   • If "Unknown" persists: Check table schema and data');

console.log("\n🚀 Ready to enhance your BLAST results!");
