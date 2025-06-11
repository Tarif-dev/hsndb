// Quick status check for BLAST system
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

console.log("🔍 BLAST System Quick Status Check");
console.log("================================\n");

// 1. Check BLAST+ installation
console.log("1. BLAST+ Installation:");
exec("blastp -version", (error, stdout, stderr) => {
  if (error) {
    console.log("   ❌ BLAST+ not installed or not in PATH");
  } else {
    console.log("   ✅ BLAST+ installed:", stdout.split("\n")[0]);
  }
});

// 2. Check database files
console.log("\n2. Database Files:");
const dbPath = path.join(__dirname, "blastdb", "hsndb");
const requiredFiles = ["phr", "pin", "psq"];
let dbComplete = true;

for (const ext of requiredFiles) {
  const filePath = `${dbPath}.${ext}`;
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`   ✅ ${ext}: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  } else {
    console.log(`   ❌ Missing: ${ext}`);
    dbComplete = false;
  }
}

// 3. Check FASTA source file
console.log("\n3. Source FASTA File:");
const fastaPath = path.join(__dirname, "..", "sequences.fasta");
if (fs.existsSync(fastaPath)) {
  const stats = fs.statSync(fastaPath);
  console.log(
    `   ✅ FASTA file exists: ${(stats.size / 1024 / 1024).toFixed(2)} MB`
  );
} else {
  console.log("   ❌ FASTA file not found");
}

// 4. Check server dependencies
console.log("\n4. Server Dependencies:");
try {
  const packageJson = require("./package.json");
  const deps = packageJson.dependencies;
  console.log("   ✅ package.json found");
  console.log(`   - express: ${deps.express || "missing"}`);
  console.log(`   - cors: ${deps.cors || "missing"}`);
  console.log(`   - uuid: ${deps.uuid || "missing"}`);
  console.log(`   - xml2js: ${deps["xml2js"] || "missing"}`);
  console.log(
    `   - @supabase/supabase-js: ${
      deps["@supabase/supabase-js"] ||
      "❌ missing - run: npm install @supabase/supabase-js"
    }`
  );
} catch (error) {
  console.log("   ❌ package.json or dependencies issue");
}

// 5. Check environment configuration
console.log("\n5. Environment Configuration:");
const envPath = path.join(__dirname, ".env");
const envExamplePath = path.join(__dirname, ".env.example");

if (fs.existsSync(envExamplePath)) {
  console.log("   ✅ .env.example exists");
} else {
  console.log("   ❌ .env.example missing");
}

if (fs.existsSync(envPath)) {
  console.log("   ✅ .env file exists");

  // Try to load and check Supabase config
  try {
    require("dotenv").config({ path: envPath });
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseUrl !== "your-supabase-project-url") {
      console.log("   ✅ Supabase URL configured");
    } else {
      console.log("   ⚠️  Supabase URL needs configuration");
    }

    if (supabaseKey && supabaseKey !== "your-supabase-anon-key") {
      console.log("   ✅ Supabase key configured");
    } else {
      console.log("   ⚠️  Supabase key needs configuration");
    }
  } catch (error) {
    console.log("   ⚠️  Could not validate environment variables");
  }
} else {
  console.log("   ⚠️  .env file missing - copy from .env.example");
}

// 6. Summary
setTimeout(() => {
  console.log("\n🎯 Quick Summary:");
  console.log(`   Database Complete: ${dbComplete ? "✅" : "❌"}`);
  console.log("   Next Steps:");
  console.log(
    "   1. Install Supabase: npm install @supabase/supabase-js dotenv"
  );
  console.log("   2. Configure .env file with your Supabase credentials");
  console.log("   3. Start server: node server.js");
  console.log("   4. Test BLAST search for proper gene/protein names");

  console.log("\n📋 Expected after setup:");
  console.log('   • BLAST results show real gene names instead of "Unknown"');
  console.log(
    '   • Protein names are descriptive instead of "Unknown protein"'
  );
  console.log("   • HSN IDs are properly mapped from FASTA to database");
}, 1000);
