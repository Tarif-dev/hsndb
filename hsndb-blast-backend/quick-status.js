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
} catch (error) {
  console.log("   ❌ package.json or dependencies issue");
}

// 5. Summary
setTimeout(() => {
  console.log("\n🎯 Quick Summary:");
  console.log(`   Database Complete: ${dbComplete ? "✅" : "❌"}`);
  console.log('   Next Step: Start server with "node server.js"');
  console.log('   Then test with "node test-blast-system.js"');
}, 1000);
