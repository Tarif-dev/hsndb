// Quick verification that the major fix is working
const BlastDatabaseMapper = require("./utils/databaseMapper");

async function quickVerification() {
  console.log("🔍 Quick Verification: Gene Names Fix\n");

  try {
    const mapper = new BlastDatabaseMapper();
    console.log("Initializing database mappings...");

    const success = await mapper.initializeMappings();
    if (!success) {
      console.log("❌ Database initialization failed");
      return;
    }
    const stats = mapper.getStats();
    console.log(`✅ Loaded ${stats.totalProteins} protein mappings\n`);

    // Check if we got all expected proteins
    if (stats.totalProteins >= 4533) {
      console.log("🎉 SUCCESS! All 4533+ proteins loaded correctly.");
    } else if (stats.totalProteins >= 4000) {
      console.log(
        `⚠️  Most proteins loaded (${stats.totalProteins}/4533). This may be acceptable.`
      );
    } else {
      console.log(
        `❌ Only ${stats.totalProteins} proteins loaded. Expected ~4533.`
      );
      console.log("   Check database connection and Supabase query limits.");
    }

    // Test the exact UniProt IDs from the FASTA file
    const testIds = ["A0A024RBG1", "A0A075B759", "A0A075B767"];

    console.log("Testing protein lookup for FASTA UniProt IDs:");
    console.log("==============================================");

    let successCount = 0;
    for (const uniprotId of testIds) {
      const details = await mapper.getProteinDetails(uniprotId);

      if (details.geneName !== "Unknown") {
        successCount++;
        console.log(
          `✅ ${uniprotId}: ${details.geneName} - ${details.proteinName}`
        );
      } else {
        console.log(`❌ ${uniprotId}: Still showing "Unknown"`);
      }
    }

    console.log("\n📊 RESULTS:");
    console.log("===========");

    if (successCount === testIds.length) {
      console.log("🎉 SUCCESS! All gene names are now working correctly.");
      console.log(
        '   BLAST results will show real gene names instead of "Unknown".'
      );
      console.log("\n✅ The major issue has been FIXED!");
    } else if (successCount > 0) {
      console.log(
        `⚠️  Partial success: ${successCount}/${testIds.length} working.`
      );
      console.log(
        '   Some proteins may still show "Unknown" - check database contents.'
      );
    } else {
      console.log('❌ Fix not working: All proteins still showing "Unknown".');
      console.log("   Check database connection and protein table contents.");
    }

    console.log("\n🚀 Next steps:");
    console.log("1. Start the BLAST server: node server.js");
    console.log("2. Test with the frontend BLAST search");
    console.log("3. Verify gene names appear in search results");
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  }
}

quickVerification();
