// Detailed test to verify all 4533 proteins are being loaded
const BlastDatabaseMapper = require("./utils/databaseMapper");

async function detailedProteinLoadingTest() {
  console.log("🔬 Detailed Protein Loading Test\n");

  try {
    const mapper = new BlastDatabaseMapper();

    console.log("1. Initializing database mappings...");
    const success = await mapper.initializeMappings();

    if (!success) {
      console.log("❌ Database initialization failed");
      return;
    }

    const stats = mapper.getStats();
    console.log("\n2. Mapping Statistics:");
    console.log("======================");
    console.log(`✅ Total proteins mapped: ${stats.totalProteins}`);
    console.log(`✅ UniProt mappings: ${stats.uniprotToProteinMappings}`);

    // Check if we got the expected number
    const expectedProteins = 4533;
    const loadedProteins = stats.totalProteins;
    const percentage = ((loadedProteins / expectedProteins) * 100).toFixed(1);

    console.log(`📊 Expected: ${expectedProteins} proteins`);
    console.log(`📊 Loaded: ${loadedProteins} proteins`);
    console.log(`📊 Coverage: ${percentage}%`);

    if (loadedProteins >= expectedProteins) {
      console.log("\n🎉 EXCELLENT! All proteins loaded successfully.");
      console.log("   The BLAST system now has access to all protein data.");
    } else if (loadedProteins >= expectedProteins * 0.95) {
      console.log("\n✅ GOOD! Almost all proteins loaded.");
      console.log(
        `   Missing only ${expectedProteins - loadedProteins} proteins.`
      );
    } else if (loadedProteins >= expectedProteins * 0.8) {
      console.log("\n⚠️  PARTIAL: Most proteins loaded but some missing.");
      console.log(`   Missing ${expectedProteins - loadedProteins} proteins.`);
    } else {
      console.log("\n❌ ISSUE: Significant number of proteins missing.");
      console.log(`   Missing ${expectedProteins - loadedProteins} proteins.`);
      console.log("   Check Supabase query limits or database connectivity.");
    }

    // Test a few specific proteins to ensure mapping quality
    console.log("\n3. Testing specific protein lookups:");
    console.log("====================================");

    const testUniprotIds = [
      "A0A024RBG1", // NUDT4B
      "A0A075B759", // PPIAL4E
      "A0A075B767", // PPIAL4H
      "A0A0B4J2A2", // PPIAL4C
      "P12345", // Non-existent for testing
    ];

    let foundCount = 0;
    for (const uniprotId of testUniprotIds) {
      const details = await mapper.getProteinDetails(uniprotId);

      if (details.geneName !== "Unknown") {
        foundCount++;
        console.log(
          `✅ ${uniprotId}: ${details.geneName} - ${details.proteinName}`
        );
      } else {
        console.log(`❌ ${uniprotId}: Not found (expected for P12345)`);
      }
    }

    console.log("\n4. Final Assessment:");
    console.log("===================");

    if (loadedProteins >= expectedProteins && foundCount >= 4) {
      console.log("🎉 PERFECT! All systems working correctly.");
      console.log("   ✅ All 4533+ proteins loaded");
      console.log("   ✅ Protein details lookup working");
      console.log("   ✅ Gene names and protein names available");
      console.log("\n🚀 The BLAST system is ready for production use!");
    } else {
      console.log("⚠️  Some issues detected:");
      if (loadedProteins < expectedProteins) {
        console.log(
          `   - Only ${loadedProteins}/${expectedProteins} proteins loaded`
        );
      }
      if (foundCount < 4) {
        console.log(`   - Only ${foundCount}/4 test proteins found`);
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the detailed test
detailedProteinLoadingTest();
